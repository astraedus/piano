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

// Adapter: agnostic InstrumentVisualProps → Keyboard. Defaults match the
// historical inline usage (rangeStart "C4", 2 octaves) so warmup rendering is
// byte-for-byte identical; the chain-drill slot can still pass rangeStart="C3".
function PianoInstrumentVisual({
  notes,
  className,
  rangeStart = "C4",
  octaves = 2,
}: InstrumentVisualProps) {
  return (
    <Keyboard
      notes={notes ?? []}
      rangeStart={rangeStart}
      octaves={octaves}
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
  InstrumentVisual: PianoInstrumentVisual,
  NotationVisual: PianoNotationVisual,
};

// Self-register at import time so the sync cache is warm.
registerInstrumentModule(pianoModule);
