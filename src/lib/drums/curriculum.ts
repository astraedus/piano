// Shared drums constants — the drums analog of guitar's curriculum.ts.
//
// The shared practice spine rotates a weekly "ghost key" (a KeyId) that drives
// chain-drill selection. Drums has no tonality, so it REUSES KeyId values as
// OPAQUE rotation tokens (design decision 1): the token is never shown as a key;
// module.focusLabel maps it to a rudiment name (focus.ts is the ONE interpreter).
//
// Stage A ships only the four Tier-0 foundation nodes — no singles/doubles/accents
// nodes or drills yet — so the rotation is the single token "C" (singles), the
// through-line of ALL foundational pad work (you play single strokes while
// learning grip, rebound, the four strokes, and the click). Shipping the doc's
// full phase-1 set [C, G, D] now would surface "Rudiment of the Week: Double
// Stroke Roll" with no doubles content anywhere. Stage B widens this rotation as
// it adds the Tier-1+ rudiment nodes; the full 8-token map already lives in
// focus.ts, ready for that.

import type { KeyId, Phase } from "../types";

export const DRUMS_GHOST_ROTATION: Record<Phase, KeyId[]> = {
  1: ["C"],
  2: ["C"],
  3: ["C"],
  4: ["C"],
  5: ["C"],
};
