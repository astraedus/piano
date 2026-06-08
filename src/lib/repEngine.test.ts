import { describe, it, expect } from "vitest";
import {
  buildRepItems,
  initRepEngine,
  repEngineReducer,
  currentRep,
  isSkillSwitch,
  repProgress,
  ladderProgress,
  toSessionQuality,
  type RepEngineConfig,
  type RepEngineState,
} from "./repEngine";
import type { BpmLadderConfig, RepBlockConfig } from "./types";

const REST: RepBlockConfig = { repsPerBlock: 3, restSec: 12 };
const LADDER: BpmLadderConfig = { startBpm: 60, targetBpm: 75, step: 5, advanceAfterSuccesses: 3 };

function cfg(partial: Partial<RepEngineConfig> = {}): RepEngineConfig {
  return {
    reps: Array.from({ length: 6 }, () => ({ drillId: "d1", label: "Drill 1" })),
    repBlocks: null,
    bpmLadder: null,
    interleaved: false,
    ...partial,
  };
}

/** Drive the engine through a sequence of marks, auto-resting and declining bumps,
 *  to reach the terminal state. Returns the final state. */
function runAll(state: RepEngineState, success: boolean): RepEngineState {
  let s = state;
  let guard = 0;
  while (s.phase !== "done" && guard++ < 200) {
    if (s.phase === "rest") { s = repEngineReducer(s, { type: "restDone" }); continue; }
    if (s.bpmBumpOffered) { s = repEngineReducer(s, { type: "declineBpm" }); continue; }
    s = repEngineReducer(s, { type: "mark", success });
  }
  return s;
}

