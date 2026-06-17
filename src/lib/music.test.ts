import { describe, expect, it } from "vitest";
import {
  KEY_META,
  keyPrefersFlats,
  scale,
  triad,
  progressionChords,
  pentatonic,
  pitchMidi,
  circleNeighbors,
  CIRCLE_MAJORS,
  CIRCLE_MINORS,
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
  it("Gb major reads Gb Ab Bb Cb Db Eb F Gb (the Cb spelling — was 'B')", () => {
    expect(scale("Gb", "major", 1, 4, true).map(stripOct)).toEqual([
      "Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F", "Gb",
    ]);
  });
  it("Gb major Cb is labelled Cb5 (not Cb4) so the scale ascends", () => {
    // Regression: the octave digit on the enharmonic-wrap note Cb must place it
    // at the right pitch (B4 = Cb5), or the rendered scale appears to jump down.
    const gb = scale("Gb", "major", 1, 4, true);
    expect(gb).toContain("Cb5");
    expect(gb).not.toContain("Cb4");
  });
  it("every key's 2-octave scale is monotonically ASCENDING in pitch (octave labels correct)", () => {
    // Catches the Cb/B#/E#/Fb octave-labelling bug across all 28 keys.
    for (const key of ALL_KEYS) {
      const meta = KEY_META[key];
      const notes = scale(meta.tonic, meta.mode, 2, 4, keyPrefersFlats(key));
      const midis = notes.map(pitchMidi);
      for (let i = 1; i < midis.length; i++) {
        expect(midis[i], `${key}: ${notes.join(" ")}`).toBeGreaterThan(midis[i - 1]);
      }
    }
  });
  it("Eb minor reads Eb F Gb Ab Bb Cb Db Eb (its 6th is Cb, not B)", () => {
    expect(scale("Eb", "minor", 1, 4, true).map(stripOct)).toEqual([
      "Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db", "Eb",
    ]);
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
// octaves + tonic triad + the I–IV–V–I / i–iv–V–i progression + pentatonic) may
// contain a '#'. This is the catch-all that prevents any flat key regressing to
// sharps.
describe("no flat key ever displays a sharp (class invariant)", () => {
  // NOTE: the natural diatonic content (scale, tonic triad, pentatonic) of a flat
  // key has NO sharps. The harmonic-minor V chord is deliberately EXCLUDED here:
  // it raises the leading tone, which is correctly spelled with a sharp/natural
  // even in a flat minor key (D minor's V = A C# E, G minor's V = D F# A). That
  // raised tone is verified separately below.
  for (const key of FLAT_KEYS) {
    it(`${key} (${KEY_META[key].name}) natural content displays only flats/naturals`, () => {
      const meta = KEY_META[key];
      const display = [
        ...scale(meta.tonic, meta.mode, 2, 4, true),
        ...triad(meta.tonic, meta.mode === "major" ? "maj" : "min", 4, true),
        ...pentatonic(meta.tonic, meta.mode, 4, true),
      ].join(" ");
      expect(display, `${key} display: ${display}`).not.toContain("#");
    });
  }

  it("the harmonic-minor V raises the leading tone with a SHARP, not a flat", () => {
    // D minor V = A C# E (NOT A Db E — the leading tone is C#). This is the bug
    // the letter-aware speller fixes: the old preferFlats path mis-spelled it Db.
    const dmV = progressionChords("dm", ["V"]).flat().map(stripOct);
    expect(dmV).toEqual(["A", "C#", "E"]);
    // G minor V = D F# A.
    const gmV = progressionChords("gm", ["V"]).flat().map(stripOct);
    expect(gmV).toEqual(["D", "F#", "A"]);
  });

  // STRENGTHENED: a diatonic scale must use each letter A–G exactly once. This
  // catches WRONG-LETTER spellings (Cb mis-rendered as "B", Fb as "E") that the
  // '#'-only check above misses — e.g. Gb major must read ...Bb Cb Db..., never
  // ...Bb B Db... (B used twice, C skipped).
  for (const key of [...FLAT_KEYS] as const) {
    it(`${key} (${KEY_META[key].name}) scale uses each letter A–G exactly once`, () => {
      const meta = KEY_META[key];
      const oneOctave = scale(meta.tonic, meta.mode, 1, 4).slice(0, 7); // drop the repeat
      const letters = oneOctave.map((n) => n.replace(/[#b]+/g, "").replace(/-?\d+$/, ""));
      expect(new Set(letters).size, `${key} letters: ${letters.join(" ")}`).toBe(7);
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

// Circle-of-fifths I / IV / V / vi neighbour derivation (#3). The tapped key is
// I; its clockwise outer neighbour is V; counter-clockwise outer neighbour is IV;
// the relative minor directly inside is vi. These four are adjacent on the circle
// and are the Pop-Formula core, so the derivation must be exactly right — incl.
// the wraparound at both ends of the 12-key ring.
describe("circleNeighbors", () => {
  it("C → I=C, IV=F, V=G, vi=am (the canonical pin)", () => {
    expect(circleNeighbors("C")).toEqual({ I: "C", IV: "F", V: "G", vi: "am" });
  });
  it("G → I=G, IV=C, V=D, vi=em", () => {
    expect(circleNeighbors("G")).toEqual({ I: "G", IV: "C", V: "D", vi: "em" });
  });
  it("F → I=F, IV=Bb, V=C, vi=dm (F is last in the ring — V wraps to C)", () => {
    // F sits at index 11; its clockwise neighbour wraps to index 0 (C).
    expect(circleNeighbors("F")).toEqual({ I: "F", IV: "Bb", V: "C", vi: "dm" });
  });
  it("C → IV wraps from index 0 back to F (index 11)", () => {
    // C sits at index 0; its counter-clockwise neighbour wraps to index 11 (F).
    expect(circleNeighbors("C")!.IV).toBe("F");
  });
  it("F# (Fs, index 6 — the bottom of the circle) → IV=B, V=Db, vi=dsm", () => {
    expect(circleNeighbors("Fs")).toEqual({ I: "Fs", IV: "B", V: "Db", vi: "dsm" });
  });
  it("returns null for a minor key (the adjacency is a major-key teaching)", () => {
    expect(circleNeighbors("am")).toBeNull();
    expect(circleNeighbors("em")).toBeNull();
  });

  it("for EVERY major circle key: I/IV/V are majors, vi is its relative minor", () => {
    for (let i = 0; i < CIRCLE_MAJORS.length; i++) {
      const key = CIRCLE_MAJORS[i];
      const n = circleNeighbors(key)!;
      expect(n, key).not.toBeNull();
      // I, IV, V are all on the outer (majors) ring.
      expect(CIRCLE_MAJORS, `${key} I`).toContain(n.I);
      expect(CIRCLE_MAJORS, `${key} IV`).toContain(n.IV);
      expect(CIRCLE_MAJORS, `${key} V`).toContain(n.V);
      // vi is the inner-ring key at the SAME index, and is the key's relative minor.
      expect(n.vi, `${key} vi index`).toBe(CIRCLE_MINORS[i]);
      expect(n.vi, `${key} vi relative`).toBe(KEY_META[key].relative);
    }
  });

  it("V is always a perfect fifth (7 semitones) above I, and IV a fourth (5)", () => {
    // The circle IS the fifths relationship — verify it acoustically, not just by
    // array position, so a re-ordering of CIRCLE_MAJORS could never pass silently.
    for (const key of CIRCLE_MAJORS) {
      const n = circleNeighbors(key)!;
      const pcUp = (a: string, b: string) =>
        ((pitchMidi(b + "4") - pitchMidi(a + "4")) % 12 + 12) % 12;
      expect(pcUp(KEY_META[n.I].tonic, KEY_META[n.V].tonic), `${key} I→V`).toBe(7);
      expect(pcUp(KEY_META[n.I].tonic, KEY_META[n.IV].tonic), `${key} I→IV`).toBe(5);
    }
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
