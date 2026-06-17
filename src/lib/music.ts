// Small music-theory helpers. No deps.

import type { KeyId, KeyMode } from "./types";

export const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1] as const; // W W H W W W H
export const NATURAL_MINOR_STEPS = [2, 1, 2, 2, 1, 2, 2] as const;
export const HARMONIC_MINOR_STEPS = [2, 1, 2, 2, 1, 3, 1] as const;

export const KEY_META: Record<KeyId, { name: string; tonic: string; mode: KeyMode; sharpsFlats: string; relative: KeyId }> = {
  C:  { name: "C major",  tonic: "C",  mode: "major", sharpsFlats: "♮", relative: "am"  },
  G:  { name: "G major",  tonic: "G",  mode: "major", sharpsFlats: "♯1", relative: "em"  },
  D:  { name: "D major",  tonic: "D",  mode: "major", sharpsFlats: "♯2", relative: "bm"  },
  A:  { name: "A major",  tonic: "A",  mode: "major", sharpsFlats: "♯3", relative: "fsm" },
  E:  { name: "E major",  tonic: "E",  mode: "major", sharpsFlats: "♯4", relative: "csm" },
  B:  { name: "B major",  tonic: "B",  mode: "major", sharpsFlats: "♯5", relative: "gsm" },
  Fs: { name: "F♯ major", tonic: "F#", mode: "major", sharpsFlats: "♯6", relative: "dsm" },
  Cs: { name: "C♯ major", tonic: "C#", mode: "major", sharpsFlats: "♯7", relative: "asm" },
  F:  { name: "F major",  tonic: "F",  mode: "major", sharpsFlats: "♭1", relative: "dm"  },
  Bb: { name: "B♭ major", tonic: "Bb", mode: "major", sharpsFlats: "♭2", relative: "gm"  },
  Eb: { name: "E♭ major", tonic: "Eb", mode: "major", sharpsFlats: "♭3", relative: "cm"  },
  Ab: { name: "A♭ major", tonic: "Ab", mode: "major", sharpsFlats: "♭4", relative: "fm"  },
  Db: { name: "D♭ major", tonic: "Db", mode: "major", sharpsFlats: "♭5", relative: "bbm" },
  Gb: { name: "G♭ major", tonic: "Gb", mode: "major", sharpsFlats: "♭6", relative: "ebm" },
  am: { name: "A minor",  tonic: "A",  mode: "minor", sharpsFlats: "♮",  relative: "C"  },
  em: { name: "E minor",  tonic: "E",  mode: "minor", sharpsFlats: "♯1", relative: "G"  },
  bm: { name: "B minor",  tonic: "B",  mode: "minor", sharpsFlats: "♯2", relative: "D"  },
  fsm:{ name: "F♯ minor", tonic: "F#", mode: "minor", sharpsFlats: "♯3", relative: "A"  },
  csm:{ name: "C♯ minor", tonic: "C#", mode: "minor", sharpsFlats: "♯4", relative: "E"  },
  gsm:{ name: "G♯ minor", tonic: "G#", mode: "minor", sharpsFlats: "♯5", relative: "B"  },
  dsm:{ name: "D♯ minor", tonic: "D#", mode: "minor", sharpsFlats: "♯6", relative: "Fs" },
  asm:{ name: "A♯ minor", tonic: "A#", mode: "minor", sharpsFlats: "♯7", relative: "Cs" },
  dm: { name: "D minor",  tonic: "D",  mode: "minor", sharpsFlats: "♭1", relative: "F"  },
  gm: { name: "G minor",  tonic: "G",  mode: "minor", sharpsFlats: "♭2", relative: "Bb" },
  cm: { name: "C minor",  tonic: "C",  mode: "minor", sharpsFlats: "♭3", relative: "Eb" },
  fm: { name: "F minor",  tonic: "F",  mode: "minor", sharpsFlats: "♭4", relative: "Ab" },
  bbm:{ name: "B♭ minor", tonic: "Bb", mode: "minor", sharpsFlats: "♭5", relative: "Db" },
  ebm:{ name: "E♭ minor", tonic: "Eb", mode: "minor", sharpsFlats: "♭6", relative: "Gb" },
};

// True when a key's signature uses flats (so its scale/triad/progression and
// staff accidentals should be spelled with flats, never sharp enharmonics).
// Reads the canonical `sharpsFlats` field: a flat key starts with the ♭ glyph.
// C major / A minor (♮, zero accidentals) prefer sharps by convention.
export function keyPrefersFlats(key: KeyId): boolean {
  return KEY_META[key].sharpsFlats.startsWith("♭");
}

// Circle of fifths, majors outer / minors inner — clockwise starting at C.
export const CIRCLE_MAJORS: KeyId[] = ["C", "G", "D", "A", "E", "B", "Fs", "Db", "Ab", "Eb", "Bb", "F"];
export const CIRCLE_MINORS: KeyId[] = ["am", "em", "bm", "fsm", "csm", "gsm", "dsm", "bbm", "fm", "cm", "gm", "dm"];

