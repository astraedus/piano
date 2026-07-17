"use client";
// PadVisual — the drums InstrumentVisual: a clean top-down practice pad with two
// sticks. The drums analog of piano's Keyboard / guitar's Fretboard, and the ONE
// instrument-coupled visual for drums. It is deliberately NON-tonal: it ignores
// every tonal prop (scaleKey, notes, shape) the agnostic InstrumentVisualProps
// contract may carry, so a warmup/lesson slot can hand it the same props it hands
// piano and get a sensible pad, never a keyboard.
//
// `highlight` optionally lights one hand's stick + a ripple on the pad, so a
// lesson can point at "the RIGHT hand plays here".

import type { CSSProperties } from "react";

export interface PadVisualProps {
  /** Light one hand's stick + a strike ripple. Omit → neutral resting pad. */
  highlight?: "R" | "L";
  className?: string;
  ariaLabel?: string;
}

export function PadVisual({ highlight, className, ariaLabel }: PadVisualProps) {
  const accent = "var(--instrument-accent)";
  const accentDeep = "var(--instrument-accent-deep)";
  const ink3 = "var(--ink-3)";
  const rule = "var(--rule)";
  const surface2 = "var(--bg-surface-2)";

  const stickStyle = (hand: "R" | "L"): CSSProperties => ({
    stroke: highlight === hand ? accentDeep : ink3,
    strokeWidth: highlight === hand ? 7 : 6,
    strokeLinecap: "round",
    transition: "stroke 150ms ease",
  });

  return (
    <svg
      viewBox="0 0 220 150"
      className={className ?? "w-full max-w-[280px] h-auto"}
      role="img"
      aria-label={ariaLabel ?? "practice pad and two sticks"}
    >
      {/* Pad base shadow */}
      <ellipse cx="110" cy="98" rx="82" ry="30" fill={surface2} stroke={rule} strokeWidth="1.5" />
      {/* Pad rim (side wall) */}
      <path
        d="M 28 90 A 82 30 0 0 0 192 90 L 192 98 A 82 30 0 0 1 28 98 Z"
        fill={surface2}
        stroke={rule}
        strokeWidth="1.5"
      />
      {/* Pad playing surface (top) */}
      <ellipse cx="110" cy="90" rx="82" ry="30" fill="var(--bg-surface)" stroke={rule} strokeWidth="1.5" />
      {/* Strike ripple when a hand is highlighted */}
      {highlight && (
        <>
          <ellipse
            cx={highlight === "R" ? 138 : 82}
            cy="90"
            rx="20"
            ry="8"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            opacity="0.7"
          />
          <ellipse
            cx={highlight === "R" ? 138 : 82}
            cy="90"
            rx="10"
            ry="4"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            opacity="0.4"
          />
        </>
      )}
      {/* Left stick — from lower-left up to the pad */}
      <line x1="34" y1="146" x2="82" y2="90" style={stickStyle("L")} />
      {/* Right stick — from lower-right up to the pad */}
      <line x1="186" y1="146" x2="138" y2="90" style={stickStyle("R")} />
      {/* Stick tips */}
      <circle cx="82" cy="90" r="4.5" fill={highlight === "L" ? accentDeep : ink3} />
      <circle cx="138" cy="90" r="4.5" fill={highlight === "R" ? accentDeep : ink3} />
      {/* Hand labels */}
      <text x="34" y="140" fontSize="12" fill={ink3} textAnchor="middle" fontFamily="var(--font-mono)">L</text>
      <text x="186" y="140" fontSize="12" fill={ink3} textAnchor="middle" fontFamily="var(--font-mono)">R</text>
    </svg>
  );
}
