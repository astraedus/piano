import type {
  AppState,
  BpmLadderConfig,
  ChainDrill,
  EarRound,
  KeyId,
  RepBlockConfig,
  SkillNode,
  TodayMode,
  Warmup,
} from "./types";
import { ghostKeyFor, weeksSinceEpoch } from "./ghostKey";
import { buildInterleavePlan, pickChainDrill, type InterleavePlan } from "./chainDrillPicker";
import { dueReviews } from "./skillReview";
import { miniShelfLineFor } from "./miniShelfLines";
import { getModuleSync, type InstrumentModule } from "./instrumentRegistry";

// Resolve the active instrument's module from the sync cache, falling back to
// piano (plan §6 todayPlan). The piano module is imported at app init so the
// cache is warm before any computeTodayPlan call.
function resolveModule(state: AppState): InstrumentModule | undefined {
  return getModuleSync(state.instrument) ?? getModuleSync("piano");
}

// Weekly warmup rotation, computed from the module's warmups + rotation lists.
// (Was the standalone warmupForWeek in lib/warmups.ts before the piano move.)
function warmupForWeek(module: InstrumentModule | undefined, weekNumber: number, phase: number): Warmup | undefined {
  if (!module) return undefined;
  const rotation = phase >= 2 ? module.warmupRotation.phase2Plus : module.warmupRotation.phase1;
  if (rotation.length === 0) return undefined;
  const idx = ((weekNumber % rotation.length) + rotation.length) % rotation.length;
  return module.warmups[rotation[idx]];
}

export type { TodayMode };

export interface TodayPlan {
  mode: TodayMode;
  ghostKey: KeyId;
  // Absent only if the instrument module failed to register (the piano module
  // self-registers at app init, so in practice this is always present).
  warmup?: Warmup;
  pieceId?: string;
  chainDrill?: ChainDrill | null;
  earRound?: EarRound | null;
  northStarNudge?: string | null;
  miniShelfLine?: string | null;
  firstBackMessage?: string | null;
  gapDays?: number;
  // ── V3 motor-learning data (consumed by P2/P3 UI) ──
  // R2/R5 — the resolved drill's micro-rest + tempo-ladder config, surfaced here
  // so the rep-engine can read them without re-resolving the drill. Absent when
  // the drill defines none (piano behavior unchanged when unset).
  repBlocks?: RepBlockConfig | null;
  bpmLadder?: BpmLadderConfig | null;
  // R4 — interleaved rep sequence when 2-3 established skills can be woven. Null
  // when there aren't enough eligible skills (the default single-drill flow).
  interleave?: InterleavePlan | null;
  // R7 — learned skill nodes due for spaced review today, for P3 to surface in
  // free-play / ear slots. Empty array when nothing is due.
  reviewSkills: SkillNode[];
}

export function computeTodayPlan(state: AppState, date: Date, overrideMode?: TodayMode): TodayPlan {
  const module = resolveModule(state);
  const ghostKey = ghostKeyFor(state, date);
  const warmup = warmupForWeek(module, weeksSinceEpoch(date), state.phase);

  // Gap detection from lastSessionEndedAt
  const gapDays = gapDaysSince(state.lastSessionEndedAt, date);
  let mode: TodayMode = overrideMode ?? "full";
  let firstBackMessage: string | null = null;
  if (!overrideMode && gapDays !== null && gapDays >= 3) {
    mode = "first-back";
    if (gapDays < 7) firstBackMessage = "a few days — picking up where we left off.";
    else if (gapDays < 14) firstBackMessage = "a little while. nothing to rebuild.";
    else if (gapDays < 60) firstBackMessage = "welcome back. short one tonight.";
    else firstBackMessage = "welcome back. start lighter — come back stronger later.";
  }

  const chainDrill = mode === "first-back" || mode === "just-play" ? null : pickChainDrill(state, date);

  // R2/R5 — surface the resolved drill's rep-block + BPM-ladder config (null when
  // the drill defines none, keeping piano behavior identical for unconfigured drills).
  const repBlocks = chainDrill?.repBlocks ?? null;
  const bpmLadder = chainDrill?.bpmLadder ?? null;

  // R4 — build an interleaved rep sequence when enough established skills qualify.
  // Skipped in the light modes (first-back / just-play) where there's no chain slot.
  const interleave = mode === "first-back" || mode === "just-play"
    ? null
    : buildInterleavePlan(state, date, chainDrill);

  // R7 — learned nodes due for spaced review today, resolved to full SkillNodes.
  const allNodes = module?.skillNodes ?? [];
  const dueIds = new Set(dueReviews(state.skillReview ?? {}, date.toISOString()));
  const reviewSkills = allNodes.filter((n) => dueIds.has(n.id));

  // North star nudge — once per month, surface for 48h
  let northStarNudge: string | null = null;
  if (state.northStar) {
    const hiddenUntil = state.northStarHiddenUntil ? new Date(state.northStarHiddenUntil).getTime() : 0;
    const showAfter = state.showNorthStarAfter ? new Date(state.showNorthStarAfter).getTime() : 0;
    const now = date.getTime();
    const daysSinceFirst = state.firstOpenedAt
      ? Math.floor((now - new Date(state.firstOpenedAt).getTime()) / (86400000))
      : 0;
    // Show in first 30 days more generously; then once ~every 30 days for 48h.
    const withinFirst30 = daysSinceFirst <= 30;
    const due = now >= showAfter && now >= hiddenUntil;
    if (withinFirst30 || due) {
      northStarNudge = `Your goal: ${state.northStar} Keep going.`;
    }
  }

  // Ear round: if the instrument module supplies its own ear-training set/generator
  // (guitar will, B1), pull from there; otherwise leave null so the Stand keeps
  // generating piano ear rounds independently via the shared earRounds.ts (existing
  // behavior — piano's module.earRounds is undefined).
  const earRound = earRoundFromModule(module, state.earLevel, ghostKey);

  return {
    mode,
    ghostKey,
    warmup,
    pieceId: state.currentPieceId,
    chainDrill,
    earRound,
    northStarNudge,
    miniShelfLine: miniShelfLineFor(state, date),
    firstBackMessage,
    gapDays: gapDays ?? undefined,
    repBlocks,
    bpmLadder,
    interleave,
    reviewSkills,
  };
}

// Resolve an ear round from the module's optional per-instrument ear set/generator.
// Returns null when the module supplies none (piano) — preserving the prior
// behavior where the Stand generates piano ear rounds itself.
function earRoundFromModule(
  module: InstrumentModule | undefined,
  level: EarRound["level"],
  focusId: KeyId,
): EarRound | null {
  const er = module?.earRounds;
  if (!er) return null;
  if (typeof er === "function") return er(level, focusId);
  if (er.length === 0) return null;
  // Pick a level-appropriate round, else the first available.
  return er.find((r) => r.level === level) ?? er[0];
}

function gapDaysSince(iso: string | undefined, date: Date): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  const day = 86400000;
  return Math.floor((date.getTime() - then) / day);
}
