// V4 Stand — resume-on-reload pure logic.
//
// The UX audit found that the chain-drill rep engine RESETS to "Rep 1" on reload
// even though the per-rep `skillReps` counter persists. The fix is to persist the
// engine's in-flight session state (which rep, how many clean, current BPM, ...)
// and rehydrate it on mount. This module owns the PURE part of that — derivation,
// (de)serialization, day-scoping, and the "which slot is NOW" computation — so it
// is fully unit-testable with zero React and zero DOM.
//
// Persistence is day-scoped: a saved session belongs to the calendar day it was
// started on (via localDateKey). A new day discards yesterday's in-flight state
// so a returning user starts a fresh session, not a stale half-finished one.

import type { RepEngineState } from "@/lib/repEngine";
import { initRepEngine } from "@/lib/repEngine";

// The subset of RepEngineState that is worth persisting. `config` is rebuilt from
// the day's plan on every load (it can change), so we never persist it — we only
// persist the user's PROGRESS through whatever config exists, and clamp it to the
// fresh config on rehydrate. This keeps the saved blob small and forward-safe.
export interface RepSessionSnapshot {
  /** Calendar day the session belongs to (localDateKey). Stale days are dropped. */
  dayKey: string;
  repIndex: number;
  phase: RepEngineState["phase"];
  bpm: number;
  consecutiveAtBpm: number;
  repsSinceRest: number;
  bpmBumpOffered: boolean;
  lastWasSuccess: boolean | null;
  atTargetBpm: boolean;
  attempts: number;
  successes: number;
  bpmReached: number;
  metronomeOn: boolean;
}

/** localStorage key for a drill's in-flight rep session. Namespaced + drill-keyed
 *  so each drill resumes independently. */
export function repSessionKey(drillRepKey: string): string {
  return `practice.repSession.${drillRepKey}`;
}

/** Extract the persistable snapshot from a live engine state. Pure. */
export function snapshotFromState(state: RepEngineState, dayKey: string): RepSessionSnapshot {
  return {
    dayKey,
    repIndex: state.repIndex,
    phase: state.phase,
    bpm: state.bpm,
    consecutiveAtBpm: state.consecutiveAtBpm,
    repsSinceRest: state.repsSinceRest,
    bpmBumpOffered: state.bpmBumpOffered,
    lastWasSuccess: state.lastWasSuccess,
    atTargetBpm: state.atTargetBpm,
    attempts: state.attempts,
    successes: state.successes,
    bpmReached: state.bpmReached,
    metronomeOn: state.metronomeOn,
  };
}

/**
 * Rehydrate a full RepEngineState from a fresh config + a saved snapshot. The
 * config is the source of truth for the rep list / ladder; the snapshot only
 * restores the user's PLACE in it. We clamp repIndex into the current config so a
 * shorter config (e.g. a different plan) can never produce an out-of-range index,
 * and resolve phase: a saved "rep" past the end becomes "done".
 *
 * Returns the fresh init state UNCHANGED when:
 *   - there is no snapshot, or
 *   - the snapshot is from a different day (stale), or
 *   - the snapshot shows zero progress (nothing worth resuming).
 */
export function rehydrateRepState(
  config: RepEngineState["config"],
  snapshot: RepSessionSnapshot | null,
  todayKey: string,
): RepEngineState {
  const fresh = initRepEngine(config);
  if (!snapshot) return fresh;
  if (snapshot.dayKey !== todayKey) return fresh;
  if (snapshot.attempts <= 0 && snapshot.repIndex <= 0) return fresh;

  const lastIndex = Math.max(0, config.reps.length - 1);
  const repIndex = Math.min(Math.max(0, snapshot.repIndex), lastIndex);
  // A rest snapshot can only resume as "rep" (the countdown is UI-only and is
  // safe to skip on reload); a snapshot at/past the end resolves to "done".
  const finished = snapshot.phase === "done" || snapshot.repIndex >= config.reps.length;
  const phase: RepEngineState["phase"] = finished
    ? "done"
    : snapshot.phase === "rest"
      ? "rep"
      : snapshot.phase;

  return {
    ...fresh,
    repIndex,
    phase,
    bpm: snapshot.bpm,
    consecutiveAtBpm: snapshot.consecutiveAtBpm,
    repsSinceRest: snapshot.repsSinceRest,
    // A pending bump offer is a transient decision surface; clear it on reload so
    // the user lands on the plain mark surface rather than a dangling prompt.
    bpmBumpOffered: false,
    lastWasSuccess: snapshot.lastWasSuccess,
    atTargetBpm: snapshot.atTargetBpm,
    attempts: snapshot.attempts,
    successes: snapshot.successes,
    bpmReached: snapshot.bpmReached,
    metronomeOn: snapshot.metronomeOn,
  };
}

/** True when a snapshot represents resumable, today, in-flight (not finished)
 *  work — the signal for showing a "Resume: …, rep N" affordance. */
export function hasResumableWork(snapshot: RepSessionSnapshot | null, todayKey: string): boolean {
  if (!snapshot) return false;
  if (snapshot.dayKey !== todayKey) return false;
  if (snapshot.phase === "done") return false;
  return snapshot.attempts > 0 || snapshot.repIndex > 0;
}

// ───────────────────────── NOW-slot derivation ─────────────────────────

// The five stand slots, in fixed order. The NOW slot is the first one not done.
export type SlotKey = "warmup" | "piece" | "chain" | "ear" | "free";
export const SLOT_ORDER: SlotKey[] = ["warmup", "piece", "chain", "ear", "free"];

/**
 * Given which slots are done, return the slot the user should "start here" with —
 * the first slot in order that is NOT done. When every slot is done, returns the
 * last slot (Free Play) so the marker has a sensible home. Pure.
 */
export function currentSlot(done: Partial<Record<SlotKey, boolean>>): SlotKey {
  for (const slot of SLOT_ORDER) {
    if (!done[slot]) return slot;
  }
  return SLOT_ORDER[SLOT_ORDER.length - 1];
}

/** Where tonight sits in the plan: the NOW slot plus its 1-based position among
 *  the slots actually PRESENT tonight. `present` is the ordered subset of
 *  SLOT_ORDER shown this session (e.g. first-back drops chain + ear). NOW is the
 *  first present slot not yet done; when all are done it is the last present slot,
 *  so the "Block N of M" cue never points past the end. Pure. */
export interface SlotProgress {
  now: SlotKey;
  index: number; // 1-based position of `now` among present slots
  total: number; // count of present slots
}
export function slotProgress(
  present: SlotKey[],
  done: Partial<Record<SlotKey, boolean>>,
): SlotProgress {
  const ordered = SLOT_ORDER.filter((s) => present.includes(s));
  const total = ordered.length || 1;
  let now: SlotKey = ordered[ordered.length - 1] ?? SLOT_ORDER[SLOT_ORDER.length - 1];
  for (const slot of ordered) {
    if (!done[slot]) { now = slot; break; }
  }
  const index = Math.max(0, ordered.indexOf(now)) + 1;
  return { now, index, total };
}
