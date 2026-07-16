// Per-instrument current-piece resolution — pure, testable, no DOM.
//
// `state.currentPieceId` points at ONE piece across all instruments, but a piano
// piece must never surface while the active instrument is guitar (and vice-versa).
// Rather than tag every Piece with an instrument (and touch every creation site),
// we snapshot the current piece per instrument at the moment of a switch: leaving
// piano stashes piano's current piece, and arriving at guitar restores guitar's
// last piece (or none). Every in-app instrument switch (the header dropdown AND
// the Settings toggle) MUST go through `instrumentSwitchPatch` below so the two
// stay in sync — a bare `patch({ instrument })` leaks the other instrument's
// current piece onto the stand.

import type { AppState, Instrument, Piece } from "./types";

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

/**
 * Build the complete state patch for an instrument switch.
 *
 * The single source of truth for what a switch must write: the new `instrument`
 * PLUS the reconciled current-piece fields. Both switch sites (the header
 * dropdown and the Settings toggle) call this and `patch(...)` the result, so
 * neither can drift back to a bare `patch({ instrument })` that would leave the
 * other instrument's piece on the stand. Pure — reads only the fields it needs.
 */
export function instrumentSwitchPatch(
  to: Instrument,
  state: Pick<AppState, "instrument" | "currentPieceId" | "currentPieceByInstrument" | "pieces">,
): { instrument: Instrument } & PieceSwitchResult {
  const { currentPieceId, currentPieceByInstrument } = reconcileCurrentPieceForSwitch(
    state.instrument,
    to,
    state.currentPieceId,
    state.currentPieceByInstrument,
    state.pieces ?? [],
  );
  return { instrument: to, currentPieceId, currentPieceByInstrument };
}
