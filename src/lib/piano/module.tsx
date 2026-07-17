// Piano instrument module — the concrete InstrumentModule for piano.
//
// This is the single assembly point that wires piano content + visuals into the
// agnostic InstrumentModule shape (plan §1.3 / §1.4 step 4). Importing this file
// self-registers the module into the sync cache via registerInstrumentModule, so
// pure functions (computeTodayPlan, ghostKeyFor) can resolve it with getModuleSync.
//
// The two injected visuals are the ONLY instrument-coupled components in the app.
// They adapt the rich Keyboard / Staff prop APIs (still used directly by KeyMap)
// to the agnostic InstrumentVisualProps / NotationVisualProps contract.

import {
  registerInstrumentModule,
  type InstrumentModule,
  type InstrumentVisualProps,
  type NotationVisualProps,
} from "../instrumentRegistry";
import { CHAIN_DRILLS } from "./chainDrills";
import {
  WARMUPS,
  PHASE_1_ROTATION,
  PHASE_2_PLUS_ROTATION,
} from "./warmups";
import { UNLOCK_LIBRARY } from "./unlocks";
import { GHOST_ROTATION_PER_PHASE } from "./trinity";
import { PIANO_NODES } from "./skillNodes";
import { Keyboard } from "./components/Keyboard";
import { Staff } from "./components/Staff";
import { KEY_META } from "../music";
import { fingeringsForKey, tuckNotesFor, tuckCue } from "./fingerings";
import type { KeyId } from "../types";

// Piano focus = a key. Reuse the existing rich key labels (e.g. "G major").
// Unknown ids fall back to the raw id so a malformed focus never crashes a header.
function pianoFocusLabel(focusId: string): string {
  return KEY_META[focusId as KeyId]?.name ?? focusId;
}

// Adapter: agnostic InstrumentVisualProps → Keyboard. Defaults match the
// historical inline usage (rangeStart "C4", 2 octaves) so warmup rendering is
// byte-for-byte identical; the chain-drill slot can still pass rangeStart="C3".
function PianoInstrumentVisual({
  notes,
  className,
  rangeStart = "C4",
  octaves = 2,
  scaleKey,
  scaleHand = "right",
}: InstrumentVisualProps) {
  // #4 — when a scaleKey is supplied, overlay the canonical scale fingerings
  // (1..5) for the chosen hand on the highlighted notes and ring the thumb-tuck
  // note. All 24 keys are encoded (fingerings.ts), so this is always correct.
  const fingerings = scaleKey && notes
    ? fingeringsForKey(notes, scaleKey, scaleHand)
    : undefined;
  const tuckNotes = scaleKey && notes
    ? tuckNotesFor(notes, scaleKey, scaleHand)
    : undefined;
  return (
    <Keyboard
      notes={notes ?? []}
      rangeStart={rangeStart}
      octaves={octaves}
      fingerings={fingerings}
      tuckNotes={tuckNotes}
      className={className}
    />
  );
}

// Adapter: agnostic NotationVisualProps → Staff. Staff requires `notes`; guard
// undefined to an empty array.
function PianoNotationVisual({
  notes,
  clef,
  keySignature,
  ariaLabel,
}: NotationVisualProps) {
  return (
    <Staff
      notes={notes ?? []}
      clef={clef}
      keySignature={keySignature}
      ariaLabel={ariaLabel}
    />
  );
}

export const pianoModule: InstrumentModule = {
  id: "piano",
  displayName: "Piano",
  accentVar: "piano",
  chainDrills: CHAIN_DRILLS,
  warmups: WARMUPS,
  warmupRotation: { phase1: PHASE_1_ROTATION, phase2Plus: PHASE_2_PLUS_ROTATION },
  unlockLibrary: UNLOCK_LIBRARY,
  skillNodes: PIANO_NODES,
  ghostRotation: GHOST_ROTATION_PER_PHASE,
  // Instrument-aware presentation hooks (V2 Phase A). Piano focuses on KEYS,
  // renders the keymap, and keeps using the shared earRounds generator (earRounds
  // left undefined → todayPlan falls back to the existing behavior).
  focusKind: "key",
  focusLabel: pianoFocusLabel,
  progressMapKind: "keymap",
  scaleFingeringCue: (keyId, hand) => tuckCue(keyId, hand),
  // Honest ear gating (see earProgression.maxAllowedEarLevel). Each level's ear
  // content may only appear once the curriculum has actually taught it:
  //   L2 scale-degree rounds  → p-key-C: the first scale is where a "scale degree" is taught.
  //   L3 chord-quality rounds → p-key-C + p-key-am: both a major AND a minor triad
  //       have been heard/played (p-key-am's own unlock is "Hear major vs minor reliably").
  //   L4 cadence rounds (V-I / IV-I / ii-V-I, Roman-numeral labels) → p-t2-pop-formula:
  //       the first node where the learner internalises chords moving in a functional
  //       progression. Earlier keys only *contain* I-IV-V-I inside a drill; cadences as a
  //       named, ear-identified idea aren't real until the pop formula (ii-V-I proper is
  //       tier-3 jazz, too strict a gate for basic cadences).
  //   L5 progression rounds (I–V–vi–IV etc.) → p-t2-pop-formula: this node IS the pop
  //       formula, so it's the exact, honest gate for hearing four-chord progressions.
  earLevelGates: {
    2: ["p-key-C"],
    3: ["p-key-C", "p-key-am"],
    4: ["p-t2-pop-formula"],
    5: ["p-t2-pop-formula"],
  },
  InstrumentVisual: PianoInstrumentVisual,
  NotationVisual: PianoNotationVisual,
};

// Self-register at import time so the sync cache is warm.
registerInstrumentModule(pianoModule);
