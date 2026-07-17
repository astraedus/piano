// Concrete guitar teaching SHAPES — pure, fully fact-checked as data, zero React.
//
// The single source of truth for the fretboard diagrams that back BOTH the
// glossary SEE-visuals (pentatonic / blues terms) AND the skill-node
// viz:"fretboard_map" panels. Before this, every fretboard_map node and every
// fretboard glossary term silently rendered the identical Am-pentatonic-Box-1
// default (Fretboard's `notes` prop was dead). These are the real, distinct
// shapes each surface should show.
//
// All frets verified against standard tuning (low→high E2 A2 D3 G3 B3 E4):
// string 1 = low E (open E2), string 6 = high e (open E4). A minor pentatonic =
// A C D E G. Box 1 roots at the 5th fret; Box 2 connects directly above it.

import type { FretPosition } from "../types";
import { scaleBoxFor } from "./scaleBox";

// Merge duplicate (string, fret) cells, keeping a root flag / label if either
// copy carries one. Used to join overlapping boxes into one highway.
function dedupePositions(positions: FretPosition[]): FretPosition[] {
  const byCell = new Map<string, FretPosition>();
  for (const p of positions) {
    const key = `${p.string}:${p.fret}`;
    const prev = byCell.get(key);
    byCell.set(key, {
      string: p.string,
      fret: p.fret,
      root: Boolean(prev?.root || p.root),
      label: p.label ?? prev?.label,
    });
  }
  return [...byCell.values()];
}

/** A minor pentatonic — Box 1 (5th fret). The moveable first-solo shape. */
export const AM_PENT_BOX1: FretPosition[] = scaleBoxFor("am");

/**
 * A minor pentatonic — Box 2 (connects directly above Box 1, frets 7–10).
 * Roots: A3 (D string, fret 7) and A4 (B string, fret 10). Every dot is a note
 * of A C D E G.
 */
export const AM_PENT_BOX2: FretPosition[] = [
  { string: 1, fret: 8 }, { string: 1, fret: 10 },              // C3, D3
  { string: 2, fret: 7 }, { string: 2, fret: 10 },              // E3, G3
  { string: 3, fret: 7, root: true }, { string: 3, fret: 10 },  // A3 (root), C4
  { string: 4, fret: 7 }, { string: 4, fret: 9 },               // D4, E4
  { string: 5, fret: 8 }, { string: 5, fret: 10, root: true },  // G4, A4 (root)
  { string: 6, fret: 8 }, { string: 6, fret: 10 },              // C5, D5
];

/**
 * The blues note (♭5, an Eb in A minor) added to Box 1 — the minor blues scale.
 * The Eb sits on the A string, fret 6, between the D (fret 5) and E (fret 7).
 */
export const BLUE_NOTE_AM: FretPosition = { string: 2, fret: 6, label: "♭5" };
export const AM_BLUES_BOX1: FretPosition[] = [...AM_PENT_BOX1, BLUE_NOTE_AM];

/**
 * Full-neck pentatonic: Box 1 and Box 2 joined into one connected map (frets
 * 5–10), showing the shape leaving first position and moving up the neck.
 */
export const AM_PENT_FULLNECK: FretPosition[] = dedupePositions([
  ...AM_PENT_BOX1,
  ...AM_PENT_BOX2,
]);

/**
 * Natural note names on the low E and A strings, frets 0–12. The map that power
 * chords, barre chords and the capo all secretly depend on. Each dot is labelled
 * with its letter; no sharps/flats (naturals only).
 */
export const NATURAL_NOTES_EA: FretPosition[] = [
  // low E string (open E) — E F G A B C D E
  { string: 1, fret: 0, label: "E" }, { string: 1, fret: 1, label: "F" },
  { string: 1, fret: 3, label: "G" }, { string: 1, fret: 5, label: "A" },
  { string: 1, fret: 7, label: "B" }, { string: 1, fret: 8, label: "C" },
  { string: 1, fret: 10, label: "D" }, { string: 1, fret: 12, label: "E" },
  // A string (open A) — A B C D E F G A
  { string: 2, fret: 0, label: "A" }, { string: 2, fret: 2, label: "B" },
  { string: 2, fret: 3, label: "C" }, { string: 2, fret: 5, label: "D" },
  { string: 2, fret: 7, label: "E" }, { string: 2, fret: 8, label: "F" },
  { string: 2, fret: 10, label: "G" }, { string: 2, fret: 12, label: "A" },
];

/**
 * Positions for each skill node whose viz is "fretboard_map". Each renders its
 * OWN shape instead of the shared default box. Keyed by node id; extend this map
 * (guarded by a test) whenever a new fretboard_map node is authored.
 */
export const FRETBOARD_MAP_POSITIONS: Record<string, FretPosition[]> = {
  "g-t2-pent-box1": AM_PENT_BOX1,
  "g-t2-blues-note": AM_BLUES_BOX1,
  "g-t2-pent-box2": AM_PENT_BOX2,
  "g-t2-fretboard-notes": NATURAL_NOTES_EA,
  "g-t3-fullneck": AM_PENT_FULLNECK,
};

/** The fretboard-map dots for a node id, or undefined if it has no authored map. */
export function fretboardMapFor(nodeId: string): FretPosition[] | undefined {
  return FRETBOARD_MAP_POSITIONS[nodeId];
}
