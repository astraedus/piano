// Skill-tree DAG engine — pure, fully testable, zero side effects.
//
// The skill tree is a directed acyclic graph of SkillNodes connected by prereq
// edges. A node's *status* is derived from its prereqs + the persisted progress
// snapshot. This replaces the dead `requires`-but-never-checked system and the
// hand-coded `shouldUnlock` switch (see plan §2.1 / §2.2 B3).

import type { SkillNode, SkillNodeStatus, SkillProgress } from "./types";

type ProgressMap = Record<string, SkillProgress>;

/** True iff every prereq of `node` is in the `learned` state. Nodes with no
 *  prereqs are always considered to have their prereqs met. */
export function prereqsMet(node: SkillNode, progress: ProgressMap): boolean {
  return node.prereqs.every((pid) => progress[pid]?.status === "learned");
}

/**
 * Compute the live status of every node from prereqs + progress.
 *
 *   learned     → progress[id].status === "learned"
 *   in-progress → has reps (or persisted "in-progress") but not learned
 *   available   → ALL prereqs learned, not yet started
 *   locked      → some prereq not learned
 *
 * The returned map is keyed by node id and contains an entry for every node in
 * `nodes` (ids not present in `nodes` are ignored even if they appear in progress).
 */
export function resolveStatus(
  nodes: SkillNode[],
  progress: ProgressMap,
): Map<string, SkillNodeStatus> {
  const out = new Map<string, SkillNodeStatus>();
  for (const node of nodes) {
    out.set(node.id, statusOf(node, progress));
  }
  return out;
}

function statusOf(node: SkillNode, progress: ProgressMap): SkillNodeStatus {
  const p = progress[node.id];
  if (p?.status === "learned") return "learned";

  const met = prereqsMet(node, progress);
  // A node can only be in-progress if it's actually reachable. If a prereq is
  // not yet learned the node is locked regardless of stray reps (no phase-jump
  // exploit — see plan §2.2 B2).
  if (!met) return "locked";

  if (p && (p.status === "in-progress" || p.reps > 0)) return "in-progress";
  return "available";
}

/**
 * The learning frontier: nodes that are `available` (prereqs met, not yet
 * started), nearest to the learned core. Ordered by tier then title for stable,
 * shallow-first suggestions. Returns up to `limit` nodes.
 */
export function nextToLearn(
  nodes: SkillNode[],
  progress: ProgressMap,
  limit = 3,
): SkillNode[] {
  const status = resolveStatus(nodes, progress);
  return nodes
    .filter((n) => status.get(n.id) === "available")
    .sort((a, b) => a.tier - b.tier || a.title.localeCompare(b.title))
    .slice(0, Math.max(0, limit));
}

/**
 * Immutably update progress for a single node. Bumps reps, sets first-reached /
 * learned timestamps, and computes the persisted status. Pure — returns a new map.
 */
export function markNodeProgress(
  progress: ProgressMap,
  nodeId: string,
  opts: { learned?: boolean; reps?: number; maxBpm?: number; now?: string } = {},
): ProgressMap {
  const now = opts.now ?? new Date().toISOString();
  const prev = progress[nodeId];
  const repsDelta = opts.reps ?? 1;
  const reps = (prev?.reps ?? 0) + repsDelta;

  const learned = opts.learned ?? prev?.status === "learned";
  const status: SkillNodeStatus = learned
    ? "learned"
    : reps > 0
      ? "in-progress"
      : "available";

  const next: SkillProgress = {
    status,
    reps,
    maxBpm: opts.maxBpm != null
      ? Math.max(prev?.maxBpm ?? 0, opts.maxBpm)
      : prev?.maxBpm,
    firstReachedAt: prev?.firstReachedAt ?? now,
    learnedAt: learned ? (prev?.learnedAt ?? now) : prev?.learnedAt,
  };

  return { ...progress, [nodeId]: next };
}

/**
 * Detect cycles in the prereq graph. Returns true if the node set is a valid
 * DAG (no cycles, all prereq ids resolvable). Used as a test/dev guard so
 * malformed node data can't ship a graph that never unlocks.
 */
export function isAcyclic(nodes: SkillNode[]): boolean {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const state = new Map<string, 0 | 1 | 2>(); // 0=unvisited 1=in-stack 2=done

  const visit = (id: string): boolean => {
    const node = byId.get(id);
    if (!node) return true; // unknown prereq id can't form a cycle within `nodes`
    const s = state.get(id) ?? 0;
    if (s === 1) return false; // back-edge → cycle
    if (s === 2) return true;
    state.set(id, 1);
    for (const pid of node.prereqs) {
      if (!visit(pid)) return false;
    }
    state.set(id, 2);
    return true;
  };

  for (const node of nodes) {
    if (!visit(node.id)) return false;
  }
  return true;
}
