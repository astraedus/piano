// Soul-First Learning (V4) — path visibility + term-link helpers.
//
// Pure logic, no DOM. P-C consumes these to filter/dim tree nodes by the user's
// chosen intent (Just Play / Play With Soul / Go Deep) and to wire TermChips to
// glossary entries from a ghost key or a skill-node id.

import type { AppState, KeyId, PathTag, SkillNode } from "./types";

export type LearningPath = NonNullable<AppState["learningPath"]>;

/**
 * Whether a node should render at all under the given path + theory setting.
 * - theory nodes hide unless theory is enabled
 * - no path (undefined) shows everything (back-compat for existing users)
 * - untagged nodes show on every path
 */
export function nodeIsVisible(
  node: SkillNode,
  path: LearningPath | undefined,
  theoryEnabled: boolean,
): boolean {
  if (node.theory && !theoryEnabled) return false;
  if (!path) return true; // no path = show everything
  return node.pathTags?.includes(path) ?? true; // untagged nodes show everywhere
}

export type PathTreatment = "on-path" | "off-path" | "theory-hidden";

/**
 * The render treatment for a node: filtered out (theory-hidden), dimmed
 * (off-path), or shown normally (on-path). P-C maps these to filter/opacity.
 * A theory node with theory OFF is always theory-hidden regardless of path.
 */
export function nodePathTreatment(
  node: SkillNode,
  path: LearningPath | undefined,
  theoryEnabled: boolean,
): PathTreatment {
  if (node.theory && !theoryEnabled) return "theory-hidden";
  if (!path) return "on-path";
  return (node.pathTags?.includes(path) ?? true) ? "on-path" : "off-path";
}

/**
 * Convenience for tree rendering: the subset of nodes that should appear in the
 * view, each tagged with its treatment ("theory-hidden" nodes are dropped).
 */
export function visibleNodes(
  nodes: SkillNode[],
  path: LearningPath | undefined,
  theoryEnabled: boolean,
): Array<{ node: SkillNode; treatment: Exclude<PathTreatment, "theory-hidden"> }> {
  const out: Array<{ node: SkillNode; treatment: Exclude<PathTreatment, "theory-hidden"> }> = [];
  for (const node of nodes) {
    const treatment = nodePathTreatment(node, path, theoryEnabled);
    if (treatment === "theory-hidden") continue;
    out.push({ node, treatment });
  }
  return out;
}

// ---- Term-link helpers (chip → glossary id) ----

// Ghost key → glossary id. KEY_META names the key (e.g. "G major", "A minor");
// the glossary keys the canonical scale entries by these stable ids. Only keys
// with a dedicated glossary entry map; others fall back to the generic concept
// ("major-scale" / "minor-scale") so the chip is never dead.
const GHOST_KEY_TERM_IDS: Partial<Record<KeyId, string>> = {
  C: "c-major",
  G: "g-major",
  am: "a-minor",
};

/**
 * Map a ghost (focus) key to its glossary term id. Majors with no dedicated entry
 * fall back to "major-scale"; minors to "minor-scale", so a TermChip on the
 * Key-of-the-Week header always resolves to *something* explainable.
 */
export function ghostKeyToTermId(key: KeyId): string {
  const direct = GHOST_KEY_TERM_IDS[key];
  if (direct) return direct;
  // Minor key ids are the lowercase ones (e.g. "am", "em", "dm").
  const isMinor = key === key.toLowerCase() && key !== key.toUpperCase();
  return isMinor ? "minor-scale" : "major-scale";
}

// Skill-node id → glossary id, where a direct concept map exists. Only nodes
// whose subject IS a single glossary term are listed; others return undefined so
// the caller renders the plain title (no dead chip).
const NODE_TERM_IDS: Record<string, string> = {
  // guitar
  "g-t1-power": "power-chord",
  "g-t1-palmmute": "palm-muting",
  "g-t1-strum": "strumming",
  "g-t1-altpick": "alternate-picking",
  "g-t1-downpick": "down-picking",
  "g-t1-fretting": "fretting",
  "g-t2-hammer": "hammer-on",
  "g-t2-pulloff": "pull-off",
  "g-t2-slide": "slide",
  "g-t2-bend": "string-bending",
  "g-t2-vibrato": "vibrato",
  "g-t2-pent-box1": "minor-pentatonic",
  "g-t2-pent-box2": "pentatonic-box",
  "g-t2-barre-E": "barre-chord",
  "g-t2-barre-A": "barre-chord",
  "g-t3-blues12": "12-bar-blues",
  "g-t3-phrasing": "phrasing",
  "g-t3-licks": "lick",
  "g-t0-tab": "tab",
  "g-t1-tabrhythm": "tab-rhythm",
  "g-t3-syncopation": "syncopation",
  // piano
  "p-t0-staff": "staff",
  "p-t1-first-improv": "improvisation",
  "p-t1-echo-ear": "ear-training",
  "p-t1-three-moods": "three-moods",
  "p-t2-pop-formula": "pop-formula",
  "p-t2-transcribe": "transcribing",
  "p-t3-lead-sheet": "lead-sheet",
  "p-t3-ii-v-i": "ii-v-i",
  "p-t3-blues": "12-bar-blues",
  "p-key-C": "c-major",
  "p-key-G": "g-major",
  "p-key-am": "a-minor",
};

/**
 * Map a skill-node id to its glossary term id where a direct concept map exists,
 * else undefined (caller renders the plain title, no TermChip). Key nodes
 * (p-key-D etc.) without a dedicated entry are intentionally absent.
 */
export function nodeToTermId(nodeId: string): string | undefined {
  return NODE_TERM_IDS[nodeId];
}

// Re-export so callers can `import { PathTag } from "./pathFilter"` alongside helpers.
export type { PathTag };
