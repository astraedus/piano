"use client";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import {
  initRepEngine,
  repEngineReducer,
  currentRep,
  isSkillSwitch,
  repProgress,
  ladderProgress,
  toSessionQuality,
  type RepEngineConfig,
} from "@/lib/repEngine";
import type { SessionQuality } from "@/lib/types";
import { Metronome } from "./Metronome";

/**
 * The interactive rep-engine. Consumes a resolved RepEngineConfig (built from the
 * day's plan) and drives the rep -> rest -> rep loop with BPM laddering, micro-rest
 * countdowns, interleave skill-switch cues, and per-rep success feedback. Reports
 * the accumulated SessionQuality up via onQualityChangeAction on every change, and
 * once more on completion, so the parent can fold it into the session log.
 *
 * Degrades gracefully: a config with no repBlocks/bpmLadder/interleave renders a
 * plain flat run of reps with no rest, no metronome ladder, no skill switch.
 */
export function RepEngine({
  config,
  noteText,
  onQualityChangeAction,
}: {
  config: RepEngineConfig;
  /** A short functional note shown once at the top (e.g. the interleave warning). */
  noteText?: string;
  onQualityChangeAction?: (quality: SessionQuality) => void;
}) {
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(repEngineReducer, config, initRepEngine);
  // Per-rep confirm flash key — bumps so the animation re-fires each success.
  const [confirmKey, setConfirmKey] = useState(0);

  // Report quality up whenever the accumulators change (cheap, derived).
  useEffect(() => {
    onQualityChangeAction?.(toSessionQuality(state));
  }, [state, onQualityChangeAction]);

  const mark = (success: boolean) => {
    if (success) setConfirmKey((k) => k + 1);
    dispatch({ type: "mark", success });
  };

  const ladder = ladderProgress(state);
  const { current, total } = repProgress(state);
  const rep = currentRep(state);
  const switching = isSkillSwitch(state);

  return (
    <div className="space-y-3 text-sm">
      {noteText && (
        <p className="text-xs text-[color:var(--ink-3)] italic leading-relaxed">{noteText}</p>
      )}

      {/* Current-skill + progress header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {config.interleaved && rep && (
            <div
              key={state.repIndex}
              className={clsx(
                "text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent-deep)]",
                switching && !reduce && "skill-switch",
              )}
            >
              Now: {rep.label}
            </div>
          )}
          <div className="text-[color:var(--ink-2)] tabular-nums">
            Rep {current} of {total}
          </div>
        </div>
        {state.config.bpmLadder && (
          <BpmDisplay
            bpm={state.bpm}
            target={state.config.bpmLadder.targetBpm}
            progress={ladder ?? 0}
            atTarget={state.atTargetBpm}
          />
        )}
      </div>

      {/* Metronome (R5) — starts at the ladder's current bpm rung */}
      {state.config.bpmLadder && (
        <MetronomeBridge
          bpm={state.bpm}
          onMetronomeOn={() => dispatch({ type: "setMetronome", on: true })}
        />
      )}

      {/* The action surface switches by phase: rest countdown / bump prompt / mark */}
      {state.phase === "done" ? (
        <DonePanel state={state} />
      ) : state.phase === "rest" ? (
        <RestPanel
          restSec={state.config.repBlocks?.restSec ?? 12}
          reduce={!!reduce}
          onDoneAction={() => dispatch({ type: "restDone" })}
        />
      ) : state.bpmBumpOffered && state.config.bpmLadder ? (
        <BumpPrompt
          nextBpm={Math.min(
            state.config.bpmLadder.targetBpm,
            state.bpm + (state.config.bpmLadder.step || 5),
          )}
          onAdvanceAction={() => dispatch({ type: "advanceBpm" })}
          onDeclineAction={() => dispatch({ type: "declineBpm" })}
        />
      ) : (
        <MarkPanel
          confirmKey={confirmKey}
          lastWasSuccess={state.lastWasSuccess}
          reduce={!!reduce}
          onMarkAction={mark}
        />
      )}
    </div>
  );
}

/** Current BPM + a thin ladder-progress bar (start -> target). */
function BpmDisplay({ bpm, target, progress, atTarget }: {
  bpm: number; target: number; progress: number; atTarget: boolean;
}) {
  return (
    <div className="shrink-0 text-right">
      <div className="tabular-nums text-[color:var(--ink)]">
        <span className="font-serif text-lg">{bpm}</span>{" "}
        <span className="text-xs text-[color:var(--ink-3)]">/ {target} BPM</span>
      </div>
      <div className="mt-1 h-1 w-24 rounded-full bg-[color:var(--bg-surface-3)] overflow-hidden ml-auto">
        <div
          className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      {atTarget && (
        <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--accent-deep)] mt-0.5">
          At target tempo
        </div>
      )}
    </div>
  );
}

/** Wires the existing Metronome to the engine. Re-keys on bpm so a ladder bump
 *  resets the metronome to the new tempo (R5). The Metronome has no run-state
 *  callback, so a pointer-down anywhere on it is treated as "metronome engaged"
 *  for the R8 quality bonus — a deliberate, conservative signal. */
