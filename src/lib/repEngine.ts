// Rep-engine state machine — pure, fully testable, zero React, zero side effects.
//
// This is the core that drives the interactive chain-drill (and ear-moment) loop:
//   do N reps -> micro-rest (R2) -> next block, in interleaved order (R4),
//   laddering the BPM up after a run of successes (R5), capturing per-rep quality
//   for the XP + node-gate logic in P1 (R8).
//
// Everything DEGRADES GRACEFULLY: a drill with no repBlocks/bpmLadder/interleave
// collapses to a single flat block of reps with no rest and no metronome ladder,
// which is functionally the old "tried it" behavior with quality capture added.

import type {
  BpmLadderConfig,
  RepBlockConfig,
  SessionQuality,
} from "./types";
import {
  DEFAULT_BPM_ADVANCE_AFTER,
  DEFAULT_BPM_LADDER_STEP,
  DEFAULT_REP_BLOCKS,
} from "./types";

// A single planned rep. `label` is the human-facing skill/drill name for the
// rep (used to show WHICH skill the current rep belongs to under interleaving).
export interface RepItem {
  /** Stable id of the drill this rep belongs to (for interleave skill switch). */
  drillId: string;
  /** Display name for the skill/drill this rep targets. */
  label: string;
}

export interface RepEngineConfig {
  /** Ordered reps to execute. Length >= 1. Built by buildRepItems. */
  reps: RepItem[];
  /** Micro-rest cadence (R2). Null = no enforced rest (single flat block). */
  repBlocks: RepBlockConfig | null;
  /** Tempo ladder (R5). Null = no metronome ladder. */
  bpmLadder: BpmLadderConfig | null;
  /** True when the rep order weaves 2+ skills (R4) — recorded in quality. */
  interleaved: boolean;
}

// What the engine is currently asking the user to do.
export type RepPhase = "rep" | "rest" | "done";

export interface RepEngineState {
  config: RepEngineConfig;
  phase: RepPhase;
  /** Index into config.reps of the rep currently being performed (or just done). */
  repIndex: number;
  /** Current metronome BPM (from the ladder; falls back to a sane default). */
  bpm: number;
  /** Consecutive successes at the CURRENT bpm rung (resets on miss or advance). */
  consecutiveAtBpm: number;
  /** Reps completed since the last rest (drives the micro-rest cadence). */
  repsSinceRest: number;
  /** True when a +step BPM bump is offered (user confirms to advance). */
  bpmBumpOffered: boolean;
  /** True when the most recent rep was a success (drives instant feedback). */
  lastWasSuccess: boolean | null;
  /** True once the bpm ladder has reached its target (no more bumps offered). */
  atTargetBpm: boolean;
  // ── accumulated quality (R8) ──
  attempts: number;
  successes: number;
  /** Highest BPM rung at which a rep was cleared (R5). 0 when no ladder. */
  bpmReached: number;
  /** Whether the metronome was on at any point this drill (R8 bonus signal). */
  metronomeOn: boolean;
}

// ───────────────────────── rep list construction ─────────────────────────

/**
 * Build the executable rep list for a drill session. Pure.
 *
 *  - With an interleave plan ({drills, repSequence}), each entry in repSequence
 *    is one rep tagged with that drill's id + name -> the woven A,B,A,B order (R4).
 *  - Without interleave, lay out `repsPerBlock * blocks` reps of the single drill,
 *    or a sensible default count when no repBlocks config exists.
 *
 * `defaultBlocks` controls how many rep-blocks a single (non-interleaved) drill
 * runs (default 3 blocks -> 3 reps each at the default cadence = a short, R2-shaped
 * session). Interleaved sessions take their length straight from repSequence.
 */
