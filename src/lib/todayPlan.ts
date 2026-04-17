import type { AppState, ChainDrill, EarRound, KeyId, Warmup } from "./types";
import { ghostKeyFor, weeksSinceEpoch } from "./ghostKey";
import { warmupForWeek } from "./warmups";
import { pickChainDrill } from "./chainDrillPicker";
import { miniShelfLineFor } from "./miniShelfLines";

export type TodayMode = "full" | "short" | "long" | "first-back" | "just-play";

export interface TodayPlan {
  mode: TodayMode;
  ghostKey: KeyId;
  warmup: Warmup;
  pieceId?: string;
  chainDrill?: ChainDrill | null;
  earRound?: EarRound | null;
  northStarNudge?: string | null;
  miniShelfLine?: string | null;
  firstBackMessage?: string | null;
  gapDays?: number;
}

export function computeTodayPlan(state: AppState, date: Date, overrideMode?: TodayMode): TodayPlan {
  const ghostKey = ghostKeyFor(state, date);
  const warmup = warmupForWeek(weeksSinceEpoch(date), state.phase);

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
      northStarNudge = `you said: ${state.northStar}. keep going.`;
    }
  }

  return {
    mode,
    ghostKey,
    warmup,
    pieceId: state.currentPieceId,
    chainDrill,
    earRound: null, // generated independently in the Piano Stand
    northStarNudge,
    miniShelfLine: miniShelfLineFor(state, date),
    firstBackMessage,
    gapDays: gapDays ?? undefined,
  };
}

function gapDaysSince(iso: string | undefined, date: Date): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  const day = 86400000;
  return Math.floor((date.getTime() - then) / day);
}
