// "What You Know" summary — pure, testable assembly of EXISTING state into one
// browsable picture of everything a learner has built for the active instrument.
// Read-only: it derives from skillProgress / skillReps / keyDepths / earLevel /
// sessions / pieces and invents nothing. This is the single place that answers
// "which skills have I done, at what tempo, and where am I?" — the app's whole
// stated purpose, previously scattered across five tabs and never summarized.

import type { KeyDepth, KeyId, Piece, SkillNode, SkillProgress } from "./types";
import { DEPTH_NAMES } from "./types";
import { resolveStatus } from "./skillTree";
import { skillLearnedCount, type SkillCount } from "./skillSummary";
import { bestBpmForKey, bestBpmForNode } from "./bestBpm";
import { patternAxis, type PatternAxis } from "./threeAxis";
import { KEY_META } from "./music";
import type { EarLevel } from "./earProgression";

type ProgressMap = Record<string, SkillProgress>;
type SkillReps = Record<string, { count: number; maxBpm?: number; lastAt?: string }> | undefined;

/** One learned skill, ready to display with its recorded best tempo. */
export interface KnownSkill {
  id: string;
  /** Plain-language name (theory name, not the soul label). */
  title: string;
  bestBpm?: number;
}

/** Learned skills grouped by tier (only tiers with at least one learned skill). */
export interface KnownSkillTier {
  tier: number;
  skills: KnownSkill[];
}

/** A key that has been charted (depth >= 1), with its depth + best scale tempo. */
export interface ChartedKey {
  keyId: KeyId;
  name: string;
  depth: KeyDepth;
  depthName: string;
  bestBpm?: number;
}

export interface WhatYouKnowSummary {
  /** Learned-skill count vs total nodes for this instrument. */
  skills: SkillCount;
  /** Learned skills grouped by tier, tiers ascending, skills by title. */
  learnedByTier: KnownSkillTier[];
  /** Keys charted (depth >= 1), deepest first then by name. */
  keys: ChartedKey[];
  /** Ear level + lifetime accuracy (the Pattern-Recognition axis). */
  ear: PatternAxis;
  /** Pieces on the shelf, oldest first. */
  pieces: Piece[];
  /** True when the learner has genuinely built nothing yet (honest empty state). */
  empty: boolean;
}

interface WhatYouKnowInput {
  nodes: SkillNode[];
  progress: ProgressMap;
  skillReps: SkillReps;
  keyDepths: Partial<Record<KeyId, KeyDepth>>;
  earLevel: EarLevel;
  sessions: { earResults?: { correctIds: string[]; wrongIds: string[] } }[];
  pieces: Piece[];
}

/** Plain, tappable-friendly name for a node (theory name, never the soul label). */
function plainTitle(node: SkillNode): string {
  return node.keepTitle ?? node.title;
}

/**
 * Assemble the read-only "What You Know" summary from persisted state. Pure —
 * no I/O, no React. Every field is derived from an already-recorded signal.
 */
export function buildWhatYouKnow(input: WhatYouKnowInput): WhatYouKnowSummary {
  const { nodes, progress, skillReps, keyDepths, earLevel, sessions, pieces } = input;

  const status = resolveStatus(nodes, progress);
  const skills = skillLearnedCount(nodes, progress);

  // Learned skills grouped by tier.
  const byTier = new Map<number, KnownSkill[]>();
  for (const node of nodes) {
    if (status.get(node.id) !== "learned") continue;
    const skill: KnownSkill = {
      id: node.id,
      title: plainTitle(node),
      bestBpm: bestBpmForNode(node, progress, skillReps),
    };
    const bucket = byTier.get(node.tier) ?? [];
    bucket.push(skill);
    byTier.set(node.tier, bucket);
  }
  const learnedByTier: KnownSkillTier[] = Array.from(byTier.entries())
    .sort(([a], [b]) => a - b)
    .map(([tier, skillsInTier]) => ({
      tier,
      skills: skillsInTier.sort((a, b) => a.title.localeCompare(b.title)),
    }));

  // Keys charted: depth >= 1, deepest first then by display name.
  const keys: ChartedKey[] = (Object.keys(keyDepths) as KeyId[])
    .map((keyId) => ({ keyId, depth: (keyDepths[keyId] ?? 0) as KeyDepth }))
    .filter((k) => k.depth >= 1)
    .map(({ keyId, depth }) => ({
      keyId,
      name: KEY_META[keyId]?.name ?? keyId,
      depth,
      depthName: DEPTH_NAMES[depth],
      bestBpm: bestBpmForKey(keyId, skillReps),
    }))
    .sort((a, b) => b.depth - a.depth || a.name.localeCompare(b.name));

  const ear = patternAxis(earLevel, sessions.map((s) => s.earResults));

  const sortedPieces = [...pieces].sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const empty =
    skills.learned === 0 &&
    keys.length === 0 &&
    sortedPieces.length === 0 &&
    ear.roundsAnswered === 0;

  return { skills, learnedByTier, keys, ear, pieces: sortedPieces, empty };
}
