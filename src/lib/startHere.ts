// Start-Here (Welcome) card visibility — pure, testable, no DOM.
//
// The stand shows a single "Welcome. Start here." card to brand-new learners who
// have not yet oriented on the instrument. It is one of several "what do I do
// now?" signals, so it must be honest about when it belongs: only before the
// first session, and only while setup is unlearned. Once the learner has logged
// a session OR learned every tier-0 setup node, the card never shows again.
//
// PracticeStand imports THIS function (not a re-implementation) so the test and
// the app assert the exact same predicate — see startHere.test.ts.

import type { SkillNode, SkillProgress } from "./types";
import { resolveStatus } from "./skillTree";

/**
 * Whether the Welcome / Start-Here card should show for the active instrument.
 *
 * Shows only when BOTH hold:
 *  - no session has been logged yet (`sessionCount === 0`), and
 *  - at least one tier-0 `setup` node is not yet learned.
 *
 * Returns false once any session is logged OR all setup nodes are learned — so a
 * returning or oriented learner is never nagged. With no setup nodes (instrument
 * not loaded) it returns false: we can't guide, so we don't falsely prompt.
 */
export function shouldShowStartHere(
  allNodes: SkillNode[],
  progress: Record<string, SkillProgress>,
  sessionCount: number,
): boolean {
  if (sessionCount > 0) return false; // any logged session → learner is oriented
  const setupNodes = allNodes.filter((n) => n.tier === 0 && n.category === "setup");
  if (setupNodes.length === 0) return false;
  const status = resolveStatus(allNodes, progress);
  return setupNodes.some((n) => status.get(n.id) !== "learned");
}
