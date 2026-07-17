// RudimentLadder view model — pure, testable. The drums progress map ("Ladder"
// tab on /tree) has to read as an honest map at 18 nodes: what you've learned and
// at what tempo, grouped by tier, with the ONE next thing to learn clearly marked.
// The component (RudimentLadder.tsx) is a thin render over this — the ordering,
// grouping, best-BPM, and next-to-learn logic all live here so they can be unit-
// tested without a DOM.

import type { AppState, SkillNode, SkillNodeStatus } from "./types";
import { resolveStatus, nextToLearn } from "./skillTree";
import { bestBpmForNode } from "./bestBpm";

type ProgressMap = NonNullable<AppState["skillProgress"]>;
type SkillReps = AppState["skillReps"];

export interface RudimentRung {
  node: SkillNode;
  status: SkillNodeStatus;
  /** Best tempo recorded for the node, shown only when learned/in-progress. */
  bpm?: number;
  /** True for the single next-to-learn frontier node (the "do this next" nudge). */
  isNext: boolean;
}

export interface RudimentTierGroup {
  tier: number;
  rungs: RudimentRung[];
}

export interface RudimentLadderView {
  /** Tier groups in tier order; each group's rungs keep original authoring order. */
  groups: RudimentTierGroup[];
  learnedCount: number;
  total: number;
  /** The id of the ONE node the learner should tackle next, or null if none/all. */
  nextNodeId: string | null;
}

/**
 * Build the drums rudiment-ladder view: tier-grouped rungs with per-node status +
 * best BPM, and the single next-to-learn node flagged. Pure over its inputs.
 */
export function buildRudimentLadder(
  nodes: SkillNode[],
  progress: ProgressMap,
  skillReps: SkillReps,
): RudimentLadderView {
  const status = resolveStatus(nodes, progress);
  const nextNodeId = nextToLearn(nodes, progress, 1)[0]?.id ?? null;

  let learnedCount = 0;
  const byTier = new Map<number, RudimentRung[]>();
  for (const node of nodes) {
    const st = status.get(node.id) ?? "locked";
    if (st === "learned") learnedCount++;
    const bpm = bestBpmForNode(node, progress, skillReps);
    const showBpm = bpm != null && (st === "learned" || st === "in-progress");
    const rung: RudimentRung = {
      node,
      status: st,
      bpm: showBpm ? bpm : undefined,
      isNext: node.id === nextNodeId,
    };
    const bucket = byTier.get(node.tier);
    if (bucket) bucket.push(rung);
    else byTier.set(node.tier, [rung]);
  }

  const groups: RudimentTierGroup[] = [...byTier.keys()]
    .sort((a, b) => a - b)
    .map((tier) => ({ tier, rungs: byTier.get(tier)! }));

  return { groups, learnedCount, total: nodes.length, nextNodeId };
}
