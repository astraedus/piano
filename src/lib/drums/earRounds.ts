// Drums ear-training — RHYTHM DICTATION, not pitch (reading.json's proven
// low-friction format: hear a pattern, pick the matching written one). Drums
// MUST ship its own generator; the shared earRounds.ts serves pitched piano
// content (scale degrees, cadences) that has no meaning on a pad.
//
// The full ladder L1–L5 (design-doc ear-round table):
//   L1 "How is it divided?" — hear one bar, choose quarters / eighths / sixteenths.
//   L2 "Which pattern?"     — 2 eighth-note count-grids differing by rest position.
//   L3 "Which pattern?"     — 3 sixteenth-note count-grids differing by rest.
//   L4 "Where's the accent?"— hear an eighth-note bar, name the accented beat.
//   L5 "Which rudiment?"    — singles vs doubles vs paradiddle, by ear.
//
// Audio: every round uses audio.kind "sticking" → playEarRound → playSticking, so
// rounds sound with zero extra audio wiring. Subdivision is encoded as PULSE RATE
// (quarters at 80/min, eighths at 160, sixteenths at 320) so the ear hears the
// density difference honestly. accents ride the cell's `accent` flag (velocity).

import type { EarLevelGates, EarRound, KeyId, StickingCell } from "../types";
import { drumsFocusFor } from "./focus";

function rid(prefix: string): string {
  return prefix + "-" + Math.random().toString(36).slice(2, 8);
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
/** Pick `n` distinct members of `arr` (n ≤ arr.length). */
function pickDistinct<T>(arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
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

// A count-grid label: hit cells show their count syllable, rests show "–". Shared
// by the L2 (eighths) and L3 (sixteenths) "which pattern?" rounds. Pure.
function countGridLabel(pattern: StickingCell[]): string {
  return pattern.map((c) => (c.rest ? "–" : c.count ?? "·")).join(" ");
}

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

// A single-stroke bar of `counts` length with one silent rest at `restIndex`
// (never beat 1). The lead hand keeps alternating so the sticking stays honest.
function barWithRest(counts: string[], restIndex: number): StickingCell[] {
  return counts.map((count, i) => {
    if (i === restIndex) return { rest: true, count };
    return { hand: (i % 2 === 0 ? "R" : "L") as "R" | "L", accent: i === 0, count };
  });
}

// L2 / L3 — "Which pattern?" `k` candidate bars at the given subdivision, each
// differing only by where its single rest falls; the learner picks the one heard.
function whichPatternRound(token: string, level: 2 | 3, counts: string[], k: number, restSlots: number[]): EarRound {
  const rests = pickDistinct(restSlots, k);
  const bars = rests.map((r) => barWithRest(counts, r));
  const heardIdx = Math.floor(Math.random() * k);
  const ids = ["A", "B", "C", "D"].slice(0, k);
  return {
    id: rid("d-pat"),
    type: "rhythm",
    level,
    prompt: "Which pattern did you hear? (– is a rest)",
    correctId: ids[heardIdx],
    choices: bars.map((b, i) => ({ label: countGridLabel(b), id: ids[i] })),
    audio: {
      kind: "sticking",
      key: token as KeyId,
      sticking: bars[heardIdx],
      bpm: BASE_QUARTER_BPM * (counts.length / 4), // 160 (eighths) or 320 (sixteenths)
    },
  };
}

// L4 — "Where's the accent?" A bar of steady eighth-note taps with ONE accent on
// a main beat; the learner names which beat (1–4) was loud.
function accentRound(token: string): EarRound {
  const accentBeat = 1 + Math.floor(Math.random() * 4); // beat 1..4
  const accentCell = (accentBeat - 1) * 2; // beats sit on even eighth cells
  const bar: StickingCell[] = EIGHTH_COUNTS.map((count, i) => ({
    hand: (i % 2 === 0 ? "R" : "L") as "R" | "L",
    accent: i === accentCell,
    count,
  }));
  return {
    id: rid("d-acc"),
    type: "rhythm",
    level: 4,
    prompt: "Where's the accent? Listen for the loud note, then pick its beat.",
    correctId: String(accentBeat),
    choices: [1, 2, 3, 4].map((b) => ({ label: `Beat ${b}`, id: String(b) })),
    audio: { kind: "sticking", key: token as KeyId, sticking: bar, bpm: BASE_QUARTER_BPM * 2 },
  };
}

// L5 — "Which rudiment?" Hear one of singles / doubles / paradiddle and name it.
// The sticking + label come from the ONE focus interpreter (focus.ts), so the
// sound the learner hears is exactly the rudiment the rest of the app teaches.
const RUDIMENT_CHOICES = ["C", "G", "A"] as const; // singles / doubles / paradiddle
function rudimentRound(): EarRound {
  const heard = pick(RUDIMENT_CHOICES);
  return {
    id: rid("d-rud"),
    type: "rhythm",
    level: 5,
    prompt: "Which rudiment did you hear?",
    correctId: heard,
    choices: RUDIMENT_CHOICES.map((t) => ({ label: drumsFocusFor(t).label, id: t })),
    audio: {
      kind: "sticking",
      key: heard as KeyId,
      sticking: drumsFocusFor(heard).pattern,
      bpm: BASE_QUARTER_BPM * 2, // the focus patterns are eighth-note bars
    },
  };
}

// Off-beat cells a rest may fall on (never beat 1): eighth cells 2..7, sixteenth
// cells that aren't the four downbeats (0/4/8/12), so the gap is clearly audible.
const EIGHTH_REST_SLOTS = [2, 3, 4, 5, 6, 7];
const SIXTEENTH_REST_SLOTS = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15];

/**
 * Generate a level-appropriate drums rhythm-dictation round for the weekly focus
 * token. L1 subdivision · L2 eighth pattern · L3 sixteenth pattern · L4 accent
 * location · L5 rudiment. Wired into drumsModule.earRounds → PracticeStand.
 */
export function generateDrumsEarRound(level: EarRound["level"], token: string): EarRound {
  switch (level) {
    case 1:
      return divisionRound(token);
    case 2:
      return whichPatternRound(token, 2, EIGHTH_COUNTS, 2, EIGHTH_REST_SLOTS);
    case 3:
      return whichPatternRound(token, 3, SIXTEENTH_COUNTS, 3, SIXTEENTH_REST_SLOTS);
    case 4:
      return accentRound(token);
    default: // level 5+ (advancement is capped at L5 by earProgression.MAX_EAR_LEVEL)
      return rudimentRound();
  }
}

export const DRUMS_EAR_ROUNDS = generateDrumsEarRound;

// Honest gating (earProgression.maxAllowedEarLevel — strict prefix: a level is
// reachable only if EVERY level ≤ it has its gate satisfied). L1 is always allowed
// (pure rhythm orientation). Each level is gated on the Tier-1/2 node that first
// teaches what it quizzes:
//   L2 reads/counts eighth patterns  → d-t1-counting
//   L3 reads sixteenth patterns      → d-t2-16ths
//   L4 hears accent placement        → d-t1-accents
//   L5 tells rudiments apart         → d-t2-paradiddle (needs singles+doubles too,
//                                       which its own prereqs guarantee)
export const DRUMS_EAR_LEVEL_GATES: EarLevelGates = {
  2: ["d-t1-counting"],
  3: ["d-t2-16ths"],
  4: ["d-t1-accents"],
  5: ["d-t2-paradiddle"],
};
