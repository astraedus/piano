// Current-lesson resolver — pure, fully testable, zero side effects.
//
// Answers "which skill-tree node is tonight's session actually on?" so the stand
// can show a map-level bridge to the tree. Two zoom levels, one answer:
//   - If the plan serves a chain drill, the session is literally drilling the
//     node whose `chainDrillId` matches that drill → that node IS the lesson.
//   - Otherwise (first-back / just-play / no drill) fall back to the frontier —
//     the one node the tree would tell you to learn next.
//   - Nothing available (everything learned, or no module registered) → null.
//
// The drill→node mapping mirrors chainDrillPicker.ts (first node whose
// chainDrillId matches). Kept a separate helper so both the stand and its test
// assert the exact same rule.

import type { ChainDrill, SkillNode, SkillProgress } from "./types";
import { nextToLearn } from "./skillTree";

type ProgressMap = Record<string, SkillProgress>;

/**
 * The skill node tonight's session maps to on the path, or null when there is
 * nothing to point at (all learned / no nodes). Pure.
 *
 * @param nodes      the active instrument's skill nodes
 * @param progress   the persisted skill-progress snapshot
 * @param chainDrill tonight's chain drill (null in first-back / just-play modes)
 */
export function currentLessonNode(
  nodes: SkillNode[],
  progress: ProgressMap,
  chainDrill: ChainDrill | null | undefined,
): SkillNode | null {
  if (chainDrill) {
    // The node this drill trains (first match, same rule as the drill picker).
    const drilled = nodes.find((n) => n.chainDrillId === chainDrill.id);
    if (drilled) return drilled;
  }
  // No drill, or the drill has no linked node → the learning frontier.
  return nextToLearn(nodes, progress, 1)[0] ?? null;
}
