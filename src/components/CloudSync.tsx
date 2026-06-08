"use client";
// Settings panel for cloud sync (Clerk account + Neon store).
//
// With CloudSyncManager handling auto pull-on-signin and debounced auto-push, this
// panel is mostly informational: it shows account status and offers manual
// "Sync now" (force push) and "Restore from cloud" (force pull + reload) escape
// hatches. localStorage stays the source of truth; signing in just makes the
// account the durable home of your progress.
//
// Clerk v7 note: the Next adapter does NOT export <SignedIn>/<SignedOut>; we gate
// with useUser() and use SignInButton / UserButton.

import { useState } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { cloudPull, cloudPush, readLocalRaw, writeLocalRaw } from "@/lib/cloudSync";
import { useAppState } from "@/hooks/useAppState";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const btn =
  "text-sm px-4 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)] disabled:opacity-50 disabled:cursor-not-allowed";

export function CloudSync() {
  if (!CLERK_ENABLED) {
    return (
      <p className="text-sm text-[color:var(--ink-3)]">
        Cloud sync is not configured in this build. Your practice is saved locally on this device.
      </p>
    );
  }
  return <CloudSyncInner />;
}

function CloudSyncInner() {
  const { isLoaded, isSignedIn } = useUser();
  const { state } = useAppState();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isLoaded) {
    return <p className="text-sm text-[color:var(--ink-3)]">Loading...</p>;
  }

  if (!isSignedIn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[color:var(--ink-2)]">
          You are practicing anonymously. Sign in to save your progress (XP, streak, skill tree, sessions) to your account and sync it across devices. Nothing local is lost when you sign in.
        </p>
        <SignInButton mode="modal">
          <button
            type="button"
            className="text-sm px-4 py-1.5 rounded-full border border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
          >
            Sign in to save my progress
          </button>
        </SignInButton>
      </div>
    );
  }

  const syncNow = async () => {
    setBusy(true);
    setStatus(null);
    const res = await cloudPush(state);
    setStatus(res.ok ? `Saved to your account at ${new Date(res.updatedAt).toLocaleTimeString()}.` : `Save failed: ${res.error}`);
    setBusy(false);
  };

  const restore = async () => {
    if (!confirm("Replace this device's progress with the copy saved in your account?")) return;
    setBusy(true);
    setStatus(null);
    const res = await cloudPull();
    if (!res.ok) {
      setStatus(`Restore failed: ${res.error}`);
      setBusy(false);
      return;
    }
    if (!res.state) {
      setStatus("Nothing saved in your account yet.");
      setBusy(false);
      return;
    }
    if (JSON.stringify(res.state) === readLocalRaw()) {
      setStatus("Already up to date with your account.");
      setBusy(false);
      return;
    }
    writeLocalRaw(res.state);
    setStatus("Restored from your account. Reloading...");
    setTimeout(() => window.location.reload(), 700);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          <UserButton />
        </span>
        <span className="text-sm text-[color:var(--ink-2)]">Signed in. Your progress saves automatically.</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button type="button" onClick={syncNow} disabled={busy} className={btn}>Sync now</button>
        <button type="button" onClick={restore} disabled={busy} className={btn}>Restore from cloud</button>
      </div>
      {status && <p className="text-xs text-[color:var(--ink-3)]" data-testid="cloud-sync-status">{status}</p>}
      <p className="text-xs text-[color:var(--ink-3)] italic">
        Changes save to your account a moment after you make them. Restore pulls your account copy onto this device.
      </p>
    </div>
  );
}