export function noteIndex(note: string): number {
  // Accept "C", "C#", "Db" — no octave
  const n = note.replace(/\d+$/, "");
  const map: Record<string, number> = {
    C:0, "B#":0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, Fb:4, F:5, "E#":5,
    "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11, Cb:11,
  };
  return map[n] ?? 0;
}

export function noteName(idx: number, preferFlats = false): string {
  const sharp = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const flat = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
  return (preferFlats ? flat : sharp)[((idx % 12) + 12) % 12];
}

export function pitchMidi(note: string): number {
  // note like "C4", "D#5", "Bb3"
  const m = note.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!m) return 60;
  const letter = m[1].toUpperCase();
  const accidental = m[2];
  const oct = parseInt(m[3], 10);
  const base: Record<string, number> = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  let idx = base[letter];
  if (accidental === "#") idx += 1;
  if (accidental === "b") idx -= 1;
  return (oct + 1) * 12 + idx;
}

export function midiToSpn(midi: number, preferFlats = false): string {
  const oct = Math.floor(midi / 12) - 1;
  return noteName(midi % 12, preferFlats) + oct;
}

// ─────────────────── letter-aware diatonic spelling ───────────────────
// A diatonic scale uses each of the seven letters A–G exactly once. Spelling
// note-by-note from the tonic's LETTER (not from a fixed flat/sharp enharmonic
// table) is what lets flat keys spell Cb / Fb correctly — Gb major is
// Gb Ab Bb Cb Db Eb F Gb, not "...B Db..." (which the enharmonic table produced,
// since its flat array has B/E and never Cb/Fb).

