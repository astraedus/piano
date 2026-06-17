import { describe, expect, it } from "vitest";
import { scaleBoxFor, scaleBoxRootFret, scaleBoxRootNote } from "./scaleBox";

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
