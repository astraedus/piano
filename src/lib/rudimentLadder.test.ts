import { describe, it, expect } from "vitest";
import { buildRudimentLadder } from "./rudimentLadder";
import { DRUMS_NODES } from "./drums/skillNodes";
import type { SkillProgress } from "./types";

function learned(bpm?: number): SkillProgress {
  return { status: "learned", reps: 3, learnedAt: "2026-07-17T00:00:00.000Z", ...(bpm ? { bpmReached: bpm } : {}) };
}

describe("buildRudimentLadder (drums progress map view model)", () => {
  it("empty progress: nothing learned, groups span every tier, next = the tier-0 root", () => {
    const view = buildRudimentLadder(DRUMS_NODES, {}, {});
    expect(view.total).toBe(18);
    expect(view.learnedCount).toBe(0);
    // Groups are tier-ordered and cover tiers 0..3.
    expect(view.groups.map((g) => g.tier)).toEqual([0, 1, 2, 3]);
    // Every node appears exactly once across the groups.
    const ids = view.groups.flatMap((g) => g.rungs.map((r) => r.node.id));
    expect(new Set(ids).size).toBe(18);
    // The one next-to-learn node is the sole available root (Hold the Sticks).
    expect(view.nextNodeId).toBe("d-t0-setup");
    const nextRungs = view.groups.flatMap((g) => g.rungs).filter((r) => r.isNext);
    expect(nextRungs.length).toBe(1);
    expect(nextRungs[0].node.id).toBe("d-t0-setup");
  });

  it("surfaces best BPM only for learned/in-progress nodes, and counts learned", () => {
    const progress = {
      "d-t0-setup": learned(),
      "d-t0-rebound": learned(),
      "d-t0-strokes": learned(),
      "d-t0-click": learned(),
      "d-t1-singles": learned(90),
    };
    const view = buildRudimentLadder(DRUMS_NODES, progress, {});
    expect(view.learnedCount).toBe(5);
    const rungById = new Map(view.groups.flatMap((g) => g.rungs).map((r) => [r.node.id, r]));
    // A learned node with a recorded tempo shows its BPM.
    expect(rungById.get("d-t1-singles")!.bpm).toBe(90);
    // A locked node never shows a BPM.
    expect(rungById.get("d-t3-buzz")!.bpm).toBeUndefined();
    expect(rungById.get("d-t3-buzz")!.status).toBe("locked");
    // Next-to-learn has advanced past the finished Tier-0 into the frontier.
    expect(view.nextNodeId).not.toBe("d-t0-setup");
    expect(view.nextNodeId).not.toBeNull();
  });
});
