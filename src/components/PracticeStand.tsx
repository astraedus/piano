"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import { computeTodayPlan } from "@/lib/todayPlan";
import { endSession } from "@/lib/sessions";
import { doneLineFor } from "@/lib/doneLines";
import { KEY_META } from "@/lib/music";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { WarmupSlot } from "./slots/WarmupSlot";
import { PieceSlot } from "./slots/PieceSlot";
import { ChainDrillSlot } from "./slots/ChainDrillSlot";
import { EarMomentSlot } from "./slots/EarMomentSlot";
import { FreeSlot } from "./slots/FreeSlot";
import { generateEarRoundForModule } from "@/lib/earRounds";
import { effectiveEarLevel } from "@/lib/earProgression";
import { drillRepId, scaleRepId, pieceRepId } from "@/lib/types";
import type { EarRound, Instrument } from "@/lib/types";
import { mentalPracticeCopy } from "@/lib/sharedCopy";
import { UnlockCardModal } from "./UnlockCardModal";
import { LevelUpModal } from "./LevelUpModal";
import { XPBar } from "./XPBar";
import { StreakFlame } from "./StreakFlame";
import { Horizons } from "./Horizons";
import { CurrentLessonCard } from "./CurrentLessonCard";
import { GhostPicker } from "./GhostPicker";
import { TermChip } from "./explain";
import { focusEyebrow as focusEyebrowFor, isNonTonal } from "@/lib/focusNoun";
import { ghostKeyToTermId } from "@/lib/pathFilter";
import type { InstrumentModule } from "@/lib/instrumentRegistry";
import { emptyStreak, levelForXp, localDateKey, titleForLevel } from "@/lib/progression";
import {
  slotProgress,
  hasResumableWork,
  repSessionKey,
  type RepSessionSnapshot,
  type SlotKey,
} from "./slots/repResume";
import { shouldShowStartHere } from "@/lib/startHere";
import { GoalRail, ReviewDueBanner, SessionClosureOverlay, type ClosureData } from "./SessionGuidance";
import { nextToLearn } from "@/lib/skillTree";

