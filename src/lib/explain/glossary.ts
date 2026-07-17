// Soul-First Learning (V4) — the GLOSSARY.
//
// Every musical term that can appear in the UI gets one GlossaryEntry so a
// TermChip can open a plain-language explainer card with four sections:
//   WHAT  — one jargon-free sentence (`what`)
//   HEAR  — a concrete Tone.js demo (`hear`, an async fn wired to audio.ts)
//   SEE   — where it sits on the instrument (`seeKind` + seeNotes/Shape/Text)
//   WHY   — why it matters for sounding good (`why`)
//
// Pure data + async `hear` callbacks. No DOM. P-C (UI) consumes `lookupTerm`.
//
// `hear` callbacks must call ensureAudio() before any Tone.js play helper so the
// AudioContext is unlocked by the user's tap. They use the helpers in
// `src/lib/audio.ts` (playSequence / playChord / playProgression / playCadence /
// playBend / playVibrato / playMutedChug). Note names are Scientific Pitch
// Notation. `seeNotes` (SPN) feed the Keyboard; `seePositions` (string/fret dots)
// feed the Fretboard — a guitar pitch maps to several fretboard spots, so the
// honest view is authored positions, not a note→fret guess; `seeChordShape`
// (6-el lowE..highE, -1 muted / 0 open / n fret) feeds ChordDiagram.

import {
  ensureAudio,
  playBend,
  playChord,
  playInterval,
  playMutedChug,
  playProgression,
  playSequence,
  playSticking,
  playVibrato,
} from "../audio";
import type { FretPosition, StickingCell } from "../types";
import { AM_PENT_BOX1, AM_BLUES_BOX1 } from "../guitar/scaleShapes";
// Reuse the ONE drums sticking interpreter so a glossary "hear" plays the exact
// rudiment the curriculum teaches (no re-authored, drifting stickings).
import { drumsFocusFor } from "../drums/focus";

export type SeeKind = "fretboard" | "keyboard" | "chord-diagram" | "text";

// The SEE payload — WHAT to draw plus its data. An entry carries one inline as
// its primary/default view and MAY override it per instrument (seeByInstrument)
// for shared concepts that live on both a keyboard and a fretboard.
export interface GlossarySee {
  seeKind: SeeKind;
  seeNotes?: string[]; // SPN — keyboard highlight
  seePositions?: FretPosition[]; // fretboard dots (string/fret) — the honest guitar view
  seeChordShape?: number[]; // for chord-diagram (lowE..highE, -1 = muted)
  seeText?: string; // for seeKind: "text"
}

export interface GlossaryEntry extends GlossarySee {
  id: string; // "power-chord", "g-major", "tonic"
  title: string; // "Power Chords"
  aliases: string[]; // for the inline text scanner: ["power chord", "5 chord", "rock chord"]
  what: string; // 1 sentence, zero jargon
  why: string; // 1 sentence on why it matters for sounding good
  hear: () => Promise<void>; // calls ensureAudio() then audio.ts helpers
  instrument?: "guitar" | "piano" | "both"; // omit = both
  // Per-instrument SEE override for a shared concept: when the active instrument
  // has a variant here it replaces the primary SEE, so a piano improvisation
  // lesson shows a keyboard while guitar keeps the fretboard box.
  seeByInstrument?: Partial<Record<"piano" | "guitar", GlossarySee>>;
}

// Small helper so every `hear` unlocks audio before playing.
async function hear(fn: () => Promise<void>): Promise<void> {
  await ensureAudio();
  await fn();
}

// Drums demo patterns for glossary `hear` (annotated so the "R"/"L" literals type
// as StickingCell, not widened string). Percussion — no pitch.
const DEMO_SINGLES: StickingCell[] = [
  { hand: "R", accent: true }, { hand: "L" }, { hand: "R" }, { hand: "L" },
];
const DEMO_LOUD_SOFT: StickingCell[] = [
  { hand: "R", accent: true }, { hand: "R" }, { hand: "R", accent: true }, { hand: "R" },
];
const DEMO_ROLL: StickingCell[] = [
  { hand: "R", accent: true }, { hand: "L" }, { hand: "R" }, { hand: "L" },
  { hand: "R" }, { hand: "L" }, { hand: "R" }, { hand: "L" },
];
const DEMO_SIXTEENTHS: StickingCell[] = Array.from({ length: 16 }, (_, i) => ({
  hand: (i % 2 === 0 ? "R" : "L") as "R" | "L",
  accent: i % 4 === 0,
}));
// The Moeller whip as a demo: one accent then two taps (down / tap / up).
const DEMO_MOELLER: StickingCell[] = [
  { hand: "R", accent: true }, { hand: "R" }, { hand: "R" },
];

// ── The GLOSSARY ──────────────────────────────────────────────────────────
// Guitar-first ship set (the stated pain) + the fundamentals it leans on. The
// ship set is the 18 terms the explain system needs to be useful immediately;
// the fundamentals (note/scale/chord/key/bpm/bar/etc.) back them so a chip on a
// fundamental term is never dead. Ordered roughly fundamental → advanced.

