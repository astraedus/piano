// Spaced-retrieval queue for learned skill nodes (R7) — pure, fully testable,
// zero side effects, no Date.now() (callers pass dates in as ISO strings).
//
// When a node becomes `learned` it is enqueued due +1 day out. Each time it is
// reviewed the interval advances along an expanding ladder (1→3→7→14 days), so
// previously-mastered skills resurface at widening intervals to fight the
// forgetting curve. The last interval (14d) repeats indefinitely once reached.

import type { SkillReviewEntry } from "./types";

type ReviewMap = Record<string, SkillReviewEntry>;

/** Expanding review ladder in DAYS. intervalIndex points into this array;
 *  beyond the end it clamps to the last (14-day) interval, repeating forever. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14] as const;

/** Days for a given interval index, clamped to the last interval. */
export function intervalDays(index: number): number {
  const i = Math.max(0, Math.min(index, REVIEW_INTERVALS_DAYS.length - 1));
  return REVIEW_INTERVALS_DAYS[i];
}

/** Add `days` whole days to an ISO instant, returning a new ISO string. */
export function addDaysIso(iso: string, days: number): string {
  const t = new Date(iso).getTime();
  return new Date(t + days * 86400000).toISOString();
}

/**
 * Enqueue a node for its FIRST review at intervalIndex 0 (due +1 day). Pure —
 * returns a new map. If the node is already queued it is left untouched (a
 * second `learned` event must not reset an in-flight review schedule).
 */
export function enqueueReview(
  review: ReviewMap,
  nodeId: string,
  now: string,
): ReviewMap {
  if (review[nodeId]) return review;
  return {
    ...review,
    [nodeId]: { dueAt: addDaysIso(now, intervalDays(0)), intervalIndex: 0 },
  };
}

/**
 * Node ids whose review is due on/before `today` (ISO). Sorted by dueAt ascending
 * so the most-overdue surface first. Pure.
 */
export function dueReviews(review: ReviewMap, today: string): string[] {
  const nowMs = new Date(today).getTime();
  return Object.entries(review)
    .filter(([, e]) => new Date(e.dueAt).getTime() <= nowMs)
    .sort((a, b) => new Date(a[1].dueAt).getTime() - new Date(b[1].dueAt).getTime())
    .map(([id]) => id);
}

/**
 * Advance a node's review interval one rung up the ladder (1→3→7→14, then stays
 * at 14) and reschedule from `now`. Pure. If the node isn't queued, this is a
 * no-op (returns the same map) — only learned nodes have review schedules.
 */
export function advanceReview(
  review: ReviewMap,
  nodeId: string,
  now: string,
): ReviewMap {
  const prev = review[nodeId];
  if (!prev) return review;
  const nextIndex = Math.min(
    prev.intervalIndex + 1,
    REVIEW_INTERVALS_DAYS.length - 1,
  );
  return {
    ...review,
    [nodeId]: { dueAt: addDaysIso(now, intervalDays(nextIndex)), intervalIndex: nextIndex },
  };
}