export function buildRepItems(opts: {
  /** The primary drill (single-drill flow). */
  drill?: { id: string; name: string } | null;
  /** Interleave plan from todayPlan (R4). When present it wins. */
  interleave?: {
    drills: { id: string; name: string }[];
    repSequence: string[];
  } | null;
  repBlocks?: RepBlockConfig | null;
  /** Blocks to run for a single drill when not interleaving (default 3). */
  defaultBlocks?: number;
}): RepItem[] {
  const { drill, interleave, repBlocks, defaultBlocks = 3 } = opts;

  if (interleave && interleave.repSequence.length > 0) {
    const nameById = new Map(interleave.drills.map((d) => [d.id, d.name]));
    return interleave.repSequence.map((id) => ({
      drillId: id,
      label: nameById.get(id) ?? id,
    }));
  }

  if (!drill) return [];

  const perBlock = repBlocks?.repsPerBlock ?? DEFAULT_REP_BLOCKS.repsPerBlock;
  const total = Math.max(1, perBlock * Math.max(1, defaultBlocks));
  return Array.from({ length: total }, () => ({ drillId: drill.id, label: drill.name }));
}

// ───────────────────────── engine init + actions ─────────────────────────

export function initRepEngine(config: RepEngineConfig): RepEngineState {
  return {
    config,
    phase: config.reps.length > 0 ? "rep" : "done",
    repIndex: 0,
    bpm: config.bpmLadder?.startBpm ?? 80,
    consecutiveAtBpm: 0,
    repsSinceRest: 0,
    bpmBumpOffered: false,
    lastWasSuccess: null,
    atTargetBpm: config.bpmLadder ? config.bpmLadder.startBpm >= config.bpmLadder.targetBpm : false,
    attempts: 0,
    successes: 0,
    bpmReached: 0,
    metronomeOn: false,
  };
}

export type RepEngineAction =
  | { type: "mark"; success: boolean }
  | { type: "advanceBpm" }    // user confirmed the offered +step bump
  | { type: "declineBpm" }    // user dismissed the bump offer, keeps current bpm
  | { type: "restDone" }      // the rest countdown elapsed (or was skipped)
  | { type: "setMetronome"; on: boolean };

const advanceAfter = (l: BpmLadderConfig) =>
  l.advanceAfterSuccesses ?? DEFAULT_BPM_ADVANCE_AFTER;
const ladderStep = (l: BpmLadderConfig) => l.step ?? DEFAULT_BPM_LADDER_STEP;

/**
 * The rep-engine reducer. Pure: (state, action) -> state. All timing (the rest
 * countdown, the instant-feedback flash) lives in the UI; the reducer only models
 * the discrete transitions.
 */
export function repEngineReducer(
  state: RepEngineState,
  action: RepEngineAction,
): RepEngineState {
  switch (action.type) {
    case "setMetronome":
      return { ...state, metronomeOn: state.metronomeOn || action.on };

    case "mark": {
      if (state.phase !== "rep") return state;
      const { config } = state;
      const ladder = config.bpmLadder;
      const success = action.success;

      const attempts = state.attempts + 1;
      const successes = state.successes + (success ? 1 : 0);
      // A rep cleared at the current bpm records that rung as reached (R5).
      const bpmReached = success && ladder
        ? Math.max(state.bpmReached, state.bpm)
        : state.bpmReached;

      // BPM-ladder bookkeeping: count consecutive successes at this rung; a miss
      // resets the run. Offer a bump once the run hits the threshold (and we are
      // not already at target).
      let consecutiveAtBpm = success ? state.consecutiveAtBpm + 1 : 0;
      let bpmBumpOffered = false;
      if (ladder && !state.atTargetBpm && success
          && consecutiveAtBpm >= advanceAfter(ladder)) {
        bpmBumpOffered = true;
      }

      // Micro-rest cadence (R2): count reps since the last rest. When a full
      // block is done AND there are more reps to go, the next phase is `rest`.
      const repsSinceRest = state.repsSinceRest + 1;
      const perBlock = config.repBlocks?.repsPerBlock ?? Infinity; // no config -> never rest
      const isLastRep = state.repIndex >= config.reps.length - 1;

      // A pending bump offer pauses progression: we stay on the current rep index
      // conceptually but move to a decision. We surface the offer and let the user
      // advance/decline before continuing. We do NOT auto-advance the rep here so
      // the UI can show the bump prompt; the rep itself is already counted.
      if (bpmBumpOffered) {
        return {
          ...state,
          attempts,
          successes,
          bpmReached,
          consecutiveAtBpm,
          repsSinceRest,
          bpmBumpOffered,
          lastWasSuccess: success,
        };
      }

      if (isLastRep) {
        return {
          ...state,
          phase: "done",
          attempts,
          successes,
          bpmReached,
          consecutiveAtBpm,
          repsSinceRest,
          lastWasSuccess: success,
        };
      }

      // When a block boundary is hit we go to `rest` and hold repIndex; restDone
      // then advances the rep and zeroes repsSinceRest. Otherwise advance now.
      const needRest = config.repBlocks != null && repsSinceRest >= perBlock;
      return {
        ...state,
        phase: needRest ? "rest" : "rep",
        repIndex: needRest ? state.repIndex : state.repIndex + 1,
        repsSinceRest,
        consecutiveAtBpm,
        bpmReached,
        attempts,
        successes,
        lastWasSuccess: success,
      };
    }

    case "advanceBpm": {
      const ladder = state.config.bpmLadder;
      if (!ladder || !state.bpmBumpOffered) return state;
      const nextBpm = Math.min(ladder.targetBpm, state.bpm + ladderStep(ladder));
      const atTargetBpm = nextBpm >= ladder.targetBpm;
      // After confirming the bump, continue the loop from where the rep left off.
      return continueAfterDecision({
        ...state,
        bpm: nextBpm,
        atTargetBpm,
        consecutiveAtBpm: 0, // fresh run at the new rung
        bpmBumpOffered: false,
      });
    }

    case "declineBpm": {
      if (!state.bpmBumpOffered) return state;
      // Keep current bpm; reset the run so the offer doesn't immediately re-fire.
      return continueAfterDecision({
        ...state,
        consecutiveAtBpm: 0,
        bpmBumpOffered: false,
      });
    }

    case "restDone": {
      if (state.phase !== "rest") return state;
      return {
        ...state,
        phase: "rep",
        repIndex: state.repIndex + 1,
        repsSinceRest: 0,
      };
    }

    default:
      return state;
  }
}

