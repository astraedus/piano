import { describe, it, expect } from "vitest";
import { computeTodayPlan } from "./todayPlan";
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

  it("the light modes (first-back / just-play) have no chain drill or interleave", () => {
    const plan = computeTodayPlan(stateWith({ phase: 1 }), DAY, "just-play");
    expect(plan.chainDrill).toBeNull();
    expect(plan.interleave).toBeNull();
    expect(plan.repBlocks).toBeNull();
    expect(plan.bpmLadder).toBeNull();
  });
});
