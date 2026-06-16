// Ear-level auto-advance — pure decision logic, fully testable.
//
// The Pattern-Recognition axis (`earLevel`, 1..7) was a dead onboarding remnant:
// set once, never advanced, never shown. This module gives it a live signal.
//
// Only L1..L5 have authored ear-round content (earRounds.ts). L6/L7 generate
// nothing distinct, so we CAP advancement at L5. That cap is correct and honest,
// not a TODO — advancing past 5 would surface no new content.

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
