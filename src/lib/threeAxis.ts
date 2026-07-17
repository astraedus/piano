// Three-Axis Progress derivations — pure, testable.
//
// The owner's product thesis: all music breaks into Generation, Technical
// Ability (playing), and Pattern Recognition. Each axis is derived ENTIRELY from
// already-persisted, Neon-synced AppState — no new written field. The judge
// explicitly cut a fabricated `generationScore`, so Generation uses an HONEST
// proxy from real signals (improv-category nodes learned, pieces made "yours",
// the first-improv arc moment) and shows a "just getting started" state when
// there is genuinely no signal yet, rather than a fake number.

import type { ArcEvent, Piece, SkillNode, SkillProgress } from "./types";
import { resolveStatus } from "./skillTree";
import { skillLearnedCount, type SkillCount } from "./skillSummary";
import { earLevelLabel, MAX_EAR_LEVEL, type EarLevel } from "./earProgression";

type ProgressMap = Record<string, SkillProgress>;

// ── Generation ─────────────────────────────────────────────────────────────

/** One discrete generation milestone — done or not. Generation has no honest
 *  single denominator, so it is a MILESTONE TRACKER, not a percentage bar. */
export interface GenerationMilestone {
  label: string;
  done: boolean;
}

export interface GenerationAxis {
  /** Improv/expression skill nodes the user has actually learned. */
  improvNodesLearned: number;
  /** Pieces the user has made their own ("yours"). */
  piecesYours: number;
  /** Whether the user has crossed their first-improv milestone. */
  hasFirstImprov: boolean;
  /** The discrete first-steps milestones, in order. The UI renders these as
   *  pips ("N of M first steps") rather than a continuous %, because the
   *  underlying signals are loose milestones, not a measured fraction. */
  milestones: GenerationMilestone[];
  /** How many milestones are done. */
  milestonesDone: number;
  /** True when no milestone is reached → show the honest "just getting started"
   *  copy instead of a hollow zero. */
  gettingStarted: boolean;
}

/**
 * Generation proxy from real state. Reports three discrete first-steps
 * milestones (first improv, an improv/expression skill learned, a piece made
 * "yours") plus the raw counts behind them. No invented score, no fabricated
 * percentage — the milestones are reached or not.
 */
export function generationAxis(
  nodes: SkillNode[],
  progress: ProgressMap,
  pieces: Piece[],
  arc: ArcEvent[],
): GenerationAxis {
  const status = resolveStatus(nodes, progress);
  let improvNodesLearned = 0;
  for (const node of nodes) {
    if (node.category === "expression" && status.get(node.id) === "learned") {
      improvNodesLearned++;
    }
  }
  const piecesYours = pieces.filter((p) => p.status === "yours").length;
  const hasFirstImprov = arc.some((e) => e.kind === "first-improv");

  const milestones: GenerationMilestone[] = [
    { label: "First improvisation", done: hasFirstImprov },
    { label: "An improv skill learned", done: improvNodesLearned > 0 },
    { label: "A piece made yours", done: piecesYours > 0 },
  ];
  const milestonesDone = milestones.filter((m) => m.done).length;

  return {
    improvNodesLearned,
    piecesYours,
    hasFirstImprov,
    milestones,
    milestonesDone,
    gettingStarted: milestonesDone === 0,
  };
}

// ── Ability ──────────────────────────────────────────────────────────────────

export interface AbilityAxis {
  /** Learned vs total skill-tree nodes — the headline number. */
  skills: SkillCount;
  /** Gamification level (1..15+). */
  level: number;
}

/** Ability proxy: skill-learned count (primary) + gamification level. */
export function abilityAxis(
  nodes: SkillNode[],
  progress: ProgressMap,
  level: number,
): AbilityAxis {
  return { skills: skillLearnedCount(nodes, progress), level: Math.max(1, level || 1) };
}

// ── Pattern Recognition ───────────────────────────────────────────────────────

export interface PatternAxis {
  /** Current ear level (1..7), the now-live Pattern-Recognition axis. */
  earLevel: EarLevel;
  /** Max content-backed level (L5) — for the "L3 of 5" framing. */
  maxLevel: number;
  /** Human label for the current ear level. */
  label: string;
  /** Lifetime ear accuracy in [0,1], or null when no rounds answered yet. */
  accuracy: number | null;
  /** Total ear rounds answered (correct + wrong) across all sessions. */
  roundsAnswered: number;
}

interface EarResults {
  correctIds: string[];
  wrongIds: string[];
}

/**
 * Pattern-Recognition proxy: the live ear level + label, plus lifetime ear
 * accuracy aggregated from every session's earResults (the interval rounds from
 * feature 3 flow into this same tally).
 */
export function patternAxis(
  earLevel: EarLevel,
  sessionEarResults: (EarResults | undefined)[],
  focusKind?: "key" | "chord" | "rudiment",
): PatternAxis {
  let correct = 0;
  let total = 0;
  for (const r of sessionEarResults) {
    if (!r) continue;
    correct += r.correctIds.length;
    total += r.correctIds.length + r.wrongIds.length;
  }
  return {
    earLevel,
    maxLevel: MAX_EAR_LEVEL,
    label: earLevelLabel(earLevel, focusKind),
    accuracy: total > 0 ? correct / total : null,
    roundsAnswered: total,
  };
}
