// Shared drums constants — the drums analog of guitar's curriculum.ts.
//
// The shared practice spine rotates a weekly "ghost key" (a KeyId) that drives
// chain-drill selection. Drums has no tonality, so it REUSES KeyId values as
// OPAQUE rotation tokens (design decision 1): the token is never shown as a key;
// module.focusLabel maps it to a rudiment name (focus.ts is the ONE interpreter).
//
// Stage B fills the rotation now that the Tier-1+ rudiment nodes + drills exist
// (design doc "Rudiment of the Week rotation"):
//   phase 1 : singles, doubles, accents        → tokens C, G, D
//   phase 2+: adds paradiddle, five-stroke,
//             flam, drag, buzz                  → tokens A, E, F, B, am
// Every token resolves to a rudiment via focus.ts, and every token has real
// Tier-1+ content (a node + a chain drill) — so "Rudiment of the Week: <name>"
// never surfaces with nothing behind it. drums onboarding starts everyone at
// phase 1; the full 8-token set is reachable as later phases would be, but the
// honest sequencing gate is the skill DAG (prereqs), not the phase.

import type { KeyId, Phase } from "../types";

const PHASE_1: KeyId[] = ["C", "G", "D"];
const PHASE_2_PLUS: KeyId[] = ["C", "G", "D", "A", "E", "F", "B", "am"];

export const DRUMS_GHOST_ROTATION: Record<Phase, KeyId[]> = {
  1: PHASE_1,
  2: PHASE_2_PLUS,
  3: PHASE_2_PLUS,
  4: PHASE_2_PLUS,
  5: PHASE_2_PLUS,
};
