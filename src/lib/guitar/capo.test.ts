import { describe, it, expect } from "vitest";
import {
  CAPO_SHAPES,
  CAPO_FRETS,
  CAPO_CHART,
  TARGET_KEYS,
  capoFret,
  soundingKey,
  keyNameForPitchClass,
  type CagedShape,
} from "./capo";

const ALL_SHAPES: CagedShape[] = ["C", "A", "G", "E", "D"];

describe("soundingKey — shape + fret → sounding key (pinned worked examples)", () => {
  it("open shapes (capo 0) sound as their own chord", () => {
    expect(soundingKey("C", 0)).toBe("C");
    expect(soundingKey("A", 0)).toBe("A");
    expect(soundingKey("G", 0)).toBe("G");
    expect(soundingKey("E", 0)).toBe("E"); // E shape open = E (the brief's pin)
    expect(soundingKey("D", 0)).toBe("D");
  });

  it("C shape + capo 2 → D", () => {
    expect(soundingKey("C", 2)).toBe("D");
  });

  it("G shape + capo 3 → Bb (flat-spelled, not A#)", () => {
    expect(soundingKey("G", 3)).toBe("Bb");
  });

  it("the audit pin: G shape + capo 2 → A", () => {
    expect(soundingKey("G", 2)).toBe("A");
  });

  it("E shape + capo 1 → F (the F barre most beginners struggle with)", () => {
    expect(soundingKey("E", 1)).toBe("F");
  });

  it("wraps an octave: fret 12 sounds the same key as fret 0", () => {
    for (const shape of ALL_SHAPES) {
      expect(soundingKey(shape, 12)).toBe(soundingKey(shape, 0));
    }
  });
});

describe("capoFret — target key + shape → fret (pinned worked examples)", () => {
  it("C shape to reach D needs capo 2 (inverse of the worked example)", () => {
    expect(capoFret("C", "D")).toBe(2);
  });

  it("G shape to reach Bb needs capo 3", () => {
    expect(capoFret("G", "Bb")).toBe(3);
  });

  it("a shape reaching its own key needs no capo (fret 0)", () => {
    for (const { shape } of CAPO_SHAPES) {
      expect(capoFret(shape, soundingKey(shape, 0))).toBe(0);
    }
  });

  it("accepts a pitch-class number as the target", () => {
    expect(capoFret("C", 2)).toBe(2); // D = pc 2
    expect(capoFret("E", 4)).toBe(0); // E = pc 4, the E shape's open key
  });

  it("accepts enharmonic spellings of the target key", () => {
    // A# and Bb are the same pitch class → same capo fret on the G shape.
    expect(capoFret("G", "A#")).toBe(capoFret("G", "Bb"));
  });

  it("always returns the lowest capo position (0-11)", () => {
    for (const shape of ALL_SHAPES) {
      for (const { pitchClass } of TARGET_KEYS) {
        const fret = capoFret(shape, pitchClass);
        expect(fret).toBeGreaterThanOrEqual(0);
        expect(fret).toBeLessThanOrEqual(11);
      }
    }
  });
});

describe("capoFret and soundingKey are exact inverses (invariant over all shapes × frets)", () => {
  it("soundingKey(shape, capoFret(shape, key)) === key for every shape × target key", () => {
    for (const shape of ALL_SHAPES) {
      for (const { name, pitchClass } of TARGET_KEYS) {
        const fret = capoFret(shape, pitchClass);
        expect(soundingKey(shape, fret)).toBe(name);
      }
    }
  });

  it("capoFret(shape, soundingKey(shape, fret)) === fret for every shape × fret 0-11", () => {
    for (const shape of ALL_SHAPES) {
      for (let fret = 0; fret < 12; fret++) {
        expect(capoFret(shape, soundingKey(shape, fret))).toBe(fret);
      }
    }
  });
});

describe("keyNameForPitchClass uses theory-correct spelling", () => {
  it("spells flat keys flat, not as sharp enharmonics", () => {
    expect(keyNameForPitchClass(3)).toBe("Eb"); // not D#
    expect(keyNameForPitchClass(8)).toBe("Ab"); // not G#
    expect(keyNameForPitchClass(10)).toBe("Bb"); // not A#
  });
  it("uses the conventionally-preferred major-key spelling (fewest accidentals)", () => {
    expect(keyNameForPitchClass(1)).toBe("Db"); // Db (5♭) over C# (7♯)
    expect(keyNameForPitchClass(6)).toBe("F#"); // F#/Gb both 6; F# is the common guitar key
  });
  it("wraps pitch classes outside 0-11", () => {
    expect(keyNameForPitchClass(12)).toBe("C");
    expect(keyNameForPitchClass(-1)).toBe("B");
  });
});

describe("CAPO_CHART — the static teaching grid is well-formed and correct", () => {
  it("has one row per CAGED shape in canonical order", () => {
    expect(CAPO_CHART.map((r) => r.shape)).toEqual(["C", "A", "G", "E", "D"]);
  });

  it("every row's sounding array matches CAPO_FRETS length", () => {
    for (const row of CAPO_CHART) {
      expect(row.sounding).toHaveLength(CAPO_FRETS.length);
    }
  });

  it("each cell equals soundingKey(shape, fret) (the chart is a pure derivation)", () => {
    for (const row of CAPO_CHART) {
      CAPO_FRETS.forEach((fret, i) => {
        expect(row.sounding[i]).toBe(soundingKey(row.shape, fret));
      });
    }
  });

  it("the open column equals each row's openKey label", () => {
    for (const row of CAPO_CHART) {
      expect(row.sounding[0]).toBe(row.openKey);
    }
  });

  it("spot-check the famous cells across the grid", () => {
    const cell = (shape: CagedShape, fret: number) =>
      CAPO_CHART.find((r) => r.shape === shape)!.sounding[CAPO_FRETS.indexOf(fret)];
    expect(cell("C", 2)).toBe("D"); // C shape, capo 2 → D
    expect(cell("G", 3)).toBe("Bb"); // G shape, capo 3 → Bb
    expect(cell("E", 1)).toBe("F"); // E shape, capo 1 → F
    expect(cell("A", 2)).toBe("B"); // A shape, capo 2 → B
    expect(cell("D", 2)).toBe("E"); // D shape, capo 2 → E
  });
});

describe("CAPO_FRETS covers open through 7", () => {
  it("is 0..7 inclusive", () => {
    expect(CAPO_FRETS).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
});
