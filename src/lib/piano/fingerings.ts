// Canonical piano scale fingerings — pure, fully testable, zero React.
//
// Curriculum batch #1, item #4: the Keyboard renders finger numbers (the
// `fingerings` prop, 1..5 inside highlighted keys) and a learner needs to SEE
// which finger plays which note — including WHERE the thumb tucks under. This
// module is the SINGLE SOURCE OF TRUTH for all 24 scales (12 major + 12 natural
// minor), RH and LH, verified against docs/research/piano-scale-fingerings.md.
//
// Keyed by full KeyId (tonic + accidental + mode), NOT bare tonic letter: a bare
// letter cannot represent F#/Gb/Db/etc. and cannot distinguish major from minor,
// so the old letter-keyed table silently fell back to the (wrong) C-major shape
// for every black-key and flat-key scale. Enharmonic KeyIds (Fs/Gb, Cs/Db,
// gsm/asm, dsm/ebm) share an entry — same keys under the hand, same fingering.
//
// Each entry is the ONE-OCTAVE ASCENDING sequence (8 fingers, degree 1..8).
// Descending is the reverse. Multi-octave scales tile it: degree (i % 7) for
// every note, the 8th entry (seq[7]) only for the final top note — so the octave
// join correctly reuses the scale's OWN starting finger (e.g. 2 for F#), not a
// hardcoded thumb.

import type { KeyId, KeyMode } from "../types";
import { KEY_META, keyPrefersFlats, midiToSpn, pitchMidi, scale } from "../music";

export type Hand = "right" | "left";

interface ScaleFingering {
  rh: number[]; // one octave ascending, degree 1..8
  lh: number[];
}

