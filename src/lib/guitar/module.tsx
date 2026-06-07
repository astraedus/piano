// Guitar instrument module — the concrete InstrumentModule for electric guitar.
//
// Single assembly point wiring guitar content + visuals into the agnostic
// InstrumentModule shape (plan §1.5). Importing this file self-registers it into
// the sync cache via registerInstrumentModule, so pure functions (computeTodayPlan,
// pickChainDrill, endSession) resolve guitar content with getModuleSync. Mirrors
// lib/piano/module.tsx exactly.
//
// InstrumentVisual = Fretboard, NotationVisual = Tab — the only guitar-coupled
// components. Adapters bridge the agnostic InstrumentVisualProps / NotationVisualProps
// contract to each component's native API.

import {
  registerInstrumentModule,
  type InstrumentModule,
  type InstrumentVisualProps,
  type NotationVisualProps,
} from "../instrumentRegistry";
import { GUITAR_CHAIN_DRILLS } from "./chainDrills";
import {
  GUITAR_WARMUPS,
  GUITAR_PHASE_1_ROTATION,
  GUITAR_PHASE_2_PLUS_ROTATION,
} from "./warmups";
import { GUITAR_UNLOCK_LIBRARY } from "./unlocks";
import { GUITAR_GHOST_ROTATION } from "./curriculum";
import { GUITAR_NODES } from "./skillNodes";
import { Fretboard } from "./components/Fretboard";
import { Tab, type GuitarTabData } from "./components/Tab";

// Adapter: agnostic InstrumentVisualProps → Fretboard. The instrument visual slot
// (warmups / chain-drill progressions) passes `shape` (a chord shape) or nothing;
// Fretboard falls back to its default pentatonic box when neither is supplied.
function GuitarInstrumentVisual({ shape, className }: InstrumentVisualProps) {
  return <Fretboard shape={shape} className={className} />;
}

// Adapter: agnostic NotationVisualProps → Tab. Notation for guitar is tab, never a
// treble staff — `tab` carries the fret data; `notes` is ignored (piano-only).
function GuitarNotationVisual({ tab, className, ariaLabel }: NotationVisualProps) {
  return <Tab tab={tab as GuitarTabData | undefined} className={className} ariaLabel={ariaLabel} />;
}

export const guitarModule: InstrumentModule = {
  id: "guitar",
  displayName: "Electric Guitar",
  accentVar: "guitar",
  chainDrills: GUITAR_CHAIN_DRILLS,
  warmups: GUITAR_WARMUPS,
  warmupRotation: { phase1: GUITAR_PHASE_1_ROTATION, phase2Plus: GUITAR_PHASE_2_PLUS_ROTATION },
  unlockLibrary: GUITAR_UNLOCK_LIBRARY,
  skillNodes: GUITAR_NODES,
  ghostRotation: GUITAR_GHOST_ROTATION,
  InstrumentVisual: GuitarInstrumentVisual,
  NotationVisual: GuitarNotationVisual,
};

// Self-register at import time so the sync cache is warm.
registerInstrumentModule(guitarModule);
