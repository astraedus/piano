"use client";
import type { EarRound, KeyId } from "./types";
import { KEY_META, progressionChords } from "./music";

// Lazy Tone.js loader — avoids SSR and only loads when user gestures.
let TonePromise: Promise<typeof import("tone")> | null = null;
let ToneMod: typeof import("tone") | null = null;
let synth: import("tone").PolySynth | null = null;

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
    }
  };
  await play();
  await sleep(400);
  await play();
}
