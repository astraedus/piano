// Guitar capo math — the capo as a KEY MULTIPLIER.
//
// A capo clamps across all strings at a fret, shortening every string by the
// same amount, so a chord SHAPE you already know sounds higher by the capo's
// fret number in semitones. That means the 5 open CAGED shapes (C, A, G, E, D)
// you learned in open position can sound in EVERY key just by moving one bar —
// near-zero new motor cost, the whole key spectrum unlocked. This module is the
// pure teaching content behind the g-t1-capo node:
//   - CAPO_SHAPES        the 5 CAGED shapes + their open-position sounding root
//   - soundingKey()      shape + capo fret  → the sounding key (note name)
//   - capoFret()         target key + shape → the fret to clamp the capo
//   - CAPO_CHART         the static 5 shapes × frets 0-7 grid (for the chart UI)
//
// Pure data + pure functions. No DOM, no audio, no React — UI consumes these.
//
// Pitch-class convention matches src/lib/music.ts: C=0, C#=1, … B=11. A capo on
// fret N raises a shape's sounding pitch by N semitones, so:
//   soundingPitchClass = (shapeOpenPitchClass + fret) mod 12
// and the inverse (which fret reaches a target key with a given shape):
//   fret = ((targetPitchClass - shapeOpenPitchClass) mod 12 + 12) mod 12

import { noteIndex } from "../music";

export type CagedShape = "C" | "A" | "G" | "E" | "D";

/** The 5 common open CAGED shapes, in their canonical chart order, each with the
 *  pitch class its OPEN (capo-0) form sounds — the major chord it IS in open
 *  position. C=0, A=9, G=7, E=4, D=2. */
export const CAPO_SHAPES: { shape: CagedShape; openPitchClass: number }[] = [
  { shape: "C", openPitchClass: 0 },
  { shape: "A", openPitchClass: 9 },
  { shape: "G", openPitchClass: 7 },
  { shape: "E", openPitchClass: 4 },
  { shape: "D", openPitchClass: 2 },
];

const OPEN_PC: Record<CagedShape, number> = Object.fromEntries(
  CAPO_SHAPES.map((s) => [s.shape, s.openPitchClass]),
) as Record<CagedShape, number>;

/** The frets covered by the static chart: open (0) through 7. Capo past ~7 is
 *  rare and the geometry gets cramped, so the teaching chart stops at 7. */
export const CAPO_FRETS: number[] = [0, 1, 2, 3, 4, 5, 6, 7];

// Deterministic, theory-correct spelling for each of the 12 major key names a
// capo can produce — each pitch class spelled as the conventionally-preferred
// major key (fewest accidentals): Db (5♭) over C# (7♯), Gb/F# at 6 each (F#
// chosen, the common guitar key), and Eb/Ab/Bb flat. Indexed by pitch class
// (0 = C … 11 = B).
const KEY_SPELLING: string[] = [
  "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B",
];

/** Spell a pitch class as a major-key name using the conventional spelling. */
export function keyNameForPitchClass(pc: number): string {
  return KEY_SPELLING[((pc % 12) + 12) % 12];
}

/** The 12 selectable target keys for the calculator, in chromatic order from C,
 *  each as a {name, pitchClass} pair. */
export const TARGET_KEYS: { name: string; pitchClass: number }[] = KEY_SPELLING.map(
  (name, pitchClass) => ({ name, pitchClass }),
);

/**
 * The sounding key when a given CAGED shape is played with the capo at `fret`.
 * Returns a major-key note name (e.g. "D", "Bb"). Capo 0 = the shape's open
 * chord. Frets wrap mod 12 (a capo at fret 12 sounds the same key an octave up).
 */
export function soundingKey(shape: CagedShape, fret: number): string {
  const pc = (OPEN_PC[shape] + fret) % 12;
  return keyNameForPitchClass(pc);
}

/**
 * The fret to place the capo so that the given CAGED `shape` sounds as
 * `targetKey`. `targetKey` may be a note name ("D", "Bb", "F#") or a pitch
 * class number (0-11). Always returns 0-11 (the lowest capo position that
 * reaches the target; add 12 for the same key an octave up).
 */
export function capoFret(shape: CagedShape, targetKey: string | number): number {
  const targetPc = typeof targetKey === "number" ? targetKey : noteIndex(targetKey);
  return (((targetPc - OPEN_PC[shape]) % 12) + 12) % 12;
}

export interface CapoChartRow {
  shape: CagedShape;
  /** The shape's open (capo-0) sounding key, for the row label. */
  openKey: string;
  /** Sounding key at each fret in CAPO_FRETS (parallel array). */
  sounding: string[];
}

/** The full static chart: one row per CAGED shape, the sounding key at each of
 *  CAPO_FRETS (0-7). Pure derivation of soundingKey over the grid. */
export const CAPO_CHART: CapoChartRow[] = CAPO_SHAPES.map(({ shape }) => ({
  shape,
  openKey: soundingKey(shape, 0),
  sounding: CAPO_FRETS.map((fret) => soundingKey(shape, fret)),
}));
