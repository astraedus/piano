// Drums ear-training — RHYTHM DICTATION, not pitch (reading.json's proven
// low-friction format: hear a pattern, pick the matching written one). Drums
// MUST ship its own generator; the shared earRounds.ts serves pitched piano
// content (scale degrees, cadences) that has no meaning on a pad.
//
// Stage A ships L1–L2:
//   L1 "How is it divided?" — hear one bar, choose quarters / eighths / sixteenths.
//   L2 "Which pattern?"     — hear one eighth-note pattern with a rest, pick which
//                             of two count-grids matches (– marks a silent rest).
//
// Audio: every round uses audio.kind "sticking" → playEarRound → playSticking, so
// rounds sound with zero extra audio wiring. Subdivision is encoded as PULSE RATE
// (quarters at 80/min, eighths at 160, sixteenths at 320) so the ear hears the
// density difference honestly.

import type { EarLevelGates, EarRound, KeyId, StickingCell } from "../types";

function rid(prefix: string): string {
  return prefix + "-" + Math.random().toString(36).slice(2, 8);
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// A base quarter-note tempo; eighths/sixteenths play at multiples so the density
// (not the absolute speed) is what the ear distinguishes.
const BASE_QUARTER_BPM = 80;

// Build N alternating single strokes (R L R L …), accent on the first, so a bar
// reads as a clean pulse at the given subdivision.
function singleStrokeBar(n: number, counts: string[]): StickingCell[] {
  return Array.from({ length: n }, (_, i) => ({
    hand: (i % 2 === 0 ? "R" : "L") as "R" | "L",
    accent: i === 0,
    count: counts[i] ?? "",
  }));
}

const QUARTER_COUNTS = ["1", "2", "3", "4"];
const EIGHTH_COUNTS = ["1", "&", "2", "&", "3", "&", "4", "&"];
const SIXTEENTH_COUNTS = ["1", "e", "&", "a", "2", "e", "&", "a", "3", "e", "&", "a", "4", "e", "&", "a"];

const SUBDIVISIONS = [
  { id: "quarter", n: 4, counts: QUARTER_COUNTS, label: "Quarter notes (1 2 3 4)" },
  { id: "eighth", n: 8, counts: EIGHTH_COUNTS, label: "Eighth notes (1 & 2 & 3 & 4 &)" },
  { id: "sixteenth", n: 16, counts: SIXTEENTH_COUNTS, label: "Sixteenths (1 e & a …)" },
] as const;

// L1 — "How is it divided?" Hear one bar, pick the subdivision.
function divisionRound(token: string): EarRound {
  const chosen = pick(SUBDIVISIONS);
  const pattern = singleStrokeBar(chosen.n, [...chosen.counts]);
  return {
    id: rid("d-div"),
    type: "rhythm",
    level: 1,
    prompt: "How is the beat divided? Listen, then pick.",
    correctId: chosen.id,
    choices: SUBDIVISIONS.map((s) => ({ label: s.label, id: s.id })),
    audio: {
      kind: "sticking",
      key: token as KeyId,
      sticking: pattern,
      bpm: BASE_QUARTER_BPM * (chosen.n / 4), // 80 / 160 / 320 — density by pulse rate
    },
  };
}

// The count-grid label for an eighth-note pattern: hit counts as-is, rests as "–".
function eighthLabel(pattern: StickingCell[]): string {
  return pattern.map((c) => (c.rest ? "–" : c.count ?? "·")).join(" ");
}

// An eighth-note bar with a single rest at `restIndex` (never beat 1).
function eighthPattern(restIndex: number): StickingCell[] {
  return EIGHTH_COUNTS.map((count, i) => {
    if (i === restIndex) return { rest: true, count };
    return { hand: (i % 2 === 0 ? "R" : "L") as "R" | "L", accent: i === 0, count };
  });
}

// L2 — "Which pattern?" Two eighth-note bars differing by where the rest falls.
function patternRound(token: string): EarRound {
  // Two distinct rest positions among the non-downbeat cells (indices 1..7).
  const positions = [2, 3, 4, 5, 6];
  const restA = pick(positions);
  let restB = pick(positions);
  while (restB === restA) restB = pick(positions);
  const A = eighthPattern(restA);
  const B = eighthPattern(restB);
  const heardA = Math.random() < 0.5;
  const heard = heardA ? A : B;
  return {
    id: rid("d-pat"),
    type: "rhythm",
    level: 2,
    prompt: "Which pattern did you hear? (– is a rest)",
    correctId: heardA ? "A" : "B",
    choices: [
      { label: eighthLabel(A), id: "A" },
      { label: eighthLabel(B), id: "B" },
    ],
    audio: {
      kind: "sticking",
      key: token as KeyId,
      sticking: heard,
      bpm: BASE_QUARTER_BPM * 2, // eighths
    },
  };
}

/**
 * Generate a level-appropriate drums rhythm-dictation round for the weekly focus
 * token. L1 = subdivision, L2+ = pattern. Wired into drumsModule.earRounds →
 * PracticeStand serves it on the drums stand.
 */
export function generateDrumsEarRound(level: EarRound["level"], token: string): EarRound {
  if (level <= 1) return divisionRound(token);
  return patternRound(token);
}

export const DRUMS_EAR_ROUNDS = generateDrumsEarRound;

// Honest gating (earProgression.maxAllowedEarLevel). L1 is always allowed (pure
// rhythm orientation — no prior skill needed). L2 "which eighth-note pattern"
// asks the learner to read subdivisions + rests, so it is gated on d-t0-click,
// the Stage-A node where the beat + counting are first taught. (The design doc's
// gate table points L2 at the Tier-1 counting node d-t1-counting; that node
// arrives in Stage B, which will re-point this gate — see the plan's deviations.)
export const DRUMS_EAR_LEVEL_GATES: EarLevelGates = {
  2: ["d-t0-click"],
};
