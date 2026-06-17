import { describe, it, expect } from "vitest";
import {
  resolveStatus,
  nextToLearn,
  prereqsMet,
  markNodeProgress,
  isAcyclic,
  successRate,
  difficultyVerdict,
  meetsLearnSuccessRate,
  markNodeFluent,
  isFluent,
  LEARN_SUCCESS_THRESHOLD,
  MIN_ATTEMPTS_FOR_VERDICT,
} from "./skillTree";
import type { SkillNode, SkillProgress } from "./types";
import { PIANO_NODES } from "./piano/skillNodes";

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

describe("PIANO_NODES shipped graph is a valid, fully-reachable DAG", () => {
  it("is acyclic", () => {
    expect(isAcyclic(PIANO_NODES)).toBe(true);
  });

  it("every prereq id resolves to a real node (no dangling edges)", () => {
    const ids = new Set(PIANO_NODES.map((n) => n.id));
    for (const node of PIANO_NODES) {
      for (const pid of node.prereqs) {
        expect(ids.has(pid)).toBe(true);
      }
    }
  });

  it("has at least one tier-0 root with no prereqs (graph is enterable)", () => {
    expect(PIANO_NODES.some((n) => n.prereqs.length === 0)).toBe(true);
  });

  it("every node becomes learnable when its full prereq chain is learned", () => {
    // Learn everything → every node resolves to learned (no node is unreachable
    // due to a prereq that itself can never be satisfied).
    const all: Record<string, SkillProgress> = {};
    for (const n of PIANO_NODES) all[n.id] = { status: "learned", reps: 1 };
    const status = resolveStatus(PIANO_NODES, all);
    for (const n of PIANO_NODES) {
      expect(status.get(n.id)).toBe("learned");
    }
  });
});

// #2 — the transition-fluency gate: The Pop Formula must stay locked until the
// Am→F transition node is learned, even when its other prereq is learned.
describe("transition-fluency gates the target song (#2)", () => {
  const popFormula = PIANO_NODES.find((n) => n.id === "p-t2-pop-formula")!;

  it("declares the transition node as a prereq", () => {
    expect(popFormula.prereqs).toContain("p-trans-am-F");
  });

  it("stays locked when the chord-under-melody prereq is learned but the transition is not", () => {
    const learnedSet: Record<string, SkillProgress> = {};
    for (const pid of popFormula.prereqs) {
      if (pid !== "p-trans-am-F") learnedSet[pid] = { status: "learned", reps: 1 };
    }
    expect(prereqsMet(popFormula, learnedSet)).toBe(false);
    expect(resolveStatus(PIANO_NODES, learnedSet).get("p-t2-pop-formula")).toBe("locked");
  });

  it("unlocks once the transition clears (transition node learned)", () => {
    const learnedSet: Record<string, SkillProgress> = {};
    for (const pid of popFormula.prereqs) learnedSet[pid] = { status: "learned", reps: 1 };
    expect(prereqsMet(popFormula, learnedSet)).toBe(true);
    expect(resolveStatus(PIANO_NODES, learnedSet).get("p-t2-pop-formula")).toBe("available");
  });
});

// ─────────────────── V3 R3: success-rate signals ───────────────────
describe("successRate", () => {
  it("returns null when no attempts logged (legacy data)", () => {
    expect(successRate(undefined)).toBeNull();
    expect(successRate({ status: "in-progress", reps: 2 })).toBeNull();
  });
  it("computes successes / attempts", () => {
    expect(successRate({ status: "in-progress", reps: 5, attempts: 10, successes: 7 })).toBe(0.7);
  });
  it("clamps successes into [0, attempts]", () => {
    expect(successRate({ status: "in-progress", reps: 5, attempts: 4, successes: 99 })).toBe(1);
    expect(successRate({ status: "in-progress", reps: 5, attempts: 4, successes: -3 })).toBe(0);
  });
});

