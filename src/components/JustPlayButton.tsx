"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";

/**
 * The href the header escape-hatch toggles to. From the guided plan it drops into
 * free play; from free play it returns to tonight's plan. Pure, so the toggle is
 * unit-tested without a router.
 */
export function freePlayHref(inFreePlay: boolean): string {
  return inFreePlay ? "/" : "/?mode=just-play";
}

/**
 * The always-visible top-right escape hatch (BRIEF non-negotiable #4). Styled as a
 * QUIET secondary — a ghost pill, never the loudest element — so the guided
 * session stays the primary action. It is a true toggle: "Free Play" into the
 * free slot, "Back to plan" once you're there. Named "Free Play" (not "Just Play")
 * to avoid colliding with the "Just Play" learning-path option.
 */
export function JustPlayButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const search = useSearchParams();
  const { patch } = useAppState();
  const inFreePlay = search?.get("mode") === "just-play";
  return (
    <button
      type="button"
      onClick={() => {
        patch({}); // ensures state exists
        router.push(freePlayHref(inFreePlay));
      }}
      className={
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-[0.02em] transition-colors " +
        "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:text-[color:var(--ink)] hover:border-[color:var(--accent-soft)] " +
        (compact ? "text-xs px-3 py-1" : "text-sm px-4 py-1.5")
      }
      aria-label={
        inFreePlay
          ? "Back to tonight's plan — return to the guided session."
          : "Free play — skip tonight's plan and just play. Still counts as a session."
      }
    >
      {inFreePlay ? <BackGlyph /> : <PlayGlyph />}
      {inFreePlay ? "Back to plan" : "Free Play"}
    </button>
  );
}

/** A small filled play triangle — real glyph, not an emoji. */
function PlayGlyph() {
  return (
    <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden className="shrink-0">
      <path d="M0 0.8 L8.4 5 L0 9.2 Z" fill="currentColor" />
    </svg>
  );
}

/** A small back-arrow glyph for the return-to-plan state. */
function BackGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
      <path d="M6.5 1.5 L3 5 L6.5 8.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
