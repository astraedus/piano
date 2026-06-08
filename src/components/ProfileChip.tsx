"use client";
// Header profile indicator. Makes the saved-vs-local state visible everywhere:
//   - signed out -> a quiet "Anonymous" pill that opens sign-in (data is local only)
//   - signed in  -> the Clerk UserButton (avatar) + a small "Saved" dot
//
// Guarded by CLERK_ENABLED so it is inert (renders nothing) on a deploy without
// Clerk keys, where ClerkProvider is not mounted and the hooks would throw.

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function ProfileChip() {
  if (!CLERK_ENABLED) return null;
  return <Inner />;
}

function Inner() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <span className="h-7 w-7 rounded-full bg-[color:var(--bg-surface-2)] animate-pulse" aria-hidden />;
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          title="Practicing anonymously. Sign in to save your progress."
          className="flex items-center gap-1.5 rounded-full border border-[color:var(--rule)] px-2.5 py-1 text-xs text-[color:var(--ink-3)] hover:border-[color:var(--accent-soft)] hover:text-[color:var(--ink-2)] transition-colors"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--ink-3)]" aria-hidden />
          Anonymous
        </button>
      </SignInButton>
    );
  }

  return (
    <span className="flex items-center gap-1.5" title="Signed in. Your progress is saved to your account.">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
      <UserButton />
    </span>
  );
}