export function PracticeStand() {
  const router = useRouter();
  const search = useSearchParams();
  const justPlayParam = search?.get("mode") === "just-play";
  const { state, setState, ready, dismissLevelUp } = useAppState();
  // Resolve the active instrument module (sync cache is warm at app init).
  const module = getModuleSync(state.instrument) ?? getModuleSync("piano");

  // Session start
  const startedAt = useMemo(() => new Date().toISOString(), []);
  const [minutes, setMinutes] = useState(0);
  const [sessionLine, setSessionLine] = useState<string | null>(null);
  const [unlocksQueue, setUnlocksQueue] = useState<string[]>([]);
  // End-of-session closure recap (captured at Done, shown after reward moments).
  const [closure, setClosure] = useState<ClosureData | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      const t0 = new Date(startedAt).getTime();
      setMinutes(Math.max(1, Math.round((Date.now() - t0) / 60000)));
    }, 15_000);
    return () => clearInterval(iv);
  }, [startedAt]);

  const plan = useMemo(() => {
    if (!ready) return null;
    const mode = justPlayParam ? "just-play" as const : undefined;
    return computeTodayPlan(state, new Date(), mode);
  }, [state, ready, justPlayParam]);

  // Ear rounds: generate 3 rounds keyed by session+round, using the ACTIVE
  // instrument's generator (guitar serves its own interval/quality/power rounds;
  // piano falls back to the shared generator). The level is clamped to what the
  // curriculum has actually taught (effectiveEarLevel), so the honest gate holds —
  // a beginner never gets cadence/progression rounds on accuracy alone.
  const earLevel = effectiveEarLevel(state, module?.earLevelGates);
  const earRounds: EarRound[] = useMemo(() => {
    if (!plan || plan.mode === "first-back" || plan.mode === "just-play") return [];
    const out: EarRound[] = [];
    for (let i = 0; i < 3; i++) out.push(generateEarRoundForModule(module, earLevel, plan.ghostKey));
    return out;
  }, [plan, module, earLevel]);

  const [earCorrect, setEarCorrect] = useState<string[]>([]);
  const [earWrong, setEarWrong] = useState<string[]>([]);
  const [journal, setJournal] = useState("");
  // R8 — per-rep quality captured by the chain-drill rep-engine, folded into the
  // session log so P1's XP weighting + node success-rate gate read real data.
  const [chainQuality, setChainQuality] = useState<import("@/lib/types").SessionQuality | null>(null);

  if (!ready || !plan) {
    return <div className="text-[color:var(--ink-3)] font-serif italic">Loading…</div>;
  }

  // First-opened redirect handled in page.tsx
  const ghost = KEY_META[plan.ghostKey];
  const piece = state.pieces.find((p) => p.id === state.currentPieceId);
  const printing = false;

  // V5 Start-Here card — a single Welcome pointer for a brand-new learner who has
  // not yet oriented (a tier-0 setup node still unlearned) AND has logged no
  // session. The predicate lives in lib/startHere so the app and its test assert
  // the same rule; it self-hides after the first session or once setup is done, so
  // it never competes with the stand's own "what's next" signals.
  const allNodes = module?.skillNodes ?? [];
  const showStartHere = shouldShowStartHere(
    allNodes,
    state.skillProgress ?? {},
    state.sessions?.length ?? 0,
  );
  const instrumentDisplayName = module?.displayName ?? state.instrument;

  // ── V4 resume UX: derive per-slot done-state, the current "NOW" slot, and any
  // in-flight chain-drill rep session to resume. Done-state comes from the
  // persistent rep counters (warmup scale + chain drill); piece/ear/free have no
  // persistent completion so they fall to the NOW marker by order. Pure helpers
  // (currentSlot / hasResumableWork) are unit-tested in repResume.test.ts. ──
  const warmupDone = !!(plan.warmup && state.skillReps?.[scaleRepId(plan.ghostKey)]);
  const chainDone = !!(plan.chainDrill && state.skillReps?.[drillRepId(plan.chainDrill.id)]);
  // V5 session-guidance: the piece slot joins the rep model. "I worked on it"
  // writes a piece rep; its presence marks the slot done so NOW can advance past
  // it (before this the marker got permanently stuck on the piece).
  const pieceRep = piece ? state.skillReps?.[pieceRepId(piece.id)] : undefined;
  const pieceDone = !!pieceRep;
  const slotDone: Partial<Record<SlotKey, boolean>> = {
    warmup: warmupDone,
    // An empty piece slot has nothing to complete, so it never blocks NOW.
    piece: piece ? pieceDone : true,
    chain: chainDone,
  };
  // The slots actually present tonight, in order, so "Block N of M" + the NOW
  // marker never count or point at a slot that isn't shown (first-back drops the
  // chain + ear slots; piece + free always render).
  const present: SlotKey[] = [
    ...(plan.warmup ? (["warmup"] as SlotKey[]) : []),
    "piece",
    ...(plan.chainDrill ? (["chain"] as SlotKey[]) : []),
    ...(earRounds.length > 0 ? (["ear"] as SlotKey[]) : []),
    "free",
  ];
  const progress = slotProgress(present, slotDone);
  const nowSlot: SlotKey = progress.now;
  const slotStatus = (key: SlotKey): "done" | "active" | null =>
    slotDone[key] ? "done" : null;

  // Read the chain drill's persisted rep session for the "Resume: …, rep N" line.
  // The banner shows whenever there is in-flight, same-day, not-yet-done chain
  // work to pick up — independent of which slot is NOW. (Gating on nowSlot ===
  // "chain" hid it whenever an earlier slot was unfinished, which is exactly when
  // a returning user most needs the pointer.) hasResumableWork already scopes to
  // today + non-finished + has-progress.
  const chainResume = plan.chainDrill
    ? readRepSnapshot(drillRepId(plan.chainDrill.id))
    : null;
  const resumeRepN = chainResume ? chainResume.attempts + 1 : null;
  const showResume = hasResumableWork(chainResume, localDateKey(new Date()));

  const handleDone = () => {
    const endedAt = new Date().toISOString();
    const logBase = {
      startedAt,
      endedAt,
      minutes: Math.max(1, minutes),
      ghostKey: plan.ghostKey,
      phase: state.phase,
      pieceId: piece?.id,
      chainDrillId: plan.chainDrill?.id,
      earResults: { correctIds: earCorrect, wrongIds: earWrong },
      journal: journal.trim() || undefined,
      mode: plan.mode,
      slotsTouched: [
        { slot: "warmup" as const, touched: true },
        { slot: "piece" as const, touched: !!piece },
        { slot: "chain" as const, touched: !!plan.chainDrill },
        { slot: "ear" as const, touched: earRounds.length > 0 },
        { slot: "free" as const, touched: true },
      ],
      // R8 — only attach quality when the rep-engine actually recorded reps, so a
      // session where the user never ran the engine stays back-compatible (no gate).
      quality: chainQuality && (chainQuality.attempts ?? 0) > 0 ? chainQuality : undefined,
    };
    const prevXp = state.xp ?? 0;
    const prevLevel = state.level ?? 1;
    const prevNodes = Object.values(state.skillProgress ?? {}).filter((p) => p?.learnedAt).length;
    const { state: next, newUnlocks } = endSession(state, logBase, new Date());
    setState(next);

    // Compute the real reward deltas so the session-end line celebrates actual
    // numbers (XP gained, streak, level/skill progress) instead of vague copy.
    const xpEarned = (next.xp ?? 0) - prevXp;
    const leveledUp = (next.level ?? 1) > prevLevel;
    const newLevel = next.level ?? 1;
    const nodesLearned = Object.values(next.skillProgress ?? {}).filter((p) => p?.learnedAt).length - prevNodes;
    const info = levelForXp(next.xp ?? 0);
    const headline = doneLineFor({
      minutes: logBase.minutes,
      ghostKeyName: ghost.name,
      pieceTitle: piece?.title,
      xpEarned,
      streakDays: next.streak?.current ?? 0,
      leveledUpTo: leveledUp ? newLevel : undefined,
      newLevelTitle: leveledUp ? titleForLevel(newLevel) : undefined,
      nodesLearned: Math.max(0, nodesLearned),
      xpToNext: info.xpToNextLevel > 0 ? info.xpToNextLevel : undefined,
      nextTitle: titleForLevel(info.level + 1) !== info.title ? titleForLevel(info.level + 1) : undefined,
    });
    setSessionLine(headline);

    // Capture tonight's real numbers for the closure recap. Per-session signals we
    // can trust: chain reps + best BPM (from the rep-engine), ear answers, XP.
    // Warmup/piece/chain "done" reflect the same flags the stand uses all evening.
    const earTotal = earCorrect.length + earWrong.length;
    const reps = chainQuality?.attempts ?? 0;
    const doneAtEnd: Partial<Record<SlotKey, boolean>> = {
      warmup: warmupDone,
      piece: pieceDone,
      chain: reps > 0 || chainDone,
      ear: earTotal > 0,
      free: true,
    };
    const nextUp = nextToLearn(module?.skillNodes ?? [], next.skillProgress ?? {}, 1)[0];
    setClosure({
      headline,
      blocksCompleted: present.filter((s) => doneAtEnd[s]).length,
      blocksTotal: present.length,
      minutes: logBase.minutes,
      reps,
      bestBpm: chainQuality?.bpmReached,
      earRight: earCorrect.length,
      earTotal,
      xpEarned,
      nextTitle: nextUp?.soulTitle ?? nextUp?.title,
    });
    if (newUnlocks.length > 0) setUnlocksQueue(newUnlocks.map((u) => u.id));
    // Redirect to home cleared; the session line + unlock modal show over
  };

  const handlePrint = () => {
    const params = new URLSearchParams();
    if (plan?.chainDrill?.id) params.set("drill", plan.chainDrill.id);
    if (plan?.ghostKey) params.set("ghost", plan.ghostKey);
    router.push(`/print?${params.toString()}`);
  };

  const instrumentLabel = module?.displayName ?? "Piano";

  // Just-play mode: collapse to free slot only
  if (plan.mode === "just-play") {
    return (
      <div>
        <div className="stage-card px-5 py-6 sm:px-7 sm:py-7">
          <Header ghostName={ghost.name} ghostKey={plan.ghostKey} instrumentLabel={instrumentLabel} mode="just-play" module={module} />
          <div className="mt-6">
            <FreeSlot journalInitial={journal} onJournalChange={setJournal} urlInitial={state.freeSlotUrl} reviewSkills={plan.reviewSkills} expanded />
          </div>
          <Footer
            onDone={handleDone}
            onPrint={handlePrint}
            sessionLine={sessionLine}
            miniShelfLine={plan.miniShelfLine ?? null}
          />
        </div>
        <UnlockQueue queue={unlocksQueue} onClose={() => setUnlocksQueue((q) => q.slice(1))} unlocks={state.unlocks} />
        <LevelUpQueue pending={state.pendingLevelUps} onClose={dismissLevelUp} />
        <SessionClosureOverlay
          data={closure}
          blocked={unlocksQueue.length > 0 || (state.pendingLevelUps?.length ?? 0) > 0}
          onClose={() => setClosure(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="stage-card px-5 py-6 sm:px-7 sm:py-7">
        <Header ghostName={ghost.name} ghostKey={plan.ghostKey} instrumentLabel={instrumentLabel} mode={plan.mode} firstBackMessage={plan.firstBackMessage} module={module} />
        {showResume && (
          <ResumeBanner
            slotLabel="Chain drill"
            repN={resumeRepN ?? 1}
          />
        )}
        {/* Desktop (lg+) splits into an info rail + the slot column so the screen
            is no longer ~40% dead gutter. Mobile/tablet stay single-column. */}
        <div className="mt-4 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:items-start">
          {/* Info rail — stats + streak + goal. On mobile it stacks above the
              slots (as today); on lg+ it sits in its own column beside them and
              sticks while you scroll the slots. */}
          <aside className="lg:sticky lg:top-20 space-y-4">
            <StatsStrip xp={state.xp ?? 0} streak={state.streak ?? emptyStreak()} />
            <DailyFramingLine />
            <GoalRail nowSlot={nowSlot} blockIndex={progress.index} blockTotal={progress.total} elapsedMin={minutes} />
            <ReviewDueBanner reviewSkills={plan.reviewSkills} />
          </aside>

          <div>
            {showStartHere && (
              <StartHereCard instrument={instrumentDisplayName} />
            )}
            <MentalPracticeCard firstBack={plan.mode === "first-back"} pieceTitle={piece?.title} instrument={state.instrument} />
            <div className="mt-5">
              <WarmupSlot module={module} warmup={plan.warmup} ghostName={ghost.name} ghostKey={plan.ghostKey} printAlways={printing} isNow={nowSlot === "warmup"} status={slotStatus("warmup")} />
              <PieceSlot module={module} piece={piece} printAlways={printing} isNow={nowSlot === "piece"} status={piece && pieceDone ? "done" : null} />
              <ChainDrillSlot
                module={module}
                drill={plan.chainDrill ?? null}
                interleave={plan.interleave ?? null}
                printAlways={printing}
                forceOpen={nowSlot === "chain"}
                status={chainDone ? "done" : null}
                onQualityChangeAction={setChainQuality}
              />
              <EarMomentSlot
                rounds={earRounds}
                muted={plan.mode === "first-back"}
                printAlways={printing}
                isNow={nowSlot === "ear"}
                status={slotStatus("ear")}
                onResultAction={(correct: string[], wrong: string[]) => { setEarCorrect(correct); setEarWrong(wrong); }}
              />
              <div id="free-play">
                <FreeSlot urlInitial={state.freeSlotUrl} journalInitial={journal} onJournalChange={setJournal} reviewSkills={plan.reviewSkills} printAlways={printing} isNow={nowSlot === "free"} status={slotStatus("free")} />
              </div>
            </div>
          </div>
        </div>
        {/* Map-level bridge: WHICH lesson on the path this session is on, and a
            deep-link into the tree. Quiet, below the actionable slots. */}
        <CurrentLessonCard
          nodes={allNodes}
          progress={state.skillProgress ?? {}}
          chainDrill={plan.chainDrill}
          instrument={state.instrument}
        />
        <Footer
          onDone={handleDone}
          onPrint={handlePrint}
          sessionLine={sessionLine}
          miniShelfLine={plan.miniShelfLine ?? null}
          northStarNudge={plan.northStarNudge ?? null}
        />
      </div>
      <Horizons ghostKey={plan.ghostKey} warmup={plan.warmup} />
      <UnlockQueue queue={unlocksQueue} onClose={() => setUnlocksQueue((q) => q.slice(1))} unlocks={state.unlocks} />
      <LevelUpQueue pending={state.pendingLevelUps} onClose={dismissLevelUp} />
      <SessionClosureOverlay
        data={closure}
        blocked={unlocksQueue.length > 0 || (state.pendingLevelUps?.length ?? 0) > 0}
        onClose={() => setClosure(null)}
      />
    </div>
  );
}

/** Read a chain-drill rep session snapshot from localStorage (browser only). The
 *  pure rehydrate logic lives in repResume; this is just the IO wrapper for the
 *  stand's "Resume: …, rep N" affordance. Returns null on SSR or parse failure. */
function readRepSnapshot(drillRepKey: string): RepSessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(repSessionKey(drillRepKey));
    return raw ? (JSON.parse(raw) as RepSessionSnapshot) : null;
  } catch {
    return null;
  }
}

