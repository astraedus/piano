"use client";
import { useEffect, useReducer } from "react";
import { clsx } from "clsx";
import { useReducedMotion } from "motion/react";
import {
  initTransitionDrill,
  transitionReducer,
  changesPerMinute,
  isPairFluent,
  type TransitionPair,
} from "@/lib/transitionDrill";

/**
 * The timed chord-transition drill (#2). Drill a chord PAIR for 60 seconds,
 * tapping once per CLEAN change; the count → changes/minute is the metric, and
 * hitting the pair's target (~30/min) is the fluency bar that gates the song.
 *
 * All scoring/clock logic is the pure reducer in lib/transitionDrill.ts; this is
 * the thin interactive shell (a 1Hz tick, the big "clean change" button, the
 * live count + per-minute readout, and an onComplete callback with the result).
 */
export function TransitionDrill({
  pair,
  bestChanges,
  onCompleteAction,
}: {
  pair: TransitionPair;
  /** The player's prior best clean-changes-per-minute for this pair, if any. */
  bestChanges?: number;
  /** Fired once when the window finishes (or is stopped), with the final score. */
  onCompleteAction?: (result: { perMinute: number; cleanChanges: number; fluent: boolean }) => void;
}) {
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(transitionReducer, undefined, () => initTransitionDrill());

  // 1Hz clock while running. The reducer clamps + auto-finishes at the window end.
  useEffect(() => {
    if (!state.running) return;
    const iv = setInterval(() => dispatch({ type: "tick", seconds: 1 }), 1000);
    return () => clearInterval(iv);
  }, [state.running]);

  // Report the final score exactly once, when the window finishes.
  useEffect(() => {
    if (!state.finished) return;
    const perMinute = changesPerMinute(state.cleanChanges, state.elapsedSec || state.windowSec);
    onCompleteAction?.({
      perMinute,
      cleanChanges: state.cleanChanges,
      fluent: isPairFluent(perMinute, pair.targetPerMin),
    });
    // Fire once on the finished transition; onCompleteAction is stable from caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.finished]);

  const remaining = Math.max(0, state.windowSec - state.elapsedSec);
  const livePerMin = state.elapsedSec > 0 ? changesPerMinute(state.cleanChanges, state.elapsedSec) : 0;
  const finalPerMin = changesPerMinute(state.cleanChanges, state.elapsedSec || state.windowSec);
  const cleared = isPairFluent(finalPerMin, pair.targetPerMin);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent-deep)]">
            {pair.chordA} ↔ {pair.chordB}
          </div>
          <div className="text-[color:var(--ink-2)] tabular-nums">
            {state.cleanChanges} clean change{state.cleanChanges === 1 ? "" : "s"}
            {state.elapsedSec > 0 && !state.finished && (
              <span className="text-[color:var(--ink-3)]"> · ~{livePerMin}/min</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="tabular-nums text-[color:var(--ink)]">
            <span className="font-serif text-lg">{remaining}</span>{" "}
            <span className="text-xs text-[color:var(--ink-3)]">s left</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--ink-3)] mt-0.5">
            target {pair.targetPerMin}/min
          </div>
        </div>
      </div>

      {state.finished ? (
        <div className="rounded-lg border border-[color:var(--rule)] px-4 py-3 space-y-1 card-rise">
          <p className="font-serif text-lg text-[color:var(--ink)]">
            {state.cleanChanges} changes · {finalPerMin}/min
          </p>
          <p className="text-sm text-[color:var(--ink-2)]">
            {cleared
              ? "Cleared the target. That change is in your hands now."
              : `Almost — aim for ${pair.targetPerMin}/min. The count going up is the progress.`}
          </p>
          {bestChanges != null && (
            <p className="text-xs text-[color:var(--ink-3)] italic">
              {finalPerMin > bestChanges ? `New best — beat ${bestChanges}/min.` : `Best so far: ${bestChanges}/min.`}
            </p>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="chip text-xs px-3 py-1 mt-1"
          >
            Go again
          </button>
        </div>
      ) : !state.running ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "start" })}
            className="cta-pill text-sm font-semibold px-5 py-2"
          >
            Start the minute
          </button>
          {bestChanges != null && (
            <p className="text-xs text-[color:var(--ink-3)] italic">Best so far: {bestChanges}/min. Beat it.</p>
          )}
          <p className="text-[11px] text-[color:var(--ink-3)]">
            Tap once per CLEAN change — both chords ringing, in time. Mark honestly.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "change" })}
            className={clsx(
              "cta-pill text-base font-semibold px-6 py-3 w-full",
              !reduce && "active:scale-[0.98] transition-transform",
            )}
          >
            Clean change ({state.cleanChanges})
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "stop" })}
            className="chip text-xs px-3 py-1"
          >
            Stop early
          </button>
        </div>
      )}
    </div>
  );
}
