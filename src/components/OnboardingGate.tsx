"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";
import { useHydrated } from "@/hooks/useHydrated";
import { Onboarding } from "./Onboarding";

/**
 * The mirror of `HomeGate`, and the reason "Start practising" can be one link.
 *
 * `/` no longer pushes new visitors into onboarding, so the CTA on every public
 * page points at `/onboarding` directly: a first-time reader has just been
 * pitched and should not be pitched again. Somebody who already has a profile can
 * follow the same link (from a marketing page, an old bookmark, a shared URL), and
 * for them the questionnaire is wrong, so they go back to their practice stand.
 *
 * The gate is deliberately narrow. Settings' "clear all data" also navigates here,
 * but it clears state first, so there is nothing left to bounce and a genuine
 * restart still reaches the questions.
 *
 * `useHydrated` is the same guard `HomeGate` documents: the first client render
 * matches the server exactly, and `ready` means localStorage has actually been
 * read rather than assumed empty.
 */
export function OnboardingGate() {
  const router = useRouter();
  const { state, ready } = useAppState();
  const hydrated = useHydrated();

  const alreadyOnboarded = hydrated && ready && Boolean(state.firstOpenedAt);

  useEffect(() => {
    if (alreadyOnboarded) router.replace("/");
  }, [alreadyOnboarded, router]);

  if (alreadyOnboarded) return null;
  return <Onboarding />;
}
