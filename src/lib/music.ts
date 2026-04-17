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
  Bb: { name: "B♭ major", tonic: "A#", mode: "major", sharpsFlats: "♭2", relative: "gm"  },
  Eb: { name: "E♭ major", tonic: "D#", mode: "major", sharpsFlats: "♭3", relative: "cm"  },
  Ab: { name: "A♭ major", tonic: "G#", mode: "major", sharpsFlats: "♭4", relative: "fm"  },
  Db: { name: "D♭ major", tonic: "C#", mode: "major", sharpsFlats: "♭5", relative: "bbm" },
  Gb: { name: "G♭ major", tonic: "F#", mode: "major", sharpsFlats: "♭6", relative: "ebm" },
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
  bbm:{ name: "B♭ minor", tonic: "A#", mode: "minor", sharpsFlats: "♭5", relative: "Db" },
  ebm:{ name: "E♭ minor", tonic: "D#", mode: "minor", sharpsFlats: "♭6", relative: "Gb" },
};

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

export function scale(tonic: string, mode: KeyMode, octaves = 1, startOct = 4): string[] {
  const steps = mode === "major" ? MAJOR_STEPS : NATURAL_MINOR_STEPS;
  const startMidi = pitchMidi(tonic + startOct);
  const out: string[] = [midiToSpn(startMidi)];
  let cur = startMidi;
  for (let o = 0; o < octaves; o++) {
    for (const s of steps) {
      cur += s;
      out.push(midiToSpn(cur));
    }
  }
  return out;
}

export function triad(tonic: string, quality: "maj" | "min" | "dim" | "aug", oct = 4): string[] {
  const rootMidi = pitchMidi(tonic + oct);
  const third = quality === "maj" || quality === "aug" ? 4 : 3;
  const fifth = quality === "aug" ? 8 : quality === "dim" ? 6 : 7;
  return [midiToSpn(rootMidi), midiToSpn(rootMidi + third), midiToSpn(rootMidi + fifth)];
}

// Map roman-numeral progressions to chord tones in a given key.
// Supports: I ii iii IV V vi vii° (major) and i iiø III iv v VI VII (minor)
export function progressionChords(key: KeyId, romans: string[], oct = 4): string[][] {
  const meta = KEY_META[key];
  const tonicMidi = pitchMidi(meta.tonic + oct);
  const majSteps = [0, 2, 4, 5, 7, 9, 11];
  const minSteps = [0, 2, 3, 5, 7, 8, 10];
  const steps = meta.mode === "major" ? majSteps : minSteps;
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
    const third = info.quality === "maj" || info.quality === "aug" ? 4 : 3;
    const fifth = info.quality === "aug" ? 8 : info.quality === "dim" ? 6 : 7;
    const tones = [midiToSpn(rootMidi), midiToSpn(rootMidi + third), midiToSpn(rootMidi + fifth)];
    if (r === "V7") tones.push(midiToSpn(rootMidi + 10));
    return tones;
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

// Pentatonic scale tones (for improv layer).
export function pentatonic(tonic: string, mode: KeyMode, oct = 4): string[] {
  const rootMidi = pitchMidi(tonic + oct);
  const intervals = mode === "major" ? [0, 2, 4, 7, 9, 12] : [0, 3, 5, 7, 10, 12];
  return intervals.map((i) => midiToSpn(rootMidi + i));
}
