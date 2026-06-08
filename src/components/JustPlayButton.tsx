"use client";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";

export function JustPlayButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { patch } = useAppState();
  return (
    <button
      type="button"
      onClick={() => {
        patch({}); // ensures state exists
        router.push("/?mode=just-play");
      }}
      className={
        "cta-pill inline-flex items-center gap-1.5 font-semibold tracking-[0.03em] " +
        (compact ? "text-xs px-3 py-1" : "text-sm px-4 py-1.5")
      }
      aria-label="Just play. Skip the structure and drop into free play."
    >
      <PlayGlyph />
      Just Play
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
