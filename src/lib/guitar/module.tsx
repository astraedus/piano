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
import { KEY_META } from "../music";
import type { KeyId } from "../types";

// Placeholder focus label for guitar (V2 Phase A). Guitar's weekly focus is a
// chord/riff, but until B1 introduces guitar-native chord/riff-of-the-week data
// the ghost rotation is still keyed by KeyId, so we reuse the key name as a
// readable label. B1 REPLACES this with a chord/riff id → name lookup.
function guitarFocusLabel(focusId: string): string {
  return KEY_META[focusId as KeyId]?.name ?? focusId;
}

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
  // Instrument-aware presentation hooks (V2 Phase A). Guitar focuses on CHORDS
  // and renders the fretboard map. B1 will: (1) replace guitarFocusLabel with a
  // chord/riff-id → name lookup, and (2) supply guitar-native `earRounds`
  // (intervals / chord-quality) here so todayPlan serves guitar ear training.
  focusKind: "chord",
  focusLabel: guitarFocusLabel,
  progressMapKind: "fretboard",
  InstrumentVisual: GuitarInstrumentVisual,
  NotationVisual: GuitarNotationVisual,
};

// Self-register at import time so the sync cache is warm.
registerInstrumentModule(guitarModule);
