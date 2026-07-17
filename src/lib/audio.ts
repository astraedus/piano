"use client";
import type { EarRound, KeyId, StickingCell } from "./types";
import { KEY_META, progressionChords } from "./music";

// Lazy Tone.js loader — avoids SSR and only loads when user gestures.
let TonePromise: Promise<typeof import("tone")> | null = null;
let ToneMod: typeof import("tone") | null = null;
let synth: import("tone").PolySynth | null = null;

// Percussion voices for the drums module — a dry practice-pad "tok". Two hands,
// each panned to its side, so R/L is audible; a short membrane thud + a noise
// transient for the stick attack. Built lazily on first use (same gesture-unlock
// contract as the pitched synth).
interface PadVoice {
  membrane: import("tone").MembraneSynth;
  noise: import("tone").NoiseSynth;
}
let padR: PadVoice | null = null;
let padL: PadVoice | null = null;

async function getTone() {
  if (typeof window === "undefined") throw new Error("audio only in browser");
  if (!TonePromise) TonePromise = import("tone");
  ToneMod = await TonePromise;
  return ToneMod;
}

async function getSynth() {
  const Tone = await getTone();
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.35, release: 0.8 },
    }).toDestination();
    synth.volume.value = -8;
  }
  return { Tone, synth };
}

export async function ensureAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  const Tone = await getTone();
  if (Tone.getContext().state !== "running") {
    try { await Tone.start(); } catch { /* ignore */ }
  }
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function playSequence(notes: string[], { noteDurationSec = 0.5, gapSec = 0.04 } = {}): Promise<void> {
  const { synth } = await getSynth();
  const now = (await getTone()).now();
  let t = now;
  for (const n of notes) {
    synth.triggerAttackRelease(n, noteDurationSec, t);
    t += noteDurationSec + gapSec;
  }
  await sleep((notes.length * (noteDurationSec + gapSec)) * 1000);
}

export async function playChord(notes: string[], { durationSec = 1.2 } = {}): Promise<void> {
  const { synth } = await getSynth();
  const Tone = await getTone();
  synth.triggerAttackRelease(notes, durationSec, Tone.now());
  await sleep(durationSec * 1000);
}

export async function playInterval(a: string, b: string): Promise<void> {
  const { synth } = await getSynth();
  const Tone = await getTone();
  const t0 = Tone.now();
  synth.triggerAttackRelease(a, 0.5, t0);
  synth.triggerAttackRelease(b, 0.5, t0 + 0.55);
  synth.triggerAttackRelease([a, b], 0.9, t0 + 1.15);
  await sleep(2200);
}

export async function playProgression(chords: string[][], { chordDurationSec = 0.9, gapSec = 0.05 } = {}): Promise<void> {
  const { synth } = await getSynth();
  const Tone = await getTone();
  let t = Tone.now();
  for (const c of chords) {
    synth.triggerAttackRelease(c, chordDurationSec, t);
    t += chordDurationSec + gapSec;
  }
  await sleep(chords.length * (chordDurationSec + gapSec) * 1000);
}

export async function playCadence(key: KeyId, kind: "V-I" | "IV-I" | "ii-V-I"): Promise<void> {
  const meta = KEY_META[key];
  let romans: string[] = [];
  if (kind === "V-I") romans = [meta.mode === "major" ? "V" : "V", meta.mode === "major" ? "I" : "i"];
  if (kind === "IV-I") romans = [meta.mode === "major" ? "IV" : "iv", meta.mode === "major" ? "I" : "i"];
  if (kind === "ii-V-I") romans = [meta.mode === "major" ? "ii" : "iiø", "V", meta.mode === "major" ? "I" : "i"];
  await playProgression(progressionChords(key, romans));
}

// V4 glossary "HEAR" helpers — small expressive demos for the explainer cards.

/**
 * Approximate a string bend: play the start note, then quickly the target note,
 * close together so the ear reads it as one pitch sliding up. Not a true
 * portamento (PolySynth has no glide) but a recognizable bend gesture.
 */
export async function playBend(from: string, to: string): Promise<void> {
  const { synth } = await getSynth();
  const Tone = await getTone();
  const t0 = Tone.now();
  synth.triggerAttackRelease(from, 0.18, t0);
  synth.triggerAttackRelease(to, 0.7, t0 + 0.16);
  await sleep(1000);
}

/**
 * Approximate vibrato: the same note re-struck a few times in quick succession,
 * simulating the warm pulsating wobble of a held, shaken note.
 */
