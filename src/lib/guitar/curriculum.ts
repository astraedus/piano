// Shared guitar constants — the guitar analog of piano's trinity.ts.
//
// Piano rotates a weekly "ghost key" (scale of the week). Guitar's spine is built
// around moveable shapes and pentatonic boxes rather than 12-major-key fluency, so
// the "focus key of the week" is a small, pedagogically-ordered set: the open-chord
// home keys (Em, Am, E, A, G, C, D) early, the blues/pentatonic keys (Am, Em, E, A)
// as the lead-guitar phases arrive. These KeyIds line up with each chain drill's
// `ghostKey`, so chainDrillPicker's "soft-prefer ghost key" logic still works.
//
// Tuning + open strings are the one hard fact every guitar surface needs (tab,
// fretboard map, chord diagrams), kept here as the single source of truth.

import type { KeyId, Phase } from "../types";

// Standard tuning, low (6th) string → high (1st) string. Index 0 = low E.
// Matches the `chordShape` array convention used across guitar skill nodes:
//   chordShape[0] = low E (6th string), chordShape[5] = high e (1st string).
export const STANDARD_TUNING = ["E", "A", "D", "G", "B", "E"] as const;
export const OPEN_STRING_PITCHES = ["E2", "A2", "D3", "G3", "B3", "E4"] as const;

// String labels for diagrams (svguitar tuning array is high-e → low-E? no: it is
// indexed string 1..6 = high e..low E, see ChordDiagram for the mapping).
export const STRING_COUNT = 6;

// Tab technique symbols, color-coded per guitar.md viz guide.
export const TAB_SYMBOLS = ["h", "p", "/", "\\", "b", "~", "x"] as const;
export const TAB_SYMBOL_COLORS: Record<string, string> = {
  h: "#2870A0", // hammer-on — blue
  p: "#B83030", // pull-off — red
  "/": "#C07000", // slide up — yellow/amber
  "\\": "#C07000", // slide down — amber
  b: "#C06020", // bend — orange
  "~": "#3A8040", // vibrato — green
  x: "#7A6448", // muted — ink-tertiary
};

// Focus "key of the week" per phase — the guitar analog of GHOST_ROTATION_PER_PHASE.
// Early phases live in the open-chord / power-chord home keys; later phases lean
// into the pentatonic/blues keys where the lead vocabulary is built.
export const GUITAR_GHOST_ROTATION: Record<Phase, KeyId[]> = {
  1: ["em", "am", "E", "A", "G"],
  2: ["em", "am", "E", "A", "G", "C", "D"],
  3: ["am", "em", "E", "A", "G", "C", "D"],
  4: ["am", "em", "E", "A", "B", "G", "C", "D"],
  5: ["am", "em", "E", "A", "B", "G", "C", "D"],
};