// Source of truth: docs/research/piano-scale-fingerings.md §2 / §5. Every
// non-obvious key cross-checked against >=2 authorities. NOTE the two documented
// exceptions: F major RH (1 2 3 4 ...) and B/Bm LH (4 3 2 1 4 3 2 1 — NOT the
// white-key 5-4-3-2-1...; one popular source has this wrong, the doc flags it).
const SCALE_FINGERINGS: Record<KeyId, ScaleFingering> = {
  // ── Majors ──
  C:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  G:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  D:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  A:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  E:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  B:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [4, 3, 2, 1, 4, 3, 2, 1] }, // LH exception
  Fs: { rh: [2, 3, 4, 1, 2, 3, 1, 2], lh: [4, 3, 2, 1, 3, 2, 1, 4] }, // F#
  Gb: { rh: [2, 3, 4, 1, 2, 3, 1, 2], lh: [4, 3, 2, 1, 3, 2, 1, 4] }, // == Fs
  Cs: { rh: [2, 3, 1, 2, 3, 4, 1, 2], lh: [3, 2, 1, 4, 3, 2, 1, 3] }, // C# == Db
  Db: { rh: [2, 3, 1, 2, 3, 4, 1, 2], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Ab: { rh: [3, 4, 1, 2, 3, 1, 2, 3], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Eb: { rh: [3, 1, 2, 3, 4, 1, 2, 3], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Bb: { rh: [2, 1, 2, 3, 1, 2, 3, 4], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  F:  { rh: [1, 2, 3, 4, 1, 2, 3, 4], lh: [5, 4, 3, 2, 1, 3, 2, 1] }, // RH exception

  // ── Natural minors (also correct for harmonic & melodic minor) ──
  am:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  em:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  bm:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [4, 3, 2, 1, 4, 3, 2, 1] }, // LH exception
  fsm: { rh: [2, 3, 1, 2, 3, 1, 2, 3], lh: [4, 3, 2, 1, 3, 2, 1, 4] },
  csm: { rh: [3, 4, 1, 2, 3, 1, 2, 3], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  gsm: { rh: [3, 4, 1, 2, 3, 1, 2, 3], lh: [3, 2, 1, 3, 2, 1, 4, 3] }, // G#m
  asm: { rh: [2, 1, 2, 3, 1, 2, 3, 4], lh: [2, 1, 3, 2, 1, 4, 3, 2] }, // A#m == Bbm
  dsm: { rh: [3, 1, 2, 3, 4, 1, 2, 3], lh: [2, 1, 4, 3, 2, 1, 3, 2] }, // D#m == Ebm
  ebm: { rh: [3, 1, 2, 3, 4, 1, 2, 3], lh: [2, 1, 4, 3, 2, 1, 3, 2] },
  bbm: { rh: [2, 1, 2, 3, 1, 2, 3, 4], lh: [2, 1, 3, 2, 1, 4, 3, 2] },
  fm:  { rh: [1, 2, 3, 4, 1, 2, 3, 4], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  cm:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  gm:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  dm:  { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
};

/** The one-octave ascending finger sequence for a key + hand. Every KeyId is
 *  encoded, so this is always defined; the `?? C` is a defensive belt-and-braces. */
function oneOctaveSequence(keyId: KeyId, hand: Hand): number[] {
  const entry = SCALE_FINGERINGS[keyId] ?? SCALE_FINGERINGS.C;
  return hand === "right" ? entry.rh : entry.lh;
}

/**
 * Build the SPN -> finger map for a key's scale across `octaves`, tiling the
 * one-octave sequence. Pure. The Keyboard consumes this record directly.
 *
 * Tiling: note i gets seq[i % 7] (so each octave restarts on the scale's OWN
 * first finger), and the very last note gets seq[7] (the one-octave top finger).
 */
export function scaleFingerings(
  keyId: KeyId,
  octaves = 2,
  startOct = 4,
  hand: Hand = "right",
): Record<string, number> {
  const meta = KEY_META[keyId];
  const notes = scale(meta.tonic, meta.mode, octaves, startOct, keyPrefersFlats(keyId));
  return fingeringsForKey(notes, keyId, hand);
}

/** Lower-level: map a scale's SPN notes to fingers for a key + hand. Pure.
 *  Exposed for callers that already have the note list (e.g. the warmup slot). */
export function fingeringsForKey(
  notes: string[],
  keyId: KeyId,
  hand: Hand = "right",
): Record<string, number> {
  const seq = oneOctaveSequence(keyId, hand);
  const out: Record<string, number> = {};
  const lastIdx = notes.length - 1;
  notes.forEach((spn, i) => {
    // Key by the Keyboard's canonical (sharp-spelled) SPN so a flat scale note
    // like "Eb4"/"Cb4" matches the keyboard's own key id ("D#4"/"B3"). Without
    // this, black-key/flat fingerings would silently fail to render.
    const canonical = midiToSpn(pitchMidi(spn));
    out[canonical] = i === lastIdx ? seq[7] : seq[i % 7];
  });
  return out;
}

/**
 * Indices in the one-octave ASCENDING sequence where the thumb comes up — the
 * owner's "when do I bring my thumb up?" cue. Derived from the finger array (no
 * second hand-maintained table):
 *   - RH: a tuck is any position (after the first) where the finger returns to 1.
 *   - LH: a cross-over is where a long finger jumps UP right after the thumb (1).
 * Pure.
 */
export function tuckIndices(seq: number[], hand: Hand): number[] {
  const out: number[] = [];
  for (let i = 1; i < seq.length; i++) {
    if (hand === "right" && seq[i] === 1) out.push(i);
    if (hand === "left" && seq[i] > seq[i - 1] && seq[i - 1] === 1) out.push(i);
  }
  return out;
}

/** The scale-degree positions (0-based, within one octave) where the thumb comes
 *  up for a key + hand. e.g. C major RH → [3] (tuck after the 3rd note, onto F). */
export function tuckDegrees(keyId: KeyId, hand: Hand = "right"): number[] {
  return tuckIndices(oneOctaveSequence(keyId, hand), hand);
}

/** The SPN of every tuck/cross note across a rendered (possibly multi-octave)
 *  scale, for ringing on the keyboard. Tiles the one-octave tuck degrees across
 *  each octave by matching note index `i % 7`. Pure. */
export function tuckNotesFor(notes: string[], keyId: KeyId, hand: Hand = "right"): string[] {
  const degrees = new Set(tuckDegrees(keyId, hand));
  return notes.filter((_, i) => degrees.has(i % 7));
}

/** A one-line, human cue for the FIRST thumb-tuck/cross in the scale, e.g.
 *  "thumb tucks under after the 3rd note" (RH) / "3rd finger crosses over the
 *  thumb after the 5th note" (LH). Returns null when the scale has no mid-octave
 *  shift in the first octave (shouldn't happen for real scales). */
export function tuckCue(keyId: KeyId, hand: Hand = "right"): string | null {
  const idx = tuckDegrees(keyId, hand)[0];
  if (idx == null) return null;
  const ord = ordinal(idx); // the move happens at the `idx`-th note (1-based reads the same)
  if (hand === "right") return `thumb tucks under after the ${ord} note`;
  // LH ascending: the long finger crosses OVER the thumb at this position.
  const finger = oneOctaveSequence(keyId, "left")[idx];
  return `${ordinal(finger)} finger crosses over the thumb after the ${ord} note`;
}

function ordinal(n: number): string {
  const names = ["zeroth", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
  return names[n] ?? `${n}th`;
}

/** True when canonical fingerings are defined for this key. Now true for ALL 24
 *  keys (every KeyId is encoded), so callers no longer need to gate on it; kept
 *  for API compatibility + as a guard. */
export function hasCanonicalFingering(keyId: KeyId): boolean {
  return SCALE_FINGERINGS[keyId] !== undefined;
}

export type { KeyMode };
