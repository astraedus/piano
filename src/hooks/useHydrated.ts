"use client";
import { useSyncExternalStore } from "react";

/** Never notifies: the value only ever changes once, when hydration happens. */
const subscribe = () => () => {};

/**
 * False while the client is reproducing the server's HTML, true afterwards.
 *
 * Anything that renders one thing on the server and a different thing for this
 * particular browser (the home page is the pitch until localStorage says the
 * visitor has a profile) needs this. Rendering the browser-specific version on
 * the first client pass is the React #418 hydration mismatch, which QA caught
 * here once already.
 *
 * `useSyncExternalStore` rather than the older `useState(false)` + `useEffect`
 * dance: the server snapshot is what hydration renders, and React swaps to the
 * client snapshot as part of finishing hydration rather than in a follow-up
 * effect. It also answers `true` immediately on a client-side navigation, where
 * there is no hydration to be safe about, so a route pushed to after onboarding
 * does not flash the pre-hydration branch on its way in.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
