// Guitar-native ear-training rounds (V2 Phase B1).
//
// The shared earRounds.ts is piano-flavored (scale degrees, cadences, pop
// progressions). A guitarist's ear is trained on different primitives: the
// interval that defines a lick (minor vs major 3rd), the quality of a chord by
// sound (major or minor), and the shape of a power chord (root+5th vs root+octave).
//
// This module supplies guitarModule.earRounds as a GENERATOR — (level, focusId) =>
// EarRound — so todayPlan serves a fresh, level-appropriate guitar round each day
// (see todayPlan.earRoundFromModule). focusId is the weekly ghost KeyId; we use its
// tonic as the audio root so the ear round sits in the same tonal home as the
// week's chord/riff focus.
//
// Audio contract: every round uses an audio.kind that playEarRound (lib/audio.ts)
// already supports — "interval" and "triad" — so guitar rounds play with zero
// changes to the audio layer. No piano-only vocabulary in any prompt or choice
// (no "scale degree", no "cadence", no roman numerals).

import type { EarRound, KeyId } from "../types";
import { KEY_META, pitchMidi, midiToSpn, triad } from "../music";

// Distinct-enough ids per round so React keys / logs don't collide.
function rid(prefix: string): string {
  return prefix + "-" + Math.random().toString(36).slice(2, 8);
}

function rand(): number {
  return Math.random();
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// The tonic note name for a focus KeyId (e.g. "am" → "A", "E" → "E"), defaulting
// to A (the home of the pentatonic box) for anything unexpected.
function tonicOf(focusId: string): string {
  return KEY_META[focusId as KeyId]?.tonic ?? "A";
}

// ── L1–L2: interval recognition (the lick-defining interval) ──
// Minor 3rd (3 semitones) vs major 3rd (4 semitones) from the root. This is THE
// ear skill behind reading a lick as bluesy/minor vs bright/major.
function thirdQualityRound(focusId: string): EarRound {
  const root = tonicOf(focusId) + "3";
  const rootMidi = pitchMidi(root);
  const isMinor = rand() < 0.5;
  const top = midiToSpn(rootMidi + (isMinor ? 3 : 4));
  return {
    id: rid("g-third"),
    type: "interval",
    level: 1,
    prompt: "Which interval? Minor 3rd or major 3rd?",
    correctId: isMinor ? "min3" : "maj3",
    choices: [
      { label: "Minor 3rd (bluesy)", id: "min3" },
      { label: "Major 3rd (bright)", id: "maj3" },
    ],
    audio: { kind: "interval", key: focusId as KeyId, notes: [root, top] },
  };
}

// ── L2–L3: chord quality by sound (major or minor) ──
// Plays a full triad; the ear calls it. The everyday open-chord skill: "is this
// an E or an Em?"
function chordQualityRound(focusId: string): EarRound {
  const tonic = tonicOf(focusId);
  const isMinor = rand() < 0.5;
  const notes = triad(tonic, isMinor ? "min" : "maj");
  return {
    id: rid("g-quality"),
    type: "maj-min",
    level: 2,
    prompt: "Major or minor chord?",
    correctId: isMinor ? "minor" : "major",
    choices: [
      // V4: the Major/Minor choice is the bright-vs-dark distinction the
      // major-vs-minor glossary entry explains, so a TermChip can make it tappable.
      { label: "Major", id: "major", termId: "major-vs-minor" },
      { label: "Minor", id: "minor", termId: "major-vs-minor" },
    ],
    audio: { kind: "triad", key: focusId as KeyId, chords: [notes] },
  };
}

// ── L4+: power-chord / two-note shape recognition ──
// A power chord is root + perfect 5th (7 semitones). The common confusion is the
// 5th vs the octave (12 semitones, "root + root"). Train the ear to hear the gap.
function powerShapeRound(focusId: string): EarRound {
  const root = tonicOf(focusId) + "2"; // low strings, where power chords live
  const rootMidi = pitchMidi(root);
  const isFifth = rand() < 0.5;
  const top = midiToSpn(rootMidi + (isFifth ? 7 : 12));
  return {
    id: rid("g-power"),
    type: "interval",
    level: 4,
    prompt: "Power chord or octave shape?",
    correctId: isFifth ? "fifth" : "octave",
    choices: [
      // V4: the power-chord choice is tappable via the power-chord glossary entry.
      { label: "Power chord (root + 5th)", id: "fifth", termId: "power-chord" },
      { label: "Octave (root + root)", id: "octave" },
    ],
    audio: { kind: "interval", key: focusId as KeyId, notes: [root, top] },
  };
}

// ── L1: open-string recognition (which of the two notes is lower) ──
// Lightest entry round: hear two notes a step apart, name the direction. Pure ear
// orientation, no theory vocabulary at all.
function intervalDirectionRound(focusId: string): EarRound {
  const root = tonicOf(focusId) + "3";
  const rootMidi = pitchMidi(root);
  const goesUp = rand() < 0.5;
  const second = midiToSpn(rootMidi + (goesUp ? 5 : -5)); // a perfect 4th up or down
  return {
    id: rid("g-dir"),
    type: "updown",
    level: 1,
    prompt: "Did the second note go up or down?",
    correctId: goesUp ? "up" : "down",
    choices: [
      { label: "Up", id: "up" },
      { label: "Down", id: "down" },
    ],
    audio: { kind: "interval", key: focusId as KeyId, notes: [root, second] },
  };
}

/**
 * Generate a level-appropriate guitar ear round for the given weekly focus.
 * Wired into guitarModule.earRounds → todayPlan serves it on guitar.
 *
 *   L1     → direction / 3rd-quality (orientation)
 *   L2     → 3rd-quality / chord-quality
 *   L3     → chord-quality
 *   L4–L7  → power-chord shape (with chord-quality mixed in)
 */
export function generateGuitarEarRound(level: EarRound["level"], focusId: string): EarRound {
  if (level <= 1) return pick([intervalDirectionRound, thirdQualityRound])(focusId);
  if (level === 2) return pick([thirdQualityRound, chordQualityRound])(focusId);
  if (level === 3) return chordQualityRound(focusId);
  // L4+ — power-chord ear, the heart of rock rhythm, with chord-quality variety.
  return pick([powerShapeRound, chordQualityRound])(focusId);
}

// The InstrumentModule.earRounds value — a generator form so todayPlan produces a
// fresh round per call (matches the EarRound | ((level, focusId) => EarRound) contract).
export const GUITAR_EAR_ROUNDS = generateGuitarEarRound;
