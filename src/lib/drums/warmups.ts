import type { Warmup, WarmupType } from "../types";

// Drums warmups (2–4 min on the pad). Like guitar, each Warmup.id reuses an
// existing WarmupType (the shared union the app already understands) mapped to its
// nearest pad analog; the Record keys stay drums-named so the module + UI read
// naturally. No tonal placeholders — these are pure hand/timing warmups.
export const DRUMS_WARMUPS: Record<string, Warmup> = {
  "eight-on-a-hand": {
    id: "ghost-scale" as WarmupType,
    instrument: "drums",
    label: "8 on a hand",
    soulSummary: "Wake both hands up, slow and even",
    lines: [
      "eight slow full strokes on your right hand, then eight on your left.",
      "even height, even volume, even timing. speed is not the point — matched hands are.",
    ],
    postureLine: "sit or stand tall, forearms roughly level, shoulders relaxed. loose grip.",
  },
  "rebound-check": {
    id: "weight-transfer" as WarmupType,
    instrument: "drums",
    label: "rebound check",
    soulSummary: "Get the bounce feeling free again",
    lines: [
      "drop each stick and let it bounce four to six times on its own — do nothing.",
      "then play single strokes that spring back to the top by themselves. no lifting.",
    ],
    postureLine: "loose 'OK'-sign grip, back fingers a soft cage, wrists relaxed.",
  },
  "todays-rudiment": {
    id: "tone-drill" as WarmupType,
    instrument: "drums",
    label: "this week's rudiment",
    soulSummary: "Ease into this week's focus, slow",
    lines: [
      "play this week's rudiment as slowly as you can stay relaxed.",
      "lead with your left hand for a round — the weaker hand sets the honest tempo.",
    ],
    postureLine: "relax between reps. let the sticks fall into the pattern, don't force them.",
  },
  free: {
    id: "free" as WarmupType,
    instrument: "drums",
    label: "free warmup",
    soulSummary: "Play a groove you love, just to drop in",
    lines: [
      "no plan tonight.",
      "tap out a beat you like for ninety seconds. anything that makes you want to keep going.",
    ],
    postureLine: "drop in. the hands remember more than you think.",
  },
};

export const DRUMS_PHASE_1_ROTATION: string[] = [
  "eight-on-a-hand",
  "rebound-check",
  "todays-rudiment",
  "free",
];
export const DRUMS_PHASE_2_PLUS_ROTATION: string[] = [
  "eight-on-a-hand",
  "rebound-check",
  "todays-rudiment",
  "free",
];
