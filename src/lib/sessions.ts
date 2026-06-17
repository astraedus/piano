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
import {
  markNodeProgress,
  meetsLearnSuccessRate,
  prereqsMet,
  resolveStatus,
} from "./skillTree";
import { levelForXp, localDateKey, updateStreak, xpForSession } from "./progression";
import { advanceReview, dueReviews, enqueueReview } from "./skillReview";
import { nextEarLevel, earLevelAdvanced, earLevelLabel, type EarTally } from "./earProgression";
import { clearedTarget } from "./drillConfig";
import { songUnlocksForNewlyLearned } from "./progressionSongs";

export function endSession(
  state: AppState,
  logBase: Omit<SessionLog, "id">,
  date: Date
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
  const chainDrills = getModuleSync(state.instrument)?.chainDrills ?? [];
  const prevProgress = state.skillProgress ?? {};
  const prevStatus = resolveStatus(nodes, prevProgress);

  // R3/R5/R8 — per-rep quality captured by the rep-engine (P2). Absent on legacy
  // sessions, in which case completion is NOT gated on success rate (back-compat).
  const q = log.quality ?? {};
  const qualityOpts = {
    attempts: q.attempts,
    successes: q.successes,
    bpmReached: q.bpmReached,
  };

  // Transition nodes are owned EXCLUSIVELY by the TransitionDrill threshold path
  // (bestChanges >= target/min, persisted via patch in the slot). They must NOT be
  // learnable through the generic drill-completion loop — the transition drill
  // reports via onCompleteAction, not onQualityChangeAction, so log.quality is
  // undefined and the success-rate gate would (wrongly) pass on a zero-score run.
  const transitionDrillIds = new Set(
    chainDrills.filter((d) => d.transitionPairId).map((d) => d.id),
  );

  let nextProgress = prevProgress;
  for (const node of nodes) {
    if (prevStatus.get(node.id) === "learned") continue;
    if (node.chainDrillId && transitionDrillIds.has(node.chainDrillId)) continue;
    if (!nodeSatisfiedThisSession(node, log, keyDepths)) continue;

    // Record this session's quality on the node first (so the success-rate gate
    // reads the accumulated total, including this session's reps).
    nextProgress = markNodeProgress(nextProgress, node.id, { now: log.endedAt, ...qualityOpts });

    // R3 gate: a node becomes `learned` only when prereqs are met AND recent
    // success rate is solidly high. With no quality data the rate gate passes
    // (legacy behavior). With data, sloppy practice keeps the node in-progress.
    if (!prereqsMet(node, nextProgress)) continue;
    if (!meetsLearnSuccessRate(nextProgress[node.id])) continue;
    nextProgress = markNodeProgress(nextProgress, node.id, { learned: true, now: log.endedAt });
  }

  // #2 — cross-session ceiling scaling. When this session cleared the authored
  // target BPM of the drill that ran, bump that drill's node targetClears so the
  // effective ceiling can rise (drillConfig.bumpedTargetBpm). Runs even for
  // already-learned nodes — a beaten drill should keep getting harder, not stop.
  if (log.chainDrillId && q.bpmReached != null) {
    const ranDrill = chainDrills.find((d) => d.id === log.chainDrillId);
    if (ranDrill && clearedTarget(ranDrill.bpmLadder ?? null, q.bpmReached)) {
      const clearedNode = nodes.find((n) => n.chainDrillId === log.chainDrillId);
      if (clearedNode) {
        nextProgress = markNodeProgress(nextProgress, clearedNode.id, {
          reps: 0,
          now: log.endedAt,
          targetClearsDelta: 1,
        });
      }
    }
  }

  const nextStatus = resolveStatus(nodes, nextProgress);
  const newlyLearned = nodes.filter(
    (n) => nextStatus.get(n.id) === "learned" && prevStatus.get(n.id) !== "learned",
  );

  // ── R7: spaced-retrieval queue ──
  // Newly-learned nodes get enqueued (+1 day). Any node already due for review
  // that was practiced this session advances along the 1→3→7→14 day ladder.
  let skillReview = state.skillReview ?? {};
  for (const node of newlyLearned) {
    skillReview = enqueueReview(skillReview, node.id, log.endedAt);
  }
  const dueNow = new Set(dueReviews(skillReview, log.endedAt));
  const newlyLearnedIds = new Set(newlyLearned.map((n) => n.id));
  for (const node of nodes) {
    if (newlyLearnedIds.has(node.id)) continue; // just enqueued, don't double-advance
    if (!dueNow.has(node.id)) continue;
    if (!nodeSatisfiedThisSession(node, log, keyDepths)) continue;
    skillReview = advanceReview(skillReview, node.id, log.endedAt);
  }

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

  // #7 — Pop-Formula song-unlock cards. When the progression-container node
  // (e.g. p-t2-pop-formula / g-t1-openDGC) first becomes learned, fire ONE
  // representative "You can now play X" card per progression. Same dedupe as
  // above (earnedIds) so a card never re-fires once shown.
  for (const card of songUnlocksForNewlyLearned(state.instrument, newlyLearnedIds)) {
    if (earnedIds.has(card.id)) continue;
    earnedIds.add(card.id);
    newlyEarned.push({ ...card, addedAt: log.endedAt });
  }

  const unlocks = [...(state.unlocks ?? []), ...newlyEarned];
  const pendingUnlocks = [...(state.pendingUnlocks ?? []), ...newlyEarned];

  // ── Gamification (V2 Phase A): XP / level / streak, layered on top ──
  // Count keys/areas that gained depth this session (compare before → after).
  const prevDepths = state.keyDepths ?? {};
  let depthUps = 0;
  for (const k of Object.keys(keyDepths) as KeyId[]) {
    if ((keyDepths[k] ?? 0) > (prevDepths[k] ?? 0)) depthUps++;
  }
  const earCorrect = log.earResults?.correctIds.length ?? 0;

  // R5/R8: a BPM-ladder advance is signaled when this session cleared a higher
  // tempo than the node's previously-recorded best on the satisfied drill.
  const bpmStepAdvanced = bpmAdvancedThisSession(nodes, prevProgress, log, keyDepths);

  const earnedXp = xpForSession(log, {
    nodesLearned: newlyLearned.length,
    depthUps,
    earCorrect,
    bpmStepAdvanced,
  });
  const xp = (state.xp ?? 0) + earnedXp;

  const prevLevel = state.level ?? 1;
  const nextLevel = levelForXp(xp).level;

  // A level-up queues a reward moment (mirrors how skill-node unlocks queue a
  // pending card) and drops a level-up marker on the Arc — one per crossed level.
  const pendingLevelUps = [...(state.pendingLevelUps ?? [])];
  if (nextLevel > prevLevel) {
    for (let lvl = prevLevel + 1; lvl <= nextLevel; lvl++) {
      pendingLevelUps.push(lvl);
      arc.push({
        id: `level-up-${lvl}-${id}`,
        at: log.endedAt,
        kind: "level-up",
        instrument: state.instrument,
        label: `reached level ${lvl}`,
        detail: { level: lvl },
      });
    }
  }

  // Forgiving streak: a single missed day is auto-graced (see progression.ts).
  const streak = updateStreak(state.streak ?? { current: 0, longest: 0 }, localDateKey(date));

  // ── Pattern-Recognition axis: auto-advance earLevel ──
  // Read the recent window of ear results (this session is already in `sessions`)
  // and bump earLevel one step when accuracy is solidly high. Capped at L5 (only
  // L1–L5 have authored rounds). Emits an `ear-level-up` arc event on advance.
  const prevEarLevel = state.earLevel;
  const earWindow: EarTally[] = sessions
    .map((s) => ({
      correct: s.earResults?.correctIds.length ?? 0,
      wrong: s.earResults?.wrongIds.length ?? 0,
    }));
  const earLevel = nextEarLevel(prevEarLevel, earWindow);
  if (earLevelAdvanced(prevEarLevel, earLevel)) {
    arc.push({
      id: `ear-level-up-${earLevel}-${id}`,
      at: log.endedAt,
      kind: "ear-level-up",
      instrument: state.instrument,
      label: `ear level ${earLevel} — ${earLevelLabel(earLevel)}`,
      detail: { earLevel },
    });
  }

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
    skillReview,
    xp,
    level: nextLevel,
    streak,
    pendingLevelUps,
    earLevel,
  };
  return { state: nextState, newUnlocks: newlyEarned };
}

/** True iff the session's reported bpmReached exceeds the prior best on any node
 *  this session satisfied — i.e. a BPM-ladder step was advanced (R5/R8). */
function bpmAdvancedThisSession(
  nodes: SkillNode[],
  prevProgress: Record<string, SkillProgress>,
  log: SessionLog,
  keyDepths: Partial<Record<KeyId, KeyDepth>>,
): boolean {
  const bpm = log.quality?.bpmReached;
  if (bpm == null) return false;
  for (const node of nodes) {
    if (!nodeSatisfiedThisSession(node, log, keyDepths)) continue;
    if (bpm > (prevProgress[node.id]?.bpmReached ?? 0)) return true;
  }
  return false;
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
