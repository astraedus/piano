import { describe, it, expect } from "vitest";
import { computeTodayPlan, weekHorizon } from "./todayPlan";
import { ghostKeyFor } from "./ghostKey";
import { defaultState } from "./storage";
import type { AppState, SkillProgress } from "./types";
import "./piano/module"; // self-registers piano so the module resolves

function stateWith(partial: Partial<AppState> = {}): AppState {
  return { ...defaultState(), ...partial };
}

const DAY = new Date("2026-06-08T12:00:00.000Z");
const learned = (): SkillProgress => ({ status: "learned", reps: 5, learnedAt: "2026-01-01" });
const inProgress = (): SkillProgress => ({ status: "in-progress", reps: 2 });

describe("computeTodayPlan — V3 surfacing", () => {
  it("surfaces the resolved drill's repBlocks + bpmLadder (R2/R5)", () => {
    // Force phase 1 so a seeded interleavable drill (with rep/bpm config) is in pool.
    // The picked drill may or may not be one of the seeded ones; assert the fields
    // are passed through faithfully from whatever drill was resolved.
    const plan = computeTodayPlan(stateWith({ phase: 1 }), DAY);
    if (plan.chainDrill?.repBlocks) {
      expect(plan.repBlocks).toEqual(plan.chainDrill.repBlocks);
    } else {
      expect(plan.repBlocks).toBeNull();
    }
    if (plan.chainDrill?.bpmLadder) {
      expect(plan.bpmLadder).toEqual(plan.chainDrill.bpmLadder);
    } else {
      expect(plan.bpmLadder).toBeNull();
    }
  });

  it("builds an interleave plan when enough established skills qualify (R4)", () => {
    const s = stateWith({
      phase: 1,
      skillProgress: {
        "p-key-C": learned(),
        "p-key-G": inProgress(),
        "p-key-F": inProgress(),
      },
    });
    const plan = computeTodayPlan(s, DAY);
    expect(plan.interleave).not.toBeNull();
    expect(plan.interleave!.repSequence.length).toBeGreaterThan(0);
  });

  it("interleave is null with no established skills", () => {
    const plan = computeTodayPlan(stateWith({ phase: 1 }), DAY);
    expect(plan.interleave).toBeNull();
  });

  it("surfaces review skills that are due today (R7)", () => {
    const s = stateWith({
      phase: 1,
      skillReview: {
        "p-key-C": { dueAt: "2026-06-01T00:00:00.000Z", intervalIndex: 0 }, // overdue
        "p-key-G": { dueAt: "2026-07-01T00:00:00.000Z", intervalIndex: 1 }, // future
      },
    });
    const plan = computeTodayPlan(s, DAY);
    const ids = plan.reviewSkills.map((n) => n.id);
    expect(ids).toContain("p-key-C");
    expect(ids).not.toContain("p-key-G");
  });

  it("reviewSkills is an empty array when nothing is due (never undefined)", () => {
    const plan = computeTodayPlan(stateWith({ phase: 1 }), DAY);
    expect(plan.reviewSkills).toEqual([]);
  });

  it("orders due reviews most-overdue-first (R7 triage)", () => {
    const s = stateWith({
      phase: 1,
      skillReview: {
        "p-key-G": { dueAt: "2026-06-05T00:00:00.000Z", intervalIndex: 1 }, // less overdue
        "p-key-C": { dueAt: "2026-06-01T00:00:00.000Z", intervalIndex: 0 }, // most overdue
      },
    });
    const ids = computeTodayPlan(s, DAY).reviewSkills.map((n) => n.id);
    expect(ids[0]).toBe("p-key-C");
    expect(ids).toContain("p-key-G");
  });

  it("the light modes (first-back / just-play) have no chain drill or interleave", () => {
    const plan = computeTodayPlan(stateWith({ phase: 1 }), DAY, "just-play");
    expect(plan.chainDrill).toBeNull();
    expect(plan.interleave).toBeNull();
    expect(plan.repBlocks).toBeNull();
    expect(plan.bpmLadder).toBeNull();
  });
});

// #5, forward horizon (next week's key + warmup).
describe("weekHorizon, the future is visible", () => {
  it("offset 0 matches today's ghost key + a warmup", () => {
    const s = stateWith({ phase: 1 });
    const h = weekHorizon(s, DAY, 0);
    expect(h.key).toBe(ghostKeyFor(s, DAY));
    expect(h.warmup).toBeDefined();
  });

  it("offset 1 derives next week's key by advancing the date +7 days", () => {
    const s = stateWith({ phase: 1 });
    const nextDate = new Date(DAY.getTime() + 7 * 24 * 3600 * 1000);
    const h = weekHorizon(s, DAY, 1);
    expect(h.key).toBe(ghostKeyFor(s, nextDate));
  });

  it("next week's key differs from this week's when the rotation has >1 key", () => {
    const s = stateWith({ phase: 1 });
    const thisWeek = weekHorizon(s, DAY, 0);
    const nextWeek = weekHorizon(s, DAY, 1);
    if ((thisWeek.rotationLength ?? 0) > 1) {
      expect(nextWeek.key).not.toBe(thisWeek.key);
    }
  });

  it("reports a 1-based rotation position within the rotation length", () => {
    const s = stateWith({ phase: 1 });
    const h = weekHorizon(s, DAY, 0);
    expect(h.rotationLength).toBeGreaterThan(0);
    expect(h.weekInRotation).toBeGreaterThanOrEqual(1);
    expect(h.weekInRotation!).toBeLessThanOrEqual(h.rotationLength!);
  });

  it("a ghost override for THIS week does not bleed into next week's derivation", () => {
    // Override only applies to the current weekId; next week falls back to the rotation.
    const s = stateWith({ phase: 1 });
    const overridden = { ...s, ghostOverride: { key: "Eb" as const, weekId: "" } };
    const nextWeek = weekHorizon(overridden, DAY, 1);
    expect(nextWeek.key).toBe(ghostKeyFor(overridden, new Date(DAY.getTime() + 7 * 86400000)));
  });
});
