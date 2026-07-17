// Drums focus-of-the-week — the ONE place opaque rotation tokens are interpreted
// (design decision 1). The shared spine rotates a "ghost key" (a KeyId); for drums
// that KeyId is meaningless as a pitch, so here we map each token → the rudiment it
// stands for (its display name, a plain-language blurb, and a sticking pattern the
// RhythmGrid + percussion audio render from).
//
// Tokens (per the design doc): C→singles, G→doubles, D→accents, A→paradiddle,
// E→five-stroke, F→flam, B→drag, am→buzz. Stage A only rotates "C" (see
// curriculum.ts), but the full map is defined here so Stage B just widens the
// rotation. Nothing here changes which drill is picked — presentation only.

import type { KeyId, StickingCell } from "../types";

export interface DrumsFocus {
  /** The rudiment's display name, e.g. "Single Stroke Roll". */
  label: string;
  /** One-line, jargon-free "what this is" hint. */
  blurb: string;
  /** The sticking pattern (count + R/L + accents) the RhythmGrid + audio render. */
  pattern: StickingCell[];
}

const DRUMS_FOCUS_BY_TOKEN: Partial<Record<KeyId, DrumsFocus>> = {
  // C — Single Stroke Roll: the alternating R L R L that every other rudiment is
  // built on, and the through-line of all foundational pad work.
  C: {
    label: "Single Stroke Roll",
    blurb: "hand to hand, R L R L — even and matched, the root of every rudiment.",
    pattern: [
      { hand: "R", accent: true, count: "1" }, { hand: "L", count: "&" },
      { hand: "R", count: "2" }, { hand: "L", count: "&" },
      { hand: "R", count: "3" }, { hand: "L", count: "&" },
      { hand: "R", count: "4" }, { hand: "L", count: "&" },
    ],
  },
  // G — Double Stroke Roll: two even strokes per hand, R R L L.
  G: {
    label: "Double Stroke Roll",
    blurb: "two even strokes per hand — R R L L — the bounce doing half the work.",
    pattern: [
      { hand: "R", accent: true, count: "1" }, { hand: "R", count: "e" },
      { hand: "L", count: "&" }, { hand: "L", count: "a" },
      { hand: "R", count: "2" }, { hand: "R", count: "e" },
      { hand: "L", count: "&" }, { hand: "L", count: "a" },
    ],
  },
  // D — Accents & Taps: one loud note among quiet ones, without the taps changing.
  D: {
    label: "Accents & Taps",
    blurb: "one loud note among quiet ones — the accent moves, the taps stay soft.",
    pattern: [
      { hand: "R", accent: true, count: "1" }, { hand: "L", count: "&" },
      { hand: "R", count: "2" }, { hand: "L", count: "&" },
      { hand: "R", accent: true, count: "3" }, { hand: "L", count: "&" },
      { hand: "R", count: "4" }, { hand: "L", count: "&" },
    ],
  },
  // A — Single Paradiddle: R L R R  L R L L — singles and doubles combined.
  A: {
    label: "Single Paradiddle",
    blurb: "R L R R, L R L L — a single, a single, then a double, hand switching.",
    pattern: [
      { hand: "R", accent: true, count: "1" }, { hand: "L", count: "e" },
      { hand: "R", count: "&" }, { hand: "R", count: "a" },
      { hand: "L", accent: true, count: "2" }, { hand: "R", count: "e" },
      { hand: "L", count: "&" }, { hand: "L", count: "a" },
    ],
  },
  // E — Five Stroke Roll: R R L L R (accented end), a fixed-count roll.
  E: {
    label: "Five Stroke Roll",
    blurb: "a short fixed roll — R R L L R — capped by one clear accent.",
    pattern: [
      { hand: "R", count: "1" }, { hand: "R", count: "e" },
      { hand: "L", count: "&" }, { hand: "L", count: "a" },
      { hand: "R", accent: true, count: "2" },
    ],
  },
  // F — Flam: a soft grace note a hair before the main note, heard as one thick hit.
  F: {
    label: "The Flam",
    blurb: "a soft grace note just before the main hit — one thick note, not two.",
    pattern: [
      { hand: "L", count: "" }, { hand: "R", accent: true, count: "1" },
      { hand: "R", count: "2" },
    ],
  },
  // B — Drag (Ruff): two soft grace notes into a tap.
  B: {
    label: "The Drag",
    blurb: "two quick soft grace notes leading into a tap — a little rip of sound.",
    pattern: [
      { hand: "L", count: "" }, { hand: "L", count: "" },
      { hand: "R", accent: true, count: "1" },
    ],
  },
  // am — Buzz Roll: many pressed multiple-bounce strokes blurring into a sustain.
  am: {
    label: "Buzz Roll",
    blurb: "press each stick so it buzzes many times — the smooth sustained roll.",
    pattern: [
      { hand: "R", count: "1" }, { hand: "R", count: "e" },
      { hand: "L", count: "&" }, { hand: "L", count: "a" },
      { hand: "R", count: "2" }, { hand: "R", count: "e" },
      { hand: "L", count: "&" }, { hand: "L", count: "a" },
    ],
  },
};

// Generic fallback so an unexpected/future token never crashes a header or shows
// a raw tonal key name.
function fallbackFocus(token: string): DrumsFocus {
  return {
    label: `${token} rudiment`,
    blurb: "this week's sticking focus.",
    pattern: [
      { hand: "R", accent: true, count: "1" }, { hand: "L", count: "2" },
      { hand: "R", count: "3" }, { hand: "L", count: "4" },
    ],
  };
}

/** Resolve the full drums focus (label + blurb + pattern) for a rotation token. */
export function drumsFocusFor(token: string): DrumsFocus {
  return DRUMS_FOCUS_BY_TOKEN[token as KeyId] ?? fallbackFocus(token);
}

/** The rudiment display name for a token — what InstrumentModule.focusLabel returns. */
export function drumsFocusLabel(token: string): string {
  return drumsFocusFor(token).label;
}
