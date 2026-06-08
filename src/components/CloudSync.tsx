"use client";
// Opt-in cloud sync UI (Clerk auth + Neon store). Lives in Settings only.
//
// Defensive + additive: localStorage stays the source of truth. This panel just
// lets a signed-in user PUSH this device's practice.state to the cloud or PULL the
// cloud copy down. A user who never signs in sees a sign-in prompt and nothing
// else changes.
//
// Clerk v7 note: the Next adapter does NOT export <SignedIn>/<SignedOut>. We gate
// with the useUser() hook and use the confirmed SignInButton / UserButton exports.
// Same-origin fetch carries the Clerk session cookie, so /api/sync's auth() works
// with no manual token.

import { useState } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { STORAGE_KEY } from "@/lib/storage";

// NEXT_PUBLIC vars are inlined at build. When absent, ClerkProvider is not mounted
// (see layout.tsx), so the Clerk hooks/components must not render either.
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
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isLoaded) {
    return <p className="text-sm text-[color:var(--ink-3)]">Loading...</p>;
  }

  if (!isSignedIn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[color:var(--ink-2)]">
          Sign in to sync your practice across devices. Your local progress stays exactly as it is.
        </p>
        <SignInButton mode="modal">
          <button
            type="button"
            className="text-sm px-4 py-1.5 rounded-full border border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
          >
            Sign in to sync
          </button>
        </SignInButton>
      </div>
    );
  }

  const push = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStatus("Nothing to sync yet. Do a session first.");
        return;
      }
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: raw,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStatus(`Pushed to cloud at ${new Date(data.updated_at).toLocaleString()}.`);
    } catch (e) {
      setStatus(`Push failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const pull = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (!data.state) {
        setStatus("No cloud save found yet. Push from one device first.");
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
      setStatus("Pulled from cloud. Reloading...");
      setTimeout(() => window.location.reload(), 700);
    } catch (e) {
      setStatus(`Pull failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <UserButton />
        <button type="button" onClick={push} disabled={busy} className={btn}>
          Push to cloud
        </button>
        <button type="button" onClick={pull} disabled={busy} className={btn}>
          Pull from cloud
        </button>
      </div>
      {status && <p className="text-xs text-[color:var(--ink-3)]" data-testid="cloud-sync-status">{status}</p>}
      <p className="text-xs text-[color:var(--ink-3)] italic">
        Push saves this device's progress to the cloud. Pull replaces this device with the cloud copy.
      </p>
    </div>
  );
}
