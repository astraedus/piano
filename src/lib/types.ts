// Shared types — small, shippable.

import type { ReactNode } from "react";

export type Phase = 1 | 2 | 3 | 4 | 5;

// ---- Soul-First Learning (V4) ----
// Which intent a node belongs to. A node with no pathTags shows on every path.
export type PathTag = "just-play" | "play-with-soul" | "go-deep";

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

export type Pillar = "technique" | "repertoire" | "ear" | "expression" | "lead-sheet" | "improv";

// ---- Instrument identity ----
export type Instrument = "piano" | "guitar" | "drums";

// ---- Skill DAG (serves BOTH instruments) ----
export type SkillCategory =
  | "setup" | "technique" | "chords" | "scales"
  | "rhythm" | "notation" | "repertoire" | "expression" | "ear";

export type SkillNodeStatus = "locked" | "available" | "in-progress" | "learned";

// ---- Guitar fretboard positions ----
// The canonical dot-on-the-neck shape. Pure data (no React) so it can live in the
// shared type home and be authored/tested as data — the Fretboard component, the
// scale-box derivation (scaleBox.ts), the glossary SEE-data and GuitarMap all plot
// FretPosition[]. Previously re-declared in three places; unified here.
export interface FretPosition {
  /** 1 (low E) .. 6 (high e) — guitar string, low to high. */
  string: number;
  /** 0 = open (on the nut), n = fret n. */
  fret: number;
  /** true → root note (accent-colored). */
  root?: boolean;
  /** optional short label rendered inside the dot (e.g. a note name, "H", "♭5"). */
  label?: string;
}

export interface SkillNode {
  id: string;                         // "g-t1-power", "p-key-C-scale"
  instrument: Instrument | "shared";  // "shared" = music theory / ear (shows in both graphs)
  title: string;
  tier: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  category: SkillCategory;
  prereqs: string[];                  // node ids — the DAG edges (REAL, checked)
  masteryDrill: string;               // the concrete drill text
  unlock: string;                     // the capability sentence ("Can solo over rock/blues")
  // optional render hints (guitar)
  viz?: "chord_diagram" | "fretboard_map" | "tab" | "animation";
  chordShape?: number[];              // e.g. [-1,0,2,2,1,0] for Am (-1 = muted)
  cagedShape?: "E" | "A" | "G" | "C" | "D";
  // optional linkage to existing systems
  chainDrillId?: string;              // completing this drill marks node in-progress/learned
  keyId?: KeyId;                      // for per-key nodes, ties to keyDepths
  unlockCardId?: string;             // UnlockCard.id earned when this node becomes `learned` (explicit, not title-matched)
  // R10 — autonomous-stage check. When present, the node has a SECOND milestone
  // ("fluent") beyond `learned`: pass this test (perform while doing something
  // else) to prove the skill is automatic, not just recallable.
  fluencyTest?: { prompt: string };
  // ── V4 soul-first labels + path membership (all optional, backward-compatible) ──
  soulTitle?: string;   // feeling/outcome-first label, e.g. "The Rock Chug", "Make a Note Cry"
  keepTitle?: string;   // the theory name kept as a tappable subtitle; defaults to `title`
  pathTags?: PathTag[]; // path membership; untagged = shown on every path
  theory?: boolean;     // true = node only renders when theoryEnabled is on
  // V4 Phase 2 (content) — optional rich, term-annotated variants of the plain
  // strings. The plain `masteryDrill` / `unlock` strings remain the always-present
  // fallback, so a node renders correctly even if the rich variant is absent.
  richMasteryDrill?: ReactNode;
  richUnlock?: ReactNode;
}