/** A one-line "pick up where you left off" affordance shown near the top when
 *  there is in-flight chain-drill work to resume on reload (V4 resume UX). */
function ResumeBanner({ slotLabel, repN }: { slotLabel: string; repN: number }) {
  return (
    <div
      data-testid="resume-banner"
      className="mt-4 flex items-center gap-2 rounded-lg border border-[color:var(--accent-soft)] bg-[color:var(--accent)]/8 px-4 py-2.5 text-sm fade-in"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--accent)]" aria-hidden />
      <span className="text-[color:var(--ink-2)]">
        Resume: <span className="font-medium text-[color:var(--ink)]">{slotLabel}</span>, rep {repN}
      </span>
    </div>
  );
}

function Header({ ghostName, ghostKey, instrumentLabel, mode, firstBackMessage, module }: { ghostName: string; ghostKey: import("@/lib/types").KeyId; instrumentLabel: string; mode?: string; firstBackMessage?: string | null; module?: InstrumentModule }) {
  // Instrument-aware focus eyebrow: "Key of the Week" (piano) / "Chord of the
  // Week" (guitar) / "Rudiment of the Week" (drums). The headline uses the module's
  // own focusLabel so the current focus reads in the instrument's terms. On TONAL
  // instruments the focus name is a tappable TermChip (opens the key/chord
  // explainer); on non-tonal drums it is plain text (its token is not a tonal key,
  // so no tonal chip is offered).
  const focusEyebrow = focusEyebrowFor(module?.focusKind);
  const nonTonal = isNonTonal(module?.focusKind);
  const focusName = module ? module.focusLabel(ghostKey) : ghostName;
  return (
    <header className="pb-5 border-b border-[color:var(--bg-rule)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">{focusEyebrow}</div>
        <span className="font-serif italic text-sm px-2.5 py-0.5 rounded-full bg-[color:var(--instrument-accent-bg)] text-[color:var(--instrument-accent-deep)]">
          {instrumentLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-3 mt-1.5 flex-wrap">
        {/* V4 soul-first (spec 4.4.1): the focus name is the theory term itself, so
            it leads as the headline AND is the always-tappable explainer — one tap
            opens "what / hear / see / why" for the week's key/chord. Degrades to
            plain text for keys with no glossary entry (and for drums, whose
            rudiment focus has no tonal chip). */}
        <h1 className="font-serif text-[length:var(--text-3xl)] tracking-[-0.025em] text-[color:var(--ink)]" style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 50" }}>
          {nonTonal ? (
            focusName
          ) : (
            <TermChip term={ghostKeyToTermId(ghostKey)} label={focusName} className="text-[color:var(--ink)] decoration-1" />
          )}
        </h1>
        <GhostPicker current={ghostKey} />
      </div>
      {mode === "first-back" && firstBackMessage && (
        <p className="text-sm text-[color:var(--ink-2)] italic mt-2 fade-in">{firstBackMessage}</p>
      )}
      {mode === "just-play" && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm text-[color:var(--ink-2)] italic">Free play. Anything you want.</p>
          <Link
            href="/"
            className="text-sm font-medium text-[color:var(--accent-deep)] underline decoration-1 underline-offset-2 hover:opacity-80"
          >
            Back to tonight&apos;s plan
          </Link>
        </div>
      )}
    </header>
  );
}

