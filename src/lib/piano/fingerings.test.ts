import { describe, expect, it } from "vitest";
import {
  scaleFingerings,
  fingeringsForKey,
  hasCanonicalFingering,
  tuckIndices,
  tuckDegrees,
  tuckNotesFor,
  tuckCue,
} from "./fingerings";
import { scale, KEY_META, pitchMidi, midiToSpn } from "../music";
import type { KeyId } from "../types";

// Source of truth: docs/research/piano-scale-fingerings.md. These pins are the
// exact verified sequences (incl. the two flagged exceptions: F major RH and the
// B/Bm LH 4-3-2-1-4-3-2-1). Wrong fingerings teach wrong, so they are locked.

// Fingerings are keyed by the Keyboard's canonical (sharp-spelled) SPN so flat
// scale notes (Eb4 -> D#4) align with the keyboard's own key ids.
const canon = (spn: string) => midiToSpn(pitchMidi(spn));

describe("scaleFingerings — RH one-octave pins (verified doc)", () => {
  const rhPins: Array<[KeyId, number[]]> = [
    ["C", [1, 2, 3, 1, 2, 3, 4, 5]],
    ["F", [1, 2, 3, 4, 1, 2, 3, 4]],   // RH exception (tuck after 4th, Bb)
    ["Fs", [2, 3, 4, 1, 2, 3, 1, 2]],  // F# major
    ["Gb", [2, 3, 4, 1, 2, 3, 1, 2]],  // enharmonic == Fs
    ["Db", [2, 3, 1, 2, 3, 4, 1, 2]],
    ["Ab", [3, 4, 1, 2, 3, 1, 2, 3]],
    ["Eb", [3, 1, 2, 3, 4, 1, 2, 3]],
    ["Bb", [2, 1, 2, 3, 1, 2, 3, 4]],
    ["B",  [1, 2, 3, 1, 2, 3, 4, 5]],
  ];
  for (const [key, seq] of rhPins) {
    it(`${key} major RH = ${seq.join(" ")}`, () => {
      const meta = KEY_META[key];
      const notes = scale(meta.tonic, meta.mode, 1, 4, true);
      const f = scaleFingerings(key, 1, 4, "right");
      const got = notes.map((n) => f[canon(n)]);
      expect(got).toEqual(seq);
    });
  }
});

describe("scaleFingerings — LH pins incl. the B-major exception (doc §3.6)", () => {
  it("C major LH = 5 4 3 2 1 3 2 1", () => {
    const notes = scale("C", "major", 1, 4);
    const f = scaleFingerings("C", 1, 4, "left");
    expect(notes.map((n) => f[canon(n)])).toEqual([5, 4, 3, 2, 1, 3, 2, 1]);
  });
  it("B major LH = 4 3 2 1 4 3 2 1 (the flagged exception, NOT the white-key shape)", () => {
    const notes = scale("B", "major", 1, 4);
    const f = scaleFingerings("B", 1, 4, "left");
    expect(notes.map((n) => f[canon(n)])).toEqual([4, 3, 2, 1, 4, 3, 2, 1]);
  });
  it("F# major LH = 4 3 2 1 3 2 1 4", () => {
    const notes = scale(KEY_META.Fs.tonic, "major", 1, 4, true);
    const f = scaleFingerings("Fs", 1, 4, "left");
    expect(notes.map((n) => f[canon(n)])).toEqual([4, 3, 2, 1, 3, 2, 1, 4]);
  });
  it("Db major LH = 3 2 1 4 3 2 1 3 (flat-key LH shape)", () => {
    const notes = scale("Db", "major", 1, 4, true);
    const f = scaleFingerings("Db", 1, 4, "left");
    expect(notes.map((n) => f[canon(n)])).toEqual([3, 2, 1, 4, 3, 2, 1, 3]);
  });
});

