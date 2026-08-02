"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAppState } from "@/hooks/useAppState";
import { useHydrated } from "@/hooks/useHydrated";
import { setReturningVisitor } from "@/lib/domAttrs";

/**
 * Decides what `/` is for the person who just arrived.
 *
 * - Nobody has onboarded in this browser, or there is no JavaScript at all:
 *   `landing`, the server-rendered pitch. This used to be a `router.replace` into
 *   `/onboarding`, which meant every visitor from search or a link met a
 *   questionnaire before being told what the app was.
 * - Already onboarded: `app`, the practice stand, exactly as before. The signal is
 *   `state.firstOpenedAt`, the same one the redirect keyed off, written once when
 *   onboarding finishes.
 *
 * Both branches are passed in as props so this stays a pure switch and the landing
 * stays a server component: it is in the HTML of the response rather than
 * something hydration has to assemble.
 *
 * Two conditions guard the swap, and both are load-bearing:
 *  - `useHydrated` keeps the first client render identical to the server's. Gating
 *    on `ready` alone let the provider's hydration effect flip state before React
 *    reconciled this subtree, which is the React #418 mismatch QA caught.
 *  - `ready` means localStorage has actually been read, so an onboarded user is
 *    never briefly classified as a stranger.
 *
 * The returning user does not watch the pitch flash while that happens: the
 * pre-paint boot script in `app/layout.tsx` sets `data-returning` from the same
 * stored field and `globals.css` hides the landing subtree under it.
 * `setReturningVisitor` re-asserts that flag from real state once hydrated, so a
 * stale pre-paint guess self-heals instead of leaving somebody on a hidden page.
 */
export function HomeGate({ landing, app }: { landing: ReactNode; app: ReactNode }) {
  const { state, ready } = useAppState();
  const onboarded = Boolean(state.firstOpenedAt);
  const decided = useHydrated() && ready;

  useEffect(() => {
    if (decided) setReturningVisitor(onboarded);
  }, [decided, onboarded]);

  if (decided && onboarded) return <>{app}</>;

  return (
    <>
      <div data-home-landing="">{landing}</div>
      {/* Hidden by default; `data-returning` on the root is what reveals it, so
          this is the only thing a returning user paints before the stand arrives
          and a crawler, which runs no script, never sees it at all. Last in the
          DOM so the pitch is what a text-only reader meets first; it fills the
          viewport when shown, and the landing is hidden in that case, so order
          costs it nothing. */}
      {!decided && (
        <div
          data-home-resume=""
          className="min-h-screen items-center justify-center px-5"
          aria-hidden="true"
        >
          <p className="font-serif italic text-[color:var(--ink-3)]">
            Loading your practice stand
          </p>
        </div>
      )}
    </>
  );
}