// ---- Teaching content (V5 "real content") ----
// Every skill node gets a NodeLesson: the actual lesson, not a one-line drill
// string. Stored as PLAIN STRINGS (JSON-serializable, so content can be generated
// + fact-checked as data) keyed by node id in lib/<instrument>/lessons.ts. The
// renderer auto-links any glossary term found in the prose via the existing term
// scanner, so authors just write natural prose using real term words ("power
// chord", "G major") and the chips appear. A node with no lesson degrades to the
// old masteryDrill/unlock one-liners (never a blank panel).
export interface LessonStep {
  do: string;     // the concrete action to take, in plain language
  feel?: string;  // the sensory cue / what to notice ("lightest pressure that rings clean")
}
export interface NodeLesson {
  what: string;        // what this actually is, feeling-first, no unexplained jargon
  why: string;         // why it matters — the real playing it unlocks
  steps: LessonStep[]; // 3-6 ordered "do this, then this" steps — the actual HOW
  goodWhen: string;    // the success check: what "you've got it" looks/sounds like
  watchOut?: string;   // the #1 common mistake and how to fix it
  song?: { name: string; note: string }; // a real song that uses this, for motivation
  // Optional "Go deeper" links to high-quality OUTSIDE resources (videos, books,
  // free lesson libraries). Rendered as a quiet external-link footer under the
  // lesson. Instrument-agnostic (benefits all instruments); only populated where
  // a genuinely great, verified resource exists — never padded.
  resources?: { name: string; url: string; note: string }[];
}

// ---- Per-skill mastery state (replaces the dead `requires` system) ----
export interface SkillProgress {
  status: SkillNodeStatus;            // computed, but persisted snapshot allowed
  reps: number;
  maxBpm?: number;
  firstReachedAt?: string;
  learnedAt?: string;
  // ── V3 quality signals (all optional, backward-compatible) ──
  attempts?: number;                  // R3 — total rep attempts recorded
  successes?: number;                 // R3 — successful reps (→ success rate)
  bpmReached?: number;                // R5 — highest tempo cleared on the ladder
  // Curriculum #2 — count of sessions that cleared the drill's authored target
  // ceiling. Drives the cross-session targetBpm ceiling bump (drillConfig.ts).
  targetClears?: number;
  // Curriculum #2 (transition fluency) — best clean chord-changes/min recorded
  // for a transition-pair node (transitionDrill.ts). Set on a transition node id.
  bestChanges?: number;
  fluent?: boolean;                   // R10 — passed the autonomous fluency test
  fluentAt?: string;                  // R10 — ISO when fluency was reached (distinct from learnedAt)
}

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
  // ── V3 motor-learning rep structure (all optional, backward-compatible) ──
  // Per-step overrides; when absent the drill-level config (below) applies.
  repBlocks?: RepBlockConfig;   // R2 micro-rest cadence for this step
  bpmLadder?: BpmLadderConfig;  // R5 tempo ladder for this step
  // V4 Phase 2 (content) — term-annotated instruction; plain `instruction` is the
  // always-present fallback.
  richInstruction?: ReactNode;
}

// R2 — micro-rest structure: do N reps, then rest, repeat. The rest between
// short rep-blocks is where early motor consolidation happens (Bönstrup 2020).
export interface RepBlockConfig {
  repsPerBlock: number; // reps before a micro-rest (default 3)
  restSec: number;      // seconds of enforced rest between blocks (default 12)
}

// R5 — tempo ladder: start slow, auto-advance +step BPM after a run of
// consecutive successes, never exceeding targetBpm.
export interface BpmLadderConfig {
  startBpm: number;
  targetBpm: number;
  step: number;                 // BPM added per advance (default 5)
  advanceAfterSuccesses: number; // consecutive successes to advance (default 3)
}

// Shared defaults so callers/UI can fill the gaps without hardcoding.
export const DEFAULT_REP_BLOCKS: RepBlockConfig = { repsPerBlock: 3, restSec: 12 };
export const DEFAULT_BPM_LADDER_STEP = 5;
export const DEFAULT_BPM_ADVANCE_AFTER = 3;

export interface ChainDrill {
  id: string;
  instrument: Instrument; // required from P1 — every drill literal is instrument-tagged.
  phase: Phase;
  name: string;
  minutes: number;
  ghostKey: KeyId;
  pillar: Pillar;
  steps: ChainStep[];
  closingNote: string;
  // V4 — feeling/outcome-first drill name, e.g. "Your First Solo" instead of
  // "Am Pentatonic Chain". When absent the theory `name` is the fallback.
  soulName?: string;
  // ── V3 motor-learning config (all optional, backward-compatible) ──
  repBlocks?: RepBlockConfig;  // R2 default micro-rest cadence for the drill
  bpmLadder?: BpmLadderConfig; // R5 default tempo ladder for the drill
  interleavable?: boolean;     // R4 — may participate in interleaved rep sequences
  // Curriculum #2 — when set, this is a TIMED CHORD-TRANSITION drill (not a rep
  // drill): drill a chord PAIR for 60s and count clean changes. The id matches a
  // TransitionPair.pairId (transitionDrill.ts). The slot renders the transition
  // counter instead of the rep engine, and clearing the threshold marks the
  // linked node learned (gating the target song via the DAG prereq).
  transitionPairId?: string;
  // Drums — the sticking pattern this drill trains, rendered as the RhythmGrid
  // reference (count + R/L + accents/rests) and sounded by "Hear it" (playSticking).
  // Tonal instruments (piano/guitar) leave this undefined; their chain-drill
  // reference is the I-IV-V-I progression + scale instead.
  pattern?: StickingCell[];
}

