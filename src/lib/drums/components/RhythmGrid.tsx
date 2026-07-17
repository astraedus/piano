"use client";
// RhythmGrid — the drums NotationVisual. The research-endorsed v1 representation
// (reading.json): a letter+count grid, NOT staff notation. Each column is one
// subdivision cell showing, top to bottom:
//   • an accent wedge ">" when the hit is accented,
//   • the sticking letter R / L (or "–" for a rest — a beat you leave silent),
//   • the count syllable underneath ("1  e  &  a").
//
// Pattern data rides the deliberately-loose `tab?: TabData` field of the agnostic
// NotationVisualProps (design decision 6), so we never widen the notation contract
// to carry drum-specific data. `DrumsTabData` is assignable to that loose shape.

import type { StickingCell } from "../../types";
import type { TabData } from "../../instrumentRegistry";

export interface DrumsTabData extends TabData {
  pattern?: StickingCell[];
}

export interface RhythmGridProps {
  /** The sticking cells to render (count + R/L + accent/rest). */
  pattern?: StickingCell[];
  className?: string;
  ariaLabel?: string;
}

// A sensible default so a grid with no data still reads: one bar of quarter-note
// single strokes, R L R L, counted 1 2 3 4.
const DEFAULT_PATTERN: StickingCell[] = [
  { hand: "R", count: "1" },
  { hand: "L", count: "2" },
  { hand: "R", count: "3" },
  { hand: "L", count: "4" },
];

/** A plain-text transcription of a pattern for aria/labels + reuse as ear-round
 *  choice labels (e.g. "R L  –  R" with accents marked "R>"). Pure. */
export function stickingToText(pattern: StickingCell[]): string {
  return pattern
    .map((c) => (c.rest ? "–" : `${c.hand ?? "?"}${c.accent ? ">" : ""}`))
    .join(" ");
}

/** The count row as text ("1 e & a 2 …"). Pure. */
export function countRowText(pattern: StickingCell[]): string {
  return pattern.map((c) => c.count ?? "·").join(" ");
}

export function RhythmGrid({ pattern, className, ariaLabel }: RhythmGridProps) {
  const cells = pattern && pattern.length > 0 ? pattern : DEFAULT_PATTERN;

  return (
    <div
      data-testid="rhythm-grid"
      className={className ?? "overflow-x-auto max-w-full"}
      role="img"
      aria-label={ariaLabel ?? `rhythm pattern: ${stickingToText(cells)}`}
    >
      <div
        className="inline-grid gap-x-1.5 rounded-lg border px-3 py-2.5"
        style={{
          gridTemplateColumns: `repeat(${cells.length}, minmax(1.75rem, 1fr))`,
          borderColor: "var(--rule)",
          background: "var(--bg-surface-2)",
        }}
      >
        {/* Accent row */}
        {cells.map((c, i) => (
          <div
            key={`a${i}`}
            className="text-center text-xs font-bold leading-none h-3"
            style={{ color: "var(--instrument-accent-deep)" }}
            aria-hidden
          >
            {c.accent ? ">" : ""}
          </div>
        ))}
        {/* Sticking row */}
        {cells.map((c, i) => (
          <div
            key={`s${i}`}
            data-testid={`rg-stick-${i}`}
            className="text-center font-mono text-base leading-snug"
            style={{
              color: c.rest
                ? "var(--ink-3)"
                : c.accent
                  ? "var(--instrument-accent-deep)"
                  : "var(--ink)",
              fontWeight: c.accent ? 700 : 500,
            }}
          >
            {c.rest ? "–" : (c.hand ?? "·")}
          </div>
        ))}
        {/* Count row */}
        {cells.map((c, i) => (
          <div
            key={`c${i}`}
            className="text-center font-mono text-xs leading-none pt-1"
            style={{ color: "var(--ink-3)" }}
          >
            {c.count ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
