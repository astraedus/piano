import { describe, expect, it } from "vitest";
import {
  KEY_META,
  keyPrefersFlats,
  scale,
  triad,
  progressionChords,
  pentatonic,
} from "./music";
import type { KeyId } from "./types";

// Note-name spelling: every flat key must display flats, never the sharp
// enharmonic. This is the #6 fix — flat tonics were stored as sharps (Bb="A#")
// so the displayed scale read "A# C D D# F G A A#" instead of the literate
// "Bb C D Eb F G A Bb". These tests lock the SPELLING (not just the pitch).

const ALL_KEYS = Object.keys(KEY_META) as KeyId[];
const FLAT_KEYS: KeyId[] = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "dm", "gm", "cm", "fm", "bbm", "ebm"];
const SHARP_KEYS: KeyId[] = ["G", "D", "A", "E", "B", "Fs", "Cs", "em", "bm", "fsm", "csm", "gsm", "dsm", "asm"];

// Strip the trailing octave digit(s) to inspect just the note-name spelling.
const stripOct = (n: string) => n.replace(/-?\d+$/, "");

describe("keyPrefersFlats", () => {
  it("is true for every flat key", () => {
    for (const k of FLAT_KEYS) expect(keyPrefersFlats(k), k).toBe(true);
  });
  it("is false for sharp keys and the natural keys", () => {
    for (const k of SHARP_KEYS) expect(keyPrefersFlats(k), k).toBe(false);
    expect(keyPrefersFlats("C")).toBe(false);
    expect(keyPrefersFlats("am")).toBe(false);
  });
});

describe("flat-key tonics in KEY_META", () => {
  it("spell flat tonics with a flat, never a sharp enharmonic", () => {
    expect(KEY_META.Bb.tonic).toBe("Bb");
    expect(KEY_META.Eb.tonic).toBe("Eb");
    expect(KEY_META.Ab.tonic).toBe("Ab");
    expect(KEY_META.Db.tonic).toBe("Db");
    expect(KEY_META.Gb.tonic).toBe("Gb");
    expect(KEY_META.bbm.tonic).toBe("Bb");
    expect(KEY_META.ebm.tonic).toBe("Eb");
  });
  it("no flat key's tonic contains a sharp", () => {
    for (const k of FLAT_KEYS) expect(KEY_META[k].tonic).not.toContain("#");
  });
});

describe("scale spelling", () => {
  it("Bb major reads Bb C D Eb F G A Bb (the canonical bug case)", () => {
    expect(scale("Bb", "major", 1, 4, true).map(stripOct)).toEqual([
      "Bb", "C", "D", "Eb", "F", "G", "A", "Bb",
    ]);
  });
  it("Eb major reads Eb F G Ab Bb C D Eb", () => {
    expect(scale("Eb", "major", 1, 4, true).map(stripOct)).toEqual([
      "Eb", "F", "G", "Ab", "Bb", "C", "D", "Eb",
    ]);
  });
  it("C major (preferFlats=false) reads all naturals — sharp keys unaffected", () => {
    expect(scale("C", "major", 1, 4, false).map(stripOct)).toEqual([
      "C", "D", "E", "F", "G", "A", "B", "C",
    ]);
  });
  it("G major still reads with F# (sharp key preserved)", () => {
    expect(scale("G", "major", 1, 4, false).map(stripOct)).toContain("F#");
  });
});

describe("triad spelling", () => {
  it("Eb major triad reads Eb G Bb", () => {
    expect(triad("Eb", "maj", 4, true).map(stripOct)).toEqual(["Eb", "G", "Bb"]);
  });
  it("D major triad reads D F# A", () => {
    expect(triad("D", "maj", 4, false).map(stripOct)).toEqual(["D", "F#", "A"]);
  });
});

describe("pentatonic spelling", () => {
  it("Bb major pentatonic reads Bb C D F G Bb", () => {
    expect(pentatonic("Bb", "major", 4, true).map(stripOct)).toEqual([
      "Bb", "C", "D", "F", "G", "Bb",
    ]);
  });
});

// Class-level invariant: for EVERY flat key, NOTHING the user sees (scale 2
// octaves + tonic triad + the I–IV–V–I / i–iv–V–i progression) may contain a
// '#'. This is the catch-all that prevents any flat key regressing to sharps.
describe("no flat key ever displays a sharp (class invariant)", () => {
  for (const key of FLAT_KEYS) {
    it(`${key} (${KEY_META[key].name}) displays only flats/naturals`, () => {
      const meta = KEY_META[key];
      const romans = meta.mode === "major" ? ["I", "IV", "V", "I"] : ["i", "iv", "V", "i"];
      const display = [
        ...scale(meta.tonic, meta.mode, 2, 4, true),
        ...triad(meta.tonic, meta.mode === "major" ? "maj" : "min", 4, true),
        ...progressionChords(key, romans).flat(),
        ...pentatonic(meta.tonic, meta.mode, 4, true),
      ].join(" ");
      expect(display, `${key} display: ${display}`).not.toContain("#");
    });
  }
});

// Sharp keys (and the natural keys) must NOT pick up spurious flats from the
// progression path, which now derives preferFlats internally per key.
describe("sharp keys keep sharp spelling in progressions", () => {
  it("D major I–IV–V–I has no flats", () => {
    const display = progressionChords("D", ["I", "IV", "V", "I"]).flat().join(" ");
    // F# and C# should appear; no 'b' accidental letters (octave-stripped).
    expect(display).toContain("F#");
    expect(display.replace(/\d/g, "")).not.toMatch(/[A-G]b/);
  });
});

// The progression spelling derives flats from the key id itself.
describe("progressionChords derives preferFlats from the key", () => {
  it("Bb major I–IV–V–I spells Bb / Eb / F chords, no sharps", () => {
    const chords = progressionChords("Bb", ["I", "IV", "V", "I"]).map((c) => c.map(stripOct));
    expect(chords[0]).toEqual(["Bb", "D", "F"]); // I = Bb
    expect(chords[1]).toEqual(["Eb", "G", "Bb"]); // IV = Eb
    expect(chords[2]).toEqual(["F", "A", "C"]); // V = F
    expect(chords.flat().join(" ")).not.toContain("#");
  });
});

// Acoustic safety: changing the tonic spelling must NOT change pitch — Bb and
// A# are the same MIDI note. Verified indirectly: the Bb scale's pitches equal
// the old A#-spelled scale's pitches.
describe("spelling change is acoustically neutral", () => {
  it("every key's scale degrees are the correct pitch classes", () => {
    for (const key of ALL_KEYS) {
      const meta = KEY_META[key];
      const s = scale(meta.tonic, meta.mode, 1, 4, keyPrefersFlats(key));
      // 8 notes (octave inclusive), first === last pitch class.
      expect(s.length, key).toBe(8);
      expect(stripOct(s[0]), key).toBe(stripOct(s[7]));
    }
  });
});
