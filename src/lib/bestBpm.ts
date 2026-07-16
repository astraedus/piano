// Best-tempo lookups — pure, testable. The app records the best BPM a scale,
// drill, or skill node has been played at (WarmupSlot's "I Played It", the
// rep-engine ladder, ChainDrillSlot), but until now never surfaced it anywhere
// browsable. These helpers read the EXISTING persisted signals so every surface
// can answer "at what tempo?" — and return `undefined` (never 0) when nothing has
// been recorded, so callers render nothing rather than a hollow "0 BPM".

import type { AppState, KeyId, SkillNode } from "./types";
import { drillRepId, scaleRepId } from "./types";

type SkillReps = AppState["skillReps"];
type ProgressMap = NonNullable<AppState["skillProgress"]>;

/** A positive number is a real recorded tempo; 0/undefined means "never played". */
function positive(n: number | undefined): number | undefined {
  return n != null && n > 0 ? n : undefined;
}

/** Best tempo ever recorded for a key's scale warmup (WarmupSlot bumps this via
 *  `scaleRepId(keyId)`), or undefined when the scale has no BPM logged. */
export function bestBpmForKey(keyId: KeyId, skillReps: SkillReps): number | undefined {
  return positive(skillReps?.[scaleRepId(keyId)]?.maxBpm);
}

/** Best tempo recorded for a specific chain drill's rep counter (ChainDrillSlot
 *  bumps `drillRepId(id)` with the rep-engine's bpmReached), or undefined. */
export function bestBpmForDrill(drillId: string, skillReps: SkillReps): number | undefined {
  return positive(skillReps?.[drillRepId(drillId)]?.maxBpm);
}

/**
 * The single best tempo a skill NODE has been played at, taking the max across
 * every place tempo is recorded for it:
 *   - the node's own rep-engine best (`skillProgress[id].bpmReached` / `.maxBpm`),
 *   - its linked key's scale warmup (per-key nodes carry `keyId`),
 *   - its linked chain drill's rep counter (`chainDrillId`).
 * Returns undefined when no tempo has ever been recorded for the node.
 */
export function bestBpmForNode(
  node: SkillNode,
  progress: ProgressMap | undefined,
  skillReps: SkillReps,
): number | undefined {
  const candidates: number[] = [];
  const p = progress?.[node.id];
  const nodeBpm = positive(p?.bpmReached);
  if (nodeBpm) candidates.push(nodeBpm);
  const nodeMax = positive(p?.maxBpm);
  if (nodeMax) candidates.push(nodeMax);
  if (node.keyId) {
    const k = bestBpmForKey(node.keyId, skillReps);
    if (k) candidates.push(k);
  }
  if (node.chainDrillId) {
    const d = bestBpmForDrill(node.chainDrillId, skillReps);
    if (d) candidates.push(d);
  }
  return candidates.length ? Math.max(...candidates) : undefined;
}
