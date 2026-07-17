import { describe, it, expect, beforeEach, vi } from "vitest";
import type { StickingCell } from "./types";

// Smoke test for the percussion layer (playSticking). Tone.js is mocked with
// minimal stubs that record every triggerAttackRelease, so we can assert the
// pattern is sounded honestly: one hit per non-rest cell, accents harder + higher.
const { membraneSpy, noiseSpy } = vi.hoisted(() => ({
  membraneSpy: vi.fn(),
  noiseSpy: vi.fn(),
}));

vi.mock("tone", () => {
  class Panner {
    constructor(_pan: number) {}
    toDestination() { return this; }
  }
  class MembraneSynth {
    volume = { value: 0 };
    constructor(_o: unknown) {}
    connect() { return this; }
    triggerAttackRelease(...a: unknown[]) { membraneSpy(...a); }
  }
  class NoiseSynth {
    volume = { value: 0 };
    constructor(_o: unknown) {}
    connect() { return this; }
    triggerAttackRelease(...a: unknown[]) { noiseSpy(...a); }
  }
  return { Panner, MembraneSynth, NoiseSynth, now: () => 0 };
});

import { playSticking } from "./audio";

// High tempo so the (real) sleep at the end is short.
const FAST_BPM = 6000;

beforeEach(() => {
  membraneSpy.mockClear();
  noiseSpy.mockClear();
});

describe("playSticking", () => {
  it("fires one membrane + one noise hit per non-rest cell", async () => {
    const pattern: StickingCell[] = [
      { hand: "R", accent: true, count: "1" },
      { hand: "L", count: "2" },
      { hand: "R", count: "3" },
    ];
    await playSticking(pattern, FAST_BPM);
    expect(membraneSpy).toHaveBeenCalledTimes(3);
    expect(noiseSpy).toHaveBeenCalledTimes(3);
  });

  it("skips rest cells (no hit sounds on a rest)", async () => {
    const pattern: StickingCell[] = [
      { hand: "R", count: "1" },
      { rest: true, count: "2" },
      { hand: "L", count: "3" },
    ];
    await playSticking(pattern, FAST_BPM);
    expect(membraneSpy).toHaveBeenCalledTimes(2); // only the two hits, not the rest
  });

  it("plays accents harder + higher than taps", async () => {
    const pattern: StickingCell[] = [
      { hand: "R", accent: true, count: "1" },
      { hand: "L", count: "2" },
    ];
    await playSticking(pattern, FAST_BPM);
    // membrane call args: (note, durationSec, when, velocity)
    const calls = membraneSpy.mock.calls;
    const accent = calls.find((c) => c[0] === "C2");
    const tap = calls.find((c) => c[0] === "A1");
    expect(accent).toBeTruthy();
    expect(tap).toBeTruthy();
    expect(accent![3]).toBe(1);    // accent velocity
    expect(tap![3]).toBe(0.5);     // tap velocity
  });

  it("does nothing (no throw) for an empty pattern", async () => {
    await expect(playSticking([], FAST_BPM)).resolves.toBeUndefined();
    expect(membraneSpy).not.toHaveBeenCalled();
  });
});
