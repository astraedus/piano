import { describe, it, expect } from "vitest";
import {
  AM_PENT_BOX1,
  AM_PENT_BOX2,
  BLUE_NOTE_AM,
  AM_BLUES_BOX1,
  AM_PENT_FULLNECK,
  NATURAL_NOTES_EA,
  FRETBOARD_MAP_POSITIONS,
  fretboardMapFor,
} from "./scaleShapes";
import type { FretPosition } from "../types";
import { GUITAR_NODES } from "./skillNodes";

// Open-string MIDI for each guitar string (1 = low E .. 6 = high e), standard tuning.
const OPEN_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
const midiOf = (p: FretPosition) => OPEN_MIDI[p.string - 1] + p.fret;
const pcOf = (p: FretPosition) => ((midiOf(p) % 12) + 12) % 12;

// A minor pentatonic pitch classes: A C D E G. Blues adds the ♭5 (Eb).
const AM_PENT_PCS = new Set([9, 0, 2, 4, 7]);
const EB_PC = 3;

describe("scaleShapes — every dot is a real note in range", () => {
  const all = [
    ["AM_PENT_BOX1", AM_PENT_BOX1],
    ["AM_PENT_BOX2", AM_PENT_BOX2],
    ["AM_BLUES_BOX1", AM_BLUES_BOX1],
    ["AM_PENT_FULLNECK", AM_PENT_FULLNECK],
    ["NATURAL_NOTES_EA", NATURAL_NOTES_EA],
  ] as const;

  it("every position has a valid string (1..6) and fret (0..24)", () => {
    for (const [name, shape] of all) {
      for (const p of shape) {
        expect(p.string, `${name} string`).toBeGreaterThanOrEqual(1);
        expect(p.string, `${name} string`).toBeLessThanOrEqual(6);
        expect(p.fret, `${name} fret`).toBeGreaterThanOrEqual(0);
        expect(p.fret, `${name} fret`).toBeLessThanOrEqual(24);
      }
    }
  });
});

describe("A minor pentatonic Box 1", () => {
  it("has 12 dots, all in the A-minor-pentatonic scale", () => {
    expect(AM_PENT_BOX1.length).toBe(12);
    for (const p of AM_PENT_BOX1) expect(AM_PENT_PCS.has(pcOf(p)), `pc of ${p.string}/${p.fret}`).toBe(true);
  });
  it("roots are the note A (pitch class 9), and there is at least one", () => {
    const roots = AM_PENT_BOX1.filter((p) => p.root);
    expect(roots.length).toBeGreaterThan(0);
    for (const r of roots) expect(pcOf(r)).toBe(9);
  });
  it("roots at the low-E and high-e 5th fret (A2 and A4)", () => {
    expect(AM_PENT_BOX1).toContainEqual(expect.objectContaining({ string: 1, fret: 5, root: true }));
    expect(AM_PENT_BOX1).toContainEqual(expect.objectContaining({ string: 6, fret: 5, root: true }));
  });
});

describe("A minor pentatonic Box 2 (connects above Box 1)", () => {
  it("has 12 dots, all A-minor-pentatonic notes, spanning frets 7–10", () => {
    expect(AM_PENT_BOX2.length).toBe(12);
    for (const p of AM_PENT_BOX2) expect(AM_PENT_PCS.has(pcOf(p)), `pc of ${p.string}/${p.fret}`).toBe(true);
    const frets = AM_PENT_BOX2.map((p) => p.fret);
    expect(Math.min(...frets)).toBe(7);
    expect(Math.max(...frets)).toBe(10);
  });
  it("roots are A (D string fret 7 = A3, B string fret 10 = A4)", () => {
    const roots = AM_PENT_BOX2.filter((p) => p.root);
    for (const r of roots) expect(pcOf(r)).toBe(9);
    expect(AM_PENT_BOX2).toContainEqual(expect.objectContaining({ string: 3, fret: 7, root: true }));
    expect(AM_PENT_BOX2).toContainEqual(expect.objectContaining({ string: 5, fret: 10, root: true }));
  });
  it("is a different shape from Box 1 (not the same default)", () => {
    expect(JSON.stringify(AM_PENT_BOX2)).not.toBe(JSON.stringify(AM_PENT_BOX1));
  });
});

