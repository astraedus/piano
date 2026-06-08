"use client";
// Soul-First Learning (V4) — the Explain card.
//
// The floating explainer anchored under a TermChip. Four sections, always in
// order: WHAT IT IS / HEAR IT / SEE IT / WHY IT MATTERS. Rendered once by
// ExplainProvider (singleton), positioned over the triggering chip via a portal
// so it floats above the skill graph and any scroll container.
//
// Dismiss: click outside, Escape, or the × button. Mobile-friendly: the card is
// width-capped and clamps to the viewport; the HEAR button is a >=44px tap
// target. Honors reduced-motion (the fade is dropped via the .fade-in rule).

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GlossaryEntry } from "@/lib/explain/glossary";
import { TermVisual } from "@/components/explain/TermVisual";

export interface ExplainProps {
  entry: GlossaryEntry;
  anchor: HTMLElement; // the triggering chip, for positioning
  onClose: () => void;
}

// Card sizing constants (kept here so positioning math matches the rendered box).
const CARD_WIDTH = 320;
const GAP = 8; // px between the chip and the card
const MARGIN = 8; // min viewport margin

export function Explain({ entry, anchor, onClose }: ExplainProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => setMounted(true), []);

  // Position the card under the anchor, clamped into the viewport. useLayoutEffect
  // so it places before paint (no flash at 0,0). Recompute on scroll/resize.
  useLayoutEffect(() => {
    if (!mounted) return;
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const cardH = cardRef.current?.offsetHeight ?? 240;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = rect.left;
      if (left + CARD_WIDTH > vw - MARGIN) left = vw - MARGIN - CARD_WIDTH;
      if (left < MARGIN) left = MARGIN;

      // Prefer below the chip; flip above if it would overflow the bottom.
      let top = rect.bottom + GAP;
      if (top + cardH > vh - MARGIN && rect.top - GAP - cardH > MARGIN) {
        top = rect.top - GAP - cardH;
      }
      setPos({ top, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [anchor, mounted]);

  // Dismiss on Escape or outside-click. The anchor click is excluded so the
  // chip's own handler (which re-opens) doesn't immediately fight a close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (cardRef.current?.contains(t)) return;
      if (anchor.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    // capture so we catch the click before other handlers stop propagation
    document.addEventListener("mousedown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown, true);
    };
  }, [anchor, onClose]);

  const onPlay = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    try {
      await entry.hear();
    } catch {
      /* audio is best-effort; never throw out of a tap handler */
    } finally {
      setPlaying(false);
    }
  }, [entry, playing]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={cardRef}
      role="dialog"
      aria-label={`Explain: ${entry.title}`}
      className="fade-in stage-card fixed z-50 p-4 text-left"
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        width: CARD_WIDTH,
        maxWidth: "calc(100vw - 16px)",
        visibility: pos ? "visible" : "hidden",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-serif text-lg text-[color:var(--ink)] leading-tight">{entry.title}</h4>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 -mt-1 -mr-1 h-9 w-9 flex items-center justify-center rounded-full text-[color:var(--ink-3)] hover:text-[color:var(--ink)] text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* WHAT IT IS */}
      <p className="mt-2 font-serif text-base text-[color:var(--ink)]">{entry.what}</p>

      {/* HEAR IT */}
      <div className="mt-3">
        <button
          type="button"
          onClick={onPlay}
          disabled={playing}
          className="chip chip-accent inline-flex items-center gap-2 min-h-[44px] px-4 disabled:opacity-60"
        >
          <span aria-hidden>▶</span>
          {playing ? "Playing…" : "Hear it"}
        </button>
      </div>

      {/* SEE IT */}
      <div className="mt-3">
        <TermVisual entry={entry} />
      </div>

      {/* WHY IT MATTERS */}
      <p className="mt-3 text-sm text-[color:var(--ink-2)] italic">{entry.why}</p>
    </div>,
    document.body,
  );
}

