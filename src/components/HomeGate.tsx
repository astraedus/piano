"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";
import { PianoStand } from "./PianoStand";

export function HomeGate() {
  const router = useRouter();
  const { state, ready } = useAppState();

  useEffect(() => {
    if (ready && !state.firstOpenedAt) {
      router.replace("/onboarding");
    }
  }, [ready, state.firstOpenedAt, router]);

  if (!ready) {
    return <div className="text-[color:var(--ink-3)] font-serif italic">opening the file…</div>;
  }
  if (!state.firstOpenedAt) return null;
  return <PianoStand />;
}
