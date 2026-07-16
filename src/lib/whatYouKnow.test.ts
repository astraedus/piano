import { describe, it, expect } from "vitest";
import { buildWhatYouKnow } from "./whatYouKnow";
import { drillRepId, scaleRepId } from "./types";
import type { KeyDepth, KeyId, Piece, SkillNode, SkillProgress } from "./types";

// Minimal node set: a tier-1 key node (linked to a scale) and a tier-1 drill node,
// plus a locked-until-prereq tier-2 node to prove only LEARNED nodes are surfaced.
const cMajor: SkillNode = {
  id: "p-key-C",
  instrument: "piano",
  title: "C major is yours",
  keepTitle: "C major",
  tier: 1,
  category: "scales",
  prereqs: [],
  masteryDrill: "x",
  unlock: "x",
  keyId: "C",
  chainDrillId: "p1-c-major-chain",
};
const firstImprov: SkillNode = {
  id: "p-t1-first-improv",
  instrument: "piano",
  title: "First Improvisation",
  keepTitle: "First Improvisation",
  tier: 1,
  category: "expression",
  prereqs: ["p-key-C"],
  masteryDrill: "x",
  unlock: "x",
  chainDrillId: "p1-first-improv",
};
const popFormula: SkillNode = {
  id: "p-t2-pop-formula",
  instrument: "piano",
  title: "The Pop Formula",
  keepTitle: "The Pop Formula",
  tier: 2,
  category: "chords",
  prereqs: ["p-key-C"],
  masteryDrill: "x",
  unlock: "x",
};
const NODES = [cMajor, firstImprov, popFormula];

function emptyInput() {
  return {
    nodes: NODES,
    progress: {} as Record<string, SkillProgress>,
    skillReps: undefined as Record<string, { count: number; maxBpm?: number; lastAt?: string }> | undefined,
    keyDepths: {} as Partial<Record<KeyId, KeyDepth>>,
    earLevel: 1 as 1 | 2 | 3 | 4 | 5 | 6 | 7,
    sessions: [] as { earResults?: { correctIds: string[]; wrongIds: string[] } }[],
    pieces: [] as Piece[],
  };
}

describe("buildWhatYouKnow", () => {
  it("reports an honest empty state when nothing is built", () => {
    const s = buildWhatYouKnow(emptyInput());
    expect(s.empty).toBe(true);
    expect(s.skills).toEqual({ learned: 0, total: 3 });
    expect(s.learnedByTier).toEqual([]);
    expect(s.keys).toEqual([]);
    expect(s.pieces).toEqual([]);
    expect(s.ear.roundsAnswered).toBe(0);
  });

  it("surfaces only LEARNED skills, grouped by tier, with best BPM", () => {
    const input = emptyInput();
    input.progress = {
      "p-key-C": { status: "learned", reps: 6 },
      "p-t1-first-improv": { status: "learned", reps: 4, bpmReached: 70 },
      // popFormula only in-progress → must NOT appear as learned.
      "p-t2-pop-formula": { status: "in-progress", reps: 2 },
    };
    input.skillReps = {
      [scaleRepId("C")]: { count: 5, maxBpm: 84 },
      [drillRepId("p1-first-improv")]: { count: 3, maxBpm: 60 },
    };
    const s = buildWhatYouKnow(input);

    expect(s.empty).toBe(false);
    expect(s.skills.learned).toBe(2);
    // Only tier 1 has learned nodes.
    expect(s.learnedByTier.map((t) => t.tier)).toEqual([1]);
    const t1 = s.learnedByTier[0].skills;
    expect(t1.map((x) => x.title)).toEqual(["C major", "First Improvisation"]);
    // C major's best BPM pulls from the scale warmup (84 > nothing on the node).
    expect(t1.find((x) => x.id === "p-key-C")?.bestBpm).toBe(84);
    // first-improv's best pulls the max of node bpmReached (70) and drill (60).
    expect(t1.find((x) => x.id === "p-t1-first-improv")?.bestBpm).toBe(70);
  });

  it("charts keys with depth >= 1, deepest first, with best scale BPM", () => {
    const input = emptyInput();
    input.keyDepths = { C: 5, G: 2, am: 0, F: 1 };
    input.skillReps = { [scaleRepId("C")]: { count: 9, maxBpm: 96 } };
    const s = buildWhatYouKnow(input);

    // am has depth 0 → excluded. Order: C(5), G(2), F(1).
    expect(s.keys.map((k) => k.keyId)).toEqual(["C", "G", "F"]);
    expect(s.keys[0].depthName).toBe("Home");
    expect(s.keys[0].bestBpm).toBe(96);
    expect(s.keys[1].bestBpm).toBeUndefined();
  });

  it("aggregates lifetime ear accuracy from sessions", () => {
    const input = emptyInput();
    input.earLevel = 3;
    input.sessions = [
      { earResults: { correctIds: ["a", "b"], wrongIds: ["c"] } },
      { earResults: { correctIds: ["d"], wrongIds: [] } },
      {}, // a session with no ear round
    ];
    const s = buildWhatYouKnow(input);
    expect(s.ear.earLevel).toBe(3);
    expect(s.ear.roundsAnswered).toBe(4);
    expect(s.ear.accuracy).toBeCloseTo(3 / 4);
  });

  it("lists pieces oldest first", () => {
    const input = emptyInput();
    input.pieces = [
      { id: "b", title: "Newer", status: "learning", startedAt: "2026-02-01", minutes: 10 },
      { id: "a", title: "Older", status: "yours", startedAt: "2026-01-01", minutes: 20 },
    ];
    const s = buildWhatYouKnow(input);
    expect(s.pieces.map((p) => p.id)).toEqual(["a", "b"]);
    expect(s.empty).toBe(false);
  });
});
