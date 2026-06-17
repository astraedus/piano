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
import { fingeringsForNotes } from "./fingerings";
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
}: InstrumentVisualProps) {
  // #4 — when a scaleKey is supplied, overlay the canonical right-hand scale
  // fingerings (1..5, thumb tucks) on the highlighted scale notes. Derived from
  // the exact notes being shown so the SPN keys align with the lit dots.
  const fingerings = scaleKey && notes
    ? fingeringsForNotes(notes, KEY_META[scaleKey].tonic, "right")
    : undefined;
  return (
    <Keyboard
      notes={notes ?? []}
      rangeStart={rangeStart}
      octaves={octaves}
      fingerings={fingerings}
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
  InstrumentVisual: PianoInstrumentVisual,
  NotationVisual: PianoNotationVisual,
};

// Self-register at import time so the sync cache is warm.
registerInstrumentModule(pianoModule);
