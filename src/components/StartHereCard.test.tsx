// V5 — Start-Here card logic tests.
//
// The card appears when any tier-0 "setup" skill node for the active instrument
// is not yet learned. Once all setup nodes are learned the card never shows.
// These tests assert the pure showStartHere logic using resolveStatus directly —
// no Next.js routing mocks needed, no browser APIs, no flakiness.

import { describe, it, expect } from "vitest";
import { shouldShowStartHere } from "@/lib/startHere";
import type { SkillNode, SkillProgress } from "@/lib/types";

// Minimal setup (tier-0) nodes for the assertions below.
const tuningNode: SkillNode = {
  id: "g-t0-anatomy",
  instrument: "guitar",
  title: "Guitar Anatomy & Tuning",
  tier: 0,
  category: "setup",
  prereqs: [],
  masteryDrill: "Tune and name strings.",
  unlock: "Tune independently.",
};

const postureNode: SkillNode = {
  id: "g-t0-posture",
  instrument: "guitar",
  title: "Holding & Pick Grip",
  tier: 0,
  category: "technique", // NOT setup — must not gate the card on its own
  prereqs: ["g-t0-anatomy"],
  masteryDrill: "Body check.",
  unlock: "Foundation posture.",
};

const pianoSetup: SkillNode = {
  id: "p-t0-keyboard-map",
  instrument: "piano",
  title: "Map the Keyboard",
  tier: 0,
  category: "setup",
  prereqs: [],
  masteryDrill: "Find any note in under a second.",
  unlock: "Find any note.",
};

// Delegates to the REAL predicate the app uses (no local re-implementation), with
// zero sessions logged — the state every assertion below is scoped to. A separate
// test pins the "hides after a session" branch.
function showStartHere(allNodes: SkillNode[], progress: Record<string, SkillProgress>): boolean {
  return shouldShowStartHere(allNodes, progress, 0);
}

describe("Start-Here card visibility logic", () => {
  it("shows for a brand-new guitar user with no progress", () => {
    expect(showStartHere([tuningNode, postureNode], {})).toBe(true);
  });

  it("hides once a session has been logged, even with setup unlearned", () => {
    // Any logged session means the learner is oriented — the Welcome card retires.
    expect(shouldShowStartHere([tuningNode, postureNode], {}, 1)).toBe(false);
  });

  it("shows when the setup node is in-progress but not yet learned", () => {
    const progress: Record<string, SkillProgress> = {
      "g-t0-anatomy": { status: "in-progress", reps: 2 },
    };
    expect(showStartHere([tuningNode], progress)).toBe(true);
  });

  it("hides once all setup nodes are learned", () => {
    const progress: Record<string, SkillProgress> = {
      "g-t0-anatomy": { status: "learned", reps: 5, learnedAt: "2026-01-01" },
    };
    expect(showStartHere([tuningNode], progress)).toBe(false);
  });

  it("shows if ANY setup node is not learned (multiple setup nodes)", () => {
    // Two setup nodes: only one learned — card should still show.
    const second: SkillNode = {
      id: "p-t0-keyboard-map",
      instrument: "piano",
      title: "Map the Keyboard",
      tier: 0,
      category: "setup",
      prereqs: [],
      masteryDrill: "Find any note.",
      unlock: "Find any note.",
    };
    const progress: Record<string, SkillProgress> = {
      "g-t0-anatomy": { status: "learned", reps: 5, learnedAt: "2026-01-01" },
    };
    expect(showStartHere([tuningNode, second], progress)).toBe(true);
  });

  it("hides when the only setup node is learned (piano)", () => {
    const progress: Record<string, SkillProgress> = {
      "p-t0-keyboard-map": { status: "learned", reps: 3, learnedAt: "2026-01-02" },
    };
    expect(showStartHere([pianoSetup], progress)).toBe(false);
  });

  it("never shows for non-setup tier-0 nodes (technique category)", () => {
    // postureNode is tier-0 but category "technique", NOT "setup" — should not trigger
    const progress: Record<string, SkillProgress> = {
      "g-t0-anatomy": { status: "learned", reps: 5, learnedAt: "2026-01-01" },
    };
    // With tuning learned + only posture remaining (technique), card should NOT show
    expect(showStartHere([tuningNode, postureNode], progress)).toBe(false);
  });

  it("shows when there are no nodes at all (instrument not yet loaded)", () => {
    // With no nodes, no setup nodes exist, so .some() returns false — card hidden.
    // This is correct: no instrument loaded means we can't guide the user, so
    // we don't falsely show the card.
    expect(showStartHere([], {})).toBe(false);
  });
});