export async function playVibrato(note: string, shakes = 5): Promise<void> {
  const { synth } = await getSynth();
  const Tone = await getTone();
  const t0 = Tone.now();
  for (let i = 0; i < shakes; i++) {
    synth.triggerAttackRelease(note, 0.16, t0 + i * 0.14);
  }
  await sleep((shakes * 0.14 + 0.2) * 1000);
}

/**
 * Palm-muted chug: short, damped, sustain-less hits of the same note(s).
 * Used for power-chord / palm-mute demos where the point is the muffled attack.
 */
export async function playMutedChug(notes: string[], hits = 4): Promise<void> {
  const { synth } = await getSynth();
  const Tone = await getTone();
  const t0 = Tone.now();
  for (let i = 0; i < hits; i++) {
    synth.triggerAttackRelease(notes, 0.1, t0 + i * 0.22);
  }
  await sleep((hits * 0.22 + 0.2) * 1000);
}

// Build (once) the two panned pad voices. `pan` is -1 (hard left) .. 1 (hard right).
async function getPadVoice(hand: "R" | "L"): Promise<PadVoice> {
  const Tone = await getTone();
  const existing = hand === "R" ? padR : padL;
  if (existing) return existing;
  const panner = new Tone.Panner(hand === "R" ? 0.4 : -0.4).toDestination();
  const membrane = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.02 },
  }).connect(panner);
  membrane.volume.value = -6;
  const noise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.01 },
  }).connect(panner);
  noise.volume.value = -20;
  const voice: PadVoice = { membrane, noise };
  if (hand === "R") padR = voice; else padL = voice;
  return voice;
}

/**
 * Play a drum sticking pattern on the pad. Each cell is one even pulse at `bpm`
 * pulses per minute (so the CALLER encodes subdivision as pulse-rate: quarters at
 * bpm, eighths at 2·bpm, etc.). Rests advance the clock silently. A hit pans to
 * its hand's side; an accent hits harder (higher velocity) so it is audibly louder
 * than surrounding taps — the whole point of the four-strokes dynamic vocabulary.
 */
export async function playSticking(pattern: StickingCell[], bpm = 90): Promise<void> {
  if (typeof window === "undefined" || pattern.length === 0) return;
  const Tone = await getTone();
  const cellSec = 60 / Math.max(1, bpm);
  const t0 = Tone.now() + 0.05;
  pattern.forEach((cell, i) => {
    if (cell.rest || !cell.hand) return;
    const t = t0 + i * cellSec;
    const accent = cell.accent ?? false;
    // Fire the correct hand's voice; play() resolves the panned voice for the side.
    void getPadVoice(cell.hand).then((voice) => {
      // Guard: the async voice build may resolve after the scheduled time on a
      // cold start; clamp to "now" so a late note still sounds rather than throwing.
      const when = Math.max(t, Tone.now());
      const vel = accent ? 1 : 0.5;
      // A slightly higher membrane pitch for accents reads as "louder/harder".
      voice.membrane.triggerAttackRelease(accent ? "C2" : "A1", 0.08, when, vel);
      voice.noise.triggerAttackRelease(0.03, when, accent ? 0.9 : 0.4);
    });
  });
  await sleep(pattern.length * cellSec * 1000 + 120);
}

export async function playEarRound(round: EarRound): Promise<void> {
  // Play twice with a small pause.
  const play = async () => {
    if (round.audio.kind === "interval") {
      const [a, b] = round.audio.notes ?? [];
      if (a && b) await playInterval(a, b);
    } else if (round.audio.kind === "triad") {
      await playChord(round.audio.chords?.[0] ?? []);
    } else if (round.audio.kind === "cadence" || round.audio.kind === "progression") {
      await playProgression(round.audio.chords ?? []);
    } else if (round.audio.kind === "scale-degree") {
      // Establish the key first — short V-I cadence — then play target note.
      const meta = KEY_META[round.audio.key];
      await playCadence(round.audio.key, "V-I");
      await sleep(250);
      const n = round.audio.notes?.[0];
      if (n) await playSequence([meta.tonic + "4", n], { noteDurationSec: 0.6 });
    } else if (round.audio.kind === "tonicized-note") {
      const n = round.audio.notes?.[0];
      if (n) await playSequence([n]);
    } else if (round.audio.kind === "sticking") {
      if (round.audio.sticking) await playSticking(round.audio.sticking, round.audio.bpm ?? 90);
    }
  };
  await play();
  await sleep(400);
  await play();
}
