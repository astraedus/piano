import type {
  AppState,
  ArcEvent,
  KeyDepth,
  KeyId,
  SessionLog,
  SkillNode,
  SkillProgress,
  UnlockCard,
} from "./types";
import { getModuleSync } from "./instrumentRegistry";
import { markNodeProgress, prereqsMet, resolveStatus } from "./skillTree";

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

  // Update piece minutes
  const pieces = state.pieces.map((p) => p.id === log.pieceId ? { ...p, minutes: p.minutes + log.minutes } : p);

  // Depth bump for ghost key — resolve the logged piece's key so a piece-in-key
  // session can promote that key to depth 4 (Lived). See B4.
  const playedPiece = pieces.find((p) => p.id === log.pieceId);
  const keyDepths = depthBumpForSession(state.keyDepths ?? {}, log, playedPiece?.keyId);

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

  // ── Skill-DAG node completion → unlocks (B3 / D4 / B2) ──
  // Replaces the dead `requires` system + the hand-coded `shouldUnlock` switch.
  // A node becomes `learned` only when (a) the session satisfied its linked
  // drill/key AND (b) its full prereq chain is already learned — so there is no
  // session-count phase-jump exploit (B2): a tier-3 unlock literally cannot fire
  // until the tier-2 chain is learned.
  const nodes = getModuleSync(state.instrument)?.skillNodes ?? [];
  const unlockLibrary = getModuleSync(state.instrument)?.unlockLibrary ?? [];
  const prevProgress = state.skillProgress ?? {};
  const prevStatus = resolveStatus(nodes, prevProgress);

  let nextProgress = prevProgress;
  for (const node of nodes) {
    if (prevStatus.get(node.id) === "learned") continue;
    if (!nodeSatisfiedThisSession(node, log, keyDepths)) continue;
    if (!prereqsMet(node, nextProgress)) {
      // Record the attempt as progress, but it can't become `learned` until the
      // prereq chain is complete. resolveStatus will keep it locked/in-progress.
      nextProgress = markNodeProgress(nextProgress, node.id, { now: log.endedAt });
      continue;
    }
    nextProgress = markNodeProgress(nextProgress, node.id, { learned: true, now: log.endedAt });
  }

  const nextStatus = resolveStatus(nodes, nextProgress);
  const newlyLearned = nodes.filter(
    (n) => nextStatus.get(n.id) === "learned" && prevStatus.get(n.id) !== "learned",
  );

  // Each newly-learned node with a linked UnlockCard earns that card (once).
  const earnedIds = new Set((state.unlocks ?? []).map((u) => u.id));
  const cardById = new Map(unlockLibrary.map((c) => [c.id, c]));
  const newlyEarned: UnlockCard[] = [];
  for (const node of newlyLearned) {
    if (!node.unlockCardId || earnedIds.has(node.unlockCardId)) continue;
    const card = cardById.get(node.unlockCardId);
    if (!card) continue;
    earnedIds.add(card.id);
    newlyEarned.push({ ...card, addedAt: log.endedAt });
  }

  const unlocks = [...(state.unlocks ?? []), ...newlyEarned];
  const pendingUnlocks = [...(state.pendingUnlocks ?? []), ...newlyEarned];

  const nextState: AppState = {
    ...state,
    sessions,
    lastSessionEndedAt,
    keyDepths,
    pieces,
    arc,
    unlocks,
    pendingUnlocks,
    recentDrillIds,
    skillProgress: nextProgress,
  };
  return { state: nextState, newUnlocks: newlyEarned };
}

/** True iff this session's activity satisfies the node's concrete requirement
 *  (its linked chain drill was played, or its linked key reached real fluency).
 *  Nodes with no linkage can only advance via explicit progress elsewhere. */
function nodeSatisfiedThisSession(
  node: SkillNode,
  log: SessionLog,
  keyDepths: Partial<Record<KeyId, KeyDepth>>,
): boolean {
  if (node.chainDrillId && log.chainDrillId === node.chainDrillId) return true;
  // A per-key node is satisfied once that key has been Walked (depth ≥ 2):
  // scale + triad + I–IV–V–I learned, i.e. the key is genuinely under hand.
  if (node.keyId && (keyDepths[node.keyId] ?? 0) >= 2) return true;
  return false;
}

export function depthBumpForSession(
  current: Partial<Record<KeyId, KeyDepth>>,
  log: SessionLog,
  pieceKeyId?: KeyId,
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

  // Piece in key → Lived (depth 4). B4: previously a TODO, so keys could never
  // reach depth 4 automatically. Per plan §2.2 B4: when the session logs a piece
  // whose key === the ghost/working key, that key becomes Lived ("a full piece
  // lives here"). Real practice only (not first-back) so a quick check-in can't
  // promote. depthBumpForSession runs on `next`, so the ghost may already have
  // been bumped to ≤3 above — depth 4 supersedes it.
  const didPiece = slots.get("piece")?.touched && !!log.pieceId;
  if (didPiece && pieceKeyId && pieceKeyId === ghost && log.mode !== "first-back") {
    const pieceCur = (next[pieceKeyId] ?? 0) as KeyDepth;
    if (pieceCur < 4) next[pieceKeyId] = 4;
  }

  return next;
}