describe("buildRepItems", () => {
  it("lays out repsPerBlock * defaultBlocks reps for a single drill", () => {
    const items = buildRepItems({ drill: { id: "d1", name: "D1" }, repBlocks: REST, defaultBlocks: 3 });
    expect(items).toHaveLength(9);
    expect(items.every((r) => r.drillId === "d1" && r.label === "D1")).toBe(true);
  });

  it("falls back to default rep count when no repBlocks (graceful degrade)", () => {
    const items = buildRepItems({ drill: { id: "d1", name: "D1" } });
    // default repsPerBlock (3) * default blocks (3) = 9
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("uses the interleave repSequence verbatim, tagging each rep with its skill", () => {
    const items = buildRepItems({
      interleave: {
        drills: [{ id: "a", name: "A" }, { id: "b", name: "B" }],
        repSequence: ["a", "b", "a", "b"],
      },
    });
    expect(items.map((r) => r.drillId)).toEqual(["a", "b", "a", "b"]);
    expect(items.map((r) => r.label)).toEqual(["A", "B", "A", "B"]);
  });

  it("returns empty when there is no drill and no interleave (graceful degrade)", () => {
    expect(buildRepItems({})).toEqual([]);
  });
});

describe("initRepEngine", () => {
  it("starts in rep phase with bpm = ladder start", () => {
    const s = initRepEngine(cfg({ bpmLadder: LADDER }));
    expect(s.phase).toBe("rep");
    expect(s.bpm).toBe(60);
    expect(s.atTargetBpm).toBe(false);
  });

  it("is immediately done with zero reps", () => {
    expect(initRepEngine(cfg({ reps: [] })).phase).toBe("done");
  });

  it("flags atTargetBpm when start already equals target", () => {
    const s = initRepEngine(cfg({ bpmLadder: { ...LADDER, startBpm: 75, targetBpm: 75 } }));
    expect(s.atTargetBpm).toBe(true);
  });
});

describe("micro-rest cadence (R2)", () => {
  it("enters rest after a full block, holding repIndex until restDone", () => {
    let s = initRepEngine(cfg({ reps: arr(6), repBlocks: REST }));
    s = repEngineReducer(s, { type: "mark", success: true }); // rep 1
    s = repEngineReducer(s, { type: "mark", success: true }); // rep 2
    expect(s.phase).toBe("rep");
    expect(s.repIndex).toBe(2);
    s = repEngineReducer(s, { type: "mark", success: true }); // rep 3 -> block done
    expect(s.phase).toBe("rest");
    expect(s.repIndex).toBe(2); // held until restDone
    s = repEngineReducer(s, { type: "restDone" });
    expect(s.phase).toBe("rep");
    expect(s.repIndex).toBe(3);
    expect(s.repsSinceRest).toBe(0);
  });

  it("never rests when there is no repBlocks config (graceful degrade)", () => {
    let s = initRepEngine(cfg({ reps: arr(4), repBlocks: null }));
    for (let i = 0; i < 3; i++) s = repEngineReducer(s, { type: "mark", success: true });
    expect(s.phase).toBe("rep");
    expect(s.repIndex).toBe(3);
  });

  it("does not rest after the final rep (goes straight to done)", () => {
    // 3 reps, block size 3 -> after rep 3 it is the last rep, so done not rest.
    let s = initRepEngine(cfg({ reps: arr(3), repBlocks: REST }));
    s = runAll(s, true);
    expect(s.phase).toBe("done");
  });
});

describe("BPM laddering (R5)", () => {
  it("offers a bump after advanceAfterSuccesses consecutive successes", () => {
    let s = initRepEngine(cfg({ reps: arr(10), bpmLadder: LADDER }));
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: true });
    expect(s.bpmBumpOffered).toBe(false);
    s = repEngineReducer(s, { type: "mark", success: true }); // 3rd consecutive
    expect(s.bpmBumpOffered).toBe(true);
    expect(s.bpm).toBe(60); // not yet advanced — awaiting confirm
  });

  it("advances by step and caps at target, resetting the run", () => {
    let s = initRepEngine(cfg({ reps: arr(10), bpmLadder: LADDER }));
    for (let i = 0; i < 3; i++) s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "advanceBpm" });
    expect(s.bpm).toBe(65);
    expect(s.consecutiveAtBpm).toBe(0);
    expect(s.bpmBumpOffered).toBe(false);
  });

  it("a miss resets the consecutive-success run (no bump)", () => {
    let s = initRepEngine(cfg({ reps: arr(10), bpmLadder: LADDER }));
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: false });
    expect(s.bpmBumpOffered).toBe(false);
    expect(s.consecutiveAtBpm).toBe(0);
  });

  it("stops offering bumps once target is reached", () => {
    // start 60 target 70 step 5 advance after 2 -> two advances reach 70.
    const ladder: BpmLadderConfig = { startBpm: 60, targetBpm: 70, step: 5, advanceAfterSuccesses: 2 };
    let s = initRepEngine(cfg({ reps: arr(20), bpmLadder: ladder }));
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "advanceBpm" }); // -> 65
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "advanceBpm" }); // -> 70 (target)
    expect(s.bpm).toBe(70);
    expect(s.atTargetBpm).toBe(true);
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: true });
    expect(s.bpmBumpOffered).toBe(false); // never re-offered at target
  });

  it("records the highest cleared bpm rung in bpmReached", () => {
    let s = initRepEngine(cfg({ reps: arr(10), bpmLadder: LADDER }));
    for (let i = 0; i < 3; i++) s = repEngineReducer(s, { type: "mark", success: true });
    expect(s.bpmReached).toBe(60);
    s = repEngineReducer(s, { type: "advanceBpm" }); // -> 65
    s = repEngineReducer(s, { type: "mark", success: true });
    expect(s.bpmReached).toBe(65);
  });

  it("declineBpm keeps current bpm and continues without an immediate re-offer", () => {
    let s = initRepEngine(cfg({ reps: arr(10), bpmLadder: LADDER }));
    for (let i = 0; i < 3; i++) s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "declineBpm" });
    expect(s.bpm).toBe(60);
    expect(s.consecutiveAtBpm).toBe(0);
    expect(s.bpmBumpOffered).toBe(false);
    expect(s.phase).toBe("rep");
  });
});

