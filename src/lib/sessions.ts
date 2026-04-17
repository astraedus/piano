import type { AppState, ArcEvent, KeyDepth, KeyId, SessionLog, UnlockCard } from "./types";
import { UNLOCK_LIBRARY } from "./unlocks";

export function endSession(
  state: AppState,
  logBase: Omit<SessionLog, "id">,
  _date: Date
): { state: AppState; newUnlocks: UnlockCard[] } {
  const id = `${logBase.startedAt}-${Math.random().toString(36).slice(2, 7)}`;
  const log: SessionLog = { id, ...logBase };

  // Session log
  const sessions = [...(state.sessions ?? []), log];

  // Last session ended marker
  const lastSessionEndedAt = log.endedAt;

  // Depth bump for ghost key
  const keyDepths = depthBumpForSession(state.keyDepths ?? {}, log);

  // Update piece minutes
  const pieces = state.pieces.map((p) => p.id === log.pieceId ? { ...p, minutes: p.minutes + log.minutes } : p);

  // Arc events
  const arc: ArcEvent[] = [...(state.arc ?? [])];
  if (sessions.length === 1) {
    arc.push({ id: `first-session-${id}`, at: log.endedAt, kind: "piece-started", label: "first session" });
  }
  const priorImprov = sessions.slice(0, -1).some((s) => s.chainDrillId);
  if (!priorImprov && log.chainDrillId) {
    arc.push({ id: `first-improv-${id}`, at: log.endedAt, kind: "first-improv", label: "first chain drill — first improvisation." });
  }

  // recentDrillIds — keep last 5
  const recentDrillIds = [log.chainDrillId, ...(state.recentDrillIds ?? [])]
    .filter((x): x is string => !!x)
    .slice(0, 5);

  // Unlock check — pick any library unlock whose simple heuristic triggers.
  const earnedIds = new Set((state.unlocks ?? []).map((u) => u.id));
  const newlyEarned: UnlockCard[] = [];
  for (const card of UNLOCK_LIBRARY) {
    if (earnedIds.has(card.id)) continue;
    if (shouldUnlock(card, state, { ...state, sessions, keyDepths, pieces, arc })) {
      newlyEarned.push({ ...card, addedAt: log.endedAt });
    }
  }
  const unlocks = [...(state.unlocks ?? []), ...newlyEarned];

  const nextState: AppState = {
    ...state,
    sessions,
    lastSessionEndedAt,
    keyDepths,
    pieces,
    arc,
    unlocks,
    recentDrillIds,
  };
  return { state: nextState, newUnlocks: newlyEarned };
}

export function depthBumpForSession(
  current: Partial<Record<KeyId, KeyDepth>>,
  log: SessionLog
): Partial<Record<KeyId, KeyDepth>> {
  const next = { ...current };
  const ghost = log.ghostKey;
  const cur = (next[ghost] ?? 0) as KeyDepth;
  // Heuristics based on slots touched:
  const slots = new Map(log.slotsTouched.map((s) => [s.slot, s]));
  const didWarmup = slots.get("warmup")?.touched;
  const didChain = slots.get("chain")?.touched && !!log.chainDrillId;

  let bumpTo: KeyDepth = cur;
  if (didWarmup && cur < 1) bumpTo = 1;               // Heard
  if (didChain && cur < 2) bumpTo = 2;                // Walked
  if (didChain && log.mode !== "first-back" && cur < 3) bumpTo = 3; // Played (with chain drill + real practice)
  next[ghost] = bumpTo;

  // Piece in key → Lived
  if (log.pieceId) {
    // Note: actual keyId of piece is elsewhere; skip — SongShelf promotion handles that.
  }
  return next;
}

function shouldUnlock(card: UnlockCard, _prev: AppState, state: AppState): boolean {
  // Minimal heuristics. Better: add explicit requirements to each card.
  const sessions = state.sessions.length;
  const keysTouched = Object.values(state.keyDepths).filter((d) => (d ?? 0) > 0).length;
  const anyChain = state.sessions.some((s) => s.chainDrillId);
  const anyImprov = anyChain;
  const pieceCount = state.pieces.length;
  const yoursCount = state.pieces.filter((p) => p.status === "yours").length;

  switch (card.id) {
    case "u-p1-keyboard-map":  return sessions >= 3;
    case "u-p1-c-map":         return (state.keyDepths.C ?? 0) >= 2;
    case "u-p1-first-improv":  return anyImprov && sessions >= 2;
    case "u-p1-minor-feeling": return state.sessions.some((s) => (s.earResults?.correctIds?.length ?? 0) >= 2);
    case "u-p2-chord-under-melody": return state.phase >= 2 && anyChain;
    case "u-p2-pop-formula":   return state.phase >= 2 && sessions >= 8;
    case "u-p2-4-bar-improv":  return state.phase >= 2 && sessions >= 10;
    case "u-p2-first-transcribe": return state.phase >= 2 && keysTouched >= 3;
    case "u-p3-ii-v-i":        return state.phase >= 3 && sessions >= 3;
    case "u-p3-pop-pull":      return state.phase >= 3 && sessions >= 6;
    case "u-p3-three-moods":   return state.phase >= 3 && sessions >= 5 && pieceCount >= 2;
    case "u-p3-lead-sheet":    return state.phase >= 3 && yoursCount >= 1;
  }
  return false;
}
