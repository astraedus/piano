import { describe, expect, it } from "vitest";
import { scaleBoxFor, scaleBoxRootFret, scaleBoxRootNote } from "./scaleBox";
import { KEY_META } from "../music";
import type { KeyId } from "../types";

// The old hand-maintained low-E fret table — kept here ONLY as the regression
// oracle: the refactored (noteIndex-based) scaleBoxRootFret must agree with it
// for every note the table covered.
const OLD_LOW_E_FRET: Record<string, number> = {
  E: 0, F: 1, "F#": 2, Gb: 2, G: 3, "G#": 4, Ab: 4, A: 5, "A#": 6, Bb: 6,
  B: 7, C: 8, "C#": 9, Db: 9, D: 10, "D#": 11, Eb: 11,
};

describe("scaleBoxRootFret matches the old hand-maintained table (refactor parity)", () => {
  it("agrees with the old table for every key's box-root note", () => {
    for (const key of Object.keys(KEY_META) as KeyId[]) {
      const root = scaleBoxRootNote(key);
      const expected = OLD_LOW_E_FRET[root];
      if (expected !== undefined) {
        expect(scaleBoxRootFret(key), `${key} root ${root}`).toBe(expected);
      }
    }
  });
  it("agrees with the old table for each note name directly", () => {
    // Probe via minor keys whose tonic IS the note, so scaleBoxRootNote returns it.
    const probes: Array<[KeyId, number]> = [
      ["em", 0], ["fm", 1], ["fsm", 2], ["gm", 3], ["gsm", 4],
      ["am", 5], ["bbm", 6], ["bm", 7], ["cm", 8], ["csm", 9], ["dm", 10], ["dsm", 11],
    ];
    for (const [key, fret] of probes) expect(scaleBoxRootFret(key), key).toBe(fret);
  });
});

describe("scaleBoxRootNote", () => {
  it("uses the minor tonic directly for a minor key", () => {
    expect(scaleBoxRootNote("am")).toBe("A");
    expect(scaleBoxRootNote("em")).toBe("E");
  });
  it("uses the relative minor for a major key (same five notes)", () => {
    expect(scaleBoxRootNote("C")).toBe("A"); // relative minor of C is Am
    expect(scaleBoxRootNote("G")).toBe("E"); // relative minor of G is Em
  });
});

describe("scaleBoxRootFret — low-E fret of the box root", () => {
  it("E minor opens at the nut (fret 0)", () => {
    expect(scaleBoxRootFret("em")).toBe(0);
  });
  it("A minor sits at the 5th fret (the canonical Box-1 home)", () => {
    expect(scaleBoxRootFret("am")).toBe(5);
  });
  it("C major's box roots at Am = 5th fret", () => {
    expect(scaleBoxRootFret("C")).toBe(5);
  });
  it("G major's box roots at Em = open (0)", () => {
    expect(scaleBoxRootFret("G")).toBe(0);
  });
});

describe("scaleBoxFor — moveable Box 1 positions", () => {
  it("Am Box 1 is the canonical 5th-fret minor-pentatonic box", () => {
    const box = scaleBoxFor("am");
    // low E (string 1) root on fret 5, plus fret 8.
    expect(box).toContainEqual({ string: 1, fret: 5, root: true });
    expect(box).toContainEqual({ string: 1, fret: 8 });
    // high E (string 6) root on fret 5.
    expect(box).toContainEqual({ string: 6, fret: 5, root: true });
  });

  it("shifts the whole shape by the root fret (Em opens at the nut)", () => {
    const box = scaleBoxFor("em");
    expect(box).toContainEqual({ string: 1, fret: 0, root: true });
    expect(box).toContainEqual({ string: 1, fret: 3 });
    // every dot is a valid fret >= 0
    for (const p of box) expect(p.fret).toBeGreaterThanOrEqual(0);
  });

  it("preserves the 12-dot two-roots shape for any key", () => {
    const box = scaleBoxFor("C");
    expect(box).toHaveLength(12);
    expect(box.filter((p) => p.root)).toHaveLength(2);
  });
});
