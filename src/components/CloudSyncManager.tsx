"use client";
// Invisible auto-sync orchestrator (mounted once in AppShell). When the user is
// signed in via Clerk, it makes their account the durable home of their progress:
//
//   1. PULL ONCE per browser session on sign-in:
//        - cloud has a save that differs from local  -> adopt cloud, reload
//        - cloud has a save identical to local        -> nothing to do
//        - cloud is empty                             -> seed it with local
//   2. AUTO-PUSH (debounced) whenever the working state changes thereafter.
//
// localStorage stays the live working copy; the cloud row is the account save. A
// signed-out user never triggers any of this (the component renders null). Guarded
// by CLERK_ENABLED so it is inert on a deploy without Clerk keys.

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppState } from "@/hooks/useAppState";
import { cloudPull, cloudPush, readLocalRaw, writeLocalRaw, syncHash } from "@/lib/cloudSync";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const PULLED_FLAG = "pianoCloudPulledSession";
const PUSH_DEBOUNCE_MS = 1500;

export function CloudSyncManager() {
  if (!CLERK_ENABLED) return null;
  return <Inner />;
}

function Inner() {
  const { isLoaded, isSignedIn } = useUser();
  const { state } = useAppState();
  const lastPushedRef = useRef<string | null>(null);
  const readyRef = useRef(false); // true once the initial pull/seed completed
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 1. Initial pull / seed, once per browser session ──
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(PULLED_FLAG) === "1") {
      readyRef.current = true;
      lastPushedRef.current = readLocalRaw();
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await cloudPull();
      if (cancelled) return;
      if (!res.ok) {
        // Network/auth hiccup: do not seed (could clobber a real cloud save we
        // failed to read). Try again next session. Leave readyRef false so
        // auto-push stays off until we have a clean baseline.
        return;
      }
      sessionStorage.setItem(PULLED_FLAG, "1");
      const localRaw = readLocalRaw();
      if (res.state) {
        const cloudRaw = JSON.stringify(res.state);
        if (cloudRaw !== localRaw) {
          // Adopt the account's save and re-init the app from it.
          writeLocalRaw(res.state);
          window.location.reload();
          return;
        }
        // Already in sync.
        lastPushedRef.current = localRaw;
        readyRef.current = true;
      } else {
        // Empty account: seed it with whatever this device has.
        const pushRes = await cloudPush(state);
        if (!cancelled && pushRes.ok) lastPushedRef.current = syncHash(state);
        readyRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
    // state intentionally excluded: this effect is the one-shot session pull.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  // ── 2. Debounced auto-push on change ──
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !readyRef.current) return;
    const hash = syncHash(state);
    if (hash === lastPushedRef.current) return; // no real change
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const res = await cloudPush(state);
      if (res.ok) lastPushedRef.current = hash;
      // On failure: leave lastPushedRef alone so the next change retries.
    }, PUSH_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, isLoaded, isSignedIn]);

  return null;
}
