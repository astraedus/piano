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
// Notation. `seeNotes` (SPN) feed Keyboard/Fretboard; `seeChordShape`
// (6-el lowE..highE, -1 muted / 0 open / n fret) feeds ChordDiagram.

import {
  ensureAudio,
  playBend,
  playChord,
  playInterval,
  playMutedChug,
  playProgression,
  playSequence,
  playVibrato,
} from "../audio";

export interface GlossaryEntry {
  id: string; // "power-chord", "g-major", "tonic"
  title: string; // "Power Chords"
  aliases: string[]; // for the inline text scanner: ["power chord", "5 chord", "rock chord"]
  what: string; // 1 sentence, zero jargon
  why: string; // 1 sentence on why it matters for sounding good
  hear: () => Promise<void>; // calls ensureAudio() then audio.ts helpers
  seeKind: "fretboard" | "keyboard" | "chord-diagram" | "text";
  seeNotes?: string[]; // scientific pitch for fretboard/keyboard highlight
  seeChordShape?: number[]; // for chord-diagram (lowE..highE, -1 = muted)
  seeText?: string; // for seeKind: "text"
  instrument?: "guitar" | "piano" | "both"; // omit = both
}

// Small helper so every `hear` unlocks audio before playing.
async function hear(fn: () => Promise<void>): Promise<void> {
  await ensureAudio();
  await fn();
}

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
    seeNotes: ["E2", "A2", "D3", "G3", "B3", "E4"],
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
    seeNotes: ["A4", "C5", "D5", "E5", "G5", "A5"],
  },
  {
    id: "minor-pentatonic",
    title: "Minor Pentatonic",
    aliases: ["minor pentatonic", "minor pent", "box scale", "pentatonic box 1"],
    what: "The five-note minor scale most electric players learn first; it is naturally bluesy.",
    why: "It sits behind almost every rock and blues solo: five notes, infinite expression.",
    hear: () => hear(() => playSequence(["A4", "C5", "D5", "E5", "G5", "A5"])),
    seeKind: "fretboard",
    seeNotes: ["A4", "C5", "D5", "E5", "G5", "A5"],
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
    seeNotes: ["A4", "C5", "D5", "E5", "G5", "A5"],
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
    seeNotes: ["E2", "A2", "D3"],
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
    seeNotes: ["A2"],
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
    seeNotes: ["E2", "B2"],
    instrument: "guitar",
  },
  {
    id: "hammer-on",
    title: "Hammer-On",
    aliases: ["hammer on", "hammer-on", "legato", "h"],
    what: "Sounding a higher note by hammering a finger down onto the string, without picking again.",
    why: "It makes melodies flow and is the key to smooth, legato blues and rock lines.",
    hear: () => hear(() => playBend("G4", "A4")),
    seeKind: "fretboard",
    seeNotes: ["A4", "B4"],
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
    seeNotes: ["A4", "B4"],
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
    seeNotes: ["E4", "F#4"],
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
    seeNotes: ["E5"],
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
    seeNotes: ["E5"],
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
    seeNotes: ["E2", "G2", "A2"],
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
    seeNotes: ["A4", "C5", "D5", "E5", "G5"],
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
    seeNotes: ["A4", "C5", "D5", "E5", "G5", "A5"],
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
