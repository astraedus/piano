// Instrument-facing copy on SHARED spine surfaces, as pure functions.
//
// The class bug this closes (live QA, 2026-07-17): spine components hardcoded
// piano/tonal wording — "One key, seven days", "Feel the fingering", "The piano
// is here when you are" — which leaked verbatim onto the drums experience. Any
// shared-surface string that names the instrument, its focus, or how you touch
// it belongs HERE, derived from the module's focusKind/id, so sharedCopy.test.ts
// can sweep every registered instrument for cross-instrument vocabulary.

import type { Instrument } from "./types";
import type { InstrumentModule } from "./instrumentRegistry";
import { focusNoun } from "./focusNoun";

type FocusKind = InstrumentModule["focusKind"] | undefined;

/** Horizons "This week" blurb — the weekly-focus framing line. */
export function weeklyFocusBlurb(focusKind: FocusKind): string {
  return `One ${focusNoun(focusKind).toLowerCase()}, seven days. The week picks it, so you don't have to.`;
}

/** What you physically touch when you play — for "without touching …" phrasing. */
export function touchNoun(instrument: Instrument): string {
  switch (instrument) {
    case "guitar": return "a string";
    case "drums": return "the pad";
    default: return "a key";
  }
}

/** How your hands hold the material: fingering for pitched, sticking for drums. */
export function handMemoryNoun(instrument: Instrument): string {
  return instrument === "drums" ? "sticking" : "fingering";
}

/** The mental-practice (audiation) card body. `subject` is already quoted/named. */
export function mentalPracticeCopy(instrument: Instrument, firstBack: boolean, subject: string): string {
  const feel = handMemoryNoun(instrument);
  return firstBack
    ? `Ease back in without touching ${touchNoun(instrument)}. Close your eyes and hear ${subject}. Feel the ${feel}, beat by beat. Mental reps count.`
    : `Close your eyes and hear ${subject}. Feel the ${feel} in your hands. Even a minute of this strengthens the real thing.`;
}

/** Settings — the example text of the 5-days-away reminder nudge. */
export function reminderExampleQuote(module: InstrumentModule | undefined): string {
  if (module?.id === "drums") return "The pad is here when you are.";
  return `The ${module ? module.displayName.toLowerCase() : "piano"} is here when you are.`;
}
