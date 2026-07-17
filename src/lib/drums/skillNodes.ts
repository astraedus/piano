import type { SkillNode } from "../types";

// Drums skill DAG — Stage A ships the four Tier-0 foundations only (design doc
// "Tier 0 — foundations (sound before anything)"). Each node links to a chain
// drill (its BPM-ladder practice) and an unlock card (the capability it earns).
// No keyId (drums have no key depths); no tonal viz. The teaching lives in
// lessons.ts; these carry the one-line masteryDrill / unlock fallbacks.
//
// Order is the honest dependency order from roadmap.json: setup → rebound →
// (the four strokes) + (the click), the last two both built on rebound.
export const DRUMS_NODES: SkillNode[] = [
  {
    id: "d-t0-setup",
    instrument: "drums",
    title: "Hold the Sticks",
    tier: 0,
    category: "setup",
    prereqs: [],
    masteryDrill:
      "Hold a relaxed matched grip in both hands for a whole short session — no death grip, shoulders down, and a light tap lets the stick bounce back on its own.",
    unlock:
      "You can hold the sticks the way every drummer does — ready to play for real without your hands cramping.",
    chainDrillId: "d-t0-setup-drill",
    unlockCardId: "u-d-setup",
  },
  {
    id: "d-t0-rebound",
    instrument: "drums",
    title: "Let the Stick Bounce",
    tier: 0,
    category: "technique",
    prereqs: ["d-t0-setup"],
    masteryDrill:
      "Throw each stick down and let it rebound back to a repeatable height on its own — loose grip, both hands, never lifting the stick back up yourself.",
    unlock:
      "You can trust the bounce, so playing fast or quiet later costs you almost no effort.",
    chainDrillId: "d-t0-rebound-drill",
    unlockCardId: "u-d-rebound",
  },
  {
    id: "d-t0-strokes",
    instrument: "drums",
    title: "The Four Strokes",
    tier: 0,
    category: "technique",
    prereqs: ["d-t0-rebound"],
    masteryDrill:
      "Loop full, down, tap, up on one hand with clearly different heights, matched between your right and left hands, slow.",
    unlock:
      "You have the loud-and-soft vocabulary every pattern, accent, and groove is built from.",
    chainDrillId: "d-t0-strokes-drill",
    unlockCardId: "u-d-strokes",
  },
  {
    id: "d-t0-click",
    instrument: "drums",
    title: "Make Friends with the Click",
    tier: 0,
    category: "rhythm",
    prereqs: ["d-t0-rebound"],
    masteryDrill:
      "Lock one hand to a 60–80 BPM click on the beat for a full minute — drop out, keep counting, then re-enter cleanly on beat 1.",
    unlock:
      "You can lock to a steady beat — the timing floor everything you ever play sits on.",
    chainDrillId: "d-t0-click-drill",
    unlockCardId: "u-d-click",
  },
];
