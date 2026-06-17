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
import { KEY_META, noteIndex } from "../music";

// Re-declared locally to avoid importing the React component's type. Matches
// Fretboard's FretPosition (string 1 = low E .. 6 = high e; fret 0 = open).
export interface ScaleBoxPosition {
  string: number;
  fret: number;
  root?: boolean;
  label?: string;
}

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

/** Root fret (0..11) of the moveable box on the low E string for a key. The low
 *  E string is the note E, so the fret is the pitch-class distance from E —
 *  music.ts already owns the note-name → pitch-class mapping (handles #/b/Cb). */
export function scaleBoxRootFret(keyId: KeyId): number {
  const root = scaleBoxRootNote(keyId);
  return (noteIndex(root) - noteIndex("E") + 12) % 12;
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
