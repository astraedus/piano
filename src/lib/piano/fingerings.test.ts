import { describe, expect, it } from "vitest";
import { scaleFingerings, fingeringsForNotes, hasCanonicalFingering } from "./fingerings";
import { scale, KEY_META } from "../music";

describe("scaleFingerings — right hand", () => {
  it("C major one octave is the textbook 1 2 3 1 2 3 4 5", () => {
    const f = scaleFingerings("C", 1, 4, "right");
    expect([f["C4"], f["D4"], f["E4"], f["F4"], f["G4"], f["A4"], f["B4"], f["C5"]]).toEqual([
      1, 2, 3, 1, 2, 3, 4, 5,
    ]);
  });

  it("C major two octaves tucks the thumb on the octave join, 5 only at the very top", () => {
    const notes = scale("C", "major", 2, 4);
    const f = scaleFingerings("C", 2, 4, "right");
    // Octave 1 ends ...B4=4, then the join C5 is a thumb (1), not a 5.
    expect(f["B4"]).toBe(4);
    expect(f["C5"]).toBe(1);
    // Only the final note (C6) is the 5.
    expect(f[notes[notes.length - 1]]).toBe(5);
    expect(notes[notes.length - 1]).toBe("C6");
  });

  it("F major right hand is the 1 2 3 4 exception (tuck after Bb)", () => {
    const f = scaleFingerings("F", 1, 4, "right");
    // F G A Bb | C D E F  → 1 2 3 4 1 2 3 (4/5 top). Tuck is after the 4th note.
    expect([f["F4"], f["G4"], f["A4"], f["Bb4"]]).toEqual([1, 2, 3, 4]);
    expect(f["C5"]).toBe(1);
  });

  it("a flat key's fingering keys are spelled with flats (align with the lit notes)", () => {
    const f = scaleFingerings("Bb", 1, 4, "right");
    // Bb major scale notes are flat-spelled; the fingering record must key on them.
    expect(f["Bb4"]).toBeDefined();
    expect(Object.keys(f).some((k) => k.includes("#"))).toBe(false);
  });
});

describe("scaleFingerings — left hand", () => {
  it("C major one octave ascending is 5 4 3 2 1 3 2 1", () => {
    const f = scaleFingerings("C", 1, 4, "left");
    expect([f["C4"], f["D4"], f["E4"], f["F4"], f["G4"], f["A4"], f["B4"], f["C5"]]).toEqual([
      5, 4, 3, 2, 1, 3, 2, 1,
    ]);
  });
  it("two octaves: each octave begins on 5, only the final note is a 1", () => {
    const notes = scale("C", "major", 2, 4);
    const f = scaleFingerings("C", 2, 4, "left");
    expect(f["C4"]).toBe(5);
    expect(f["C5"]).toBe(5); // join begins a fresh octave on the pinky
    expect(f[notes[notes.length - 1]]).toBe(1);
  });
});

describe("fingeringsForNotes maps the exact notes the Keyboard lights", () => {
  it("every highlighted scale note gets a finger (no gaps)", () => {
    for (const keyId of ["C", "G", "F", "D", "A", "E", "am", "em"] as const) {
      const meta = KEY_META[keyId];
      const notes = scale(meta.tonic, meta.mode, 2, 4);
      const f = fingeringsForNotes(notes, meta.tonic, "right");
      for (const n of notes) {
        expect(f[n], `${keyId} ${n}`).toBeGreaterThanOrEqual(1);
        expect(f[n], `${keyId} ${n}`).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe("hasCanonicalFingering", () => {
  it("is true for the priority keys, falls back gracefully otherwise", () => {
    expect(hasCanonicalFingering("C")).toBe(true);
    expect(hasCanonicalFingering("F")).toBe(true);
    expect(hasCanonicalFingering("am")).toBe(true); // shares C-major tonic letter A? no — A
    // A minor's tonic is "A" which is a listed key, so canonical.
    expect(hasCanonicalFingering("Bb")).toBe(false); // not explicitly listed -> C fallback
  });
});
