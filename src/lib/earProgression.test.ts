import { describe, it, expect } from "vitest";
import {
  nextEarLevel,
  earLevelAdvanced,
  earLevelLabel,
  maxAllowedEarLevel,
  effectiveEarLevel,
  MAX_EAR_LEVEL,
  type EarTally,
} from "./earProgression";
import { generateEarRound } from "./earRounds";
import type { EarLevelGates, SkillProgress } from "./types";

// The real piano gate shape (mirrors lib/piano/module.tsx). Kept local so the
// gating logic is tested independently of the module wiring.
const PIANO_GATES: EarLevelGates = {
  2: ["p-key-C"],
  3: ["p-key-C", "p-key-am"],
  4: ["p-t2-pop-formula"],
  5: ["p-t2-pop-formula"],
};
const learned = (): SkillProgress => ({ status: "learned", reps: 1 });
const progress = (...ids: string[]): Record<string, SkillProgress> =>
  Object.fromEntries(ids.map((id) => [id, learned()]));

const strong: EarTally = { correct: 3, wrong: 0 };
const ok: EarTally = { correct: 2, wrong: 1 };

describe("nextEarLevel — advance", () => {
  it("advances one level on strong recent accuracy over enough rounds", () => {
    // 3 sessions × 3 correct = 9/9 → advance L2 → L3.
    expect(nextEarLevel(2, [strong, strong, strong])).toBe(3);
  });

  it("advances by exactly one level (not multiple)", () => {
    expect(nextEarLevel(1, [strong, strong, strong])).toBe(2);
  });

  it("graces a single bad round inside an otherwise-strong window", () => {
    // 8 correct, 1 wrong over the window = 0.888... ≥ 0.8 → still advances.
    const window: EarTally[] = [
      { correct: 3, wrong: 0 },
      { correct: 3, wrong: 0 },
      { correct: 2, wrong: 1 },
    ];
    expect(nextEarLevel(3, window)).toBe(4);
  });
});

describe("nextEarLevel — hold", () => {
  it("holds when accuracy is below threshold", () => {
    // 6 correct, 3 wrong = 0.666 < 0.8 → hold.
    expect(nextEarLevel(2, [ok, ok, ok])).toBe(2);
  });

  it("holds when too few rounds were answered (one lucky round can't promote)", () => {
    // 3 correct, 0 wrong, but only 3 rounds < EAR_MIN_ROUNDS (5) → hold.
    expect(nextEarLevel(1, [{ correct: 3, wrong: 0 }])).toBe(1);
  });

  it("holds on empty history", () => {
    expect(nextEarLevel(3, [])).toBe(3);
  });

  it("only considers the most recent window (older sessions ignored)", () => {
    // A long-ago strong run shouldn't promote if the recent window is weak.
    const history: EarTally[] = [
      strong, strong, strong, // old, ignored
      { correct: 1, wrong: 3 },
      { correct: 1, wrong: 3 },
      { correct: 1, wrong: 3 },
    ];
    expect(nextEarLevel(2, history)).toBe(2);
  });
});

describe("nextEarLevel — cap", () => {
  it("never advances past MAX_EAR_LEVEL (L5)", () => {
    expect(nextEarLevel(5, [strong, strong, strong])).toBe(5);
    expect(MAX_EAR_LEVEL).toBe(5);
  });

  it("a level-4 user with a strong window lands exactly on the cap", () => {
    expect(nextEarLevel(4, [strong, strong, strong])).toBe(5);
  });
});

describe("helpers", () => {
  it("earLevelAdvanced detects an upward change", () => {
    expect(earLevelAdvanced(2, 3)).toBe(true);
    expect(earLevelAdvanced(3, 3)).toBe(false);
  });

  it("earLevelLabel returns a human label for every level", () => {
    expect(earLevelLabel(1)).toBe("Major vs Minor");
    expect(earLevelLabel(5)).toBe("Progressions");
    expect(earLevelLabel(7)).toBe("Progressions");
  });

  it("earLevelLabel serves the rhythm ladder for non-tonal (rudiment) modules — never tonal names (QA 2026-07-17)", () => {
    expect(earLevelLabel(1, "rudiment")).toBe("Beat Divisions");
    expect(earLevelLabel(4, "rudiment")).toBe("Accent Placement");
    expect(earLevelLabel(5, "rudiment")).toBe("Rudiments by Ear");
    for (const level of [1, 2, 3, 4, 5, 6, 7] as const) {
      expect(earLevelLabel(level, "rudiment")).not.toMatch(/major|minor|scale|chord|cadence|progression/i);
    }
    // tonal callers are unchanged by the new param
    expect(earLevelLabel(1, "key")).toBe("Major vs Minor");
    expect(earLevelLabel(3, "chord")).toBe("Chord Quality");
  });
});