function Footer({ onDone, onPrint, sessionLine, miniShelfLine, northStarNudge }: {
  onDone: () => void;
  onPrint: () => void;
  sessionLine: string | null;
  miniShelfLine: string | null;
  northStarNudge?: string | null;
}) {
  return (
    <footer className="mt-8 pt-5 border-t border-[color:var(--bg-rule)] space-y-6">
      {northStarNudge && (
        <div className="fade-in text-sm text-[color:var(--ink-2)] italic border-l-2 border-[color:var(--accent-soft)] pl-3">
          {northStarNudge}
        </div>
      )}
      {sessionLine ? (
        <div className="card-rise space-y-3">
          <p className="font-serif text-[length:var(--text-2xl)] text-[color:var(--ink)] tracking-[-0.025em]" style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 40" }}>{sessionLine}</p>
          <p className="text-sm text-[color:var(--ink-3)]">
            <Link href="/" className="hover:text-[color:var(--ink-2)]">Back to the Stand</Link>
            <span className="mx-2">·</span>
            <Link href="/timeline" className="hover:text-[color:var(--ink-2)]">Timeline</Link>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={onDone}
            className="cta-pill text-sm font-semibold tracking-[0.04em] px-6 py-2.5"
          >
            Done for Tonight
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="text-sm text-[color:var(--ink-3)] hover:text-[color:var(--ink)] transition-colors"
          >
            Print
          </button>
          {miniShelfLine && (
            <div className="ml-auto text-xs text-[color:var(--ink-muted)] italic max-w-[50%] text-right">
              {miniShelfLine}
            </div>
          )}
        </div>
      )}
    </footer>
  );
}

