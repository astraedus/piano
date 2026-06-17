// Instrument registry — the single seam between the shared practice spine and
// per-instrument content/visuals (plan §1.3, decision D1).
//
// One shared <PracticeStand> consumes getInstrumentModule(state.instrument).
// Guitar is data + 2 injected visual components, NOT a parallel app.
//
// Loading model (plan note under §1.3): instrument *data* is small and is held
// in a SYNC cache so pure functions like computeTodayPlan can read it without
// awaiting. Heavy visual components are code-split via next/dynamic inside each
// module. Modules self-register into the cache at import time.
//
// P0 ships the interface + cache + registration mechanism only. The piano module
// (P1) and guitar module (P4) register themselves; until then getModuleSync
// returns undefined and getInstrumentModule rejects with a clear error rather
// than crashing the app.

import type { ComponentType } from "react";
import type {
  ChainDrill,
  Warmup,
  UnlockCard,
  SkillNode,
  Instrument,
  Phase,
  KeyId,
  EarRound,
} from "./types";

// Minimal tab payload shape; the guitar module (P4) defines the concrete data
// it feeds to its VexFlow TabStave NotationVisual. Kept loose here so P0 has no
// dependency on guitar internals.
export interface TabData {
  strings?: number;
  positions?: { str: number; fret: number }[];
  [key: string]: unknown;
}

export interface InstrumentVisualProps {
  notes?: string[];
  shape?: number[];
  className?: string;
  // Optional render hints. Piano's Keyboard interprets these directly; a guitar
  // Fretboard may interpret or ignore them. Kept on the agnostic contract so a
  // slot can request a specific window (e.g. the chain-drill progression needs a
  // lower C3 start) without reaching past the module seam.
  rangeStart?: string;
  octaves?: number;
  // #4 — finger-placement hint. `scaleKey` names the key whose SCALE this visual
  // represents; each module derives its own finger guidance from it: piano maps
  // the canonical scale fingerings (1..5) onto the highlighted keys + rings the
  // thumb-tuck note, guitar plots the moveable minor-pentatonic Box 1 for that
  // key. Absent → no finger overlay (the prior notes-only behavior).
  scaleKey?: KeyId;
  // Which hand's fingering to show (piano only; guitar ignores). Default "right".
  scaleHand?: "right" | "left";
}

export interface NotationVisualProps {
  notes?: string[];
  tab?: TabData;
  className?: string;
  clef?: "treble" | "bass";
  keySignature?: string;
  ariaLabel?: string;
}

export interface InstrumentModule {
  id: Instrument;
  displayName: string;                 // "Piano" | "Electric Guitar"
  accentVar: string;                   // "piano" | "guitar" → drives data-instrument
  chainDrills: ChainDrill[];
  warmups: Record<string, Warmup>;
  warmupRotation: { phase1: string[]; phase2Plus: string[] };
  unlockLibrary: UnlockCard[];
  skillNodes: SkillNode[];
  ghostRotation: Record<Phase, KeyId[]>;

  // ── Instrument-aware presentation hooks (V2 Phase A) ──
  // These let B2 render an instrument-appropriate "focus of the week" header and
  // progress map WITHOUT changing the underlying ghost-key / skill-tree plumbing.
  // The generalization is purely presentation-layer: the existing ghostRotation
  // still drives chain-drill selection; `focusKind`/`focusLabel` just describe
  // how to PRESENT the current focus for this instrument.

  /** What a weekly "focus" is for this instrument. piano = "key", guitar = "chord". */
  focusKind: "key" | "chord";
  /** Map a focus id (a KeyId for piano, a chord/riff id for guitar) → display label. */
  focusLabel: (focusId: string) => string;
  /** Which progress-map visual the /tree page should render for this instrument. */
  progressMapKind: "keymap" | "fretboard";
  /**
   * #4 — a one-line "when to bring the thumb up" cue for a key's scale on a hand,
   * surfaced beside the fingered scale view. Piano returns e.g. "thumb tucks under
   * after the 3rd note"; instruments with no such cue (guitar) leave it undefined.
   */
  scaleFingeringCue?: (keyId: KeyId, hand: "right" | "left") => string | null;
  /**
   * Optional per-instrument ear-training rounds. When present, todayPlan pulls
   * ear rounds from here; when absent it falls back to the shared earRounds.ts
   * generator. A function form lets the module generate fresh rounds per call.
   * (Piano leaves this undefined → keeps using the shared generator unchanged.)
   */
  earRounds?: EarRound[] | ((level: EarRound["level"], focusId: string) => EarRound);

  // injected visuals — the ONLY instrument-coupled components
  InstrumentVisual: ComponentType<InstrumentVisualProps>;
  NotationVisual: ComponentType<NotationVisualProps>;
}

// --- Sync cache + registration -------------------------------------------

const CACHE = new Map<Instrument, InstrumentModule>();

/**
 * Register a module into the sync cache. Each instrument module calls this at
 * import time (e.g. `registerInstrumentModule(pianoModule)`). Idempotent —
 * re-registering the same id overwrites the previous entry.
 */
export function registerInstrumentModule(module: InstrumentModule): void {
  CACHE.set(module.id, module);
}

/**
 * Sync cache lookup for use inside pure functions (computeTodayPlan etc.).
 * Returns undefined if the module hasn't registered yet — callers must guard.
 */
export function getModuleSync(id: Instrument): InstrumentModule | undefined {
  return CACHE.get(id);
}

/** True once a module for `id` has registered. */
export function isModuleRegistered(id: Instrument): boolean {
  return CACHE.has(id);
}

/**
 * Async accessor. Returns the cached module if present. P1/P4 may replace the
 * body with dynamic imports that ensure the module file is loaded (which
 * triggers its self-registration); for P0 it resolves from cache or rejects
 * with an actionable error.
 */
export async function getInstrumentModule(id: Instrument): Promise<InstrumentModule> {
  const cached = CACHE.get(id);
  if (cached) return cached;
  throw new Error(
    `Instrument module "${id}" is not registered. Import its module file ` +
      `(which self-registers via registerInstrumentModule) before calling getInstrumentModule.`,
  );
}