export type WarmupType =
  | "ghost-scale" | "weight-transfer" | "triad-tour" | "mirror" | "free"
  | "parallel-sets" | "tone-drill";

export interface Warmup {
  id: WarmupType;
  instrument: Instrument; // required from P1 — every warmup literal is instrument-tagged.
  label: string;
  lines: string[]; // instructions. Kept short, scannable.
  postureLine: string;
  // V4 — feeling-first one-liner, e.g. "Loosen up in the home shape" instead of
  // "G major scale". When absent `label` is the fallback.
  soulSummary?: string;
}

export type EarRoundType =
  | "interval" | "quality" | "cadence" | "progression" | "updown" | "scale-degree" | "maj-min"
  | "rhythm"; // drums — rhythm dictation (which subdivision / which pattern)

export interface EarChoice {
  label: string;
  id: string;
  // V4 — glossary key so an ear-round choice label becomes a tappable TermChip.
  termId?: string;
}
// Ear-level gating: node ids that must ALL be `learned` before that level's ear
// content may appear. Keyed by the ear level it guards. L1 is ungated (the entry
// round is always allowed); a level with no entry here is unrestricted. A module
// that omits earLevelGates entirely is fully unrestricted (opt-in gating). See
// earProgression.maxAllowedEarLevel for the prefix semantics.
export type EarLevelGates = Partial<Record<2 | 3 | 4 | 5, string[]>>;

// A single sounded hit in a drum sticking pattern: which hand, whether accented,
// and whether it is a silent rest (a gap the player leaves). Pure data so the
// percussion audio layer + the RhythmGrid render from ONE shape.
export interface StickingCell {
  hand?: "R" | "L";  // omitted when `rest` is true (nothing sounds)
  accent?: boolean;  // played measurably louder (the ">" wedge)
  rest?: boolean;    // a silence in the pattern (rendered "–", no audio)
  count?: string;    // the count syllable under this cell ("1", "e", "&", "a")
}

