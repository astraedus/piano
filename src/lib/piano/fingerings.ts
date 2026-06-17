// Canonical piano scale fingerings — pure, fully testable, zero React.
//
// Curriculum batch #1, item #4: the Keyboard component already renders finger
// numbers (the `fingerings` prop, 1..5 inside highlighted keys) but no call site
// ever passed it. This module supplies the standard right-hand (and left-hand)
// scale fingerings for the priority keys, as a Record<SPN, finger> the Keyboard
// consumes directly. Fingerings are the textbook conservatory patterns (thumb
// tuck under on the 3rd/4th degree), so a learner sees HOW to finger the current
// key's scale, not just which keys light up.
//
// We store the ONE-OCTAVE ascending finger sequence per key per hand, then tile
// it across the requested octave span with the standard octave join: ascending
// RH repeats 1-2-3(-4)-1-2-3-4-5, i.e. the octave's top finger becomes a thumb
// (1) at the start of the next octave, and only the final top note is a 5.

import type { KeyId, KeyMode } from "../types";
import { KEY_META, keyPrefersFlats, scale } from "../music";

export type Hand = "right" | "left";

// One-octave ASCENDING finger sequences (8 notes: degree 1..8/octave). The 8th
// entry is the octave note's finger when it is the FINAL note (a 5 for RH, a 1
// for LH). When tiling multiple octaves, the join note re-uses finger 1 (RH) /
// 5 (LH) instead, per standard practice. Source: standard conservatory (ABRSM /
// Hanon) major + natural-minor scale fingerings.
//
// Keyed by tonic letter spelling (matches KEY_META.tonic). Only the priority
// keys are listed; any key without an entry falls back to the C-major shape,
// which is correct for all the "white-key start, group-of-3 tuck" major scales.
const RH_ONE_OCTAVE: Record<string, number[]> = {
  // 1 2 3 1 2 3 4 5  — thumb tucks under after the 3rd degree (C/G/D/A/E majors,
  // and natural minors A/E that share the white-key tuck point).
  C: [1, 2, 3, 1, 2, 3, 4, 5],
  G: [1, 2, 3, 1, 2, 3, 4, 5],
  D: [1, 2, 3, 1, 2, 3, 4, 5],
  A: [1, 2, 3, 1, 2, 3, 4, 5],
  E: [1, 2, 3, 1, 2, 3, 4, 5],
  // F major RH is the exception: 1 2 3 4 1 2 3 4 (tuck after the 4th, Bb).
  F: [1, 2, 3, 4, 1, 2, 3, 4],
};

const LH_ONE_OCTAVE: Record<string, number[]> = {
  // 5 4 3 2 1 3 2 1  — LH ascending, thumb under after the 5th degree.
  C: [5, 4, 3, 2, 1, 3, 2, 1],
  G: [5, 4, 3, 2, 1, 3, 2, 1],
  D: [5, 4, 3, 2, 1, 3, 2, 1],
  A: [5, 4, 3, 2, 1, 3, 2, 1],
  E: [5, 4, 3, 2, 1, 3, 2, 1],
  // F major LH: 5 4 3 2 1 3 2 1 (same join point as C for the LH).
  F: [5, 4, 3, 2, 1, 3, 2, 1],
};

/** The one-octave ascending finger sequence for a tonic + hand, defaulting to
 *  the C-major (white-key tuck) shape when the tonic isn't explicitly listed.
 *  We do NOT borrow a same-letter sharp/flat key's shape (e.g. Db must not get
 *  D-major's fingering) — an unlisted tonic falls straight to C. In practice the
 *  caller gates on hasCanonicalFingering so only listed tonics reach here. */
function oneOctaveSequence(tonicLetter: string, hand: Hand): number[] {
  const table = hand === "right" ? RH_ONE_OCTAVE : LH_ONE_OCTAVE;
  return table[tonicLetter] ?? table.C;
}

/**
 * Build the SPN -> finger map for a key's scale across `octaves`, joining the
 * one-octave pattern with the standard octave join. Pure. Returns a record the
 * Keyboard component can consume directly.
 *
 *  - RH: every octave begins on the thumb (1); only the very last note is a 5.
 *  - LH: every octave begins on the pinky (5); only the very last note is a 1.
 */
export function scaleFingerings(
  keyId: KeyId,
  octaves = 2,
  startOct = 4,
  hand: Hand = "right",
): Record<string, number> {
  const meta = KEY_META[keyId];
  const notes = scale(meta.tonic, meta.mode, octaves, startOct, keyPrefersFlats(keyId));
  return fingeringsForNotes(notes, meta.tonic, hand);
}

/** Lower-level: map a sequence of scale SPN notes to fingers for a hand. Pure.
 *  Exposed for callers that already have the note list (e.g. the warmup slot). */
export function fingeringsForNotes(
  notes: string[],
  tonicLetter: string,
  hand: Hand = "right",
): Record<string, number> {
  const seq = oneOctaveSequence(tonicLetter, hand);
  // The finger that starts each octave (and ends the whole scale): RH thumb (1),
  // LH pinky (5)... except the very LAST note flips (RH top is 5, LH top is 1).
  const joinFinger = hand === "right" ? 1 : 5;
  const topFinger = hand === "right" ? 5 : 1;
  const out: Record<string, number> = {};
  const lastIdx = notes.length - 1;
  notes.forEach((spn, i) => {
    if (i === lastIdx) {
      out[spn] = topFinger;
      return;
    }
    // Within-octave degree (0..6); octave join notes reuse the start finger.
    const degree = i % 7;
    out[spn] = degree === 0 ? joinFinger : seq[degree];
  });
  return out;
}

/** True when canonical fingerings are explicitly defined for this key (vs the
 *  C-major fallback). Useful for surfacing a "standard fingering" badge only
 *  where we're confident. */
export function hasCanonicalFingering(keyId: KeyId): boolean {
  return RH_ONE_OCTAVE[KEY_META[keyId].tonic] !== undefined;
}

export type { KeyMode };