export const GLOSSARY: GlossaryEntry[] = [
  // ---- Fundamentals (Cluster 1: sound + instrument) ----
  {
    id: "note",
    title: "Note",
    aliases: ["pitch", "tone"],
    what: "A single musical sound with a specific highness or lowness, named by a letter A to G.",
    why: "Every melody, chord, and scale is built from notes; their names are the alphabet of music.",
    hear: () => hear(() => playSequence(["C4", "A4"], { noteDurationSec: 1 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "A4"],
  },
  {
    id: "open-string",
    title: "Open String",
    aliases: ["open note", "open strings"],
    what: "A guitar string played without pressing down any fret.",
    why: "Open strings ring fuller and anchor many famous riffs and chords.",
    hear: () => hear(() => playSequence(["E2", "A2", "D3", "G3", "B3", "E4"], { noteDurationSec: 0.45 })),
    seeKind: "fretboard",
    // All six strings played open (fret 0) — the six named open strings.
    seePositions: [
      { string: 1, fret: 0, label: "E" }, { string: 2, fret: 0, label: "A" },
      { string: 3, fret: 0, label: "D" }, { string: 4, fret: 0, label: "G" },
      { string: 5, fret: 0, label: "B" }, { string: 6, fret: 0, label: "e" },
    ],
    instrument: "guitar",
  },
  {
    id: "tab",
    title: "Tab",
    aliases: ["tablature", "guitar tab"],
    what: "Six lines for six strings, with numbers for frets, so you can play songs without reading music.",
    why: "Tab opens the entire internet of guitar music; it is the guitar player's cheat code.",
    hear: () => hear(() => playSequence(["E2", "E2", "G2", "E2", "A2", "G2"], { noteDurationSec: 0.32 })),
    seeKind: "text",
    seeText: "e|---------------------|\nB|---------------------|\nG|---------------------|\nD|---------------------|\nA|-------------5-3-----|\nE|-0-0-3-0-----------0-|",
    instrument: "guitar",
  },
  {
    id: "tab-rhythm",
    title: "Tab Rhythm",
    aliases: ["tab rhythm", "rhythm reading"],
    what: "Timing layered onto tab, showing how long each note lasts.",
    why: "Rhythm is what makes a riff actually sound like the song.",
    hear: () => hear(() => playSequence(["E2", "E2", "E2", "E2"], { noteDurationSec: 0.25 })),
    seeKind: "text",
    seeText: "Each tab number sits under a rhythm stem: long held notes vs short clipped ones.",
    instrument: "guitar",
  },
  {
    id: "staff",
    title: "Staff",
    aliases: ["stave", "the staff", "grand staff"],
    what: "The five lines written music lives on; a note's position shows its pitch.",
    why: "Reading the staff unlocks sheet music and lead sheets.",
    hear: () => hear(() => playSequence(["E4", "G4", "B4", "D5", "F5"], { noteDurationSec: 0.5 })),
    seeKind: "text",
    seeText: "Treble clef lines bottom to top: E G B D F. Spaces: F A C E.",
  },
  {
    id: "bpm",
    title: "BPM",
    aliases: ["tempo", "speed", "metronome", "beats per minute"],
    what: "Beats per minute: how fast the music goes, with higher numbers meaning faster.",
    why: "A target BPM is an honest progress measure: clean at 70 beats sloppy at 120.",
    hear: () => hear(() => playSequence(["E4", "E4", "E4", "E4", "E4", "E4"], { noteDurationSec: 0.18 })),
    seeKind: "text",
    seeText: "A metronome ticking steadily, the number rising from 60 toward 120.",
  },
  {
    id: "bar",
    title: "Bar",
    aliases: ["measure", "bars"],
    what: "A group of (usually four) beats that repeats as the basic unit of musical time.",
    why: "Bars let you follow a song and change chords on time.",
    hear: () => hear(() => playProgression([["A3", "E4", "A4"], ["D3", "A3", "D4"]], { chordDurationSec: 1.6 })),
    seeKind: "text",
    seeText: "Vertical bar lines on the staff split the music into equal beat groups.",
  },

  // ---- Scales (Cluster 2) ----
  {
    id: "interval",
    title: "Interval",
    aliases: ["intervals", "distance between notes", "the gap between two notes"],
    what: "The distance in pitch between two notes — the building block under every melody and chord.",
    why: "Naming intervals by ear lets you work out melodies and harmonies without sheet music.",
    hear: () => hear(() => playInterval("C4", "G4")),
    seeKind: "keyboard",
    seeNotes: ["C4", "G4"],
  },
  {
    id: "scale",
    title: "Scale",
    aliases: ["scales", "the notes in a key"],
    what: "An ordered set of notes that sound good together and give a key its character.",
    why: "A scale is the palette you improvise from; stay in it and your playing sounds intentional.",
    hear: () => hear(() => playSequence(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"])),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  },
  {
    id: "major-scale",
    title: "Major Scale",
    aliases: ["major", "the happy scale", "do re mi", "do-re-mi"],
    what: "The bright, stable, resolved scale most people call the happy scale.",
    why: "It is the foundation everything else in music makes sense against.",
    hear: () => hear(() => playSequence(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"])),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  },
  {
    id: "minor-scale",
    title: "Minor Scale",
    aliases: ["minor", "natural minor", "the sad scale"],
    what: "A darker scale built from the same notes as a major scale but starting on a different note.",
    why: "Most emotional and cinematic music lives in minor.",
    hear: () => hear(() => playSequence(["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"])),
    seeKind: "keyboard",
    seeNotes: ["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"],
  },
  {
    id: "c-major",
    title: "C Major",
    aliases: ["c major", "key of c", "c major scale"],
    what: "The home scale played entirely on the white keys, from C up to the next C.",
    why: "C major has no sharps or flats, so it is the clearest place to learn how a key feels.",
    hear: () => hear(() => playSequence(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"])),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  },
  {
    id: "g-major",
    title: "G Major",
    aliases: ["g major", "key of g", "g major scale", "one sharp"],
    what: "The major scale starting on G, with one sharp (F#).",
    why: "G major sits perfectly under open guitar chords, so a huge amount of rock and folk lives here.",
    hear: () => hear(() => playSequence(["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"])),
    seeKind: "keyboard",
    seeNotes: ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
  },
  {
    id: "a-minor",
    title: "A Minor",
    aliases: ["a minor", "key of a minor", "a minor scale", "the sad shape"],
    what: "The minor scale starting on A, played on the white keys from A up to the next A.",
    why: "A minor shares all its notes with C major, so it is the easiest doorway into the darker, sadder sound.",
    hear: () => hear(() => playSequence(["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"])),
    seeKind: "keyboard",
    seeNotes: ["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"],
  },
  {
    id: "pentatonic",
    title: "Pentatonic Scale",
    aliases: ["pentatonic", "five note scale", "five-note scale", "the solo scale"],
    what: "A five-note scale with the clashing notes stripped out, so almost everything you play sounds good.",
    why: "It is forgiving and expressive, and it lives in nearly every rock, blues, and pop solo.",
    hear: () => hear(() => playSequence(["A4", "C5", "D5", "E5", "G5", "A5"])),
    seeKind: "fretboard",
    seePositions: AM_PENT_BOX1,
    seeByInstrument: { piano: { seeKind: "keyboard", seeNotes: ["A4", "C5", "D5", "E5", "G5", "A5"] } },
  },
  {
    id: "minor-pentatonic",
    title: "Minor Pentatonic",
    aliases: ["minor pentatonic", "minor pent", "box scale", "pentatonic box 1"],
    what: "The five-note minor scale most electric players learn first; it is naturally bluesy.",
    why: "It sits behind almost every rock and blues solo: five notes, infinite expression.",
    hear: () => hear(() => playSequence(["A4", "C5", "D5", "E5", "G5", "A5"])),
    seeKind: "fretboard",
    seePositions: AM_PENT_BOX1,
    instrument: "guitar",
  },
  {
    id: "pentatonic-box",
    title: "Pentatonic Box",
    aliases: ["pentatonic box", "box position", "box1", "box 1", "position"],
    what: "One of five fingering patterns covering a small patch of the neck, each connecting to the next.",
    why: "Learning the boxes one at a time gives you freedom over the whole fretboard.",
    hear: () => hear(() => playSequence(["A4", "C5", "D5", "E5", "G5", "A5"])),
    seeKind: "fretboard",
    seePositions: AM_PENT_BOX1,
    instrument: "guitar",
  },

  // ---- Chords (Cluster 3) ----
  {
    id: "chord",
    title: "Chord",
    aliases: ["chords", "shape", "voicing"],
    what: "Three or more notes played together that sound good as one stack.",
    why: "Chords are the harmonic foundation under every melody; a chord progression is basically a song.",
    hear: () => hear(() => playChord(["C4", "E4", "G4"])),
    seeKind: "keyboard",
    seeNotes: ["C4", "E4", "G4"],
  },
  {
    id: "triad",
    title: "Triad",
    aliases: ["triad", "three note chord", "three-note chord"],
    what: "The simplest chord: three notes stacked in a regular pattern.",
    why: "It is the fundamental unit of harmony, and where you first hear major versus minor.",
    hear: () => hear(() => playChord(["C4", "E4", "G4"])),
    seeKind: "keyboard",
    seeNotes: ["C4", "E4", "G4"],
  },
  {
    id: "major-vs-minor",
    title: "Major vs Minor",
    aliases: ["major vs minor", "happy vs sad", "bright vs dark", "minor key"],
    what: "Major sounds bright and stable, minor sounds darker; the whole difference is one note moving a half-step.",
    why: "It is the single most ear-trainable distinction in music.",
    hear: () => hear(async () => {
      await playChord(["A3", "C#4", "E4"]);
      await playChord(["A3", "C4", "E4"]);
    }),
    seeKind: "keyboard",
    seeNotes: ["A3", "C4", "E4"],
  },
  {
    id: "power-chord",
    title: "Power Chord",
    aliases: ["power chord", "power chords", "5 chord", "rock chord", "the rock chug"],
    what: "A raw two-note chord (a root and its fifth) with no happy or sad character, just power.",
    why: "It is the fundamental sound of rock, punk, and metal, and it is one shape you can slide anywhere.",
    hear: () => hear(async () => {
      await playMutedChug(["E2", "B2"], 4);
      await playMutedChug(["A2", "E3"], 4);
    }),
    seeKind: "chord-diagram",
    seeChordShape: [0, 2, -1, -1, -1, -1],
    instrument: "guitar",
  },
  {
    id: "barre-chord",
    title: "Barre Chord",
    aliases: ["barre chord", "bar chord", "moveable chord", "the shape that moves"],
    what: "Your index finger laid flat across the strings like a moveable capo, so one shape plays in any key.",
    why: "It unlocks every key, not just the handful that open chords reach.",
    hear: () => hear(() => playChord(["F2", "C3", "F3", "A3", "C4", "F4"])),
    seeKind: "chord-diagram",
    seeChordShape: [1, 3, 3, 2, 1, 1],
    instrument: "guitar",
  },
  {
    id: "capo",
    title: "Capo",
    aliases: ["capo", "key multiplier", "moveable nut"],
    what: "A clamp across all the strings at a fret — a moveable nut that raises every open shape by however many frets up you put it.",
    why: "One capo lets the 5 open shapes you already know play in every key, for near-zero new effort — the cheapest range on the guitar.",
    // The shape never changes — only the sounding key. Demo: a G-shape voicing
    // open (sounds G), then the SAME shape with a capo on fret 2 (sounds A).
    hear: () =>
      hear(async () => {
        await playChord(["G2", "B2", "D3", "G3", "B3", "G4"]); // G shape, open
        await playChord(["A2", "C#3", "E3", "A3", "C#4", "A4"]); // same shape, capo 2 → A
      }),
    seeKind: "chord-diagram",
    seeChordShape: [3, 2, 0, 0, 0, 3], // the open G shape — what the capo carries up the neck
    instrument: "guitar",
  },

  // ---- Keys, tonality, harmony (Cluster 4) ----
  {
    id: "key",
    title: "Key",
    aliases: ["key", "home key", "tonal center"],
    what: "The home base of a piece: which notes belong and what home sounds like.",
    why: "It is the single most useful concept for improvising and writing your own music.",
    hear: () => hear(() => playProgression([["C4", "E4", "G4"], ["G3", "B3", "D4"], ["C4", "E4", "G4"]])),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  },
  {
    id: "tonic",
    title: "Tonic",
    aliases: ["tonic", "home note", "root of the key", "the 1"],
    what: "The note a key is built around and the place the music rests.",
    why: "Every melody is a journey away from and back to the tonic.",
    hear: () => hear(() => playProgression([["E3", "G#3", "B3"], ["A3", "C4", "E4"]])),
    seeKind: "keyboard",
    seeNotes: ["A3"],
  },
  {
    id: "chord-progression",
    title: "Chord Progression",
    aliases: ["chord progression", "progression", "changes", "chord loop"],
    what: "A repeating sequence of chords that forms a song's harmonic backbone.",
    why: "Most pop uses just a handful, so recognizing them lets you learn songs fast.",
    hear: () => hear(() => playProgression([
      ["A3", "C4", "E4"],
      ["F3", "A3", "C4"],
      ["C4", "E4", "G4"],
      ["G3", "B3", "D4"],
    ])),
    seeKind: "keyboard",
    seeNotes: ["A3", "C4", "E4"],
  },
  {
    id: "circle-of-fifths",
    title: "Circle of Fifths",
    aliases: ["circle of fifths", "fifths", "the circle", "key wheel", "wheel of fifths"],
    what: "A wheel of the 12 major keys (minors inside) arranged so each step clockwise jumps up a fifth — and neighbours on the wheel are the keys that sound at home together.",
    why: "It shows at a glance which chords belong together: the three keys touching yours are its I, IV and V, and the one tucked inside is its vi — and those four chords are most pop songs.",
    hear: () => hear(() => playProgression([
      ["C4", "E4", "G4"], // I  — C
      ["G3", "B3", "D4"], // V  — G (clockwise neighbour)
      ["A3", "C4", "E4"], // vi — A minor (inner neighbour)
      ["F3", "A3", "C4"], // IV — F (counter-clockwise neighbour)
    ])),
    seeKind: "keyboard",
    seeNotes: ["C4", "F4", "G4", "A4"], // the roots of C's four neighbours: I, IV, V, vi
  },
  {
    id: "pop-formula",
    title: "The Pop Formula",
    aliases: ["pop formula", "the four chords", "i-v-vi-iv", "four chord song"],
    what: "A four-chord loop that sits under hundreds of pop songs.",
    why: "Learn it and you can play a recognizable song within weeks.",
    hear: () => hear(() => playProgression([
      ["A3", "C4", "E4"],
      ["F3", "A3", "C4"],
      ["C4", "E4", "G4"],
      ["G3", "B3", "D4"],
    ])),
    seeKind: "keyboard",
    seeNotes: ["A3", "C4", "E4", "G4"],
  },
  {
    id: "12-bar-blues",
    title: "12-Bar Blues",
    aliases: ["12 bar blues", "twelve bar blues", "blues form", "12-bar"],
    what: "A repeating 12-bar pattern that is the spine of blues and early rock.",
    why: "Learn it and you can jam with practically any blues, rock, or jazz musician.",
    hear: () => hear(() => playProgression([
      ["A2", "E3"],
      ["D3", "A3"],
      ["A2", "E3"],
      ["E3", "B3"],
    ])),
    seeKind: "fretboard",
    // Blues in A: the I, IV and V chord roots (A, D, E) on the low strings.
    seePositions: [
      { string: 1, fret: 5, root: true, label: "I" },
      { string: 2, fret: 5, label: "IV" },
      { string: 2, fret: 7, label: "V" },
    ],
    seeByInstrument: { piano: { seeKind: "keyboard", seeNotes: ["A4", "D5", "E5"] } },
  },
  {
    id: "ii-v-i",
    title: "ii-V-I",
    aliases: ["ii v i", "two five one", "2-5-1", "jazz turnaround"],
    what: "The 2nd, 5th, and 1st chords of a key played in a row: the most common phrase in jazz.",
    why: "It is the skeleton of nearly every jazz standard.",
    hear: () => hear(() => playProgression([
      ["D3", "F3", "A3", "C4"],
      ["G3", "B3", "D4", "F4"],
      ["C4", "E4", "G4", "B4"],
    ])),
    seeKind: "keyboard",
    seeNotes: ["D4", "F4", "A4", "C5"],
  },

  // ---- Guitar technique (Cluster 5) ----
  {
    id: "fretting",
    title: "Fretting",
    aliases: ["fretting", "pressing", "left-hand technique", "clean notes"],
    what: "Pressing a string against a fret with your fingertip so the note rings cleanly.",
    why: "It is the foundation of every guitar note actually sounding musical instead of buzzing.",
    hear: () => hear(() => playSequence(["A2", "A2", "A2"], { noteDurationSec: 0.4 })),
    seeKind: "fretboard",
    // One clean fretted note: A on the low E string, 5th fret.
    seePositions: [{ string: 1, fret: 5, root: true }],
    instrument: "guitar",
  },
  {
    id: "down-picking",
    title: "Down-Picking",
    aliases: ["down picking", "downstrokes", "down-picking"],
    what: "Picking every note with a downward stroke only, for a heavier, consistent attack.",
    why: "It is the sound of metal rhythm and it builds rock-solid pick control first.",
    hear: () => hear(() => playMutedChug(["E2", "B2"], 8)),
    seeKind: "text",
    seeText: "All down arrows: every note struck on the way down.",
    instrument: "guitar",
  },
  {
    id: "alternate-picking",
    title: "Alternate Picking",
    aliases: ["alternate picking", "down-up picking", "down up picking"],
    what: "Picking in a continuous down-up-down-up motion: the efficient way to play fast.",
    why: "It is the engine behind every fast melody and solo.",
    hear: () => hear(() => playSequence(["A2", "B2", "C3", "D3", "A2", "B2", "C3", "D3"], { noteDurationSec: 0.2 })),
    seeKind: "text",
    seeText: "Arrows alternating down, up, down, up across the notes.",
    instrument: "guitar",
  },
  {
    id: "strumming",
    title: "Strumming",
    aliases: ["strumming", "strum pattern", "strum", "right-hand rhythm"],
    what: "Sweeping the pick across the strings to sound a chord in a rhythmic pattern.",
    why: "It is the most direct route from knowing some chords to actually playing songs.",
    hear: () => hear(() => playProgression([
      ["E2", "B2", "E3", "G3", "B3", "E4"],
      ["E2", "B2", "E3", "G3", "B3", "E4"],
    ], { chordDurationSec: 0.5 })),
    seeKind: "chord-diagram",
    seeChordShape: [0, 2, 2, 1, 0, 0],
    instrument: "guitar",
  },
  {
    id: "palm-muting",
    title: "Palm Muting",
    aliases: ["palm muting", "palm mute", "pm", "the chug", "muted crunch"],
    what: "Resting the edge of your picking hand near the bridge to get a muffled, chugging tone.",
    why: "It is the core texture of punk, metal, and hard rock; it turns loud into alive.",
    hear: () => hear(async () => {
      await playMutedChug(["E2", "B2"], 4);
      await playChord(["E2", "B2", "E3"], { durationSec: 0.8 });
    }),
    seeKind: "fretboard",
    // The E5 power chord you chug: open low E (root) + B on the A string, fret 2.
    seePositions: [{ string: 1, fret: 0, root: true }, { string: 2, fret: 2 }],
    instrument: "guitar",
  },
  {
    id: "hammer-on",
    title: "Hammer-On",
    // "legato" moved to its own instrument-neutral entry (batch-3b): a piano
    // articulation lesson saying "legato" must chip to the general term, not this
    // guitar-only technique. The no-shadow test forbids the alias in two places.
    aliases: ["hammer on", "hammer-on", "h"],
    what: "Sounding a higher note by hammering a finger down onto the string, without picking again.",
    why: "It makes melodies flow and is the key to smooth, connected blues and rock lines.",
    hear: () => hear(() => playBend("G4", "A4")),
    seeKind: "fretboard",
    // Hammer a whole step up on the high e string: A (fret 5) → B (fret 7).
    seePositions: [{ string: 6, fret: 5 }, { string: 6, fret: 7, label: "H" }],
    instrument: "guitar",
  },
  {
    id: "pull-off",
    title: "Pull-Off",
    aliases: ["pull off", "pull-off", "p", "po"],
    what: "Pulling a finger off the string to sound the lower note, without picking again.",
    why: "It is the descending half of legato, the partner to the hammer-on.",
    hear: () => hear(() => playBend("A4", "G4")),
    seeKind: "fretboard",
    // Pull off a whole step down on the high e string: B (fret 7) → A (fret 5).
    seePositions: [{ string: 6, fret: 7 }, { string: 6, fret: 5, label: "P" }],
    instrument: "guitar",
  },
  {
    id: "slide",
    title: "Slide",
    aliases: ["slide", "gliding", "glide"],
    what: "Moving a fretting finger along the string while keeping it pressed down, so the pitch glides.",
    why: "It adds a vocal, bluesy quality almost instantly.",
    hear: () => hear(() => playBend("D5", "E5")),
    seeKind: "fretboard",
    // Slide up a whole step on the B string, 5th fret (E) → 7th (F#).
    seePositions: [{ string: 5, fret: 5 }, { string: 5, fret: 7, label: "/" }],
    instrument: "guitar",
  },
  {
    id: "string-bending",
    title: "String Bending",
    aliases: ["string bending", "bend", "bending", "blues bend", "make a note cry"],
    what: "Pushing a string sideways to raise its pitch smoothly, the way a singer slides up to a note.",
    why: "It is the blues voice: the crying quality that makes an electric solo sound human.",
    hear: () => hear(() => playBend("E5", "F#5")),
    seeKind: "fretboard",
    // The signature blues bend: push the D on the G string (fret 7) up a whole
    // step toward E, the way a singer slides up to a note.
    seePositions: [{ string: 4, fret: 7, label: "↑" }],
    instrument: "guitar",
  },
  {
    id: "vibrato",
    title: "Vibrato",
    aliases: ["vibrato", "note shake", "oscillation", "make a note breathe"],
    what: "A small, repeated bend-and-release that gives a held note a warm, pulsating wobble.",
    why: "It makes a held note sing and is the signature of expressive playing.",
    hear: () => hear(() => playVibrato("E5", 6)),
    seeKind: "fretboard",
    // A held note to shake: the tonic A on the high e string, fret 5, wobbled.
    seePositions: [{ string: 6, fret: 5, root: true, label: "~" }],
    instrument: "guitar",
  },
  {
    id: "riff",
    title: "Riff",
    aliases: ["riff", "main riff", "the hook"],
    what: "A short, repeated guitar phrase that is the backbone of a song.",
    why: "It is the entry point to real playing, and the first thing you can show people.",
    hear: () => hear(() => playSequence(["E2", "E2", "G2", "E2", "A2", "G2"], { noteDurationSec: 0.3 })),
    seeKind: "fretboard",
    // A low-string riff on the low E: open E (root), G (fret 3), A (fret 5).
    seePositions: [
      { string: 1, fret: 0, root: true }, { string: 1, fret: 3 }, { string: 1, fret: 5 },
    ],
    instrument: "guitar",
  },
  {
    id: "lick",
    title: "Lick",
    aliases: ["lick", "phrase", "vocabulary"],
    what: "A short, memorized melodic phrase you use as a building block in solos.",
    why: "Licks are the sentences of improvisation: things you actually have to say.",
    hear: () => hear(() => playSequence(["E5", "G5", "E5", "D5", "C5", "A4"], { noteDurationSec: 0.22 })),
    seeKind: "fretboard",
    // A short descending lick inside Box 1: C5, A4, G4, E4, D4.
    seePositions: [
      { string: 6, fret: 8 }, { string: 6, fret: 5, root: true },
      { string: 5, fret: 8 }, { string: 5, fret: 5 }, { string: 4, fret: 7 },
    ],
    instrument: "guitar",
  },
  {
    id: "syncopation",
    title: "Syncopation",
    aliases: ["syncopation", "off-beat accents", "off beat accents", "push rhythm"],
    what: "Accenting notes between the main beats to give a rhythm push and pull.",
    why: "It makes a rhythm feel alive and human instead of mechanical.",
    hear: () => hear(() => playMutedChug(["E2", "B2"], 6)),
    seeKind: "text",
    seeText: "The off-beats highlighted: D - x - DU instead of steady downstrokes.",
    instrument: "guitar",
  },

  // ---- Concepts + expression (Cluster 7) ----
  {
    id: "improvisation",
    title: "Improvisation",
    aliases: ["improvisation", "improv", "soloing", "noodling"],
    what: "Making up music in the moment, guided by feel and the chords underneath.",
    why: "It is where playing becomes your own voice; it is a skill you build, not a talent you are born with.",
    hear: () => hear(async () => {
      await playProgression([
        ["A3", "C4", "E4"],
        ["F3", "A3", "C4"],
        ["C4", "E4", "G4"],
        ["G3", "B3", "D4"],
      ]);
      await playSequence(["A4", "C5", "D5", "E5", "D5", "C5", "A4"], { noteDurationSec: 0.24 });
    }),
    seeKind: "fretboard",
    // Guitar: the Am pentatonic box you solo over. Piano: the same scale on keys.
    seePositions: AM_PENT_BOX1,
    seeByInstrument: { piano: { seeKind: "keyboard", seeNotes: ["A4", "C5", "D5", "E5", "G5", "A5"] } },
  },
  {
    id: "phrasing",
    title: "Phrasing",
    aliases: ["phrasing", "musical sentences", "call and answer"],
    what: "Grouping notes into sentences with beginnings, endings, and silences.",
    why: "Space is music; phrasing is what makes a line sound composed instead of random.",
    hear: () => hear(async () => {
      await playSequence(["A4", "C5", "D5", "C5"], { noteDurationSec: 0.25 });
      await playSequence(["E5", "D5", "C5", "A4"], { noteDurationSec: 0.25 });
    }),
    seeKind: "text",
    seeText: "A short question phrase, a breath of silence, then an answering phrase.",
  },
  {
    id: "three-moods",
    title: "Playing With Mood",
    aliases: ["playing with mood", "mood playing", "touch and timing", "expression", "interpretation"],
    what: "Changing the emotional character of the same notes through touch, timing, and loudness.",
    why: "It is proof that music lives in the player, not just the notes.",
    hear: () => hear(() => playProgression([
      ["A3", "C4", "E4"],
      ["F3", "A3", "C4"],
      ["C4", "E4", "G4"],
      ["G3", "B3", "D4"],
    ])),
    seeKind: "text",
    seeText: "The same chord chart, marked three ways: tender, restless, resigned.",
  },
  {
    id: "ear-training",
    title: "Ear Training",
    aliases: ["ear training", "listening", "the echo game", "pitch matching"],
    what: "Learning to recognize sounds by ear, like telling major from minor or singing a melody back.",
    why: "It lets you figure out songs without tab and improvise musically.",
    hear: () => hear(async () => {
      await playChord(["C4", "E4", "G4"]);
      await playChord(["C4", "Eb4", "G4"]);
    }),
    seeKind: "keyboard",
    seeNotes: ["A3", "C4", "E4"],
  },

  {
    id: "transcribing",
    title: "Transcribing",
    aliases: ["transcribing", "playing by ear", "figuring out a song", "transcribe"],
    what: "Working out the notes of a song by ear alone, with no sheet music or tab.",
    why: "Songs you love become yours without waiting for anyone to write out a chart.",
    hear: () => hear(() => playSequence(["C4", "C4", "D4", "C4", "F4", "E4"], { noteDurationSec: 0.32 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4"],
  },
  {
    id: "lead-sheet",
    title: "Lead Sheet",
    aliases: ["lead sheet", "chord chart", "fake book page"],
    what: "A simple score with just the melody line and chord symbols written above it.",
    why: "It is the professional shorthand that lets you play any song from one page.",
    hear: () => hear(() => playProgression([
      ["G3", "B3", "D4"],
      ["E3", "G3", "B3"],
      ["C4", "E4", "G4"],
      ["D3", "F#3", "A3"],
    ])),
    seeKind: "text",
    seeText: "One melody line on the staff with chord symbols (G, Em, C, D) floating above it.",
  },

  // ---- Piano technique (Cluster 6, the foundations) ----
  {
    id: "arm-weight",
    title: "Arm Weight",
    aliases: ["arm weight", "weight transfer", "arm-drop"],
    what: "Using the relaxed weight of your arm to press keys, instead of tense fingers.",
    why: "It is the foundation of good tone and endurance; tension kills both.",
    hear: () => hear(() => playSequence(["C4", "D4", "E4", "F4", "G4"], { noteDurationSec: 0.45 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4"],
    instrument: "piano",
  },
  {
    id: "five-finger-pattern",
    title: "Five-Finger Pattern",
    aliases: ["five finger pattern", "five-finger exercise", "five finger exercise"],
    what: "Each finger playing one adjacent note (C-D-E-F-G) to build even, independent movement.",
    why: "It builds the coordination that scales and real pieces depend on.",
    hear: () => hear(() => playSequence(["C4", "D4", "E4", "F4", "G4", "F4", "E4", "D4", "C4"], { noteDurationSec: 0.3 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4"],
    instrument: "piano",
  },
  {
    id: "arpeggio",
    title: "Arpeggio",
    aliases: ["arpeggio", "broken chord", "rolled chord"],
    what: "The notes of a chord played one at a time in sequence, so the chord ripples.",
    why: "It gives harmony texture and movement, and it is a core accompaniment style.",
    hear: () => hear(async () => {
      await playChord(["C4", "E4", "G4", "C5"], { durationSec: 0.6 });
      await playSequence(["C4", "E4", "G4", "C5"], { noteDurationSec: 0.3 });
    }),
    seeKind: "keyboard",
    seeNotes: ["C4", "E4", "G4", "C5"],
    instrument: "piano",
  },
  {
    id: "sustain-pedal",
    title: "Sustain Pedal",
    aliases: ["sustain pedal", "damper pedal", "the pedal"],
    what: "The right pedal, which lifts the dampers so notes keep ringing after you let go of the keys.",
    why: "It creates the lush, flowing sound of ballads and classical music.",
    hear: () => hear(() => playChord(["C4", "E4", "G4"], { durationSec: 2 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "E4", "G4"],
    instrument: "piano",
  },
  {
    id: "dynamics",
    title: "Dynamics",
    aliases: ["dynamics", "soft and loud", "touch control", "touch"],
    what: "Variation in loudness, which on piano you set by how hard you press the keys.",
    why: "It is the primary vehicle for emotion: touch is feeling.",
    hear: () => hear(() => playSequence(["C4", "E4", "G4", "C5", "G4", "E4", "C4"], { noteDurationSec: 0.3 })),
    seeKind: "text",
    seeText: "A dynamic arc: soft, swelling to loud, then back down.",
    instrument: "piano",
  },

  // ---- Quick-reference appendix (text-only labels) ----
  {
    id: "tier",
    title: "Tier",
    aliases: ["tier", "skill tier"],
    what: "A grouping of skills by difficulty, from setup (T0) up to expression and reward (T3).",
    why: "It lets you see where you are without feeling overwhelmed by the whole map at once.",
    hear: () => hear(() => playSequence(["C4", "E4", "G4", "C5"], { noteDurationSec: 0.35 })),
    seeKind: "text",
    seeText: "A sunrise color ramp from the earliest tier to the most advanced.",
  },
  {
    id: "xp",
    title: "XP",
    aliases: ["xp", "experience points"],
    what: "Points you earn for practicing, which raise your level over time.",
    why: "It makes invisible day-to-day progress visible.",
    hear: () => hear(() => playSequence(["C5", "E5", "G5"], { noteDurationSec: 0.2 })),
    seeKind: "text",
    seeText: "A progress bar filling toward the next level.",
  },
  {
    id: "streak",
    title: "Streak",
    aliases: ["streak", "practice streak", "days in a row"],
    what: "The number of days in a row you have practiced, which resets if you miss a day.",
    why: "It builds the single most important habit: showing up.",
    hear: () => hear(() => playSequence(["C5", "D5", "E5"], { noteDurationSec: 0.2 })),
    seeKind: "text",
    seeText: "A flame that grows as your consecutive practice days add up.",
  },
  {
    id: "unlock",
    title: "Unlock",
    aliases: ["unlock", "capability unlock"],
    what: "A real musical capability you gain when you complete a skill, not just a badge.",
    why: "It reframes practice as steadily gaining things you can actually do.",
    hear: () => hear(() => playChord(["C4", "E4", "G4", "C5"], { durationSec: 1 })),
    seeKind: "text",
    seeText: "A card describing the new thing you can now play.",
  },

  // ---- Batch 3a — missing fundamentals (rhythm, harmony, pedal, gear) ----
  {
    id: "pulse",
    title: "Pulse",
    aliases: ["pulse", "steady pulse", "the beat", "steady beat", "quarter note", "quarter notes"],
    what: "The steady, even beat running underneath a piece of music, like a heartbeat you can tap along to.",
    why: "Every rhythm you ever play sits on top of this pulse. Lose it and nothing else locks into place.",
    hear: () => hear(() => playSequence(["C4", "C4", "C4", "C4", "C4", "C4"], { noteDurationSec: 0.5 })),
    seeKind: "text",
    seeText: "A steady row of evenly spaced dots ticking forward, like the second hand of a clock.",
  },
  {
    id: "downbeat",
    title: "Downbeat",
    aliases: ["downbeat", "strong beat", "beat one", "count one"],
    what: "The first, heaviest beat in a group of counted beats, the one your foot naturally wants to stomp on.",
    why: "Finding beat one tells you where a new group of counted beats starts, which is usually where a chord change or a phrase begins.",
    hear: () => hear(async () => {
      await playChord(["C4", "E4", "G4"], { durationSec: 0.4 });
      await playSequence(["E4", "E4", "E4"], { noteDurationSec: 0.4 });
    }),
    seeKind: "text",
    seeText: "Four counted beats, 1, 2, 3, 4, with beat 1 shown bold and slightly louder than the rest.",
  },
  {
    id: "subdivision",
    title: "Subdivision",
    aliases: ["subdivision", "eighth note", "eighth notes", "eighth-note subdivision", "counting eighths", "subdividing"],
    what: "Splitting each beat in half so you count '1 and 2 and 3 and 4 and' instead of just '1, 2, 3, 4'.",
    why: "It is how you place notes that fall between the main beats, the skill behind almost every real rhythm pattern you will ever play.",
    hear: () => hear(() => playSequence(["C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"], { noteDurationSec: 0.25 })),
    seeKind: "text",
    seeText: "Each of four counted beats split into two even ticks: 1 and, 2 and, 3 and, 4 and, eight evenly spaced pulses in total.",
  },
  {
    id: "octave",
    title: "Octave",
    aliases: ["octave", "an octave up", "an octave down", "octave apart", "an octave", "octave higher", "octave lower", "same note higher"],
    what: "Two notes that share the same letter name where one sounds exactly double, or half, the pitch of the other, like one C and the next C up.",
    why: "Moving a note up or down an octave keeps its letter name the same, so you can find that same note again elsewhere without it becoming a different note.",
    hear: () => hear(() => playSequence(["C4", "C5"], { noteDurationSec: 0.6 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "C5"],
  },
  {
    id: "inversion",
    title: "Chord Inversion",
    aliases: ["inversion", "chord inversion", "inversions", "first inversion", "second inversion", "nearest inversion"],
    what: "The same three notes of a chord, rearranged so a different note sits on the bottom instead of the root.",
    why: "It lets you move between chords by shifting one or two notes instead of jumping your whole hand to a new spot.",
    hear: () => hear(async () => {
      await playChord(["C4", "E4", "G4"]);
      await playChord(["E4", "G4", "C5"]);
    }),
    seeKind: "keyboard",
    seeNotes: ["E4", "G4", "C5"],
  },
  {
    id: "root-position",
    title: "Root Position",
    aliases: ["root position", "root chord", "the root spelling"],
    what: "A chord played with its root, the note the chord is named after, sitting as the lowest note.",
    why: "It is the default way most people first learn a chord, and the starting point every inversion is measured against.",
    hear: () => hear(() => playChord(["C4", "E4", "G4"])),
    seeKind: "keyboard",
    seeNotes: ["C4", "E4", "G4"],
  },
  {
    id: "voice-leading",
    title: "Voice Leading",
    aliases: ["voice leading", "smooth voice leading", "leading the voices"],
    what: "Choosing which inversion of the next chord to play so its notes move the shortest possible distance from the chord you are already holding.",
    why: "It is what makes a chord change sound connected and calm instead of like your whole hand is leaping to a brand new spot every time.",
    hear: () => hear(() => playProgression([["A3", "C4", "E4"], ["A3", "C4", "F4"]])),
    seeKind: "keyboard",
    seeNotes: ["A3", "C4", "F4"],
  },
  {
    id: "syncopated-pedaling",
    title: "Syncopated Pedaling",
    aliases: ["syncopated pedaling", "pedal change", "catch pedal", "pedal timing"],
    what: "Lifting the sustain pedal and pressing it straight back down in one quick flick exactly when a new chord lands, so the old chord clears and the new one gets caught.",
    why: "It is what makes chord changes flow into each other with no gap and no muddy overlap, the technique behind almost every smooth ballad.",
    hear: () => hear(async () => {
      await playChord(["C4", "E4", "G4"], { durationSec: 1.8 });
      await playChord(["F4", "A4", "C5"], { durationSec: 1.8 });
    }),
    seeKind: "keyboard",
    seeNotes: ["C4", "E4", "G4", "F4", "A4", "C5"],
    instrument: "piano",
  },
  {
    id: "accompaniment",
    title: "Accompaniment",
    // "comping" / "comp" (the jazz shorthand for rhythmic chordal backing) point at
    // this explainer rather than a near-duplicate entry — same concept, one card.
    aliases: ["accompaniment", "backing pattern", "left-hand pattern", "accompanying", "comping", "comp"],
    what: "The musical support that plays under a melody, usually a chord or a moving bass pattern in the other hand.",
    why: "Good accompaniment is what makes a song feel alive instead of a tune floating alone with nothing underneath it.",
    hear: () => hear(async () => {
      await playChord(["C4", "E4", "G4"], { durationSec: 1 });
      await playSequence(["C4", "E4", "G4", "C5"], { noteDurationSec: 0.3 });
    }),
    seeKind: "keyboard",
    seeNotes: ["C4", "E4", "G4"],
  },
  {
    id: "root-fifth-pattern",
    title: "Root-Fifth Pattern",
    aliases: ["root-fifth pattern", "root and fifth", "open fifth bass", "fifth bass"],
    what: "A left-hand pattern that plays just the root note and its fifth, leaving out the middle note of the chord.",
    why: "It gives an open, spacious sound and is the simplest way to make the left hand move instead of holding a fist of notes.",
    hear: () => hear(() => playSequence(["C3", "G3", "C3", "G3"], { noteDurationSec: 0.4 })),
    seeKind: "keyboard",
    seeNotes: ["C3", "G3"],
    instrument: "piano",
  },
  {
    id: "octave-bass",
    title: "Octave Bass",
    aliases: ["octave bass", "bouncing octaves", "octaves in the bass"],
    what: "A left-hand pattern that bounces between a low note and the same note one octave higher.",
    why: "It gives a driving, rolling low end that powers ballads and rock piano parts alike.",
    hear: () => hear(() => playSequence(["C3", "C4", "C3", "C4"], { noteDurationSec: 0.35 })),
    seeKind: "keyboard",
    seeNotes: ["C3", "C4"],
    instrument: "piano",
  },

  // ---- Batch 3b — hands-together + articulation (piano) ----
  {
    id: "hands-together",
    title: "Hands Together",
    aliases: ["hands together", "hands-together", "both hands", "both hands at once"],
    what: "Playing with your left and right hands at the same time, whether they do the same thing (like a scale in both hands) or two different jobs (a chord under a melody).",
    why: "It is the moment piano becomes piano. Nearly every real piece needs both hands moving together, so this is the coordination the whole instrument stands on.",
    hear: () => hear(async () => {
      await playChord(["C3", "E3", "G3", "C4", "E4", "G4"], { durationSec: 1.4 });
      await playSequence(["C4", "D4", "E4", "F4", "G4"], { noteDurationSec: 0.3 });
    }),
    seeKind: "keyboard",
    seeNotes: ["C3", "E3", "G3", "C4", "E4", "G4"],
    instrument: "piano",
  },
  {
    id: "articulation",
    title: "Articulation",
    aliases: ["articulation", "connected vs detached", "note shaping"],
    what: "How you shape each note: whether you hold it smooth and connected into the next, or clip it short so there is a little silence before the next.",
    why: "Same notes, same rhythm, but articulation changes the whole feeling: smooth sounds tender and flowing, detached sounds crisp and playful. It is one of your main expression levers.",
    hear: () => hear(async () => {
      await playSequence(["C4", "D4", "E4", "F4", "G4"], { noteDurationSec: 0.5, gapSec: 0 });
      await playSequence(["C4", "D4", "E4", "F4", "G4"], { noteDurationSec: 0.18 });
    }),
    seeKind: "text",
    seeText: "The same five notes played twice: first slurred smoothly together, then clipped short and detached.",
    instrument: "piano",
  },
  {
    id: "legato",
    title: "Legato",
    aliases: ["legato", "smooth and connected", "connected notes", "hold each note"],
    what: "Playing notes smoothly connected, holding each one right up until the next begins so there is no gap of silence between them.",
    why: "It is the sound of a singing, flowing line, the way most melodies and ballads are meant to feel.",
    hear: () => hear(() => playSequence(["C4", "D4", "E4", "F4", "G4"], { noteDurationSec: 0.5, gapSec: 0 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4"],
    instrument: "piano",
  },
  {
    id: "staccato",
    title: "Staccato",
    aliases: ["staccato", "detached", "short and detached", "clipped notes"],
    what: "Playing notes short and detached, releasing each key almost the instant you press it so a little silence sits before the next note.",
    why: "It gives a crisp, light, bouncy feel, the opposite of smooth legato, and it is how you make a line sound playful or punchy.",
    hear: () => hear(() => playSequence(["C4", "D4", "E4", "F4", "G4"], { noteDurationSec: 0.16 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4"],
    instrument: "piano",
  },

  {
    id: "gain",
    title: "Gain",
    aliases: ["gain", "gain knob", "how hard the amp is pushed"],
    what: "The knob on an amp that controls how hard the signal is being pushed, which decides how much growl or distortion gets stacked into your tone.",
    why: "It is the one control that turns a clean chord into a driven one, completely separate from how loud you are playing.",
    hear: () => hear(async () => {
      await playChord(["E2", "B2", "E3"], { durationSec: 1 });
      await playMutedChug(["E2", "B2"], 8);
    }),
    seeKind: "text",
    seeText: "A single dial: turned low for a clear tone, turned high for a thick, growling one.",
    instrument: "guitar",
  },
  {
    id: "distortion",
    title: "Distortion",
    aliases: ["distortion", "overdrive", "driven tone", "drive knob", "fuzz"],
    what: "The thick, growling, slightly broken up sound an electric guitar makes when its signal is pushed harder than a clean amp can handle.",
    why: "It is the sound of rock, metal, and punk rhythm, and how much of it you get comes from the gain knob, not the volume knob.",
    hear: () => hear(() => playMutedChug(["E2", "B2"], 8)),
    seeKind: "text",
    seeText: "A clean note with a wall of buzzing harmonics stacked on top of it.",
    instrument: "guitar",
  },
  {
    id: "clean-tone",
    title: "Clean Tone",
    aliases: ["clean tone", "clean sound", "undistorted tone"],
    what: "The clear, undistorted sound an electric guitar makes when the gain knob is kept low, every note ringing true to what your hands actually played.",
    why: "Clean tone hides nothing, so it is the honest setting to practice on: any buzz or slip shows up instead of getting buried.",
    hear: () => hear(() => playChord(["E2", "B2", "E3"], { durationSec: 1.2 })),
    seeKind: "text",
    seeText: "A single ringing chord with no fuzz stacked on top of it.",
    instrument: "guitar",
  },
  {
    id: "pickup",
    title: "Pickup",
    aliases: ["pickup", "pickups", "pickup selector", "bridge pickup", "neck pickup"],
    what: "The small magnet under your strings that turns their vibration into the electric signal your amp hears, most electrics have two or three, chosen with a selector switch.",
    why: "The bridge pickup sounds brighter and sharper, the neck pickup sounds warmer and rounder, so the selector switch is a free tone change already wired into your guitar.",
    hear: () => hear(async () => {
      await playSequence(["E4", "G4", "B4"], { noteDurationSec: 0.4 });
      await playSequence(["E3", "G3", "B3"], { noteDurationSec: 0.4 });
    }),
    seeKind: "text",
    seeText: "A selector switch flicking between a bright bridge position and a warm neck position.",
    instrument: "guitar",
  },
  {
    id: "amp-volume",
    title: "Volume (Amp)",
    aliases: ["volume knob", "amp volume", "how loud the amp is"],
    what: "The knob on an amp that controls how loud its sound comes out of the speaker, separate from how much growl or distortion is baked into the tone.",
    why: "Mixing up volume with gain is the most common beginner mixup: turning up volume just makes the same tone louder, it never adds any growl on its own.",
    hear: () => hear(async () => {
      await playChord(["E2", "B2", "E3"], { durationSec: 0.6 });
      await playChord(["E2", "B2", "E3"], { durationSec: 0.6 });
    }),
    seeKind: "text",
    seeText: "A single dial: low toward quiet, high toward loud, with the tone itself unchanged.",
    instrument: "guitar",
  },
  {
    id: "octave-shape",
    title: "Octave Shape",
    aliases: ["octave shape", "octave finder", "find the octave", "two string two fret shape"],
    what: "A moveable shape on the guitar: from a note on the low E or A string, skip one string and add two frets to land on the exact same note, one octave higher.",
    why: "It turns any single note you already know into a fast route to that same note higher up the neck, instead of a whole new fretboard you have to memorize from scratch.",
    hear: () => hear(() => playSequence(["A2", "A3"], { noteDurationSec: 0.6 })),
    seeKind: "fretboard",
    // The octave shape: A on the low E (fret 5) → skip a string, +2 frets → A on
    // the D string (fret 7), one octave up.
    seePositions: [
      { string: 1, fret: 5, root: true, label: "A" }, { string: 3, fret: 7, label: "8" },
    ],
    instrument: "guitar",
  },
  {
    id: "natural-note",
    title: "Natural Note",
    aliases: ["natural note", "natural notes", "natural letter", "natural letter names"],
    what: "One of the seven plain letter names, A through G, with no sharp or flat attached.",
    why: "Learning the natural names first gives you a solid, uncluttered map of the neck before you add the sharps and flats that sit between them.",
    hear: () => hear(() => playSequence(["C4", "D4", "E4", "F4", "G4", "A4", "B4"], { noteDurationSec: 0.4 })),
    seeKind: "keyboard",
    seeNotes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4"],
  },
  {
    id: "noise-control",
    title: "Noise Control",
    aliases: ["noise control", "string muting", "muting idle strings", "damping", "left hand damping", "quiet strings", "kill the squeal"],
    what: "Resting your fretting hand and picking hand lightly on the strings you are not playing so they stay silent while gain is on.",
    why: "It is the difference between a clean driven solo and a mess of humming, squealing strings behind every note.",
    hear: () => hear(async () => {
      await playSequence(["A4"], { noteDurationSec: 1 });
      await playMutedChug(["E2", "A2", "D3", "G3", "B3"], 2);
    }),
    seeKind: "fretboard",
    // One note rings clean (A on the high e, fret 5) while every other string
    // stays silenced — the whole point of noise control under gain.
    seePositions: [{ string: 6, fret: 5, root: true }],
    instrument: "guitar",
  },
  {
    id: "fmaj7",
    title: "Fmaj7",
    aliases: ["Fmaj7", "F major 7", "F major seventh", "the friendly F"],
    what: "A brighter, dreamier cousin of the plain F chord, built from the notes F, A, C, and E, that needs no barre at all.",
    why: "It sounds finished as its own chord in real songs, and it is the exact hand shape your first barre chord grows out of.",
    hear: () => hear(() => playChord(["F3", "A3", "C4", "E4"], { durationSec: 1.2 })),
    seeKind: "chord-diagram",
    seeChordShape: [-1, -1, 3, 2, 1, 0],
    instrument: "guitar",
  },
  {
    id: "partial-barre",
    title: "Partial Barre",
    aliases: ["partial barre", "mini barre", "half barre", "small F", "baby F", "easy F", "two-string barre"],
    what: "Laying one finger flat across just a couple of strings, often called the small F, instead of all six strings of a full barre chord.",
    why: "It builds the exact flat finger strength and feel a full six string barre needs, on two easy strings before you ever try all six.",
    hear: () => hear(() => playChord(["F3", "A3", "C4", "F4"], { durationSec: 1 })),
    seeKind: "chord-diagram",
    seeChordShape: [-1, -1, 3, 2, 1, 1],
    instrument: "guitar",
  },

  // ---- Batch 3b (guitar breadth) ----
  {
    id: "blues-note",
    title: "The Blues Note",
    aliases: ["blues note", "blue note", "flat five", "flat fifth", "flatted fifth"],
    what: "One extra note, the flat five (written ♭5), that sits a half step below the fifth note of the scale, giving the tense, gritty flavour of the blues.",
    why: "Dropped into the minor pentatonic box you already know, this single note is the highest-value note in blues and rock lead, the tension that makes a line sound bluesy instead of plain.",
    hear: () => hear(() => playSequence(["D4", "D#4", "E4"], { noteDurationSec: 0.5 })),
    seeKind: "fretboard",
    // Am Box 1 with the blue note (♭5) added on the A string, fret 6.
    seePositions: AM_BLUES_BOX1,
    instrument: "guitar",
  },
  {
    id: "blues-scale",
    title: "Blues Scale",
    aliases: ["blues scale", "minor blues scale", "six-note blues scale"],
    what: "The minor pentatonic scale with one extra note, the blues note, added in, giving a darker, greasier six-note scale.",
    why: "It is the sound of nearly every blues and rock solo, and you build it from a shape you already own just by adding one note.",
    hear: () => hear(() => playSequence(["A4", "C5", "D5", "D#5", "E5", "G5", "A5"])),
    seeKind: "fretboard",
    // The six-note blues scale: Am Box 1 plus the blue note (♭5) on the A string.
    seePositions: AM_BLUES_BOX1,
    instrument: "guitar",
  },
  {
    id: "half-step-bend",
    title: "Half-Step Bend",
    aliases: ["half-step bend", "half step bend", "semitone bend"],
    what: "A string bend that raises the pitch by just one fret's worth, the smallest common bend.",
    why: "It is actually the more common bend in real music, and its short travel makes it the easiest bend to land exactly in tune.",
    hear: () => hear(() => playBend("F#4", "G4")),
    seeKind: "fretboard",
    // A half-step bend on the B string, 7th fret (F#), pushed up one fret to G.
    seePositions: [{ string: 5, fret: 7, label: "½" }],
    instrument: "guitar",
  },
  {
    id: "unison-bend",
    title: "Unison Bend",
    aliases: ["unison bend", "unison bends"],
    what: "Bending one string up until it matches a note held on the string beside it, so two strings ring the exact same pitch as one thick note.",
    why: "It gives a fat, crying, vocal shout heard all over blues and rock lead, from Chuck Berry to Hendrix.",
    hear: () => hear(async () => {
      await playSequence(["E4"], { noteDurationSec: 0.5 });
      await playBend("D4", "E4");
    }),
    seeKind: "fretboard",
    // Unison bend: hold E on the B string (fret 5), bend D on the G string
    // (fret 7) up a whole step until both strings ring the same E.
    seePositions: [
      { string: 5, fret: 5, label: "=" }, { string: 4, fret: 7, label: "↑" },
    ],
    instrument: "guitar",
  },
  {
    id: "gallop",
    title: "The Gallop",
    aliases: ["gallop", "gallop rhythm", "palm-muted gallop", "galloping rhythm"],
    what: "A palm-muted rhythm of one long note then two quick ones on each beat, giving a tight, chugging, horse-hooves feel.",
    why: "It is the driving muted engine behind countless rock and metal riffs, the rhythm that turns power chords into forward motion.",
    hear: () => hear(() => playMutedChug(["E2", "B2"], 6)),
    seeKind: "text",
    seeText: "One long note then two quick ones on each beat, palm-muted: da, da-da, da, da-da, the chugging horse-hooves feel of metal rhythm.",
    instrument: "guitar",
  },

  // ---- Batch 3c — the chord-numbering system + the harmony vocab it leans on ----
  // Roman numerals are used from the very first lesson (I–IV–V in C) but were only
  // explained deep in the tree; this entry lets every I/IV/V/vi string chip to a
  // plain-language explainer. The title "Roman Numerals" is itself scanned, so the
  // phrase "Roman numerals" in prose chips without needing a bare-numeral alias
  // (single "I" is un-matchable — it collides with the English word and is < 3 chars).
  {
    id: "roman-numerals",
    title: "Roman Numerals",
    aliases: ["roman numeral", "chord numbers", "chord number", "scale-degree number", "scale-degree numbers", "numeral notation"],
    what: "A way of naming a chord by which step of the scale it is built on, written as a Roman numeral. A CAPITAL letter means a major chord and a small letter means a minor one, so I is the chord on step one and vi is the minor chord on step six.",
    why: "The numbers describe the pattern, not the exact notes, so the same numbered progression works in every key: learn I, IV, V once and you can play it in C, in G, anywhere.",
    hear: () => hear(() => playProgression([
      ["C4", "E4", "G4"], // I  — C major (capital = major)
      ["F3", "A3", "C4"], // IV — F major
      ["G3", "B3", "D4"], // V  — G major
      ["A3", "C4", "E4"], // vi — A minor (small = minor)
    ])),
    seeKind: "text",
    seeText: "The chords of C major, numbered: I = C, ii = Dm, iii = Em, IV = F, V = G, vi = Am. CAPITAL letters are major chords, small letters are minor.",
  },
  {
    id: "relative-minor",
    title: "Relative Minor",
    aliases: ["relative major", "relative key"],
    what: "A minor key that shares the exact same notes as a major key, just centred on a different home note: A minor is the relative minor of C major, the same white keys with a sadder home.",
    why: "Every major key comes with a relative minor for free, so learning one key hands you a second, darker key with no new notes to learn.",
    hear: () => hear(async () => {
      await playSequence(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]);
      await playSequence(["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"]);
    }),
    seeKind: "text",
    seeText: "C major and A minor use the exact same white keys. The only thing that changes is home: C for the major, A for its relative minor, three notes lower.",
  },
  {
    id: "cadence",
    title: "Cadence",
    aliases: ["cadences", "musical full stop", "chord ending"],
    what: "The chord or two that ends a musical phrase, the way a full stop or comma ends a sentence, telling your ear the phrase has arrived home or paused for breath.",
    why: "Cadences are how music breathes and resolves. Learn a few and you can make any progression sound finished instead of just stopping.",
    hear: () => hear(() => playProgression([
      ["G3", "B3", "D4"], // V
      ["C4", "E4", "G4"], // I — the phrase lands home
    ])),
    seeKind: "text",
    seeText: "The last chords of a phrase, like G landing on C, bringing your ear back home. The musical version of a full stop.",
  },
  {
    id: "seventh-chord",
    title: "Seventh Chord",
    // Word forms + the exact 7th symbols that appear in the tier-3 drills, so a
    // standalone "C7" / "Dm7" token chips (linkTerms needs whole-token boundaries;
    // an embedded "maj7" inside "Gmaj7" can't match, so the whole token is listed).
    // "Fmaj7" is deliberately absent — it owns its own dedicated entry.
    aliases: [
      "seventh chords", "dominant seventh", "major seventh", "minor seventh",
      "C7", "D7", "E7", "F7", "G7", "Am7", "Dm7", "Em7", "Cmaj7", "Gmaj7",
    ],
    what: "A four-note chord: an ordinary three-note chord with one more note stacked on top, the seventh, which adds colour and a gentle, leaning restlessness. Written with a 7, like G7, Dm7, or Cmaj7.",
    why: "That one extra note is the sound of jazz, soul, and blues. It turns a plain, settled chord into a richer one that leans forward and wants to move on.",
    hear: () => hear(async () => {
      await playChord(["C4", "E4", "G4"]);        // plain triad
      await playChord(["C4", "E4", "G4", "B4"]);  // Cmaj7 — add the major 7th
      await playChord(["C4", "E4", "G4", "Bb4"]); // C7 — the dominant 7th
    }),
    seeKind: "keyboard",
    seeNotes: ["C4", "E4", "G4", "Bb4"],
  },

  // ---- Drums (Stage A) — pad-first fundamentals. Text SEE (a pad has no
  //      keyboard/fretboard); percussion HEAR via playSticking. ----
  {
    id: "practice-pad",
    title: "Practice Pad",
    aliases: ["practice pad", "drum pad"],
    what: "A round rubber pad you hit with sticks — quiet, springy, and portable, so you can build your hands without a full kit or bothering anyone.",
    why: "Almost every drumming hand skill is built here first: its consistent, honest bounce is exactly what makes it the tool teachers reach for.",
    hear: () => hear(() => playSticking(DEMO_SINGLES, 90)),
    seeKind: "text",
    seeText: "A round pad and two sticks — where the hands learn to play before a kit ever gets involved.",
  },
  {
    id: "matched-grip",
    title: "Matched Grip",
    aliases: ["matched grip"],
    what: "Holding the stick the same way in both hands — the standard, symmetrical grip every pad learner starts with.",
    why: "One grip to learn instead of two, and it carries over to every drum and percussion instrument you might ever play.",
    hear: () => hear(() => playSticking(DEMO_SINGLES, 90)),
    seeKind: "text",
    seeText: "Both hands holding the sticks identically — palms down, a loose 'OK'-sign pinch, fingers curled softly underneath.",
  },
  {
    id: "fulcrum",
    title: "Fulcrum",
    aliases: ["fulcrum", "balance point"],
    what: "The pinch point about a third of the way up the stick, between the pad of your thumb and the side of your index finger, that the stick pivots around.",
    why: "It is the hinge every single stroke rotates on. Place it right and loose and the stick bounces for free; place it wrong and every note fights you.",
    hear: () => hear(() => playSticking(DEMO_SINGLES, 90)),
    seeKind: "text",
    seeText: "A loose 'OK'-sign pinch about a third up the stick — the one spot where a light tap makes it rebound on its own.",
  },
  {
    id: "rebound",
    title: "Rebound",
    aliases: ["rebound", "the rebound", "free stroke"],
    what: "The way the pad springs the stick back up on its own after you throw it down, exactly like dribbling a basketball — you push down, the surface returns it.",
    why: "Trusting the rebound instead of muscling every note is THE core drumming skill: it is where all your speed, quiet control, and stamina come from.",
    hear: () => hear(() => playSticking(DEMO_SINGLES, 96)),
    seeKind: "text",
    seeText: "Throw the stick down, do nothing, and let it bounce back near its starting height by itself.",
  },
  {
    id: "four-strokes",
    title: "The Four Strokes",
    aliases: ["four strokes", "the four strokes"],
    what: "Full, down, tap, and up — the same bounce played at four named heights. Full is loud into loud, down is loud into quiet, tap is quiet, up is quiet into ready.",
    why: "Every rhythm, accent, and groove is these four strokes in some order — once your hands know all four, playing loud then soft cleanly stops being a mystery.",
    hear: () => hear(() => playSticking(DEMO_LOUD_SOFT, 84)),
    seeKind: "text",
    seeText: "Loud, loud, soft, soft: the stick starting high for loud notes and low for quiet ones.",
  },
  {
    id: "rudiment",
    title: "Rudiment",
    aliases: ["rudiment", "rudiments"],
    what: "A short, named sticking pattern — like the single stroke roll (R L R L) — that acts as a building block for everything you play.",
    why: "Rudiments are the vocabulary of drumming: learn a handful cleanly at a target tempo and you can build real grooves and fills out of them.",
    hear: () => hear(() => playSticking(DEMO_ROLL, 120)),
    seeKind: "text",
    seeText: "A repeating sticking pattern (e.g. R L R L) drilled slow, then faster, until it is even and automatic.",
  },

  // ---- Drums (Stage B) — the rudiment + reading vocabulary of Tiers 1-3. ----
  {
    id: "single-stroke-roll",
    title: "Single Stroke Roll",
    aliases: ["single stroke roll", "single strokes", "single stroke"],
    what: "The simplest rudiment: you alternate hands, right left right left, one hit each — the pattern every other rudiment is built from.",
    why: "Almost everything you play breaks down into single strokes, so making both hands sound identical here is the foundation for every fill and fast pattern.",
    hear: () => hear(() => playSticking(drumsFocusFor("C").pattern, 100)),
    seeKind: "text",
    seeText: "R L R L R L R L — the hands alternating evenly, one hit at a time.",
  },
  {
    id: "double-stroke-roll",
    title: "Double Stroke Roll",
    aliases: ["double stroke roll", "double strokes", "double stroke"],
    what: "Two strokes per hand — R R L L — where the second stroke of each pair is the stick's own rebound, caught with the fingers.",
    why: "Doubles are the engine behind fast fills, rolls, and quiet ghost notes; letting the bounce play the second note is what makes speed feel easy.",
    hear: () => hear(() => playSticking(drumsFocusFor("G").pattern, 90)),
    seeKind: "text",
    seeText: "R R L L R R L L — two even hits per hand before switching.",
  },
  {
    id: "sixteenth-notes",
    title: "Sixteenth Notes",
    aliases: ["sixteenth notes", "sixteenths", "sixteenth note", "16th notes"],
    what: "Notes that split each beat into four even parts, counted '1 e & a' — twice as dense as eighth notes.",
    why: "Most busy grooves and quick fills live at this subdivision, so counting and playing sixteenths evenly is the door to real drum parts.",
    hear: () => hear(() => playSticking(DEMO_SIXTEENTHS, 300)),
    seeKind: "text",
    seeText: "Each beat split into four even ticks — 1 e & a, 2 e & a — sixteen hits in a bar.",
  },
  {
    id: "accent",
    title: "Accent",
    aliases: ["accent", "accents"],
    what: "A note played noticeably louder than the notes around it, marked with a '>' wedge above it.",
    why: "Placing a loud note exactly where you want it is the basis of groove and feel — it is how a flat, even pattern turns into music.",
    hear: () => hear(() => playSticking(DEMO_LOUD_SOFT, 84)),
    seeKind: "text",
    seeText: "One note standing out louder — a '>' over it — against quieter notes on either side.",
  },
  {
    id: "paradiddle",
    title: "Paradiddle",
    aliases: ["paradiddle", "single paradiddle", "paradiddles"],
    what: "A sticking that fuses singles and doubles — R L R R, L R L L — with the lead hand switching each time through.",
    why: "It is the most-used sticking in drumming; the doubled note lets you reset a hand to move a fill around the drums.",
    hear: () => hear(() => playSticking(drumsFocusFor("A").pattern, 100)),
    seeKind: "text",
    seeText: "R L R R, then L R L L — a single, a single, then a double, hands swapping lead.",
  },
  {
    id: "flam",
    title: "Flam",
    aliases: ["flam", "flams"],
    what: "A soft grace note played a hair before a louder main note from the other hand, heard as one thick note rather than two.",
    why: "Flams add weight — dropping one on a backbeat is the textbook way to make it hit harder and fuller.",
    hear: () => hear(() => playSticking(drumsFocusFor("F").pattern, 90)),
    seeKind: "text",
    seeText: "A tiny soft note tucked just before a loud one — two sticks, one thick sound.",
  },
  {
    id: "drag",
    title: "Drag (Ruff)",
    aliases: ["drag", "drags", "ruff"],
    what: "Two quick soft grace notes on one hand leading into a louder note on the other — a tiny 'brrp' before the main hit. Also called a ruff.",
    why: "The drag sits inside a dozen other patterns, and on its own it is the classic soft pickup into a fill or accented backbeat.",
    hear: () => hear(() => playSticking(drumsFocusFor("B").pattern, 90)),
    seeKind: "text",
    seeText: "Two soft grace notes, then a loud tap — a little rip of sound into the main note.",
  },
  {
    id: "five-stroke-roll",
    title: "Five Stroke Roll",
    aliases: ["five stroke roll", "five-stroke roll", "5 stroke roll"],
    what: "Two doubles capped by a single accent — R R L L R — a short counted roll that resolves into one loud hit.",
    why: "It is the classic 'roll into a hit' shape that ends fills and sets up crashes.",
    hear: () => hear(() => playSticking(drumsFocusFor("E").pattern, 100)),
    seeKind: "text",
    seeText: "R R L L R — two doubles, then one accented note that clearly tops the roll.",
  },
  {
    id: "buzz-roll",
    title: "Buzz Roll",
    aliases: ["buzz roll", "press roll", "multiple bounce roll", "buzz"],
    what: "A smooth sustained sound made by pressing each stroke into the pad so the stick buzzes many times, alternating hands.",
    why: "It is the texture behind crescendos, swells, and soft builds — a control-and-dynamics skill, not a speed one.",
    hear: () => hear(() => playSticking(drumsFocusFor("am").pattern, 90)),
    seeKind: "text",
    seeText: "Each stroke pressed so it buzzes, the hands overlapping into one continuous roll.",
  },
  {
    id: "moeller",
    title: "The Whip Stroke (Moeller)",
    aliases: ["moeller", "whip stroke", "moeller technique", "moeller method"],
    what: "A relaxed whipping arm motion that chains a down stroke, a rebound tap, and an up stroke into one flowing move, using gravity for speed and power.",
    why: "It is how drummers play fast and loud with little effort — but it is built on the four strokes, so it comes only once those are automatic.",
    hear: () => hear(() => playSticking(DEMO_MOELLER, 80)),
    seeKind: "text",
    seeText: "One accent, then two taps, in a single whipping motion — down, tap, up.",
  },
];

/**
 * Look up a glossary entry by id, exact title, or any alias (case-insensitive).
 * Returns undefined for unknown terms so a TermChip can gracefully degrade to
 * plain text rather than rendering a dead affordance.
 */
export function lookupTerm(query: string): GlossaryEntry | undefined {
  const q = query.toLowerCase().trim();
  return GLOSSARY.find(
    (e) =>
      e.id === q ||
      e.title.toLowerCase() === q ||
      e.aliases.some((a) => a.toLowerCase() === q),
  );
}