/** A quiet stats strip under the header: XP progress + level title on the left,
 *  the streak ember on the right. Layered on top of the territory model — purely
 *  motivational, never gating. */
function StatsStrip({ xp, streak }: { xp: number; streak: import("@/lib/types").StreakState }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
      <XPBar xp={xp} className="flex-1 min-w-[200px]" />
      <StreakFlame streak={streak} />
    </div>
  );
}

/** R1 — daily-practice framing. A quiet, true motivator that makes showing up
 *  daily salient. Complements the streak UI without nagging. */
function DailyFramingLine() {
  return (
    <p
      data-testid="daily-framing"
      className="mt-3 text-xs text-[color:var(--ink-3)] italic"
    >
      15 minutes today beats 2 hours on Sunday. Small and daily wins.
    </p>
  );
}

/** R9 — mental-practice (audiation) card. An OPTIONAL prompt for the times you're
 *  away from the instrument or easing back in. Dismissible for the session, so it
 *  helps rather than nags. Surfaced more prominently on a first-back day. */
function MentalPracticeCard({ firstBack, pieceTitle, instrument }: { firstBack: boolean; pieceTitle?: string; instrument: Instrument }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const subject = pieceTitle ? `“${pieceTitle}”` : "this week's piece";
  return (
    <div
      data-testid="mental-practice-card"
      className="mt-4 rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-4 py-3 fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-[color:var(--ink)]">
            Away from your instrument?
          </p>
          <p className="text-xs text-[color:var(--ink-2)] leading-relaxed">
            {mentalPracticeCopy(instrument, firstBack, subject)}
          </p>
        </div>
        <button
          type="button"
          data-testid="mental-practice-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="dismiss mental practice card"
          className="shrink-0 text-[color:var(--ink-3)] hover:text-[color:var(--ink)] text-lg leading-none -mt-0.5"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/** Shows the next pending level-up as a reward moment. Clears via dismissLevelUp;
 *  if multiple levels were crossed at once, they surface one after another. */
function LevelUpQueue({ pending, onClose }: { pending?: number[]; onClose: (level: number) => void }) {
  const level = pending?.[0];
  if (level == null) return null;
  return <LevelUpModal level={level} onCloseAction={() => onClose(level)} />;
}

function UnlockQueue({ queue, onClose, unlocks }: { queue: string[]; onClose: () => void; unlocks: { id: string; title: string; tryLine: string }[] }) {
  const id = queue[0];
  if (!id) return null;
  const u = unlocks.find((x) => x.id === id);
  if (!u) return null;
  return <UnlockCardModal unlock={u} onCloseAction={onClose} />;
}

/** V5 Start-Here card. Shown when the active instrument's tier-0 setup nodes are
 *  not yet learned (brand-new user, or someone who skipped orientation). Links to
 *  /tree (Your Path) where the setup nodes live. Disappears once all setup nodes
 *  are learned — never nags a returning user. */
function StartHereCard({ instrument }: { instrument: string }) {
  const lower = instrument.toLowerCase();
  const hint = lower.includes("guitar")
    ? "New to this? Start with tuning and holding the guitar."
    : lower.includes("drum")
      ? "New to this? Start with how to hold the sticks and let them bounce."
      : "New to this? Start with finding notes and setting your posture.";
  return (
    <div
      data-testid="start-here-card"
      className="mt-4 mb-1 rounded-xl border-2 border-[color:var(--accent-soft)] bg-[color:var(--accent)]/6 px-5 py-4 fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="font-serif text-base font-medium text-[color:var(--ink)]">
            Welcome. Start here.
          </p>
          <p className="text-sm text-[color:var(--ink-2)] leading-relaxed">
            {hint}
          </p>
          <Link
            href="/tree"
            className="inline-block mt-1.5 text-sm font-medium text-[color:var(--accent-deep)] underline decoration-1 underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Open Your Path
          </Link>
        </div>
      </div>
    </div>
  );
}
