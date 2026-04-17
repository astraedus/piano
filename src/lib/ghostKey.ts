import type { AppState, KeyId } from "./types";
import { GHOST_ROTATION_PER_PHASE } from "./trinity";

// UTC Monday-start week id (ISO-ish)
export function weekIdOf(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // ISO week: Thursday of this week
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const WEEK_MS = 7 * 24 * 3600 * 1000;
// Fixed reference: Mon 2000-01-03 UTC = first "week 0" for rotation indexing.
const EPOCH_UTC = Date.UTC(2000, 0, 3); // Monday

export function weeksSinceEpoch(date: Date): number {
  const d = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((d - EPOCH_UTC) / WEEK_MS);
}

export function ghostKeyFor(state: AppState, date: Date): KeyId {
  const thisWeek = weekIdOf(date);
  if (state.ghostOverride && state.ghostOverride.weekId === thisWeek) {
    return state.ghostOverride.key;
  }
  const rotation = GHOST_ROTATION_PER_PHASE[state.phase] ?? GHOST_ROTATION_PER_PHASE[1];
  const idx = ((weeksSinceEpoch(date) % rotation.length) + rotation.length) % rotation.length;
  return rotation[idx];
}

export function setGhostOverride(state: AppState, key: KeyId, date: Date): AppState {
  return { ...state, ghostOverride: { key, weekId: weekIdOf(date) } };
}
