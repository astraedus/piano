"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";
import { PracticeStand } from "./PracticeStand";

export function HomeGate() {
  const router = useRouter();
  const { state, ready } = useAppState();

  // Mount gate. The server always renders the "Loading…" placeholder (state is
  // the default, `ready` is false during SSR). The provider's hydration effect
  // can flip `ready` to true *before* React reconciles this suspended subtree on
  // the client, so gating only on `ready` let the client's first render swap in
  // PracticeStand while the server HTML still said "Loading…" — the React #418
  // hydration mismatch QA caught. `mounted` is provably false during hydration
  // (its setter only runs in an effect, i.e. after the first commit), so the
  // first client render renders the identical placeholder the server did. Only
  // after hydration completes do we consult `ready`/state and swap content.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && ready && !state.firstOpenedAt) {
      router.replace("/onboarding");
    }
  }, [mounted, ready, state.firstOpenedAt, router]);

  if (!mounted || !ready) {
    return <div className="text-[color:var(--ink-3)] font-serif italic">Loading…</div>;
  }
  if (!state.firstOpenedAt) return null;
  return <PracticeStand />;
}
