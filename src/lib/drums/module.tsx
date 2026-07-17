// Drums instrument module — the concrete InstrumentModule for the practice pad.
//
// Single assembly point wiring drums content + visuals into the agnostic
// InstrumentModule shape. Importing this file self-registers it into the sync
// cache via registerInstrumentModule, so pure functions (computeTodayPlan,
// pickChainDrill, endSession) resolve drums content with getModuleSync. Mirrors
// lib/piano/module.tsx and lib/guitar/module.tsx.
//
// InstrumentVisual = PadVisual (a top-down practice pad), NotationVisual =
// RhythmGrid (count + R/L + accents/rests) — the ONLY drums-coupled components.
// Drums is NON-TONAL (focusKind "rudiment"): the whole app's tonal UI (scales,
// key wheel, I-IV-V-I previews) is gated off, and the module ships its own ear
// rounds + gates because the shared pitched generator has no meaning on a pad.

import {
  registerInstrumentModule,
  type InstrumentModule,
  type NotationVisualProps,
} from "../instrumentRegistry";
import { DRUMS_CHAIN_DRILLS } from "./chainDrills";
import {
  DRUMS_WARMUPS,
  DRUMS_PHASE_1_ROTATION,
  DRUMS_PHASE_2_PLUS_ROTATION,
} from "./warmups";
import { DRUMS_UNLOCK_LIBRARY } from "./unlocks";
import { DRUMS_GHOST_ROTATION } from "./curriculum";
import { DRUMS_NODES } from "./skillNodes";
import { DRUMS_EAR_ROUNDS, DRUMS_EAR_LEVEL_GATES } from "./earRounds";
import { drumsFocusLabel } from "./focus";
import { PadVisual } from "./components/PadVisual";
import { RhythmGrid, type DrumsTabData } from "./components/RhythmGrid";

// Adapter: agnostic InstrumentVisualProps → PadVisual. A pad has no scale, key, or
// notes, so every tonal prop is deliberately ignored — the pad is the same on
// every stand, which is exactly right.
function DrumsInstrumentVisual() {
  return <PadVisual />;
}

// Adapter: agnostic NotationVisualProps → RhythmGrid. Pattern data rides the
// deliberately-loose `tab` field (design decision 6); `notes` (pitched) is ignored.
function DrumsNotationVisual({ tab, className, ariaLabel }: NotationVisualProps) {
  const pattern = (tab as DrumsTabData | undefined)?.pattern;
  return <RhythmGrid pattern={pattern} className={className} ariaLabel={ariaLabel} />;
}

export const drumsModule: InstrumentModule = {
  id: "drums",
  displayName: "Drums",
  accentVar: "drums",
  chainDrills: DRUMS_CHAIN_DRILLS,
  warmups: DRUMS_WARMUPS,
  warmupRotation: { phase1: DRUMS_PHASE_1_ROTATION, phase2Plus: DRUMS_PHASE_2_PLUS_ROTATION },
  unlockLibrary: DRUMS_UNLOCK_LIBRARY,
  skillNodes: DRUMS_NODES,
  ghostRotation: DRUMS_GHOST_ROTATION,
  // Non-tonal presentation: the weekly focus is a RUDIMENT (focus.ts maps the
  // opaque rotation token → rudiment name), and /tree renders the RudimentLadder.
  focusKind: "rudiment",
  focusLabel: drumsFocusLabel,
  progressMapKind: "rudiments",
  // Drums ships its OWN rhythm-dictation ear rounds + gates (the shared generator
  // is pitched piano content). L1 ungated; L2 gated on the click node.
  earRounds: DRUMS_EAR_ROUNDS,
  earLevelGates: DRUMS_EAR_LEVEL_GATES,
  InstrumentVisual: DrumsInstrumentVisual,
  NotationVisual: DrumsNotationVisual,
};

// Self-register at import time so the sync cache is warm.
registerInstrumentModule(drumsModule);
