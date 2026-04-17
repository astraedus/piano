// Shared types — small, shippable.

export type Phase = 1 | 2 | 3 | 4 | 5;

export type Grade =
  | "initial"
  | "g1"
  | "g2"
  | "g3"
  | "g4"
  | "g5"
  | "g6"
  | "g7"
  | "g8";

export type Pillar = "technique" | "repertoire" | "ear" | "expression" | "lead-sheet";

export type KeyMode = "major" | "minor";

export type KeyId =
  | "C" | "G" | "D" | "A" | "E" | "B" | "Fs" | "Cs"
  | "F" | "Bb" | "Eb" | "Ab" | "Db" | "Gb"
  | "am" | "em" | "bm" | "fsm" | "csm" | "gsm" | "dsm" | "asm"
  | "dm" | "gm" | "cm" | "fm" | "bbm" | "ebm";

export type ChainStepType =
  | "scale" | "triad" | "progression" | "improv" | "song"
  | "tone" | "parallel-set" | "transcribe" | "lead-sheet" | "moods";

export interface ChainStep {
  type: ChainStepType;
  durationSec: number;
  instruction: string;
}

export interface ChainDrill {
  id: string;
  phase: Phase;
  name: string;
  minutes: number;
  ghostKey: KeyId;
  pillar: Pillar;
  steps: ChainStep[];
  closingNote: string;
}

export type WarmupType =
  | "ghost-scale" | "weight-transfer" | "triad-tour" | "mirror" | "free"
  | "parallel-sets" | "tone-drill";

export interface Warmup {
  id: WarmupType;
  label: string;
  lines: string[]; // instructions. Kept short, scannable.
  postureLine: string;
}

export type EarRoundType =
  | "interval" | "quality" | "cadence" | "progression" | "updown" | "scale-degree" | "maj-min";

export interface EarChoice { label: string; id: string; }
export interface EarRound {
  id: string;
  type: EarRoundType;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7; // from ear ladder L1..L7
  prompt: string;
  correctId: string;
  choices: EarChoice[];
  // payload for audio
  audio: {
    kind: "interval" | "triad" | "cadence" | "progression" | "scale-degree" | "tonicized-note";
    key: KeyId;
    notes?: string[]; // scientific pitch e.g. "C4" "E4"
    chords?: string[][]; // array of chord tones
    keyCenter?: string; // "C4" — for scale-degree rounds
  };
}

// ------------ Piece / Song ------------

export type PieceStatus = "learning" | "shelved" | "yours" | "known";

export interface Piece {
  id: string;
  title: string;
  composer?: string;
  grade?: Grade;
  keyId?: KeyId;
  sheetUrl?: string;
  referenceUrl?: string;
  status: PieceStatus;
  section?: string; // "bars 9-16"
  notes?: string;
  startedAt: string; // ISO
  minutes: number; // total minutes accrued
}

// ------------ Key Map ------------

export type KeyDepth = 0 | 1 | 2 | 3 | 4 | 5;
// 0 Untouched · 1 Heard · 2 Walked · 3 Played · 4 Lived · 5 Home
export const DEPTH_NAMES = ["Untouched", "Heard", "Walked", "Played", "Lived", "Home"] as const;
export const DEPTH_MEANINGS: Record<KeyDepth, string> = {
  0: "Never visited yet.",
  1: "Scale has been played here (hands-separate counts).",
  2: "Scale + triad + I–IV–V–I learned.",
  3: "Has improvised in this key.",
  4: "At least one full piece lives here.",
  5: "Fluent and expressive. Can improvise and accompany without thinking.",
};

// ------------ Unlocks ------------

export interface UnlockCard {
  id: string;
  phase: Phase;
  title: string;          // "Hold a chord with the left hand while the right hand plays a melody"
  tryLine: string;        // "Try it: play any song you know in C. It'll sound right."
  requires?: string[];    // skill ids (lit in state)
  addedAt?: string;       // ISO — populated when earned
}

// ------------ Session ------------

export interface SessionSlotLog {
  slot: "warmup" | "piece" | "chain" | "ear" | "free";
  touched: boolean;
  completed?: boolean;
  detail?: Record<string, unknown>;
}

export interface SessionLog {
  id: string;                   // date + nanotime
  startedAt: string;            // ISO
  endedAt: string;              // ISO
  minutes: number;
  ghostKey: KeyId;
  phase: Phase;
  pieceId?: string;
  chainDrillId?: string;
  earResults?: { correctIds: string[]; wrongIds: string[] };
  journal?: string;             // free slot one-liner
  mode: "full" | "short" | "long" | "just-play" | "first-back";
  slotsTouched: SessionSlotLog[];
}

// ------------ Arc events ------------

export type ArcEventKind =
  | "piano-begins" | "phase-begins" | "unlock" | "piece-yours" | "first-improv" | "piece-started";

export interface ArcEvent {
  id: string;
  at: string; // ISO
  kind: ArcEventKind;
  label: string;
  detail?: Record<string, unknown>;
}

// ------------ App State (localStorage) ------------

export interface AppState {
  version: 1;
  firstOpenedAt?: string;       // ISO
  name?: string;                // optional display name
  northStar?: string;           // onboarding answer
  hasKeyboardNow?: boolean;
  phase: Phase;
  grade: Grade;
  earLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  currentPieceId?: string;
  pieces: Piece[];
  keyDepths: Partial<Record<KeyId, KeyDepth>>;
  sessions: SessionLog[];
  arc: ArcEvent[];
  unlocks: UnlockCard[];        // earned (with addedAt)
  pendingUnlocks: UnlockCard[]; // queued to show after next Done
  ghostOverride?: { key: KeyId; weekId: string } | null; // user changed ghost this week
  freeSlotUrl?: string;         // user-pasted URL for free slot
  theme?: "dark" | "light";
  notifyAfter5Days?: boolean;   // opt-in
  lastSessionEndedAt?: string;  // ISO
  showNorthStarAfter?: string;  // ISO — monthly surface
  northStarHiddenUntil?: string; // ISO
  // freshness for chain drills
  recentDrillIds: string[];
  // Per-skill reps — "I did this" counters keyed by slug e.g. "scale:C:hs", "progression:am:i-iv-V"
  skillReps?: Record<string, { count: number; maxBpm?: number; lastAt?: string }>;
}

// Skill rep id helpers.
export function scaleRepId(keyId: KeyId, handed: "hs" | "ht" = "hs"): string {
  return `scale:${keyId}:${handed}`;
}
export function progressionRepId(keyId: KeyId, name: string): string {
  return `progression:${keyId}:${name}`;
}
export function drillRepId(drillId: string): string {
  return `drill:${drillId}`;
}
