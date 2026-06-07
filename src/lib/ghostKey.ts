import type { AppState, KeyId, Phase } from "./types";
import { getModuleSync } from "./instrumentRegistry";

// Resolve the active instrument's ghost-key rotation from the registry. The
// rotation moved into the per-instrument module (piano's lives in lib/piano/
// trinity.ts); the shared spine reads it through the module seam so it never
// deep-imports an instrument plugin. Empty fallback keeps this pure/safe if the
// module hasn't registered yet (callers already guard the empty-rotation case).
function ghostRotationFor(state: AppState): Record<Phase, KeyId[]> {
  return getModuleSync(state.instrument)?.ghostRotation ?? ({} as Record<Phase, KeyId[]>);
}

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
  const rotations = ghostRotationFor(state);
  const rotation = rotations[state.phase] ?? rotations[1] ?? [];
  if (rotation.length === 0) return "C"; // module not registered yet — safe default
  const idx = ((weeksSinceEpoch(date) % rotation.length) + rotation.length) % rotation.length;
  return rotation[idx];
}

export function setGhostOverride(state: AppState, key: KeyId, date: Date): AppState {
  return { ...state, ghostOverride: { key, weekId: weekIdOf(date) } };
}