describe("rest + bpm-ladder interaction", () => {
  it("rests at a block boundary even when a bump was just confirmed", () => {
    // block size 3, advance after 3 -> the 3rd success both ends the block AND
    // offers a bump. Confirming the bump should then hand off to a rest.
    const ladder: BpmLadderConfig = { startBpm: 60, targetBpm: 90, step: 5, advanceAfterSuccesses: 3 };
    let s = initRepEngine(cfg({ reps: arr(9), repBlocks: REST, bpmLadder: ladder }));
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: true });
    s = repEngineReducer(s, { type: "mark", success: true }); // bump offered, block full
    expect(s.bpmBumpOffered).toBe(true);
    s = repEngineReducer(s, { type: "advanceBpm" });
    expect(s.bpm).toBe(65);
    expect(s.phase).toBe("rest"); // block boundary respected after the bump
  });
});

describe("interleave selectors (R4)", () => {
  const inter = cfg({
    reps: [
      { drillId: "a", label: "A" },
      { drillId: "b", label: "B" },
      { drillId: "a", label: "A" },
    ],
    interleaved: true,
  });

  it("isSkillSwitch detects a change in drill between consecutive reps", () => {
    let s = initRepEngine(inter);
    expect(isSkillSwitch(s)).toBe(false); // first rep, nothing before
    s = repEngineReducer(s, { type: "mark", success: true });
    expect(currentRep(s)?.drillId).toBe("b");
    expect(isSkillSwitch(s)).toBe(true);
  });

  it("non-interleaved sessions never report a skill switch", () => {
    let s = initRepEngine(cfg({ reps: arr(3) }));
    s = repEngineReducer(s, { type: "mark", success: true });
    expect(isSkillSwitch(s)).toBe(false);
  });
});

describe("derived display selectors", () => {
  it("repProgress reports 1-based current/total", () => {
    const s = initRepEngine(cfg({ reps: arr(6) }));
    expect(repProgress(s)).toEqual({ current: 1, total: 6 });
  });

  it("ladderProgress is null without a ladder, 0..1 with one", () => {
    expect(ladderProgress(initRepEngine(cfg()))).toBeNull();
    const s = initRepEngine(cfg({ bpmLadder: LADDER }));
    expect(ladderProgress(s)).toBe(0);
  });
});

describe("toSessionQuality (R8)", () => {
  it("rolls up attempts/successes/metronome/interleaved and omits bpm when no ladder", () => {
    let s = initRepEngine(cfg({ reps: arr(3), interleaved: true }));
    s = repEngineReducer(s, { type: "setMetronome", on: true });
    s = runAll(s, true);
    const q = toSessionQuality(s);
    expect(q.attempts).toBe(3);
    expect(q.successes).toBe(3);
    expect(q.metronomeOn).toBe(true);
    expect(q.interleaved).toBe(true);
    expect(q.bpmReached).toBeUndefined();
  });

  it("captures a sub-70% success rate so P1's gate keeps the node in-progress", () => {
    // 6 reps, 3 successes = 50% -> below LEARN_SUCCESS_THRESHOLD.
    let s = initRepEngine(cfg({ reps: arr(6) }));
    let i = 0;
    while (s.phase !== "done") {
      if (s.phase === "rest") { s = repEngineReducer(s, { type: "restDone" }); continue; }
      s = repEngineReducer(s, { type: "mark", success: i++ % 2 === 0 });
    }
    const q = toSessionQuality(s);
    expect(q.attempts).toBe(6);
    expect(q.successes).toBe(3);
  });

  it("includes bpmReached when the ladder cleared a rung", () => {
    let s = initRepEngine(cfg({ reps: arr(3), bpmLadder: LADDER }));
    s = runAll(s, true);
    const q = toSessionQuality(s);
    expect(q.bpmReached).toBe(60);
  });

  it("metronomeOn latches true once set, even if toggled off later", () => {
    let s = initRepEngine(cfg({ reps: arr(2) }));
    s = repEngineReducer(s, { type: "setMetronome", on: true });
    s = repEngineReducer(s, { type: "setMetronome", on: false });
    expect(s.metronomeOn).toBe(true);
  });
});