/**
 * Shared tail for advanceBpm/declineBpm: the rep that triggered the decision was
 * already counted, so now we move forward exactly as the `mark` reducer would
 * have (rest if a block boundary was hit, else next rep, else done).
 */
function continueAfterDecision(state: RepEngineState): RepEngineState {
  const { config } = state;
  const isLastRep = state.repIndex >= config.reps.length - 1;
  if (isLastRep) return { ...state, phase: "done" };

  const perBlock = config.repBlocks?.repsPerBlock ?? Infinity;
  const needRest = config.repBlocks != null && state.repsSinceRest >= perBlock;
  return {
    ...state,
    phase: needRest ? "rest" : "rep",
    repIndex: needRest ? state.repIndex : state.repIndex + 1,
  };
}

// ───────────────────────── derived selectors ─────────────────────────

/** The rep currently being performed, or undefined when done. */
export function currentRep(state: RepEngineState): RepItem | undefined {
  return state.config.reps[state.repIndex];
}

/** True iff the upcoming rep targets a DIFFERENT skill than the one just done —
 *  i.e. an interleave skill switch the UI should highlight (R4). */
export function isSkillSwitch(state: RepEngineState): boolean {
  if (!state.config.interleaved || state.repIndex <= 0) return false;
  const prev = state.config.reps[state.repIndex - 1];
  const cur = state.config.reps[state.repIndex];
  return !!prev && !!cur && prev.drillId !== cur.drillId;
}

/** 1-based "rep X of N" progress for display. */
export function repProgress(state: RepEngineState): { current: number; total: number } {
  return {
    current: Math.min(state.repIndex + 1, state.config.reps.length),
    total: state.config.reps.length,
  };
}

/** Ladder progress for display: how far bpm has climbed start -> target (0..1). */
export function ladderProgress(state: RepEngineState): number | null {
  const l = state.config.bpmLadder;
  if (!l) return null;
  const span = l.targetBpm - l.startBpm;
  if (span <= 0) return 1;
  return Math.max(0, Math.min(1, (state.bpm - l.startBpm) / span));
}

/** Roll up the accumulated quality into the SessionQuality the log records (R8). */
export function toSessionQuality(state: RepEngineState): SessionQuality {
  const q: SessionQuality = {
    attempts: state.attempts,
    successes: state.successes,
    metronomeOn: state.metronomeOn,
    interleaved: state.config.interleaved,
  };
  if (state.bpmReached > 0) q.bpmReached = state.bpmReached;
  return q;
}