describe("the blue note (♭5)", () => {
  it("sits on the A string, fret 6, and is an Eb (pitch class 3)", () => {
    expect(BLUE_NOTE_AM.string).toBe(2);
    expect(BLUE_NOTE_AM.fret).toBe(6);
    expect(pcOf(BLUE_NOTE_AM)).toBe(EB_PC);
  });
  it("AM_BLUES_BOX1 is Box 1 plus exactly the blue note", () => {
    expect(AM_BLUES_BOX1.length).toBe(AM_PENT_BOX1.length + 1);
    expect(AM_BLUES_BOX1).toContainEqual(BLUE_NOTE_AM);
    // every dot is either a pentatonic note or the blue note
    for (const p of AM_BLUES_BOX1) {
      expect(AM_PENT_PCS.has(pcOf(p)) || pcOf(p) === EB_PC, `pc of ${p.string}/${p.fret}`).toBe(true);
    }
  });
});

describe("full-neck pentatonic", () => {
  it("joins Box 1 and Box 2 with no duplicate (string, fret) cells", () => {
    const keys = AM_PENT_FULLNECK.map((p) => `${p.string}:${p.fret}`);
    expect(new Set(keys).size).toBe(keys.length);
    // spans both boxes (frets 5–10)
    const frets = AM_PENT_FULLNECK.map((p) => p.fret);
    expect(Math.min(...frets)).toBe(5);
    expect(Math.max(...frets)).toBe(10);
    // strictly more than a single box
    expect(AM_PENT_FULLNECK.length).toBeGreaterThan(AM_PENT_BOX1.length);
  });
});

describe("natural note map (low E + A strings)", () => {
  it("labels every dot and covers only strings 1 and 2", () => {
    for (const p of NATURAL_NOTES_EA) {
      expect(p.label, `label at ${p.string}/${p.fret}`).toBeTruthy();
      expect([1, 2]).toContain(p.string);
    }
  });
  it("each label matches the actual note at that fret (no sharps)", () => {
    const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    for (const p of NATURAL_NOTES_EA) {
      const name = NAMES[pcOf(p)];
      expect(name, `no accidental at ${p.string}/${p.fret}`).not.toContain("#");
      expect(p.label).toBe(name);
    }
  });
  it("low E open is E and A string open is A", () => {
    expect(NATURAL_NOTES_EA).toContainEqual(expect.objectContaining({ string: 1, fret: 0, label: "E" }));
    expect(NATURAL_NOTES_EA).toContainEqual(expect.objectContaining({ string: 2, fret: 0, label: "A" }));
  });
});

describe("fretboard-map node lookup", () => {
  it("EVERY guitar node with viz:fretboard_map has authored positions (no silent default)", () => {
    const mapNodes = GUITAR_NODES.filter((n) => n.viz === "fretboard_map").map((n) => n.id);
    expect(mapNodes.length).toBeGreaterThan(0);
    for (const id of mapNodes) {
      const pos = fretboardMapFor(id);
      expect(pos, `${id} has a fretboard map`).toBeDefined();
      expect(pos!.length, `${id} map non-empty`).toBeGreaterThan(0);
    }
  });
  it("Box 2 node shows Box 2, not Box 1", () => {
    expect(fretboardMapFor("g-t2-pent-box2")).toBe(AM_PENT_BOX2);
    expect(fretboardMapFor("g-t2-pent-box2")).not.toBe(AM_PENT_BOX1);
  });
  it("returns undefined for an unmapped node", () => {
    expect(fretboardMapFor("g-t0-posture")).toBeUndefined();
  });
});

// The whole lookup table is a fact-check space: every value must be a shape we
// can point at, keyed by a real node. This guards the class of bug the task
// found — a fretboard_map node rendering someone else's shape.
describe("FRETBOARD_MAP_POSITIONS integrity", () => {
  it("every keyed node exists in the guitar tree and is a fretboard_map node", () => {
    const byId = new Map(GUITAR_NODES.map((n) => [n.id, n]));
    for (const id of Object.keys(FRETBOARD_MAP_POSITIONS)) {
      const node = byId.get(id);
      expect(node, `${id} is a real guitar node`).toBeDefined();
      expect(node!.viz, `${id} is viz:fretboard_map`).toBe("fretboard_map");
    }
  });
});