const LETTER_ORDER = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Spell a target pitch class with a SPECIFIC letter, choosing the accidental
 *  (b / bb / # / ## / natural) that maps that letter to the pitch. Used so each
 *  diatonic degree keeps its own letter (the rule that gives Cb/Fb). */
function spellWithLetter(letter: string, targetPc: number): string {
  const natural = LETTER_PC[letter];
  let diff = ((targetPc - natural) % 12 + 12) % 12; // 0..11 semitones above natural
  if (diff > 6) diff -= 12; // choose the nearest direction (-1 = flat, +1 = sharp)
  if (diff === 0) return letter;
  if (diff === 1) return letter + "#";
  if (diff === 2) return letter + "##";
  if (diff === -1) return letter + "b";
  if (diff === -2) return letter + "bb";
  return letter; // unreachable for diatonic scales
}

/** The letter-spelled scale degree names (no octave) for a tonic + mode, walking
 *  the letters A–G in order from the tonic letter so each is used once. Pure. */
export function spelledScaleNames(tonic: string, mode: KeyMode): string[] {
  const steps = mode === "major" ? MAJOR_STEPS : NATURAL_MINOR_STEPS;
  const tonicLetter = tonic[0].toUpperCase();
  const startMidi = pitchMidi(tonic + "4");
  const names: string[] = [spellWithLetter(tonicLetter, startMidi % 12)];
  let pc = startMidi % 12;
  let letterIdx = LETTER_ORDER.indexOf(tonicLetter as (typeof LETTER_ORDER)[number]);
  for (const s of steps) {
    pc = (pc + s) % 12;
    letterIdx = (letterIdx + 1) % 7;
    names.push(spellWithLetter(LETTER_ORDER[letterIdx], pc));
  }
  return names; // 8 entries, first === last letter+accidental
}

export function scale(tonic: string, mode: KeyMode, octaves = 1, startOct = 4, _preferFlats = false): string[] {
  // Spell the degrees letter-by-letter from the tonic (each letter A–G once),
  // which is correct for EVERY key — flats spell Cb/Fb, sharps spell F#, and the
  // flat-vs-sharp choice is driven entirely by the (correctly-spelled) tonic, so
  // the legacy `preferFlats` hint is no longer needed (kept for call-site compat).
  const steps = mode === "major" ? MAJOR_STEPS : NATURAL_MINOR_STEPS;
  const names = spelledScaleNames(tonic, mode); // 8 degree names (octave inclusive)
  let cur = pitchMidi(tonic + startOct);
  const out: string[] = [];
  for (let o = 0; o < octaves; o++) {
    for (let i = 0; i < steps.length; i++) {
      out.push(names[i] + (Math.floor(cur / 12) - 1));
      cur += steps[i];
    }
  }
  out.push(names[0] + (Math.floor(cur / 12) - 1)); // final octave note
  return out;
}

// Spell a TERTIAN chord (stacked thirds) by letter: the root keeps its letter,
// each successive chord tone steps the letter by 2 (a third) and is spelled to
// the target pitch — so Cb major spells Cb Eb Gb (not B D# F#), and a 7th adds
// the next letter up. `semis` are semitone intervals above the root (e.g. maj
// triad [0,4,7]). Octaves attach by tracking absolute MIDI. Pure.
function spellTertianChord(rootName: string, rootMidi: number, semis: number[]): string[] {
  const rootLetter = rootName.replace(/[#b]+$/, "")[0].toUpperCase();
  const rootLetterIdx = LETTER_ORDER.indexOf(rootLetter as (typeof LETTER_ORDER)[number]);
  return semis.map((s, i) => {
    const midi = rootMidi + s;
    // i-th chord tone sits a third (2 letters) above the previous one.
    const letter = LETTER_ORDER[(rootLetterIdx + 2 * i) % 7];
    const oct = Math.floor(midi / 12) - 1;
    return spellWithLetter(letter, midi % 12) + oct;
  });
}

const TRIAD_SEMIS: Record<"maj" | "min" | "dim" | "aug", number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
};

export function triad(tonic: string, quality: "maj" | "min" | "dim" | "aug", oct = 4, _preferFlats = false): string[] {
  const rootMidi = pitchMidi(tonic + oct);
  // Spell from the tonic letter so flat-key triads (incl. Cb) read correctly;
  // preferFlats is implied by the tonic spelling (kept for call-site compat).
  return spellTertianChord(tonic, rootMidi, TRIAD_SEMIS[quality]);
}

// Map roman-numeral progressions to chord tones in a given key.
// Supports: I ii iii IV V vi vii° (major) and i iiø III iv v VI VII (minor)
export function progressionChords(key: KeyId, romans: string[], oct = 4): string[][] {
  const meta = KEY_META[key];
  const tonicMidi = pitchMidi(meta.tonic + oct);
  const majSteps = [0, 2, 4, 5, 7, 9, 11];
  const minSteps = [0, 2, 3, 5, 7, 8, 10];
  const steps = meta.mode === "major" ? majSteps : minSteps;
  // Spelled degree roots (each letter once) so a chord built on, say, the IV of
  // Gb (Cb) keeps the Cb letter instead of collapsing to B.
  const degreeRoots = spelledScaleNames(meta.tonic, meta.mode); // 8 (octave inclusive)
  const romanMap: Record<string, { degree: number; quality: "maj" | "min" | "dim" | "aug" }> = meta.mode === "major"
    ? {
        I:  { degree: 0, quality: "maj" },
        ii: { degree: 1, quality: "min" },
        iii:{ degree: 2, quality: "min" },
        IV: { degree: 3, quality: "maj" },
        V:  { degree: 4, quality: "maj" },
        V7: { degree: 4, quality: "maj" }, // 7 added below
        vi: { degree: 5, quality: "min" },
        "vii°":{ degree: 6, quality: "dim" },
      }
    : {
        i:  { degree: 0, quality: "min" },
        "iiø":{ degree: 1, quality: "dim" },
        "ii°":{ degree: 1, quality: "dim" },
        III:{ degree: 2, quality: "maj" },
        iv: { degree: 3, quality: "min" },
        v:  { degree: 4, quality: "min" },
        V:  { degree: 4, quality: "maj" }, // harmonic minor V
        V7: { degree: 4, quality: "maj" },
        VI: { degree: 5, quality: "maj" },
        VII:{ degree: 6, quality: "maj" },
      };

  return romans.map((r) => {
    const info = romanMap[r] ?? { degree: 0, quality: "maj" };
    const rootMidi = tonicMidi + steps[info.degree];
    const rootName = degreeRoots[info.degree]; // letter-correct degree spelling
    const semis = [...TRIAD_SEMIS[info.quality]];
    if (r === "V7") semis.push(10); // add the minor 7th as a fourth chord tone
    return spellTertianChord(rootName, rootMidi, semis);
  });
}

// Short english description of a roman numeral in context of a key.
export function romansToEnglish(key: KeyId, romans: string[]): string {
  const meta = KEY_META[key];
  return romans.map((r) => {
    const info: Record<string, string> = {
      I: meta.tonic, ii: "ii", iii: "iii", IV: "IV", V: "V", V7: "V7", vi: "vi", "vii°": "vii°",
      i: meta.tonic.toLowerCase() + "m", "iiø": "ii°", "ii°": "ii°", III: "III", iv: "iv", v: "v", VI: "VI", VII: "VII",
    };
    return info[r] ?? r;
  }).join("–");
}

// Pentatonic scale tones (for improv layer). Spelled letter-correct by pulling
// the relevant diatonic degrees from the spelled scale (so flat keys read flats,
// incl. Cb). Major pentatonic = degrees 1 2 3 5 6; minor = 1 3 4 5 7.
export function pentatonic(tonic: string, mode: KeyMode, oct = 4, _preferFlats = false): string[] {
  const names = spelledScaleNames(tonic, mode); // 8 (degree 0..6 + octave at 7)
  const rootMidi = pitchMidi(tonic + oct);
  const intervals = mode === "major" ? [0, 2, 4, 7, 9, 12] : [0, 3, 5, 7, 10, 12];
  const degreeOf = mode === "major" ? [0, 1, 2, 4, 5, 0] : [0, 2, 3, 4, 6, 0];
  return intervals.map((semi, i) => {
    const midi = rootMidi + semi;
    return names[degreeOf[i]] + (Math.floor(midi / 12) - 1);
  });
}
