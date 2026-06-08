import type { AppState, ChainDrill, SkillNode } from "./types";
import { ghostKeyFor } from "./ghostKey";
import { getModuleSync } from "./instrumentRegistry";
import { resolveStatus } from "./skillTree";

// Deterministic pick per (phase, ghost, dayOfYear) so the same day yields the same drill.
// Drills come from the active instrument's module (guarded — empty if unregistered).
export function pickChainDrill(state: AppState, date: Date): ChainDrill | null {
  const phase = state.phase;
  const ghost = ghostKeyFor(state, date);
  const drills = getModuleSync(state.instrument)?.chainDrills ?? [];
  const pool = drills.filter((d) => d.phase === phase);
  if (pool.length === 0) return null;

  // Soft-prefer drills matching ghost key; exclude last 5.
  const recent = new Set(state.recentDrillIds ?? []);
  const preferred = pool.filter((d) => d.ghostKey === ghost && !recent.has(d.id));
  const fallback = pool.filter((d) => !recent.has(d.id));
  const choices = preferred.length > 0 ? preferred : (fallback.length > 0 ? fallback : pool);

  // Phase-stable seed (B6): folding `phase` into the seed shifts the index space
  // per phase, so advancing phase mid-year doesn't land on a recently-played
  // drill purely because dayOfYear % poolSize collides. Still deterministic
  // within a (phase, day) pair.
  const seed = dayOfYear(date) + phase * 31;
  const idx = seed % choices.length;
  return choices[idx];
}

function dayOfYear(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
}

// ─────────────────────── R4: interleaved rep sequence ───────────────────────
//
// Contextual interference: once 2-3 skills are past the early COGNITIVE stage,
// alternate reps between them (A,B,A,B,...) instead of blocking all reps of one
// skill. Brand-new skills (cognitive stage = `available`, never started) are
// EXCLUDED — interleaving a not-yet-established skill just adds confusion.

export interface InterleavePlan {
  /** The drills woven together, in interleave order. */
  drills: ChainDrill[];
  /** The executable rep sequence of drill ids, e.g. [A,B,A,B,A,B]. */
  repSequence: string[];
}

/** Reps per skill in an interleaved block (the round count). */
export const INTERLEAVE_REPS_PER_SKILL = 3;
/** Max distinct skills woven into one interleave block (R4 says 2-3). */
export const INTERLEAVE_MAX_SKILLS = 3;

/**
 * Build an interleaved rep sequence for the session, or null if there aren't at
 * least 2 eligible interleavable drills. A drill is eligible when it is
 * `interleavable` AND its linked skill node is past the early stage
 * (learned or in-progress — NOT brand-new `available`/`locked`). Pure.
 *
 * The `primary` drill (the deterministic pick for the day) is always first in
 * the weave when it qualifies, so the session still centers on the day's focus.
 */
export function buildInterleavePlan(
  state: AppState,
  date: Date,
  primary: ChainDrill | null,
): InterleavePlan | null {
  const phase = state.phase;
  const drills = getModuleSync(state.instrument)?.chainDrills ?? [];
  const nodes = getModuleSync(state.instrument)?.skillNodes ?? [];
  const status = resolveStatus(nodes, state.skillProgress ?? {});

  // Map drillId → its linked skill node (first match), to read its stage.
  const nodeByDrill = new Map<string, SkillNode>();
  for (const n of nodes) {
    if (n.chainDrillId && !nodeByDrill.has(n.chainDrillId)) nodeByDrill.set(n.chainDrillId, n);
  }

  const pastEarlyStage = (d: ChainDrill): boolean => {
    const node = nodeByDrill.get(d.id);
    if (!node) return false; // no linked node → can't confirm it's established
    const s = status.get(node.id);
    return s === "learned" || s === "in-progress";
  };

  const eligible = drills.filter(
    (d) => d.phase === phase && d.interleavable && pastEarlyStage(d),
  );
  if (eligible.length < 2) return null;

  // Order: primary first (if eligible), then by id for stability.
  const ordered = eligible
    .slice()
    .sort((a, b) => {
      if (primary) {
        if (a.id === primary.id) return -1;
        if (b.id === primary.id) return 1;
      }
      return a.id.localeCompare(b.id);
    })
    .slice(0, INTERLEAVE_MAX_SKILLS);

  if (ordered.length < 2) return null;

  // Weave: rep1 of each, rep2 of each, ... (round-robin).
  const repSequence: string[] = [];
  for (let r = 0; r < INTERLEAVE_REPS_PER_SKILL; r++) {
    for (const d of ordered) repSequence.push(d.id);
  }

  return { drills: ordered, repSequence };
}
