import { describe, expect, it } from "vitest";
import {
  TRANSITION_PAIRS,
  DEFAULT_TARGET_PER_MIN,
  TRANSITION_WINDOW_SEC,
  transitionNodeId,
  findTransitionPair,
  initTransitionDrill,
  transitionReducer,
  changesPerMinute,
  isPairFluent,
  scoreTransition,
  type TransitionDrillState,
} from "./transitionDrill";

describe("transition pairs + node ids", () => {
  it("defines the canonical priority-key pairs for both instruments", () => {
    expect(findTransitionPair("piano", "am-F")?.chordA).toBe("Am");
    expect(findTransitionPair("piano", "G-C")?.chordA).toBe("G");
    expect(findTransitionPair("guitar", "G-C")?.chordA).toBe("G");
    expect(findTransitionPair("guitar", "em-am")?.chordA).toBe("Em");
  });
  it("maps a pair to its instrument-prefixed DAG node id", () => {
    expect(transitionNodeId("piano", "am-F")).toBe("p-trans-am-F");
    expect(transitionNodeId("guitar", "G-C")).toBe("g-trans-G-C");
  });
  it("every pair targets the standard 30/min", () => {
    for (const p of TRANSITION_PAIRS) expect(p.targetPerMin).toBe(DEFAULT_TARGET_PER_MIN);
  });
});

describe("changesPerMinute", () => {
  it("scales the count to a full minute", () => {
    expect(changesPerMinute(30, 60)).toBe(30);
    expect(changesPerMinute(15, 30)).toBe(30); // 15 in 30s = 30/min
    expect(changesPerMinute(20, 60)).toBe(20);
  });
  it("rounds to the nearest whole change/min", () => {
    expect(changesPerMinute(31, 60)).toBe(31);
    expect(changesPerMinute(10, 19)).toBe(32); // 10/19*60 = 31.6 -> 32
  });
  it("guards divide-by-zero / no elapsed time", () => {
    expect(changesPerMinute(5, 0)).toBe(0);
    expect(changesPerMinute(5, -3)).toBe(0);
  });
});

describe("isPairFluent (the song-gate threshold)", () => {
  it("clears at or above the target", () => {
    expect(isPairFluent(30)).toBe(true);
    expect(isPairFluent(45)).toBe(true);
  });
  it("does not clear below the target", () => {
    expect(isPairFluent(29)).toBe(false);
    expect(isPairFluent(0)).toBe(false);
  });
  it("honors a custom target", () => {
    expect(isPairFluent(20, 15)).toBe(true);
    expect(isPairFluent(20, 25)).toBe(false);
  });
});

describe("transition timed-count reducer", () => {
  it("starts a fresh 60s window", () => {
    const s = initTransitionDrill();
    expect(s.windowSec).toBe(TRANSITION_WINDOW_SEC);
    expect(s).toMatchObject({ running: false, elapsedSec: 0, cleanChanges: 0, finished: false });
  });

  it("only counts changes while running", () => {
    let s = initTransitionDrill();
    s = transitionReducer(s, { type: "change" }); // ignored — not running
    expect(s.cleanChanges).toBe(0);
    s = transitionReducer(s, { type: "start" });
    s = transitionReducer(s, { type: "change" });
    s = transitionReducer(s, { type: "change" });
    expect(s.cleanChanges).toBe(2);
  });

  it("ticks the clock and auto-finishes at the window end", () => {
    let s = transitionReducer(initTransitionDrill(), { type: "start" });
    s = transitionReducer(s, { type: "tick", seconds: 59 });
    expect(s.finished).toBe(false);
    expect(s.running).toBe(true);
    s = transitionReducer(s, { type: "tick", seconds: 1 });
    expect(s.elapsedSec).toBe(60);
    expect(s.finished).toBe(true);
    expect(s.running).toBe(false);
  });

  it("clamps elapsed to the window and ignores changes after finishing", () => {
    let s = transitionReducer(initTransitionDrill(), { type: "start" });
    s = transitionReducer(s, { type: "tick", seconds: 100 });
    expect(s.elapsedSec).toBe(60);
    const after = transitionReducer(s, { type: "change" });
    expect(after.cleanChanges).toBe(0);
  });

  it("stop ends the window early; count is final", () => {
    let s = transitionReducer(initTransitionDrill(), { type: "start" });
    s = transitionReducer(s, { type: "change" });
    s = transitionReducer(s, { type: "tick", seconds: 30 });
    s = transitionReducer(s, { type: "stop" });
    expect(s.finished).toBe(true);
    expect(s.running).toBe(false);
    expect(s.cleanChanges).toBe(1);
  });

  it("reset returns a fresh window", () => {
    let s = transitionReducer(initTransitionDrill(), { type: "start" });
    s = transitionReducer(s, { type: "change" });
    s = transitionReducer(s, { type: "reset" });
    expect(s).toMatchObject({ running: false, elapsedSec: 0, cleanChanges: 0, finished: false });
  });
});

describe("scoreTransition — full-window vs early-stop", () => {
  const pair = { targetPerMin: 30 };

  it("a full-window 30-change run is fluent (30/min)", () => {
    const state: TransitionDrillState = {
      running: false, elapsedSec: 60, cleanChanges: 30, finished: true, windowSec: 60,
    };
    expect(scoreTransition(state, pair)).toEqual({ perMinute: 30, fluent: true });
  });

  it("an early-stop scales by elapsed time", () => {
    const state: TransitionDrillState = {
      running: false, elapsedSec: 30, cleanChanges: 18, finished: true, windowSec: 60,
    };
    // 18 in 30s = 36/min -> fluent
    expect(scoreTransition(state, pair)).toEqual({ perMinute: 36, fluent: true });
  });

  it("a slow full run is not fluent", () => {
    const state: TransitionDrillState = {
      running: false, elapsedSec: 60, cleanChanges: 20, finished: true, windowSec: 60,
    };
    expect(scoreTransition(state, pair)).toEqual({ perMinute: 20, fluent: false });
  });
});
