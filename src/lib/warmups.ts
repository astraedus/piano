import type { Phase, Warmup, WarmupType } from "./types";

export const WARMUPS: Record<WarmupType, Warmup> = {
  "ghost-scale": {
    id: "ghost-scale",
    label: "ghost scale",
    lines: [
      "today's ghost, hands separate. 2 octaves. slow on the return.",
      "or just play the ghost for a minute. don't count.",
    ],
    postureLine: "neck free. shoulders drop. forearms heavy. let arm weight rest on the keys.",
  },
  "weight-transfer": {
    id: "weight-transfer",
    label: "weight transfer",
    lines: [
      "five-finger pattern — C D E F G F E D C.",
      "transfer arm weight finger to finger. zero tension between strikes.",
      "or just mash the keys to your favourite song.",
    ],
    postureLine: "jaw unclenched. shoulders drop. arm weight into the keys, not through the fingers.",
  },
  "triad-tour": {
    id: "triad-tour",
    label: "triad tour",
    lines: [
      "walk I–IV–V–vi in today's ghost. both hands.",
      "once around, slowly. feel where home is.",
    ],
    postureLine: "let the keys meet you. quiet hands. listen for the top note.",
  },
  "mirror": {
    id: "mirror",
    label: "mirror",
    lines: [
      "left hand plays the scale backwards while the right plays forwards.",
      "if it falls apart, laugh. begin again.",
    ],
    postureLine: "wide shoulders. spine long. nothing held tight.",
  },
  "free": {
    id: "free",
    label: "free warmup",
    lines: [
      "no structure tonight.",
      "play for 90 seconds. anything. any key you press counts.",
    ],
    postureLine: "drop in. no plan. the hands know more than you think.",
  },
  "parallel-sets": {
    id: "parallel-sets",
    label: "parallel sets",
    lines: [
      "pick a 4-note burst in today's key. play it at target tempo, pause, again.",
      "build speed inside the burst. knit later.",
    ],
    postureLine: "forearm relaxed. let rotation carry the hand. bursts, not scrapes.",
  },
  "tone-drill": {
    id: "tone-drill",
    label: "tone drill",
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