export interface EarRound {
  id: string;
  type: EarRoundType;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7; // from ear ladder L1..L7
  prompt: string;
  correctId: string;
  choices: EarChoice[];
  // payload for audio
  audio: {
    kind: "interval" | "triad" | "cadence" | "progression" | "scale-degree" | "tonicized-note" | "sticking";
    key: KeyId;
    notes?: string[]; // scientific pitch e.g. "C4" "E4"
    chords?: string[][]; // array of chord tones
    keyCenter?: string; // "C4" — for scale-degree rounds
    // Percussion (drums) rounds: the sticking pattern to play + its tempo.
    // `key` stays a KeyId token for type-compatibility but is unused here.
    sticking?: StickingCell[];
    bpm?: number;
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

// Daily-loop shape. Shared so the progression engine (XP scaling) and todayPlan
// reference one source of truth. todayPlan re-exports this as `TodayMode`.
export type SessionMode = "full" | "short" | "long" | "just-play" | "first-back";
export type TodayMode = SessionMode;

// R3/R8 — per-session drill quality capture. The rep-engine UI (P2) populates
// this; the XP engine weights the drill award by it, and node completion gates
// on the success rate. Absent → treated as a plain completion (back-compatible).
export interface SessionQuality {
  attempts?: number;     // total reps attempted in the chain-drill slot
  successes?: number;    // reps cleared cleanly (→ success rate)
  bpmReached?: number;   // highest BPM-ladder step cleared this session (R5)
  metronomeOn?: boolean; // practiced with the metronome (R8 quality bonus)
  interleaved?: boolean; // the chain-drill used an interleaved rep order (R4)
}

export interface SessionLog {
  id: string;                   // date + nanotime
  instrument?: Instrument;      // §7 hedge — tag sessions so per-instrument filtering is possible without a v3 migration
  startedAt: string;            // ISO
  endedAt: string;              // ISO
  minutes: number;
  ghostKey: KeyId;
  phase: Phase;
  pieceId?: string;
  chainDrillId?: string;
  earResults?: { correctIds: string[]; wrongIds: string[] };
  journal?: string;             // free slot one-liner
  mode: SessionMode;
  slotsTouched: SessionSlotLog[];
  quality?: SessionQuality;     // V3 — per-rep quality summary (optional)
}

// ------------ Arc events ------------

export type ArcEventKind =
  | "instrument-begins" | "phase-begins" | "unlock" | "piece-yours" | "first-improv" | "piece-started"
  | "level-up"  // gamification: surfaced on the Arc when XP crosses a level threshold
  | "ear-level-up"; // pattern-recognition: surfaced when earLevel auto-advances

export interface ArcEvent {
  id: string;
  at: string; // ISO
  kind: ArcEventKind;
  instrument?: Instrument;      // §7 hedge — tag arc events per instrument for future per-instrument timelines
  label: string;
  detail?: Record<string, unknown>;
}

// ------------ App State (localStorage) ------------

// Forgiving gamification streak. `lastPracticeDate` is a LOCAL "YYYY-MM-DD" key
// (not an ISO timestamp) so calendar-day comparison is timezone-stable.
export interface StreakState {
  current: number;
  longest: number;
  lastPracticeDate?: string; // "YYYY-MM-DD"
}

// R7 — spaced-retrieval queue entry for a learned skill node. `dueAt` is an ISO
// timestamp; `intervalIndex` indexes the expanding ladder 1→3→7→14 days.
export interface SkillReviewEntry {
  dueAt: string;        // ISO — when this node is next due for review
  intervalIndex: number; // position in REVIEW_INTERVALS_DAYS
}

export interface AppState {
  version: 6;                   // v1→…→v6 migrations in storage.ts
  instrument: Instrument;       // NEW — active instrument for this profile
  firstOpenedAt?: string;       // ISO
  name?: string;                // optional display name
  northStar?: string;           // onboarding answer
  hasKeyboardNow?: boolean;
  phase: Phase;
  grade: Grade;
  earLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  // The floor for how high ear content may go regardless of what the skill tree
  // has taught — the user's self-reported level at onboarding. The EFFECTIVE ear
  // level is max(what the tree has taught, this floor), so a genuinely-advanced
  // learner who says so is trusted, while auto-advance can only exceed the floor
  // once the tree has actually taught the content (earProgression.maxAllowedEarLevel).
  // Absent → treated as 1 (existing users are clamped to tree-taught content; the
  // v5→v6 migration writes 1 for every pre-existing profile).
  earLevelFloor?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  currentPieceId?: string;
  // Per-instrument snapshot of the current piece, so switching instruments never
  // surfaces (say) a piano piece while guitar is active. Reconciled in the header
  // instrument switcher via lib/pieces.reconcileCurrentPieceForSwitch.
  currentPieceByInstrument?: Partial<Record<Instrument, string>>;
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
  // NEW — DAG skill-node mastery, keyed by SkillNode.id
  skillProgress?: Record<string, SkillProgress>;
  // R7 (storage v4) — spaced-retrieval queue, keyed by SkillNode.id. Populated
  // when a node becomes `learned`; each review advances the interval.
  skillReview?: Record<string, SkillReviewEntry>;
  // ── V2 gamification (storage v3) — layered ON TOP of the progression model ──
  xp: number;                   // lifetime XP total
  level: number;                // derived from xp via progression.levelForXp (cached)
  streak: StreakState;          // forgiving daily-practice streak
  pendingLevelUps?: number[];   // level numbers reached but not yet shown (B2 reward moment)
  // ── V4 soul-first learning (storage v5) ──
  // Chosen intent. `undefined` = show everything (back-compat for existing users,
  // who get a one-time nudge rather than forced re-onboarding).
  learningPath?: PathTag;
  // Whether theory nodes render. Independent of path; forced true when go-deep.
  theoryEnabled?: boolean;
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
export function pieceRepId(pieceId: string): string {
  return `piece:${pieceId}`;
}
