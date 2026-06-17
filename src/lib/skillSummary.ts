// Skill-count derivations — pure, testable. Feeds the /tree header
// ("N of M skills learned") and PathView's per-tier completion bars.
//
// These read the *live* status (resolveStatus), not the raw persisted snapshot,
// so a node whose prereqs were un-learned does not falsely count as learned.

import type { SkillNode, SkillProgress } from "./types";
import { resolveStatus } from "./skillTree";

type ProgressMap = Record<string, SkillProgress>;

export interface SkillCount {
  learned: number;
  total: number;
}

/**
 * Count of `learned` nodes over all nodes for the active instrument's tree.
 * `total` is the node count; `learned` is how many resolve to status "learned".
 */
export function skillLearnedCount(
  nodes: SkillNode[],
  progress: ProgressMap,
): SkillCount {
  const status = resolveStatus(nodes, progress);
  let learned = 0;
  for (const node of nodes) {
    if (status.get(node.id) === "learned") learned++;
  }
  return { learned, total: nodes.length };
}

export interface TierCount extends SkillCount {
  tier: number;
}

/**
 * Per-tier learned/total counts, sorted ascending by tier. One entry per tier
 * that has at least one node. Used by PathView's per-tier completion bar.
 */
export function tierLearnedCounts(
  nodes: SkillNode[],
  progress: ProgressMap,
): TierCount[] {
  const status = resolveStatus(nodes, progress);
  const byTier = new Map<number, SkillCount>();
  for (const node of nodes) {
    const c = byTier.get(node.tier) ?? { learned: 0, total: 0 };
    c.total++;
    if (status.get(node.id) === "learned") c.learned++;
    byTier.set(node.tier, c);
  }
  return Array.from(byTier.entries())
    .sort(([a], [b]) => a - b)
    .map(([tier, c]) => ({ tier, ...c }));
}

/** Completion fraction in [0,1]; 0 when the group is empty (no divide-by-zero). */
export function completionFraction(count: SkillCount): number {
  if (count.total <= 0) return 0;
  return count.learned / count.total;
}
