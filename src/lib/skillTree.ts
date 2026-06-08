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
  opts: {
    learned?: boolean;
    reps?: number;
    maxBpm?: number;
    now?: string;
    // R3/R5 quality accumulators (added when the rep-engine reports them).
    attempts?: number;
    successes?: number;
    bpmReached?: number;
  } = {},
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

  // Accumulate quality signals when supplied; otherwise carry the prior values.
  const attempts = opts.attempts != null
    ? (prev?.attempts ?? 0) + Math.max(0, opts.attempts)
    : prev?.attempts;
  const successes = opts.successes != null
    ? (prev?.successes ?? 0) + Math.max(0, opts.successes)
    : prev?.successes;
  const bpmReached = opts.bpmReached != null
    ? Math.max(prev?.bpmReached ?? 0, opts.bpmReached)
    : prev?.bpmReached;

  const next: SkillProgress = {
    status,
    reps,
    maxBpm: opts.maxBpm != null
      ? Math.max(prev?.maxBpm ?? 0, opts.maxBpm)
      : prev?.maxBpm,
    firstReachedAt: prev?.firstReachedAt ?? now,
    learnedAt: learned ? (prev?.learnedAt ?? now) : prev?.learnedAt,
    attempts,
    successes,
    bpmReached,
    // Preserve fluency (set via markNodeFluent, a separate dimension).
    fluent: prev?.fluent,
    fluentAt: prev?.fluentAt,
  };

  return { ...progress, [nodeId]: next };
}

// ─────────────────────── R3: success-rate signals ───────────────────────
//
// A node should only be considered solidly learned when recent practice clears
// it most of the time, not merely "the drill was played." successRate() turns
// the persisted attempts/successes into a 0..1 fraction; difficultyVerdict()
// buckets it for the self-assessment UI (P3).

/** Minimum success rate to count a node as solidly learned (R3 ~70%). */
export const LEARN_SUCCESS_THRESHOLD = 0.7;
/** Above this, the drill is too easy (R3 ~85%). */
export const TOO_EASY_THRESHOLD = 0.85;
/** Below this, the drill is too hard (R3 ~55%). */
export const TOO_HARD_THRESHOLD = 0.55;
/** Minimum attempts before a verdict/threshold is meaningful (avoid 1/1 = 100%). */
export const MIN_ATTEMPTS_FOR_VERDICT = 3;

export type DifficultyVerdict = "too-easy" | "just-right" | "too-hard" | "unknown";

/** Success rate (0..1) from a progress snapshot, or null if no attempts logged. */
export function successRate(progress: SkillProgress | undefined): number | null {
  const attempts = progress?.attempts ?? 0;
  if (attempts <= 0) return null;
  const successes = Math.max(0, Math.min(attempts, progress?.successes ?? 0));
  return successes / attempts;
}

/** Bucket the success rate for the self-assessment UI (R3). `unknown` until
 *  there are enough attempts to judge. */
export function difficultyVerdict(progress: SkillProgress | undefined): DifficultyVerdict {
  const attempts = progress?.attempts ?? 0;
  const rate = successRate(progress);
  if (rate === null || attempts < MIN_ATTEMPTS_FOR_VERDICT) return "unknown";
  if (rate > TOO_EASY_THRESHOLD) return "too-easy";
  if (rate < TOO_HARD_THRESHOLD) return "too-hard";
  return "just-right";
}

/** True iff recent success rate is solidly high enough to count as learned (R3).
 *  When no quality data is recorded at all we DON'T block (back-compat: callers
 *  that never report attempts behave as before). When data IS present it gates. */
export function meetsLearnSuccessRate(progress: SkillProgress | undefined): boolean {
  const rate = successRate(progress);
  if (rate === null) return true; // no quality data → don't gate (legacy callers)
  if ((progress?.attempts ?? 0) < MIN_ATTEMPTS_FOR_VERDICT) return false;
  return rate >= LEARN_SUCCESS_THRESHOLD;
}

// ─────────────────────── R10: fluency milestone ───────────────────────
//
// A SECOND dimension beyond `learned` (autonomous stage). It does NOT change a
// node's DAG status — resolveStatus/nextToLearn are untouched — it just records
// that the node's fluencyTest was passed.

/** Mark a node `fluent` (R10). Idempotent on the timestamp. Only meaningful for
 *  already-learned nodes, but the caller (UI action) owns that policy. Pure. */
export function markNodeFluent(
  progress: ProgressMap,
  nodeId: string,
  now: string = new Date().toISOString(),
): ProgressMap {
  const prev = progress[nodeId];
  return {
    ...progress,
    [nodeId]: {
      ...(prev ?? { status: "available", reps: 0 }),
      fluent: true,
      fluentAt: prev?.fluentAt ?? now,
    },
  };
}

/** True iff the node has passed its fluency test (R10). */
export function isFluent(progress: SkillProgress | undefined): boolean {
  return progress?.fluent === true;
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
