// Per-instrument current-piece resolution — pure, testable, no DOM.
//
// `state.currentPieceId` points at ONE piece across all instruments, but a piano
// piece must never surface while the active instrument is guitar (and vice-versa).
// Rather than tag every Piece with an instrument (and touch every creation site),
// we snapshot the current piece per instrument at the moment of a switch: leaving
// piano stashes piano's current piece, and arriving at guitar restores guitar's
// last piece (or none). AppShell's instrument switcher is the only in-app path
// that changes `state.instrument`, so reconciling there keeps the two in sync.

import type { Instrument, Piece } from "./types";

export interface PieceSwitchResult {
  /** The current piece id for the instrument being switched TO (undefined = none). */
  currentPieceId?: string;
  /** The updated per-instrument snapshot map to persist. */
  currentPieceByInstrument: Partial<Record<Instrument, string>>;
}

/**
 * Reconcile the current piece across an instrument switch.
 *
 * Snapshots the outgoing instrument's current piece into the map, then restores
 * the incoming instrument's last-known piece — validated against `pieces` so a
 * since-deleted id resolves to none rather than a dangling reference. Pure.
 */
export function reconcileCurrentPieceForSwitch(
  from: Instrument,
  to: Instrument,
  currentPieceId: string | undefined,
  map: Partial<Record<Instrument, string>> | undefined,
  pieces: Piece[],
): PieceSwitchResult {
  const next: Partial<Record<Instrument, string>> = { ...(map ?? {}) };
  if (currentPieceId) next[from] = currentPieceId;
  else delete next[from];

  let restored = next[to];
  if (restored && !pieces.some((p) => p.id === restored)) restored = undefined;

  return { currentPieceId: restored, currentPieceByInstrument: next };
}
