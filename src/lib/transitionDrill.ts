// Timed chord-transition fluency — pure, fully testable, zero React.
//
// Curriculum batch #1, item #2 (the real song bottleneck): knowing a chord and
// being able to CHANGE to it in tempo are separated by weeks of motor
// consolidation. The JustinGuitar "one-minute changes" protocol drills a chord
// PAIR for 60 seconds and counts clean changes; ~30/min is the threshold where
// the change starts to run without conscious oversight. This module owns:
//
//   - the transition-pair model + the canonical pairs for the priority keys,
//   - the 60-second timed-count state machine (tick the clock, count clean
//     changes, finalize at the window end),
//   - changes-per-minute + the fluency threshold check,
//   - the synthetic DAG node id a pair maps to, so the existing prereq gate in
//     skillTree.ts can gate a target-song node on the pair clearing threshold.
//
// The count is "clean changes" the player self-reports (tap on each landed
// change) — the same honest-self-report contract as the rep engine's mark.

import type { KeyId } from "./types";

/** A chord-change pair to drill (e.g. G→C). `pairId` is stable + used to derive
 *  the DAG node id. `targetPerMin` is the clean-changes/min threshold for
 *  "fluent" (JustinGuitar's ~30 for common open-chord pairs). */
export interface TransitionPair {
  pairId: string;          // stable, e.g. "am-F" / "G-C"
  instrument: "piano" | "guitar";
  keyId: KeyId;            // the working key the pair lives in
  chordA: string;          // display chord name, e.g. "Am"
  chordB: string;          // display chord name, e.g. "F"
  targetPerMin: number;    // clean changes/min to count as fluent
}

/** Standard one-minute-changes target for common open-chord pairs. */
export const DEFAULT_TARGET_PER_MIN = 30;
/** The timed window, in seconds (JustinGuitar one-minute changes). */
export const TRANSITION_WINDOW_SEC = 60;

// The canonical hardest/most-unlocking pairs for the priority keys. Piano's
// Am→F is the hard change behind the Pop Formula loop (Am–F–C–G); guitar's
// G→C is the notorious beginner wall behind most open-chord songs.
export const TRANSITION_PAIRS: TransitionPair[] = [
  { pairId: "am-F", instrument: "piano", keyId: "am", chordA: "Am", chordB: "F", targetPerMin: DEFAULT_TARGET_PER_MIN },
  { pairId: "G-C", instrument: "piano", keyId: "C", chordA: "G", chordB: "C", targetPerMin: DEFAULT_TARGET_PER_MIN },
  { pairId: "G-C", instrument: "guitar", keyId: "G", chordA: "G", chordB: "C", targetPerMin: DEFAULT_TARGET_PER_MIN },
  { pairId: "em-am", instrument: "guitar", keyId: "em", chordA: "Em", chordB: "Am", targetPerMin: DEFAULT_TARGET_PER_MIN },
];

/** The synthetic DAG node id a transition pair maps to. Becoming `learned` on
 *  this node (when the pair clears threshold) lets the existing prereq gate
 *  unlock a target-song node. Instrument-prefixed to match node id conventions. */
export function transitionNodeId(instrument: "piano" | "guitar", pairId: string): string {
  return `${instrument === "piano" ? "p" : "g"}-trans-${pairId}`;
}

export function findTransitionPair(instrument: "piano" | "guitar", pairId: string): TransitionPair | undefined {
  return TRANSITION_PAIRS.find((p) => p.instrument === instrument && p.pairId === pairId);
}

// ───────────────────────── the 60-second timed count ─────────────────────────

export interface TransitionDrillState {
  /** Whether the clock is running (between start and the window end). */
  running: boolean;
  /** Seconds elapsed in the current window, clamped to [0, windowSec]. */
  elapsedSec: number;
  /** Clean changes counted this window. */
  cleanChanges: number;
  /** True once the window has elapsed (or was stopped) — count is final. */
  finished: boolean;
  windowSec: number;
}

export function initTransitionDrill(windowSec = TRANSITION_WINDOW_SEC): TransitionDrillState {
  return { running: false, elapsedSec: 0, cleanChanges: 0, finished: false, windowSec };
}

export type TransitionAction =
  | { type: "start" }
  | { type: "tick"; seconds?: number } // advance the clock (default 1s)
  | { type: "change" }                 // the player landed one clean change
  | { type: "stop" }                   // end early; count is final
  | { type: "reset" };

/** Pure reducer for the timed count. The clock/tick interval lives in the UI;
 *  this only models the discrete transitions, so it is fully unit-testable. */
export function transitionReducer(
  state: TransitionDrillState,
  action: TransitionAction,
): TransitionDrillState {
  switch (action.type) {
    case "start":
      if (state.finished) return state;
      return { ...state, running: true };

    case "change":
      // Only count while the window is live.
      if (!state.running || state.finished) return state;
      return { ...state, cleanChanges: state.cleanChanges + 1 };

    case "tick": {
      if (!state.running || state.finished) return state;
      const elapsedSec = Math.min(state.windowSec, state.elapsedSec + (action.seconds ?? 1));
      const finished = elapsedSec >= state.windowSec;
      return { ...state, elapsedSec, finished, running: finished ? false : state.running };
    }

    case "stop":
      return { ...state, running: false, finished: true };

    case "reset":
      return initTransitionDrill(state.windowSec);

    default:
      return state;
  }
}

// ───────────────────────── scoring + fluency ─────────────────────────

/**
 * Clean changes per minute, scaled to a full minute when the window was shorter
 * (e.g. stopped early). A zero-or-negative elapsed window scores 0 (avoid a
 * divide-by-zero / a single change reading as "infinite/min"). Pure.
 */
export function changesPerMinute(cleanChanges: number, elapsedSec: number): number {
  if (elapsedSec <= 0) return 0;
  return Math.round((cleanChanges / elapsedSec) * 60);
}

/** True iff the run met the pair's per-minute target. `target` defaults to the
 *  standard 30/min. Pure. */
export function isPairFluent(perMinute: number, target = DEFAULT_TARGET_PER_MIN): boolean {
  return perMinute >= target;
}

/** Convenience: score a finished drill state for a pair, returning the per-minute
 *  rate and whether it cleared the pair's threshold. Pure. */
export function scoreTransition(
  state: TransitionDrillState,
  pair: Pick<TransitionPair, "targetPerMin">,
): { perMinute: number; fluent: boolean } {
  // Use the full window when it ran to completion; otherwise the elapsed time.
  const elapsed = state.finished && state.elapsedSec === 0 ? state.windowSec : state.elapsedSec;
  const perMinute = changesPerMinute(state.cleanChanges, elapsed || state.windowSec);
  return { perMinute, fluent: isPairFluent(perMinute, pair.targetPerMin) };
}
