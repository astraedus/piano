// Trinity 2021–2023 Piano Syllabus — the backbone. Source: Piano Syllabus 2021-2023 Trinity.pdf
// Distilled for the app — progression map only, not certification.

import type { Grade, KeyId, Phase } from "./types";

export const TQT_HOURS: Record<Grade, { guided: number; independent: number; total: number }> = {
  initial: { guided: 8,  independent: 32,  total: 40 },
  g1:      { guided: 12, independent: 48,  total: 60 },
  g2:      { guided: 18, independent: 72,  total: 90 },
  g3:      { guided: 18, independent: 102, total: 120 },
  g4:      { guided: 24, independent: 126, total: 150 },
  g5:      { guided: 24, independent: 156, total: 180 },
  g6:      { guided: 36, independent: 184, total: 220 },
  g7:      { guided: 48, independent: 222, total: 270 },
  g8:      { guided: 54, independent: 266, total: 320 },
};

export const SIGHT_READING_PARAMS: Record<Grade, { keys: string[]; timeSignatures: string[]; noteValues: string[]; dynamicsTempi: string[]; articulation: string[] }> = {
  initial: { keys: ["C major"], timeSignatures: ["2/4"], noteValues: ["♩","♪","𝅗𝅥"], dynamicsTempi: ["p","f","moderato"], articulation: ["simple phrasing"] },
  g1:      { keys: ["C","G","A minor (white notes only)"], timeSignatures: ["4/4"], noteValues: ["𝅝","𝅗𝅥"], dynamicsTempi: ["mf"], articulation: [] },
  g2:      { keys: ["A minor (incl. G#)"], timeSignatures: ["3/4"], noteValues: ["𝅗𝅥","ties"], dynamicsTempi: ["allegretto"], articulation: [] },
  g3:      { keys: ["D minor"], timeSignatures: [], noteValues: ["♪","rest"], dynamicsTempi: ["mp","andante"], articulation: ["slurs"] },
  g4:      { keys: ["D major","E minor"], timeSignatures: [], noteValues: ["♩.","rest"], dynamicsTempi: ["crescendo","decrescendo"], articulation: ["staccato","accents"] },
  g5:      { keys: ["F","Bb","Eb","A major","B minor","G minor"], timeSignatures: ["6/8"], noteValues: ["rests incl. ♪."], dynamicsTempi: ["rit.","rall.","a tempo","pause","accel."], articulation: ["simple pedalling"] },
  g6:      { keys: ["F# major","C minor"], timeSignatures: [], noteValues: [], dynamicsTempi: [], articulation: ["pedalling marked"] },
  g7:      { keys: ["E major","Ab major","any related modulation"], timeSignatures: ["9/8"], noteValues: [], dynamicsTempi: ["any common terms"], articulation: ["pedalling essential"] },
  g8:      { keys: ["B major","Db major","G# minor","F minor (incl. double sharps/flats)"], timeSignatures: ["2/2","changing"], noteValues: ["duplets","triplets"], dynamicsTempi: ["dim./cresc. (text)","ff/pp","differing dynamics LH/RH"], articulation: ["tenuto"] },
};

export const IMPROV_HARMONIC: Record<Grade, { keyNames: string[]; chords: string[]; lengthBars: number; plays: number }> = {
  initial: { keyNames: ["C major"], chords: ["I","V"], lengthBars: 4, plays: 1 },
  g1:      { keyNames: ["F major","G major"], chords: ["I","V"], lengthBars: 8, plays: 2 },
  g2:      { keyNames: ["F major","G major","A minor"], chords: ["I","IV","V / i","iv","V"], lengthBars: 8, plays: 2 },
  g3:      { keyNames: ["D major","Bb major","D minor","E minor"], chords: ["I","ii","IV","V / i","iiø","iv","V"], lengthBars: 8, plays: 2 },
  g4:      { keyNames: ["G major","B minor"], chords: ["+ same as G3"], lengthBars: 12, plays: 3 },
  g5:      { keyNames: ["A major","Eb major","A minor","D minor","E minor","G minor","B minor"], chords: ["I","ii","IV","V","vi / i","iv","V","VI"], lengthBars: 12, plays: 3 },
  g6:      { keyNames: ["C","F","G","Bb","D","Eb","A major","A","D","E","G","B","C","F# minor"], chords: ["+ 7ths"], lengthBars: 16, plays: 2 },
  g7:      { keyNames: ["(all G6)"], chords: ["+ iii / III + 7ths"], lengthBars: 16, plays: 2 },
  g8:      { keyNames: ["all"], chords: ["all chords + 7ths + 9ths + suspensions"], lengthBars: 16, plays: 2 },
};

