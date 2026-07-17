import type { Phase, Warmup, WarmupType } from "../types";

export const WARMUPS: Record<WarmupType, Warmup> = {
  "ghost-scale": {
    id: "ghost-scale",
    instrument: "piano",
    label: "week's scale",
    soulSummary: "Loosen up in this week's home key",
    lines: [
      "this week's scale, hands separate. 2 octaves. slow on the return.",
      "or just play this week's scale for a minute. don't count.",
    ],
    postureLine: "neck free. shoulders drop. forearms heavy. let arm weight rest on the keys.",
  },
  "weight-transfer": {
    id: "weight-transfer",
    instrument: "piano",
    // `{fiveFinger}` is substituted with this week's key's five-finger pattern at
    // render (WarmupSlot.fillWarmupLine) so it is never hardcoded to C.
    label: "weight transfer",
    soulSummary: "Let your arm do the work, no tension",
    lines: [
      "five-finger pattern — {fiveFinger}.",
      "transfer arm weight finger to finger. zero tension between strikes.",
      "or just mash the keys to your favourite song.",
    ],
    postureLine: "jaw unclenched. shoulders drop. arm weight into the keys, not through the fingers.",
  },
  "triad-tour": {
    id: "triad-tour",
    instrument: "piano",
    label: "triad tour",
    soulSummary: "Walk the chords and feel where home is",
    lines: [
      "walk the I, IV, V and vi chords of this week's key — Roman numerals for the 1, 4, 5 and 6 chords. both hands.",
      "once around, slowly. feel where home is.",
    ],
    postureLine: "let the keys meet you. quiet hands. listen for the top note.",
  },
  "mirror": {
    id: "mirror",
    instrument: "piano",
    label: "mirror",
    soulSummary: "Two hands, two directions, wake up coordination",
    lines: [
      "left hand plays the scale backwards while the right plays forwards.",
      "if it falls apart, laugh. begin again.",
    ],
    postureLine: "wide shoulders. spine long. nothing held tight.",
  },
  "free": {
    id: "free",
    instrument: "piano",
    label: "free warmup",
    soulSummary: "Play anything for 90 seconds, just to drop in",
    lines: [
      "no structure tonight.",
      "play for 90 seconds. anything. any key you press counts.",
    ],
    postureLine: "drop in. no plan. the hands know more than you think.",
  },
  "parallel-sets": {
    id: "parallel-sets",
    instrument: "piano",
    label: "parallel sets",
    soulSummary: "Build speed in short bursts, then rest",
    lines: [
      "pick a 4-note burst in today's key. play it at target tempo, pause, again.",
      "build speed inside the burst. knit later.",
    ],
    postureLine: "forearm relaxed. let rotation carry the hand. bursts, not scrapes.",
  },
  "tone-drill": {
    id: "tone-drill",
    instrument: "piano",
    label: "tone drill",
    soulSummary: "One note, many feelings, all from your touch",
    lines: [
      "one note, ten ways — whisper · clear · bright · dark · ringing · singing · punchy · distant · warm · cold.",
      "use weight and alignment, not force.",
    ],
    postureLine: "let the note speak on its own terms. hear it before you play it.",
  },
};

export const PHASE_1_ROTATION: WarmupType[] = ["ghost-scale", "weight-transfer", "triad-tour", "mirror", "free"];
export const PHASE_2_PLUS_ROTATION: WarmupType[] = [
  "ghost-scale", "weight-transfer", "triad-tour", "mirror", "free", "parallel-sets", "tone-drill",
];

export function warmupForWeek(weekNumber: number, phase: Phase): Warmup {
  const rotation = phase >= 2 ? PHASE_2_PLUS_ROTATION : PHASE_1_ROTATION;
  const idx = ((weekNumber % rotation.length) + rotation.length) % rotation.length;
  return WARMUPS[rotation[idx]];
}
