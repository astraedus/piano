// Interval-Training ear rounds — pure, seedable, testable.
//
// The `interval` EarRoundType has lived in the union since V4 but
// `generateEarRound` never emitted one (confirmed in earRounds.ts). This module
// builds it: play two notes (a dyad), ask the interval. It is gated by earLevel
// (intervals are an L3+ skill — by then the user already labels chord quality).
//
// Determinism: the generator takes an injectable RNG so a seeded RNG yields a
// reproducible round (the production call passes Math.random). This keeps the
// note/answer choice fully unit-testable without mocking globals.

import type { EarRound, KeyId } from "./types";
import { KEY_META, pitchMidi, midiToSpn } from "./music";

/** Earliest ear level at which interval rounds appear. Below this, the ladder
 *  stays on the simpler maj/min + scale-degree rounds. */
export const INTERVAL_MIN_LEVEL = 3;

/** The intervals we train, in ascending semitone order. Kept to the consonant +
 *  common set a learner can actually name; chromatic oddities (tritone, m2) are
 *  omitted so the choices stay honestly answerable by ear. */
export interface IntervalSpec {
  /** Semitones above the lower note. */
  semitones: number;
  /** Stable choice id (also the correctId when chosen). */
  id: string;
  /** Human label shown on the choice button. */
  label: string;
}

export const INTERVALS: IntervalSpec[] = [
  { semitones: 2, id: "M2", label: "Major 2nd" },
  { semitones: 3, id: "m3", label: "Minor 3rd" },
  { semitones: 4, id: "M3", label: "Major 3rd" },
  { semitones: 5, id: "P4", label: "Perfect 4th" },
  { semitones: 7, id: "P5", label: "Perfect 5th" },
  { semitones: 9, id: "M6", label: "Major 6th" },
  { semitones: 12, id: "P8", label: "Octave" },
];

/** Injectable RNG: returns a float in [0, 1). Production passes Math.random. */
export type Rng = () => number;

function pick<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Build one interval ear-round in the given key, choosing the interval and its
 * distractors via the injected RNG.
 *
 * - The lower note is the key's tonic at octave 4; the upper note is `tonic +
 *   semitones`, so the round is anchored in the week's ghost key (consistent
 *   with the other ear rounds).
 * - The choice set is the correct interval plus three distractors drawn from the
 *   remaining INTERVALS, shuffled. Every choice maps to the `interval` glossary
 *   term so the post-answer auto-reveal has an entry to open.
 */
export function intervalRound(ghostKey: KeyId, rng: Rng = Math.random): EarRound {
  const meta = KEY_META[ghostKey];
  const correct = pick(INTERVALS, rng);

  const rootMidi = pitchMidi(meta.tonic + "4");
  const lower = midiToSpn(rootMidi);
  const upper = midiToSpn(rootMidi + correct.semitones);

  // Three distractors from the other intervals, then shuffle the 4 together.
  const others = INTERVALS.filter((i) => i.id !== correct.id);
  const distractors = sampleWithout(others, 3, rng);
  const choiceSpecs = shuffle([correct, ...distractors], rng);

  return {
    id: "interval-" + Math.random().toString(36).slice(2, 8),
    type: "interval",
    level: INTERVAL_MIN_LEVEL,
    prompt: "Which interval is this?",
    correctId: correct.id,
    choices: choiceSpecs.map((spec) => ({
      id: spec.id,
      label: spec.label,
      termId: "interval",
    })),
    audio: { kind: "interval", key: ghostKey, notes: [lower, upper] },
  };
}

/** Fisher–Yates shuffle driven by the injected RNG (pure; does not mutate input). */
export function shuffle<T>(arr: T[], rng: Rng): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Draw `n` distinct items from `arr` (without replacement) using the RNG. */
function sampleWithout<T>(arr: T[], n: number, rng: Rng): T[] {
  return shuffle(arr, rng).slice(0, Math.min(n, arr.length));
}
