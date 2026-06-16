import { describe, it, expect } from "vitest";
import {
  intervalRound,
  shuffle,
  INTERVALS,
  INTERVAL_MIN_LEVEL,
  type Rng,
} from "./intervalRound";
import { generateEarRound } from "./earRounds";
import { pitchMidi } from "./music";

/** A deterministic RNG seeded by a number — a simple LCG. Same seed → same
 *  sequence, so any round it drives is fully reproducible in a test. */
function seededRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    // Numerical Recipes LCG
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

describe("intervalRound — structure", () => {
  it("emits an interval-type round at the interval min level", () => {
    const r = intervalRound("C", seededRng(1));
    expect(r.type).toBe("interval");
    expect(r.level).toBe(INTERVAL_MIN_LEVEL);
    expect(r.audio.kind).toBe("interval");
  });

  it("plays exactly two notes (a dyad)", () => {
    const r = intervalRound("C", seededRng(7));
    expect(r.audio.notes).toHaveLength(2);
  });

  it("offers four distinct choices including the correct one", () => {
    const r = intervalRound("G", seededRng(3));
    expect(r.choices).toHaveLength(4);
    const ids = r.choices.map((c) => c.id);
    expect(new Set(ids).size).toBe(4); // all distinct
    expect(ids).toContain(r.correctId);
  });

  it("tags every choice with the interval glossary term (auto-reveal needs it)", () => {
    const r = intervalRound("D", seededRng(9));
    expect(r.choices.every((c) => c.termId === "interval")).toBe(true);
  });

  it("upper note is the correct interval's semitone distance above the lower", () => {
    const r = intervalRound("C", seededRng(42));
    const [lower, upper] = r.audio.notes!;
    const correct = INTERVALS.find((iv) => iv.id === r.correctId)!;
    expect(pitchMidi(upper) - pitchMidi(lower)).toBe(correct.semitones);
  });
});

describe("intervalRound — determinism", () => {
  it("is fully reproducible given the same seed", () => {
    const a = intervalRound("A", seededRng(123));
    const b = intervalRound("A", seededRng(123));
    expect(a.correctId).toBe(b.correctId);
    expect(a.choices.map((c) => c.id)).toEqual(b.choices.map((c) => c.id));
    expect(a.audio.notes).toEqual(b.audio.notes);
  });

  it("different seeds can produce different rounds", () => {
    // Across a spread of seeds we should see more than one distinct correct
    // answer (guards against a degenerate generator that always returns M2).
    const correctIds = new Set(
      Array.from({ length: 40 }, (_, k) => intervalRound("C", seededRng(k * 97 + 1)).correctId),
    );
    expect(correctIds.size).toBeGreaterThan(1);
  });
});

describe("shuffle — pure", () => {
  it("does not mutate the input and preserves membership", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, seededRng(2));
    expect(input).toEqual([1, 2, 3, 4, 5]); // unchanged
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]); // same members
  });
});

describe("generateEarRound — interval gating", () => {
  it("never emits an interval round below the min level", () => {
    // Below INTERVAL_MIN_LEVEL the gate cannot fire regardless of RNG. Sample
    // many rounds at L1/L2 — none should be intervals.
    for (let n = 0; n < 200; n++) {
      expect(generateEarRound(1, "C").type).not.toBe("interval");
      expect(generateEarRound(2, "C").type).not.toBe("interval");
    }
  });

  it("can emit interval rounds at or above the min level", () => {
    // At L3+, with ~1/3 probability, intervals appear across enough samples.
    let sawInterval = false;
    for (let n = 0; n < 500 && !sawInterval; n++) {
      if (generateEarRound(INTERVAL_MIN_LEVEL, "C").type === "interval") sawInterval = true;
    }
    expect(sawInterval).toBe(true);
  });
});
