import { describe, it, expect } from "vitest";
import {
  resolveStatus,
  nextToLearn,
  prereqsMet,
  markNodeProgress,
  isAcyclic,
} from "./skillTree";
import type { SkillNode, SkillProgress } from "./types";

// A small, deterministic graph:
//   A (t0) → B (t1) → D (t2)
//   A (t0) → C (t1) ↗
// D requires BOTH B and C learned.
function makeNodes(): SkillNode[] {
  const base = {
    instrument: "guitar" as const,
    category: "technique" as const,
    masteryDrill: "drill",
    unlock: "unlock",
  };
  return [
    { id: "A", title: "A", tier: 0, prereqs: [], ...base },
    { id: "B", title: "B", tier: 1, prereqs: ["A"], ...base },
    { id: "C", title: "C", tier: 1, prereqs: ["A"], ...base },
    { id: "D", title: "D", tier: 2, prereqs: ["B", "C"], ...base },
  ];
}

const learned = (): SkillProgress => ({ status: "learned", reps: 5, learnedAt: "2026-01-01" });
const inProgress = (): SkillProgress => ({ status: "in-progress", reps: 2 });

describe("resolveStatus", () => {
  it("locks every non-root node when nothing is learned", () => {
    const nodes = makeNodes();
    const s = resolveStatus(nodes, {});
    expect(s.get("A")).toBe("available"); // no prereqs
    expect(s.get("B")).toBe("locked");
    expect(s.get("C")).toBe("locked");
    expect(s.get("D")).toBe("locked");
  });

  it("makes children available only once a prereq is learned", () => {
    const nodes = makeNodes();
    const s = resolveStatus(nodes, { A: learned() });
    expect(s.get("A")).toBe("learned");
    expect(s.get("B")).toBe("available");
    expect(s.get("C")).toBe("available");
    expect(s.get("D")).toBe("locked"); // needs both B and C
  });

  it("locks a node until ALL prereqs are learned (no partial unlock)", () => {
    const nodes = makeNodes();
    // B learned but C not → D must stay locked
    const s = resolveStatus(nodes, { A: learned(), B: learned() });
    expect(s.get("D")).toBe("locked");
    // now C learned too → D available
    const s2 = resolveStatus(nodes, { A: learned(), B: learned(), C: learned() });
    expect(s2.get("D")).toBe("available");
  });

  it("does NOT allow a phase-jump exploit: reps on a locked node stay locked", () => {
    const nodes = makeNodes();
    // D has reps but its prereqs are not learned — must remain locked, not in-progress.
    const s = resolveStatus(nodes, { D: inProgress() });
    expect(s.get("D")).toBe("locked");
  });

  it("reports in-progress only when reachable and started", () => {
    const nodes = makeNodes();
    const s = resolveStatus(nodes, { A: learned(), B: inProgress() });
    expect(s.get("B")).toBe("in-progress");
    expect(s.get("C")).toBe("available");
  });
});

describe("prereqsMet", () => {
  it("is true for prereq-free nodes", () => {
    const [a] = makeNodes();
    expect(prereqsMet(a, {})).toBe(true);
  });
  it("requires every prereq learned", () => {
    const nodes = makeNodes();
    const d = nodes.find((n) => n.id === "D")!;
    expect(prereqsMet(d, { B: learned() })).toBe(false);
    expect(prereqsMet(d, { B: learned(), C: learned() })).toBe(true);
  });
});

describe("nextToLearn (frontier detection)", () => {
  it("returns only available frontier nodes, tier-shallow first", () => {
    const nodes = makeNodes();
    const frontier = nextToLearn(nodes, { A: learned() }, 5);
    expect(frontier.map((n) => n.id).sort()).toEqual(["B", "C"]);
  });

  it("excludes learned, locked, and in-progress nodes", () => {
    const nodes = makeNodes();
    const frontier = nextToLearn(nodes, { A: learned(), B: inProgress() }, 5);
    // A learned (excluded), B in-progress (excluded), C available, D locked.
    expect(frontier.map((n) => n.id)).toEqual(["C"]);
  });

  it("respects the limit", () => {
    const nodes = makeNodes();
    const frontier = nextToLearn(nodes, { A: learned() }, 1);
    expect(frontier).toHaveLength(1);
  });

  it("returns empty when the whole graph is learned", () => {
    const nodes = makeNodes();
    const all = { A: learned(), B: learned(), C: learned(), D: learned() };
    expect(nextToLearn(nodes, all)).toEqual([]);
  });
});

describe("markNodeProgress", () => {
  it("creates progress for a fresh node and bumps reps", () => {
    const p = markNodeProgress({}, "A", { now: "2026-02-01" });
    expect(p.A.reps).toBe(1);
    expect(p.A.status).toBe("in-progress");
    expect(p.A.firstReachedAt).toBe("2026-02-01");
  });

  it("is immutable — does not mutate the input", () => {
    const input = {};
    const p = markNodeProgress(input, "A");
    expect(input).toEqual({});
    expect(p).not.toBe(input);
  });

  it("marks learned and stamps learnedAt once", () => {
    const p1 = markNodeProgress({}, "A", { learned: true, now: "2026-03-01" });
    expect(p1.A.status).toBe("learned");
    expect(p1.A.learnedAt).toBe("2026-03-01");
    // re-marking keeps the original learnedAt
    const p2 = markNodeProgress(p1, "A", { learned: true, now: "2026-04-01" });
    expect(p2.A.learnedAt).toBe("2026-03-01");
  });

  it("tracks max bpm monotonically", () => {
    let p = markNodeProgress({}, "A", { maxBpm: 80 });
    p = markNodeProgress(p, "A", { maxBpm: 60 });
    expect(p.A.maxBpm).toBe(80);
    p = markNodeProgress(p, "A", { maxBpm: 100 });
    expect(p.A.maxBpm).toBe(100);
  });
});

describe("isAcyclic (cycle-free guard)", () => {
  it("accepts a valid DAG", () => {
    expect(isAcyclic(makeNodes())).toBe(true);
  });

  it("detects a direct cycle", () => {
    const nodes = makeNodes();
    // introduce A → ... → A by making A depend on D
    nodes[0] = { ...nodes[0], prereqs: ["D"] };
    expect(isAcyclic(nodes)).toBe(false);
  });

  it("detects a self-loop", () => {
    const nodes = makeNodes();
    nodes[1] = { ...nodes[1], prereqs: ["B"] };
    expect(isAcyclic(nodes)).toBe(false);
  });

  it("tolerates unknown prereq ids without false-positiving a cycle", () => {
    const nodes = makeNodes();
    nodes[1] = { ...nodes[1], prereqs: ["A", "does-not-exist"] };
    expect(isAcyclic(nodes)).toBe(true);
  });
});
