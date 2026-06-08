import { describe, it, expect } from "vitest";
import {
  REVIEW_INTERVALS_DAYS,
  intervalDays,
  addDaysIso,
  enqueueReview,
  dueReviews,
  advanceReview,
} from "./skillReview";
import type { SkillReviewEntry } from "./types";

type ReviewMap = Record<string, SkillReviewEntry>;

const T0 = "2026-06-08T00:00:00.000Z";

describe("intervalDays — the 1→3→7→14 ladder", () => {
  it("maps indices to the expanding ladder", () => {
    expect(intervalDays(0)).toBe(1);
    expect(intervalDays(1)).toBe(3);
    expect(intervalDays(2)).toBe(7);
    expect(intervalDays(3)).toBe(14);
  });
  it("clamps beyond the end to the last (14d) interval, repeating forever", () => {
    expect(intervalDays(4)).toBe(14);
    expect(intervalDays(99)).toBe(14);
  });
  it("clamps negative indices to the first interval", () => {
    expect(intervalDays(-5)).toBe(1);
  });
  it("the ladder is exactly [1,3,7,14]", () => {
    expect([...REVIEW_INTERVALS_DAYS]).toEqual([1, 3, 7, 14]);
  });
});

describe("addDaysIso — date math", () => {
  it("adds whole days across a month boundary", () => {
    expect(addDaysIso("2026-06-30T00:00:00.000Z", 1)).toBe("2026-07-01T00:00:00.000Z");
  });
  it("adds 14 days correctly", () => {
    expect(addDaysIso(T0, 14)).toBe("2026-06-22T00:00:00.000Z");
  });
  it("preserves the time-of-day component", () => {
    expect(addDaysIso("2026-06-08T13:45:00.000Z", 3)).toBe("2026-06-11T13:45:00.000Z");
  });
});

describe("enqueueReview", () => {
  it("schedules a brand-new node due +1 day at intervalIndex 0", () => {
    const out = enqueueReview({}, "n1", T0);
    expect(out.n1).toEqual({ dueAt: addDaysIso(T0, 1), intervalIndex: 0 });
  });
  it("does NOT reset an already-queued node (second learned event is a no-op)", () => {
    const existing: ReviewMap = { n1: { dueAt: "2026-07-01T00:00:00.000Z", intervalIndex: 2 } };
    const out = enqueueReview(existing, "n1", T0);
    expect(out.n1).toEqual(existing.n1); // unchanged
  });
  it("is pure (returns a new map, leaves the input untouched)", () => {
    const input: ReviewMap = {};
    const out = enqueueReview(input, "n1", T0);
    expect(input).toEqual({});
    expect(out).not.toBe(input);
  });
});

describe("dueReviews", () => {
  const review: ReviewMap = {
    overdue: { dueAt: "2026-06-01T00:00:00.000Z", intervalIndex: 0 },
    dueToday: { dueAt: T0, intervalIndex: 1 },
    future: { dueAt: "2026-06-20T00:00:00.000Z", intervalIndex: 2 },
  };

  it("returns nodes due on or before today, excluding future", () => {
    const due = dueReviews(review, T0);
    expect(due).toContain("overdue");
    expect(due).toContain("dueToday"); // inclusive of exact dueAt
    expect(due).not.toContain("future");
  });
  it("sorts most-overdue first", () => {
    expect(dueReviews(review, T0)).toEqual(["overdue", "dueToday"]);
  });
  it("returns empty when nothing is due", () => {
    expect(dueReviews(review, "2025-01-01T00:00:00.000Z")).toEqual([]);
  });
});

describe("advanceReview — climbs the ladder 1→3→7→14", () => {
  it("advances intervalIndex by one and reschedules from now", () => {
    const review: ReviewMap = { n1: { dueAt: "2026-05-01T00:00:00.000Z", intervalIndex: 0 } };
    const out = advanceReview(review, "n1", T0);
    // index 0 → 1 (3 days) from T0
    expect(out.n1).toEqual({ dueAt: addDaysIso(T0, 3), intervalIndex: 1 });
  });

  it("walks the full ladder across repeated reviews", () => {
    let review: ReviewMap = enqueueReview({}, "n1", T0); // index 0, due +1
    expect(review.n1.intervalIndex).toBe(0);

    review = advanceReview(review, "n1", T0); // → index 1, +3
    expect(review.n1).toEqual({ dueAt: addDaysIso(T0, 3), intervalIndex: 1 });

    review = advanceReview(review, "n1", T0); // → index 2, +7
    expect(review.n1).toEqual({ dueAt: addDaysIso(T0, 7), intervalIndex: 2 });

    review = advanceReview(review, "n1", T0); // → index 3, +14
    expect(review.n1).toEqual({ dueAt: addDaysIso(T0, 14), intervalIndex: 3 });

    review = advanceReview(review, "n1", T0); // clamps at index 3, +14
    expect(review.n1).toEqual({ dueAt: addDaysIso(T0, 14), intervalIndex: 3 });
  });

  it("is a no-op for an unqueued node", () => {
    const review: ReviewMap = {};
    expect(advanceReview(review, "ghost", T0)).toBe(review);
  });
});