describe("difficultyVerdict (R3 too-easy / just-right / too-hard)", () => {
  const prog = (attempts: number, successes: number): SkillProgress => ({
    status: "in-progress", reps: attempts, attempts, successes,
  });
  it("is unknown below the minimum attempt count", () => {
    expect(difficultyVerdict(prog(2, 2))).toBe("unknown");
    expect(MIN_ATTEMPTS_FOR_VERDICT).toBe(3);
  });
  it("is too-easy above 85%", () => {
    expect(difficultyVerdict(prog(10, 9))).toBe("too-easy"); // 90%
  });
  it("is too-hard below 55%", () => {
    expect(difficultyVerdict(prog(10, 5))).toBe("too-hard"); // 50%
  });
  it("is just-right in the 55-85% band", () => {
    expect(difficultyVerdict(prog(10, 7))).toBe("just-right"); // 70%
  });
});

describe("meetsLearnSuccessRate (R3 completion gate)", () => {
  it("passes when there is no quality data (legacy callers not gated)", () => {
    expect(meetsLearnSuccessRate({ status: "in-progress", reps: 3 })).toBe(true);
  });
  it("fails when too few attempts to judge", () => {
    expect(meetsLearnSuccessRate({ status: "in-progress", reps: 2, attempts: 2, successes: 2 })).toBe(false);
  });
  it("gates below the ~70% threshold", () => {
    expect(meetsLearnSuccessRate({ status: "in-progress", reps: 10, attempts: 10, successes: 6 })).toBe(false); // 60%
  });
  it("passes at or above the threshold", () => {
    expect(meetsLearnSuccessRate({ status: "in-progress", reps: 10, attempts: 10, successes: 7 })).toBe(true); // 70%
    expect(LEARN_SUCCESS_THRESHOLD).toBe(0.7);
  });
});

describe("markNodeProgress quality accumulation", () => {
  it("accumulates attempts/successes and tracks max bpmReached", () => {
    let p = markNodeProgress({}, "n1", { now: "2026-01-01", attempts: 4, successes: 3, bpmReached: 80 });
    expect(p.n1.attempts).toBe(4);
    expect(p.n1.successes).toBe(3);
    expect(p.n1.bpmReached).toBe(80);
    p = markNodeProgress(p, "n1", { now: "2026-01-02", attempts: 6, successes: 5, bpmReached: 70 });
    expect(p.n1.attempts).toBe(10); // 4 + 6
    expect(p.n1.successes).toBe(8); // 3 + 5
    expect(p.n1.bpmReached).toBe(80); // max(80, 70)
  });
  it("preserves fluency across progress updates", () => {
    let p = markNodeFluent({ n1: { status: "learned", reps: 1 } }, "n1", "2026-01-01");
    p = markNodeProgress(p, "n1", { attempts: 1, successes: 1 });
    expect(p.n1.fluent).toBe(true);
  });
});

// ─────────────────── V3 R10: fluency milestone ───────────────────
describe("markNodeFluent / isFluent (R10 autonomous stage)", () => {
  it("marks a node fluent with a timestamp", () => {
    const p = markNodeFluent({ n1: { status: "learned", reps: 5 } }, "n1", "2026-06-08T00:00:00.000Z");
    expect(p.n1.fluent).toBe(true);
    expect(p.n1.fluentAt).toBe("2026-06-08T00:00:00.000Z");
    expect(isFluent(p.n1)).toBe(true);
  });
  it("does NOT change DAG status (fluency is a second dimension)", () => {
    const p = markNodeFluent({ n1: { status: "learned", reps: 5, learnedAt: "2026-01-01" } }, "n1", "2026-06-08");
    expect(p.n1.status).toBe("learned"); // unchanged
    expect(p.n1.learnedAt).toBe("2026-01-01"); // distinct from fluentAt
  });
  it("is idempotent on fluentAt", () => {
    let p = markNodeFluent({ n1: { status: "learned", reps: 1 } }, "n1", "2026-06-08");
    p = markNodeFluent(p, "n1", "2026-12-31");
    expect(p.n1.fluentAt).toBe("2026-06-08"); // first timestamp kept
  });
  it("isFluent is false for non-fluent / missing nodes", () => {
    expect(isFluent(undefined)).toBe(false);
    expect(isFluent({ status: "learned", reps: 1 })).toBe(false);
  });
});