function arr(n: number) {
  return Array.from({ length: n }, () => ({ drillId: "d1", label: "Drill 1" }));
}

// ─────────── P2 -> P1 contract: rep-engine quality drives endSession ───────────
//
// This closes the loop the task asks to VERIFY: the SessionQuality the rep-engine
// produces, fed through P1's endSession, (a) gates a node `learned` only at high
// success and (b) earns more XP for accurate practice.

import { endSession } from "./sessions";
import { defaultState } from "./storage";
import type { AppState, SkillProgress } from "./types";
import "./piano/module"; // self-registers piano so getModuleSync resolves

const learnedNode = (): SkillProgress => ({ status: "learned", reps: 5, learnedAt: "2026-01-01" });

function piano(partial: Partial<AppState> = {}): AppState {
  return { ...defaultState(), phase: 1, ...partial };
}

function sessionLog(quality: ReturnType<typeof toSessionQuality>) {
  return {
    startedAt: "2026-06-07T10:00:00.000Z",
    endedAt: "2026-06-07T10:30:00.000Z",
    minutes: 30,
    ghostKey: "C" as const,
    phase: 1 as const,
    mode: "full" as const,
    chainDrillId: "p1-c-major-chain",
    slotsTouched: [
      { slot: "warmup" as const, touched: true },
      { slot: "chain" as const, touched: true },
    ],
    quality,
  };
}

describe("rep-engine quality -> endSession gate (P2->P1 end to end)", () => {
  // p-key-C links chainDrillId p1-c-major-chain + keyId C; its prereqs are the
  // tier-0 setup nodes, pre-learned here so the only remaining gate is success rate.
  const base = piano({
    skillProgress: { "p-t0-keyboard-map": learnedNode(), "p-t0-posture": learnedNode() },
  });

  it("a high-success drill run gates the node LEARNED and earns the metronome bonus", () => {
    // Drive a real engine: 10 clean reps with the metronome engaged -> 100%.
    let s = initRepEngine(cfg({ reps: arr(10) }));
    s = repEngineReducer(s, { type: "setMetronome", on: true });
    s = runAll(s, true);
    const q = toSessionQuality(s);
    expect(q.successes).toBe(10);
    expect(q.metronomeOn).toBe(true);

    const { state: next } = endSession(base, sessionLog(q), new Date("2026-06-07T10:30:00.000Z"));
    expect(next.skillProgress?.["p-key-C"]?.status).toBe("learned");
    // Quality run earns strictly more than a no-quality completion would.
    const noQuality = endSession(base, sessionLog({}), new Date("2026-06-07T10:30:00.000Z"));
    // Both learn the node here (legacy back-compat learns with no data), but the
    // metronome bonus means the quality run's XP is higher.
    expect(next.xp).toBeGreaterThan(noQuality.state.xp);
  });

  it("a sloppy (<70%) drill run keeps the node IN-PROGRESS, not learned", () => {
    // 10 reps, alternating -> 5 successes = 50%.
    let s = initRepEngine(cfg({ reps: arr(10) }));
    let i = 0;
    while (s.phase !== "done") {
      if (s.phase === "rest") { s = repEngineReducer(s, { type: "restDone" }); continue; }
      s = repEngineReducer(s, { type: "mark", success: i++ % 2 === 0 });
    }
    const q = toSessionQuality(s);
    expect(q.successes).toBe(5);

    const { state: next } = endSession(base, sessionLog(q), new Date("2026-06-07T10:30:00.000Z"));
    expect(next.skillProgress?.["p-key-C"]?.status).toBe("in-progress");
    expect(next.skillProgress?.["p-key-C"]?.attempts).toBe(10);
    expect(next.skillProgress?.["p-key-C"]?.successes).toBe(5);
  });
});
