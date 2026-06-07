import type { Warmup, WarmupType } from "../types";

// Guitar warmups. Keyed by guitar-friendly slugs (the Record key is what
// warmupRotation references); each Warmup.id reuses an existing WarmupType (the
// shared union the app already understands) mapped to its nearest guitar analog:
//   tuning            → "free"           (settle in, get in tune)
//   finger-stretch    → "weight-transfer" (relaxation / posture, the #1 guitar fix)
//   one-minute-changes→ "tone-drill"     (JustinGuitar's core automaticity burst)
//   chromatic-spider  → "ghost-scale"    (the scale-shaped daily mechanical warmup)
//   free              → "free"
//
// The Record keys stay guitar-named so the module + UI read naturally; the `id`
// union value keeps Warmup type-safe without touching shared types.
export const GUITAR_WARMUPS: Record<string, Warmup> = {
  tuning: {
    id: "free" as WarmupType,
    instrument: "guitar",
    label: "tune up",
    lines: [
      "tune all six strings to a tuner — E A D G B E, low to high.",
      "play each open string slowly. listen. a guitar in tune is half the battle.",
    ],
    postureLine: "sit tall, guitar resting on the leg, neck angled slightly up. shoulders down.",
  },
  "finger-stretch": {
    id: "weight-transfer" as WarmupType,
    instrument: "guitar",
    label: "finger stretch",
    lines: [
      "thumb behind the neck, fingers curved. press fret 1 to 4 on the low E, one finger each.",
      "no death-grip — the lightest pressure that rings clean. shake the hand out after.",
    ],
    postureLine: "fret-hand thumb behind the neck, not hooked over. wrist relaxed, fingertips not pads.",
  },
  "one-minute-changes": {
    id: "tone-drill" as WarmupType,
    instrument: "guitar",
    label: "one-minute changes",
    lines: [
      "pick two chords you know. count how many clean changes you make in 60 seconds.",
      "write the number down. tomorrow, beat it. the count going up is the whole game.",
    ],
    postureLine: "relax between changes. let the fingers fall into the shape — don't force it.",
  },
  "chromatic-spider": {
    id: "ghost-scale" as WarmupType,
    instrument: "guitar",
    label: "chromatic spider",
    lines: [
      "frets 1-2-3-4 on every string, alternate-picked, slow. one finger per fret.",
      "the spider walk. even volume, even timing. speed comes later, on its own.",
    ],
    postureLine: "pick-hand wrist loose, ~45° pick angle. let the forearm rest on the body.",
  },
  free: {
    id: "free" as WarmupType,
    instrument: "guitar",
    label: "free warmup",
    lines: [
      "no plan tonight.",
      "play a riff you like for 90 seconds. anything that makes you want to keep going.",
    ],
    postureLine: "drop in. the hands remember more than you think.",
  },
};

export const GUITAR_PHASE_1_ROTATION: string[] = [
  "tuning",
  "finger-stretch",
  "one-minute-changes",
  "chromatic-spider",
  "free",
];
export const GUITAR_PHASE_2_PLUS_ROTATION: string[] = [
  "tuning",
  "finger-stretch",
  "one-minute-changes",
  "chromatic-spider",
  "free",
];
