import { describe, it, expect } from "vitest";
import {
  nextEarLevel,
  earLevelAdvanced,
  earLevelLabel,
  MAX_EAR_LEVEL,
  type EarTally,
} from "./earProgression";

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
});