export const IMPROV_MOTIVIC: Record<Grade, { stimulusBars: number; responseBars: [number, number]; intervals: string; rhythmicFeatures: string[] }> = {
  initial: { stimulusBars: 2, responseBars: [4, 6],  intervals: "up to minor 3rd", rhythmicFeatures: ["minims","crotchets"] },
  g1:      { stimulusBars: 2, responseBars: [4, 8],  intervals: "major 3rd",       rhythmicFeatures: ["quavers"] },
  g2:      { stimulusBars: 2, responseBars: [6, 8],  intervals: "perfect 4th",     rhythmicFeatures: ["dotted notes","staccato"] },
  g3:      { stimulusBars: 2, responseBars: [6, 8],  intervals: "perfect 5th",     rhythmicFeatures: ["ties"] },
  g4:      { stimulusBars: 2, responseBars: [8, 12], intervals: "minor/major 6th", rhythmicFeatures: ["syncopation","accents"] },
  g5:      { stimulusBars: 2, responseBars: [8, 12], intervals: "octave",          rhythmicFeatures: ["semiquavers","slurs"] },
  g6:      { stimulusBars: 1, responseBars: [12,16], intervals: "aug 4th, dim 5th",rhythmicFeatures: ["acciaccaturas"] },
  g7:      { stimulusBars: 1, responseBars: [12,16], intervals: "minor/major 7th", rhythmicFeatures: [] },
  g8:      { stimulusBars: 1, responseBars: [12,16], intervals: "up to major 10th",rhythmicFeatures: ["triplets","duplets","sforzando"] },
};

export const MUSICAL_KNOWLEDGE: Partial<Record<Grade, string[]>> = {
  initial: ["pitch letter names","note durations","clefs / staves / barlines","key + time signatures","basic terms (pause etc.)"],
  g1: ["note values","time signatures (e.g. 4/4)","ledger lines (up to 2)","terms (da capo etc.)"],
  g2: ["intervals (2nd–5th, numeric)","metronome marks","grace notes / ornaments","ledger lines (up to 3)"],
  g3: ["intervals 2nd–7th","relative major/minor","scale/arpeggio/broken-chord patterns in scores"],
  g4: ["modulation to closely related keys","tonic/dominant triads","full interval names"],
  g5: ["musical period and style","musical structures (form)","subdominant triads"],
};

// Cumulative scale keys per grade (app's working set per grade).
export const SCALES_PER_GRADE: Partial<Record<Grade, KeyId[]>> = {
  initial: ["C", "am"],
  g1:      ["C", "G", "F", "am", "dm"],
  g2:      ["C", "G", "D", "F", "am", "dm", "em"],
  g3:      ["C", "G", "D", "F", "Bb", "am", "em", "dm", "bm"],
  g4:      ["C", "G", "D", "A", "F", "Bb", "Eb", "am", "em", "dm", "bm", "gm"],
  g5:      ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "am", "em", "dm", "bm", "gm", "cm", "fsm"],
  g6:      ["C", "G", "D", "A", "E", "B", "F", "Bb", "Eb", "Ab", "am", "em", "dm", "bm", "gm", "cm", "fsm", "csm"],
  g7:      ["C", "G", "D", "A", "E", "B", "Fs", "F", "Bb", "Eb", "Ab", "Db", "am", "em", "dm", "bm", "gm", "cm", "fsm", "csm", "gsm", "fm"],
  g8:      ["C", "G", "D", "A", "E", "B", "Fs", "Cs", "F", "Bb", "Eb", "Ab", "Db", "Gb", "am", "em", "dm", "bm", "gm", "cm", "fsm", "csm", "gsm", "dsm", "fm", "bbm", "ebm"],
};

// Weekly ghost-key rotation per phase. Phase 1 small set; grows per phase.
export const GHOST_ROTATION_PER_PHASE: Record<Phase, KeyId[]> = {
  1: ["C", "G", "F", "am", "dm"],
  2: ["C", "G", "D", "F", "Bb", "am", "em", "dm", "bm"],
  3: ["C", "G", "D", "A", "F", "Bb", "Eb", "am", "em", "dm", "bm", "gm"],
  4: ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab", "am", "em", "dm", "bm", "gm", "cm", "fsm", "csm"],
  5: ["C", "G", "D", "A", "E", "B", "Fs", "F", "Bb", "Eb", "Ab", "Db", "am", "em", "dm", "bm", "gm", "cm", "fsm", "csm", "gsm", "fm", "bbm"],
};
