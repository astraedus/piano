// Guitar scale-box derivation — pure, fully testable, zero React.
//
// Curriculum batch #1, item #4: the guitar practice slots showed a CHORD shape
// (or the default pentatonic box) but had no way to plot the scale box for the
// CURRENT ghost key. This derives the moveable minor-pentatonic Box 1 rooted at
// the key, so the warmup/chain slot can show "here is the scale shape for this
// week's key" on the fretboard.
//
// Minor-pentatonic Box 1 is the universal first soloing shape. It is moveable:
// the same dot pattern slides up the neck, rooted at the tonic's fret on the low
// E string. For a MAJOR key we root the box at its relative minor (same five
// notes — the relative minor pentatonic IS the major pentatonic's box), so the
// shape shown is the correct scale for the key.

import type { KeyId } from "../types";
import { KEY_META } from "../music";

// Re-declared locally to avoid importing the React component's type. Matches
// Fretboard's FretPosition (string 1 = low E .. 6 = high e; fret 0 = open).
export interface ScaleBoxPosition {
  string: number;
  fret: number;
  root?: boolean;
  label?: string;
}

// Note-name -> fret on the low E string (0..11), E open = 0. Sharps only; we
// normalize flats to their sharp enharmonic for the fret math (the fret is the
// same pitch either way — this is positions, not spelling).
const LOW_E_FRET: Record<string, number> = {
  E: 0, F: 1, "F#": 2, Gb: 2, G: 3, "G#": 4, Ab: 4, A: 5, "A#": 6, Bb: 6,
  B: 7, C: 8, "C#": 9, Db: 9, D: 10, "D#": 11, Eb: 11,
};

// The moveable minor-pentatonic Box 1 shape, as fret OFFSETS from the root fret
// (string 1 = low E). Root degrees flagged. This is the canonical Box 1 the app
// already uses (lib/guitar/components/Fretboard default), expressed moveably.
const MINOR_PENT_BOX1_OFFSETS: ScaleBoxPosition[] = [
  { string: 1, fret: 0, root: true }, { string: 1, fret: 3 },
  { string: 2, fret: 0 }, { string: 2, fret: 2 },
  { string: 3, fret: 0 }, { string: 3, fret: 2 },
  { string: 4, fret: 0 }, { string: 4, fret: 2 },
  { string: 5, fret: 0 }, { string: 5, fret: 3 },
  { string: 6, fret: 0, root: true }, { string: 6, fret: 3 },
];

/** The minor tonic letter for a key: the key's own tonic if it's minor, else its
 *  relative minor's tonic (so a major key's box shows the right five notes). */
export function scaleBoxRootNote(keyId: KeyId): string {
  const meta = KEY_META[keyId];
  if (meta.mode === "minor") return meta.tonic;
  return KEY_META[meta.relative].tonic; // relative minor of the major key
}

/** Root fret (0..11) of the moveable box on the low E string for a key. */
export function scaleBoxRootFret(keyId: KeyId): number {
  const root = scaleBoxRootNote(keyId);
  return LOW_E_FRET[root] ?? LOW_E_FRET[root.replace(/b$/, "")] ?? 5;
}

/**
 * The minor-pentatonic Box 1 positions for a key, shifted to its root fret. If
 * the root fret is 0 (open E minor), the box sits at the nut. Pure. Returns the
 * dot list the Fretboard component plots directly.
 */
export function scaleBoxFor(keyId: KeyId): ScaleBoxPosition[] {
  const rootFret = scaleBoxRootFret(keyId);
  return MINOR_PENT_BOX1_OFFSETS.map((p) => ({
    ...p,
    fret: p.fret + rootFret,
  }));
}
