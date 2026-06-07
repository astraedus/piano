// Guitar focus-of-the-week labels (V2 Phase B1).
//
// The shared practice spine rotates a weekly "ghost key" (a KeyId) that drives
// chain-drill selection via chainDrillPicker's soft-prefer logic. For PIANO that
// ghost key reads naturally as the focus ("G major"). For GUITAR a bare key name
// is the wrong mental model — a guitarist's weekly focus is a CHORD, a chord-change
// pair, or a named riff/box, not "the key of E minor".
//
// So the ghost rotation stays KeyId-based (the plumbing is untouched), but here we
// map each focus KeyId to a guitar-native LABEL. The KeyIds that actually appear in
// GUITAR_GHOST_ROTATION (curriculum.ts) are: em, am, E, A, G, C, D, B. Each maps to
// the chord/riff that lives in that tonal home, ordered to match the curriculum's
// pedagogical arc (open chords → power-chord rock → pentatonic/blues lead).
//
// This is presentation-only: nothing here changes which drill is picked.

import type { KeyId } from "../types";

export interface GuitarFocus {
  /** Short guitar-native label for the weekly focus header (e.g. "Am chord"). */
  label: string;
  /** One-line "what this focus is about" hint, guitar-native, no piano-only terms. */
  blurb: string;
}

// Keyed by the KeyIds GUITAR_GHOST_ROTATION actually emits. Anything outside this
// set falls back to a generic guitar-native label (see guitarFocusFor).
const GUITAR_FOCUS_BY_KEY: Partial<Record<KeyId, GuitarFocus>> = {
  // Minor / open-chord homes — the first vocabulary.
  em: { label: "Em → Am changes", blurb: "the first two open chords. clean changes, every string ringing." },
  am: { label: "Am pentatonic — Box 1", blurb: "the home of rock and blues lead. one box, endless licks." },
  // Major / open-chord homes.
  E:  { label: "E5 power chord & open E", blurb: "the lowest, heaviest shape. down-picks and palm muting." },
  A:  { label: "A → E riff", blurb: "the rock backbone — power chords on the low strings." },
  G:  { label: "G → C → D changes", blurb: "the campfire trio. strum through the three open majors." },
  C:  { label: "C major open chord", blurb: "the trickiest open shape. land it clean, then change to G." },
  D:  { label: "D → G strum", blurb: "bright open chords and a steady down-up strum." },
  // Barre / any-key territory (later phases).
  B:  { label: "B barre chord", blurb: "moveable shapes — one grip, every key up the neck." },
};

// Generic guitar-native fallback for any focus id outside the curated set, so a
// malformed or future KeyId never surfaces a piano-style key name in the header.
function fallbackFocus(focusId: string): GuitarFocus {
  return {
    label: `${focusId} riff focus`,
    blurb: "this week's chord and riff vocabulary.",
  };
}

/** Resolve the full guitar focus (label + blurb) for a focus id (a KeyId). */
export function guitarFocusFor(focusId: string): GuitarFocus {
  return GUITAR_FOCUS_BY_KEY[focusId as KeyId] ?? fallbackFocus(focusId);
}

/** Guitar-native display label for the weekly focus — what InstrumentModule.focusLabel returns. */
export function guitarFocusLabel(focusId: string): string {
  return guitarFocusFor(focusId).label;
}