describe("scaleFingerings — minor pins (verified doc §2 minor table)", () => {
  it("B minor LH = 4 3 2 1 4 3 2 1 (minor analogue of the B-major exception)", () => {
    const notes = scale("B", "minor", 1, 4);
    const f = scaleFingerings("bm", 1, 4, "left");
    expect(notes.map((n) => f[canon(n)])).toEqual([4, 3, 2, 1, 4, 3, 2, 1]);
  });
  it("F# minor RH = 2 3 1 2 3 1 2 3", () => {
    const notes = scale(KEY_META.fsm.tonic, "minor", 1, 4, true);
    const f = scaleFingerings("fsm", 1, 4, "right");
    expect(notes.map((n) => f[canon(n)])).toEqual([2, 3, 1, 2, 3, 1, 2, 3]);
  });
  it("Bb minor RH = 2 1 2 3 1 2 3 4 / LH = 2 1 3 2 1 4 3 2", () => {
    const notes = scale("Bb", "minor", 1, 4, true);
    const rh = scaleFingerings("bbm", 1, 4, "right");
    const lh = scaleFingerings("bbm", 1, 4, "left");
    expect(notes.map((n) => rh[canon(n)])).toEqual([2, 1, 2, 3, 1, 2, 3, 4]);
    expect(notes.map((n) => lh[canon(n)])).toEqual([2, 1, 3, 2, 1, 4, 3, 2]);
  });
  it("A# minor (asm) shares Bb minor's fingering (enharmonic)", () => {
    // asm is the enharmonic of bbm (not user-surfaced — the circle uses bbm).
    // Read each scale by ITS OWN notes so the degree-ordered finger sequence is
    // compared independent of spelling, and assert both equal the doc's Bbm RH.
    const asmNotes = scale(KEY_META.asm.tonic, "minor", 1, 4, true);
    const bbmNotes = scale(KEY_META.bbm.tonic, "minor", 1, 4, true);
    const asmRh = scaleFingerings("asm", 1, 4, "right");
    const bbmRh = scaleFingerings("bbm", 1, 4, "right");
    const asmSeq = asmNotes.map((n) => asmRh[canon(n)]);
    const bbmSeq = bbmNotes.map((n) => bbmRh[canon(n)]);
    expect(asmSeq).toEqual([2, 1, 2, 3, 1, 2, 3, 4]);
    expect(bbmSeq).toEqual(asmSeq);
  });
});

describe("multi-octave tiling reuses the scale's own starting finger", () => {
  it("C major 2 octaves: octave join is a thumb, only the top note is 5", () => {
    const notes = scale("C", "major", 2, 4);
    const f = scaleFingerings("C", 2, 4, "right");
    const seq = notes.map((n) => f[canon(n)]);
    expect(seq).toEqual([1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5]);
  });
  it("F# major 2 octaves: octave join continues on 2 (NOT a forced thumb)", () => {
    const notes = scale(KEY_META.Fs.tonic, "major", 2, 4, true);
    const f = scaleFingerings("Fs", 2, 4, "right");
    const seq = notes.map((n) => f[canon(n)]);
    expect(seq[7]).toBe(2); // 8th note (octave) restarts on the scale's own first finger
    expect(seq[seq.length - 1]).toBe(2); // final top note = seq[7] = 2
  });
});

describe("tuck-point derivation (the 'bring your thumb up' cue)", () => {
  it("tuckIndices finds RH thumb returns", () => {
    expect(tuckIndices([1, 2, 3, 1, 2, 3, 4, 5], "right")).toEqual([3]);
    expect(tuckIndices([1, 2, 3, 4, 1, 2, 3, 4], "right")).toEqual([4]); // F major
    expect(tuckIndices([2, 3, 4, 1, 2, 3, 1, 2], "right")).toEqual([3, 6]); // F#
  });
  it("tuckIndices finds LH cross-overs (long finger up right after thumb)", () => {
    expect(tuckIndices([5, 4, 3, 2, 1, 3, 2, 1], "left")).toEqual([5]); // C: 1->3 after deg 5
    expect(tuckIndices([4, 3, 2, 1, 4, 3, 2, 1], "left")).toEqual([4]); // B: 1->4 after deg 4
  });
  it("tuckDegrees + tuckCue surface the canonical first move", () => {
    expect(tuckDegrees("C", "right")).toEqual([3]);
    expect(tuckCue("C", "right")).toBe("thumb tucks under after the 3rd note");
    expect(tuckCue("F", "right")).toBe("thumb tucks under after the 4th note");
    expect(tuckCue("C", "left")).toBe("3rd finger crosses over the thumb after the 5th note");
    expect(tuckCue("B", "left")).toBe("4th finger crosses over the thumb after the 4th note");
  });
  it("tuckNotesFor returns the actual SPN scale notes at tuck positions", () => {
    const notes = scale("C", "major", 1, 4);
    // C major RH tuck after degree 3 → index 3 → F4.
    expect(tuckNotesFor(notes, "C", "right")).toEqual(["F4"]);
  });
});

describe("fingeringsForKey aligns flat notes to the keyboard's sharp SPN", () => {
  it("Eb major's notes map onto the keyboard's D#/etc. ids", () => {
    const notes = scale("Eb", "major", 1, 4, true); // Eb F G Ab Bb C D Eb
    const f = fingeringsForKey(notes, "Eb", "right");
    expect(f["D#4"]).toBe(3); // Eb4 keyed as D#4; Eb major RH starts on 3
    expect(Object.keys(f).every((k) => /^[A-G]#?-?\d+$/.test(k))).toBe(true);
  });
});

describe("hasCanonicalFingering is now true for ALL 24 keys", () => {
  it("covers every KeyId", () => {
    for (const key of Object.keys(KEY_META) as KeyId[]) {
      expect(hasCanonicalFingering(key), key).toBe(true);
    }
  });
});