function MetronomeBridge({ bpm, onMetronomeOn }: { bpm: number; onMetronomeOn: () => void }) {
  const noop = useCallback(() => { /* bpm is driven by the ladder, not the slider */ }, []);
  return (
    <div className="flex items-center gap-2" onPointerDownCapture={onMetronomeOn}>
      <Metronome key={bpm} defaultBpm={bpm} onBpmChangeAction={noop} />
    </div>
  );
}

/** The calm rest countdown (R2). Counts restSec -> 0, then auto-continues. */
function RestPanel({ restSec, reduce, onDoneAction }: {
  restSec: number; reduce: boolean; onDoneAction: () => void;
}) {
  const [left, setLeft] = useState(restSec);
  useEffect(() => {
    setLeft(restSec);
    const iv = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { clearInterval(iv); onDoneAction(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
    // restSec is stable per drill; onDoneAction is stable from dispatch.
  }, [restSec, onDoneAction]);

  return (
    <div className="rounded-lg border border-[color:var(--accent-soft)] bg-[color:var(--accent)]/5 px-4 py-5 text-center space-y-2">
      <div className="flex items-center justify-center gap-3">
        <span
          className={clsx(
            "inline-block h-3 w-3 rounded-full bg-[color:var(--accent)]",
            !reduce && "rest-pulse",
          )}
          aria-hidden
        />
        <span className="font-serif text-2xl tabular-nums text-[color:var(--ink)]">{left}s</span>
      </div>
      <p className="text-sm text-[color:var(--ink-2)] font-medium">Rest. This is when it sticks.</p>
      <p className="text-xs text-[color:var(--ink-3)]">
        The pause is the practice. Let the last reps settle.
      </p>
      <button
        type="button"
        onClick={onDoneAction}
        className="chip text-xs px-3 py-1 mt-1"
      >
        Skip rest
      </button>
    </div>
  );
}

/** The BPM-bump confirmation prompt (R5). */
function BumpPrompt({ nextBpm, onAdvanceAction, onDeclineAction }: {
  nextBpm: number; onAdvanceAction: () => void; onDeclineAction: () => void;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--accent-soft)] bg-[color:var(--accent)]/5 px-4 py-3 space-y-2">
      <p className="text-sm text-[color:var(--ink)] font-medium">
        Three clean in a row. Bump to {nextBpm} BPM?
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAdvanceAction}
          className="cta-pill text-xs font-semibold px-4 py-1.5"
        >
          Bump it up
        </button>
        <button
          type="button"
          onClick={onDeclineAction}
          className="chip text-xs px-3 py-1.5"
        >
          Stay here
        </button>
      </div>
    </div>
  );
}

/** The per-rep mark surface with instant success feedback (R8). */
function MarkPanel({ confirmKey, lastWasSuccess, reduce, onMarkAction }: {
  confirmKey: number;
  lastWasSuccess: boolean | null;
  reduce: boolean;
  onMarkAction: (success: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMarkAction(true)}
          className="cta-pill text-sm font-semibold px-5 py-2"
        >
          Clean rep
        </button>
        <button
          type="button"
          onClick={() => onMarkAction(false)}
          className="chip text-sm px-4 py-2"
        >
          Missed it
        </button>
        {/* Instant confirm (<2s) — keyed so it re-fires on each clean rep. */}
        {lastWasSuccess === true && (
          <span
            key={confirmKey}
            className={clsx(
              "text-[color:var(--accent-deep)] font-serif italic text-sm",
              !reduce && "rep-confirm",
            )}
            aria-live="polite"
          >
            Locked in.
          </span>
        )}
        {lastWasSuccess === false && (
          <span className="text-[color:var(--ink-3)] italic text-sm" aria-live="polite">
            No problem. Next rep.
          </span>
        )}
      </div>
      <p className="text-[11px] text-[color:var(--ink-3)]">
        Mark honestly. Accurate reps earn more and unlock the skill faster.
      </p>
    </div>
  );
}

/** Closing panel — a quick session-quality readout once all reps are done. */
function DonePanel({ state }: { state: ReturnType<typeof initRepEngine> }) {
  const rate = state.attempts > 0 ? Math.round((state.successes / state.attempts) * 100) : null;
  return (
    <div className="rounded-lg border border-[color:var(--rule)] px-4 py-3 space-y-1 card-rise">
      <p className="font-serif text-lg text-[color:var(--ink)]">Drill done.</p>
      <p className="text-sm text-[color:var(--ink-2)] tabular-nums">
        {state.successes} of {state.attempts} clean
        {rate != null && <span className="text-[color:var(--ink-3)]"> · {rate}%</span>}
        {state.bpmReached > 0 && (
          <span className="text-[color:var(--ink-3)]"> · reached {state.bpmReached} BPM</span>
        )}
      </p>
    </div>
  );
}
