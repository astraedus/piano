// One place that maps a module's focusKind → the human noun for its weekly focus.
// Piano's focus is a KEY, guitar's is a CHORD, drums' is a RUDIMENT. Centralized
// so the stand header, the print sheet, Horizons, and the settings/ghost pickers
// all agree (and so guitar's old "Key · E minor" mislabel can never come back).

import type { InstrumentModule } from "./instrumentRegistry";

type FocusKind = InstrumentModule["focusKind"];

/** True for instruments with NO tonal content (drums). The single derived
 *  predicate that gates every tonal UI block. */
export function isNonTonal(focusKind: FocusKind | undefined): boolean {
  return focusKind === "rudiment";
}

/** The short noun: "Key" | "Chord" | "Rudiment". */
export function focusNoun(focusKind: FocusKind | undefined): string {
  switch (focusKind) {
    case "chord": return "Chord";
    case "rudiment": return "Rudiment";
    case "key":
    default: return "Key";
  }
}

/** The eyebrow label above the weekly focus: "<Noun> of the Week". */
export function focusEyebrow(focusKind: FocusKind | undefined): string {
  return `${focusNoun(focusKind)} of the Week`;
}
