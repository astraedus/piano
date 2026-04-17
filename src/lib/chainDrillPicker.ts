import type { AppState, ChainDrill } from "./types";
import { CHAIN_DRILLS } from "./chainDrills";
import { ghostKeyFor } from "./ghostKey";

// Deterministic pick per (phase, ghost, dayOfYear) so the same day yields the same drill.
export function pickChainDrill(state: AppState, date: Date): ChainDrill | null {
  const phase = state.phase;
  const ghost = ghostKeyFor(state, date);
  const pool = CHAIN_DRILLS.filter((d) => d.phase === phase);
  if (pool.length === 0) return null;

  // Soft-prefer drills matching ghost key; exclude last 5.
  const recent = new Set(state.recentDrillIds ?? []);
  const preferred = pool.filter((d) => d.ghostKey === ghost && !recent.has(d.id));
  const fallback = pool.filter((d) => !recent.has(d.id));
  const choices = preferred.length > 0 ? preferred : (fallback.length > 0 ? fallback : pool);

  const seed = dayOfYear(date);
  const idx = seed % choices.length;
  return choices[idx];
}

function dayOfYear(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
}
