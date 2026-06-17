// Drill motor-config helpers — pure, fully testable, zero React.
//
// Two jobs (curriculum batch #1, item #2):
//
//  1. DEFAULT MOTOR CONFIG for the ~42 "flat" chain drills. Before this, only
//     6 of ~48 drills carried repBlocks + bpmLadder; the other 88% ran a flat
//     "mark done" path (no micro-rest, no tempo ladder). withDefaultMotorConfig
//     gives every drill a micro-rest cadence (universally good — Bönstrup 2020)
//     and a tempo ladder WHEN tempo is a meaningful axis for that drill. A pure
//     expression/mood drill ("play it tender") or a by-ear transcription drill
//     gets the rest cadence but NO ladder, because a metronome target on "make
//     a note cry" is musically wrong. Drills that already declare their own
//     config are returned untouched.
//
//  2. CROSS-SESSION BPM PERSISTENCE + CEILING SCALING. initRepEngine always
//     reset the ladder to the drill's hardcoded startBpm, so reaching 95 BPM
//     today still started you at 60 tomorrow (the ladder was amnesiac). These
//     helpers seed the ladder's start from the node's persisted bpmReached and
//     raise the target ceiling a step once the user has cleared the target
//     across several sessions — so the drill keeps getting harder after it's
//     beaten, instead of running identically at day 1 and day 100.

import type { BpmLadderConfig, ChainDrill, Pillar, SkillProgress } from "./types";
import { DEFAULT_REP_BLOCKS, DEFAULT_BPM_LADDER_STEP, DEFAULT_BPM_ADVANCE_AFTER } from "./types";

// A drill's tempo ladder is meaningful only when the drill trains something with
// a SPEED axis: scales, chord changes, picking, riffs. Pure-expression drills
// (dynamics/mood) and pure by-ear drills have no honest "target BPM", so they
// get the micro-rest cadence but no ladder.
const TEMPO_PILLARS: ReadonlySet<Pillar> = new Set<Pillar>([
  "technique",
  "repertoire",
  "lead-sheet",
  "improv",
]);

// Step types that carry a tempo (used to rescue a drill whose pillar is
// expression/ear but which still contains real scale/progression speed work).
const TEMPO_STEP_TYPES = new Set(["scale", "triad", "progression"]);

/** True when a tempo ladder is pedagogically appropriate for this drill. */
export function drillWantsTempoLadder(drill: ChainDrill): boolean {
  if (TEMPO_PILLARS.has(drill.pillar)) return true;
  // expression/ear drills: only if they contain genuine tempo steps.
  return drill.steps.some((s) => TEMPO_STEP_TYPES.has(s.type));
}

// A conservative default ladder for a flat drill that wants one. Beginners start
// slow and climb; 60→100 mirrors the existing Phase-1 technique drills.
export const DEFAULT_FLAT_BPM_LADDER: BpmLadderConfig = {
  startBpm: 60,
  targetBpm: 100,
  step: DEFAULT_BPM_LADDER_STEP,
  advanceAfterSuccesses: DEFAULT_BPM_ADVANCE_AFTER,
};

/**
 * Return the drill augmented with default motor config so it stops running flat.
 * Idempotent and non-destructive: a drill that already declares repBlocks /
 * bpmLadder keeps its own; only the MISSING pieces are filled in. Pure.
 */
export function withDefaultMotorConfig(drill: ChainDrill): ChainDrill {
  const repBlocks = drill.repBlocks ?? DEFAULT_REP_BLOCKS;
  const bpmLadder =
    drill.bpmLadder ?? (drillWantsTempoLadder(drill) ? DEFAULT_FLAT_BPM_LADDER : null);
  return {
    ...drill,
    repBlocks,
    // Only attach a ladder when one is wanted; leave undefined otherwise so the
    // engine's "no ladder" path (flat reps, no metronome) is preserved for pure
    // expression/ear drills.
    ...(bpmLadder ? { bpmLadder } : {}),
    // A drill with a ladder is interleavable unless it opted out explicitly.
    interleavable: drill.interleavable ?? !!bpmLadder,
  };
}

/** Apply withDefaultMotorConfig across a drill list. Pure. */
export function withDefaultMotorConfigAll(drills: ChainDrill[]): ChainDrill[] {
  return drills.map(withDefaultMotorConfig);
}

// ───────────────────────── cross-session BPM scaling ─────────────────────────

/** How many target-clears (sessions reaching the ceiling) before the ceiling is
 *  raised one step. Two solid sessions at target = "you've outgrown this tempo". */
export const CEILING_BUMP_AFTER_CLEARS = 2;
/** Hard cap on how far the ceiling can climb above its authored target: +2 steps.
 *  Keeps a runaway ladder from drifting a beginner drill into virtuoso tempos. */
export const MAX_CEILING_BUMPS = 2;

/**
 * The startBpm to use this session, seeded from the node's persisted best so the
 * ladder is no longer amnesiac. We start a touch below the prior best (one step)
 * so there's a warm-up rung to re-clear, never below the authored start and never
 * above the (possibly bumped) target. Pure.
 */
export function seededStartBpm(
  ladder: BpmLadderConfig,
  lastBpmReached: number | undefined,
  target = ladder.targetBpm,
): number {
  const step = ladder.step || DEFAULT_BPM_LADDER_STEP;
  const fromHistory = lastBpmReached != null ? lastBpmReached - step : ladder.startBpm;
  const seeded = Math.max(ladder.startBpm, fromHistory);
  // Clamp into [startBpm, target] — a seed can never exceed the ceiling.
  return Math.min(Math.max(ladder.startBpm, seeded), target);
}

/**
 * The target ceiling for this session. Once the user has cleared the authored
 * target across CEILING_BUMP_AFTER_CLEARS sessions, raise it one step per that
 * many clears, capped at MAX_CEILING_BUMPS steps above the authored target. Pure.
 */
export function bumpedTargetBpm(
  ladder: BpmLadderConfig,
  targetClears: number | undefined,
): number {
  const step = ladder.step || DEFAULT_BPM_LADDER_STEP;
  const clears = Math.max(0, targetClears ?? 0);
  const bumps = Math.min(MAX_CEILING_BUMPS, Math.floor(clears / CEILING_BUMP_AFTER_CLEARS));
  return ladder.targetBpm + bumps * step;
}

/**
 * Compose the persisted progress into an EFFECTIVE ladder for this session:
 * a raised ceiling (after enough clears) plus a start seeded from the node's
 * best. Returns null unchanged when the drill has no ladder. Pure.
 */
export function effectiveBpmLadder(
  ladder: BpmLadderConfig | null | undefined,
  progress: SkillProgress | undefined,
): BpmLadderConfig | null {
  if (!ladder) return null;
  const targetBpm = bumpedTargetBpm(ladder, progress?.targetClears);
  const startBpm = seededStartBpm(ladder, progress?.bpmReached, targetBpm);
  return { ...ladder, startBpm, targetBpm };
}

/**
 * Did this session clear the drill's (authored) target ceiling? Used by endSession
 * to increment the node's targetClears so the ceiling can scale. Pure.
 */
export function clearedTarget(
  ladder: BpmLadderConfig | null | undefined,
  bpmReachedThisSession: number | undefined,
): boolean {
  if (!ladder || bpmReachedThisSession == null) return false;
  return bpmReachedThisSession >= ladder.targetBpm;
}