describe("maxAllowedEarLevel — honest gating", () => {
  it("gates unmet (empty tree, floor 1) → L1 only", () => {
    expect(maxAllowedEarLevel(PIANO_GATES, {}, 1)).toBe(1);
  });

  it("partially met returns the taught prefix max", () => {
    // Only C major learned → L2 open, L3 needs A minor too → stop at L2.
    expect(maxAllowedEarLevel(PIANO_GATES, progress("p-key-C"), 1)).toBe(2);
    // C + A minor → L3 open, L4 needs the pop formula → stop at L3.
    expect(maxAllowedEarLevel(PIANO_GATES, progress("p-key-C", "p-key-am"), 1)).toBe(3);
  });

  it("fully met → the content cap L5", () => {
    expect(
      maxAllowedEarLevel(PIANO_GATES, progress("p-key-C", "p-key-am", "p-t2-pop-formula"), 1),
    ).toBe(5);
  });

  it("is a STRICT prefix — a later gate met while an earlier one is not does NOT count", () => {
    // A minor learned (part of the L3 gate) but NOT C major (the L2 gate) → the
    // first unmet gate at L2 stops the climb; A minor being learned is irrelevant.
    expect(maxAllowedEarLevel(PIANO_GATES, progress("p-key-am"), 1)).toBe(1);
    // Pop formula learned but neither C nor A minor → still capped at L1.
    expect(maxAllowedEarLevel(PIANO_GATES, progress("p-t2-pop-formula"), 1)).toBe(1);
  });

  it("floor overrides the taught max (an advanced self-report is trusted)", () => {
    // Empty tree but claimed L5 → L5 (the whole point of the floor).
    expect(maxAllowedEarLevel(PIANO_GATES, {}, 5)).toBe(5);
    // Taught L2, claimed L4 → the higher floor wins.
    expect(maxAllowedEarLevel(PIANO_GATES, progress("p-key-C"), 4)).toBe(4);
  });

  it("caps at MAX_EAR_LEVEL even when floor is higher", () => {
    expect(maxAllowedEarLevel(PIANO_GATES, progress("p-key-C", "p-key-am", "p-t2-pop-formula"), 7)).toBe(5);
    expect(MAX_EAR_LEVEL).toBe(5);
  });

  it("undefined gates = unrestricted (back-compat: a module can opt out of gating)", () => {
    expect(maxAllowedEarLevel(undefined, {}, 1)).toBe(5);
  });

  it("a per-level gap in the gate config is treated as open at that level", () => {
    // Only L4/L5 gated; L2/L3 have no config → open. With L4's gate unmet the
    // prefix stops at L3 (the last open level before the unmet gate).
    const partialGates: EarLevelGates = { 4: ["p-t2-pop-formula"], 5: ["p-t2-pop-formula"] };
    expect(maxAllowedEarLevel(partialGates, {}, 1)).toBe(3);
  });
});

describe("effectiveEarLevel — stored level clamped by gates + floor", () => {
  it("clamps a high stored level down to what the tree/floor allow", () => {
    // Stored L5 ratchet but empty tree + floor 1 → clamped to L1.
    expect(effectiveEarLevel({ earLevel: 5, earLevelFloor: 1, skillProgress: {} }, PIANO_GATES)).toBe(1);
  });

  it("returns the stored level when it's within the allowed ceiling", () => {
    expect(
      effectiveEarLevel(
        { earLevel: 3, earLevelFloor: 1, skillProgress: progress("p-key-C", "p-key-am") },
        PIANO_GATES,
      ),
    ).toBe(3);
  });

  it("never inflates a modest stored level even when the tree allows more", () => {
    // Fully-taught tree (ceiling 5) but the ratchet only reached L2 → stays L2.
    expect(
      effectiveEarLevel(
        { earLevel: 2, earLevelFloor: 1, skillProgress: progress("p-key-C", "p-key-am", "p-t2-pop-formula") },
        PIANO_GATES,
      ),
    ).toBe(2);
  });

  it("honors the claimed floor for an advanced learner with an empty tree", () => {
    expect(effectiveEarLevel({ earLevel: 5, earLevelFloor: 5, skillProgress: {} }, PIANO_GATES)).toBe(5);
  });

  it("treats a missing floor as 1", () => {
    expect(effectiveEarLevel({ earLevel: 4, skillProgress: {} }, PIANO_GATES)).toBe(1);
  });
});

describe("fresh beginner never meets cadence/progression content", () => {
  it("clamps to L1 at any stored level, and L1 rounds are never cadence/progression", () => {
    for (const stored of [1, 2, 3, 4, 5] as const) {
      const level = effectiveEarLevel(
        { earLevel: stored, earLevelFloor: 1, skillProgress: {} },
        PIANO_GATES,
      );
      expect(level).toBe(1);
      // Generate many L1 rounds across randomized branches — never a Roman-numeral
      // cadence or progression (the content the beginner was never taught).
      for (let i = 0; i < 40; i++) {
        const round = generateEarRound(level, "C");
        expect(round.type).not.toBe("cadence");
        expect(round.type).not.toBe("progression");
      }
    }
  });
});
