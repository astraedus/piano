// Ear-level auto-advance + honest gating — pure decision logic, fully testable.
//
// The Pattern-Recognition axis (`earLevel`, 1..7) was a dead onboarding remnant:
// set once, never advanced, never shown. This module gives it a live signal.
//
// Only L1..L5 have authored ear-round content (earRounds.ts). L6/L7 generate
// nothing distinct, so we CAP advancement at L5. That cap is correct and honest,
// not a TODO — advancing past 5 would surface no new content.
//
// GATING (maxAllowedEarLevel / effectiveEarLevel): the ear ladder must never
// quiz a learner on material the curriculum has not taught (scale degrees at L2,
// chord quality at L3, cadences at L4, progressions at L5 — all Roman-numeral /
// theory content). The effective level is max(what the skill tree has TAUGHT,
// what the user CLAIMED at onboarding), so an advanced learner who self-reports
// is trusted, but accuracy alone can only push past the claimed floor once the
// gate nodes are learned.

import type { AppState, EarLevelGates, SkillProgress } from "./types";

/** Levels with authored ear-round content. Advancement never exceeds this. */
export const MAX_EAR_LEVEL = 5;

/** Sessions of recent ear history considered when deciding to advance. */
export const EAR_WINDOW = 3;

/** Accuracy over the window required to advance one level. */
export const EAR_ADVANCE_ACCURACY = 0.8;

/** Minimum rounds answered over the window before an advance can fire (so one
 *  lucky round can't promote). */
export const EAR_MIN_ROUNDS = 5;

export type EarLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Per-session ear tally: how many rounds were right vs wrong that session. */
export interface EarTally {
  correct: number;
  wrong: number;
}

/**
 * Decide the next ear level given the current level and the recent window of
 * per-session ear tallies (most-recent-last is fine; order does not matter).
 *
 * Rules:
 * - Advance by exactly ONE level when, over the last EAR_WINDOW sessions, the
 *   user answered >= EAR_MIN_ROUNDS rounds total AND accuracy >= 80%.
 * - Never advance past MAX_EAR_LEVEL (L5) — higher levels have no content.
 * - Otherwise hold. A single bad round inside an otherwise-strong window is
 *   absorbed by the windowed accuracy (grace), so one slip never demotes or
 *   blocks: the threshold is over the aggregate, not per-round.
 * - We never DEMOTE: ear level only ratchets up. Losing skill is handled by the
 *   content being level-gated, not by punishing the user's recorded position.
 */
export function nextEarLevel(current: EarLevel, recent: EarTally[]): EarLevel {
  if (current >= MAX_EAR_LEVEL) return current;

  // Only the most recent EAR_WINDOW sessions count.
  const window = recent.slice(-EAR_WINDOW);
  let correct = 0;
  let total = 0;
  for (const t of window) {
    correct += t.correct;
    total += t.correct + t.wrong;
  }
  if (total < EAR_MIN_ROUNDS) return current;

  const accuracy = correct / total;
  if (accuracy >= EAR_ADVANCE_ACCURACY) {
    return (current + 1) as EarLevel;
  }
  return current;
}

/** Convenience: did the level change? */
export function earLevelAdvanced(from: EarLevel, to: EarLevel): boolean {
  return to > from;
}

/** Human label for an ear level, for UI surfaces. */
export function earLevelLabel(level: EarLevel): string {
  switch (level) {
    case 1: return "Major vs Minor";
    case 2: return "Scale Degrees";
    case 3: return "Chord Quality";
    case 4: return "Cadences";
    case 5: return "Progressions";
    default: return "Progressions";
  }
}

/** Clamp any number into the valid 1..7 ear-level range. */
function asEarLevel(n: number): EarLevel {
  return Math.max(1, Math.min(7, Math.round(n))) as EarLevel;
}

/**
 * The highest ear level the learner may access, given the instrument's gates,
 * their skill progress, and their claimed onboarding floor.
 *
 * Rule: allowed = max(what the tree has TAUGHT, what the user CLAIMED), capped at
 * MAX_EAR_LEVEL. "What the tree has taught" is the highest level L such that the
 * gate for EVERY level ≤ L is satisfied (a strict prefix — the first unsatisfied
 * gate stops the climb). A level with no gate configured is treated as satisfied,
 * so gating is opt-in per level and per module (undefined gates → fully open).
 *
 * A gate is satisfied when every listed node id is `learned` in skillProgress.
 */
export function maxAllowedEarLevel(
  gates: EarLevelGates | undefined,
  skillProgress: Record<string, SkillProgress> | undefined,
  claimedFloor: EarLevel,
): EarLevel {
  const learned = (id: string): boolean => skillProgress?.[id]?.status === "learned";
  const gateSatisfied = (level: 2 | 3 | 4 | 5): boolean => {
    const required = gates?.[level];
    if (!required || required.length === 0) return true; // no gate → open
    return required.every(learned);
  };

  // Walk levels upward; stop at the first level whose gate isn't met (prefix rule).
  let taughtMax: EarLevel = 1;
  for (const level of [2, 3, 4, 5] as const) {
    if (level > MAX_EAR_LEVEL) break;
    if (!gateSatisfied(level)) break;
    taughtMax = level;
  }

  return asEarLevel(Math.min(MAX_EAR_LEVEL, Math.max(taughtMax, claimedFloor)));
}

/** The subset of AppState the effective-level resolver needs. */
type EarLevelStateSlice = Pick<AppState, "earLevel" | "earLevelFloor" | "skillProgress">;

/**
 * The ear level actually presented/generated for a learner: their stored ratchet
 * level, clamped down to what the gates + floor allow. This is the ONE shared
 * clamp every round-generation and display site uses so no surface can offer a
 * level the curriculum hasn't earned. (Advancement in sessions.ts uses the raw
 * maxAllowedEarLevel so it can ratchet without demoting a level already reached.)
 */
export function effectiveEarLevel(
  state: EarLevelStateSlice,
  gates: EarLevelGates | undefined,
): EarLevel {
  const floor = asEarLevel(state.earLevelFloor ?? 1);
  const cap = maxAllowedEarLevel(gates, state.skillProgress, floor);
  return Math.min(state.earLevel, cap) as EarLevel;
}
