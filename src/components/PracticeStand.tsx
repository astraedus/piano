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
import { generateEarRound } from "@/lib/earRounds";
import { drillRepId, scaleRepId } from "@/lib/types";
import type { EarRound } from "@/lib/types";
import { UnlockCardModal } from "./UnlockCardModal";
import { LevelUpModal } from "./LevelUpModal";
import { XPBar } from "./XPBar";
import { StreakFlame } from "./StreakFlame";
import { Horizons } from "./Horizons";
import { GhostPicker } from "./GhostPicker";
import { TermChip } from "./explain";
import { ghostKeyToTermId } from "@/lib/pathFilter";
import type { InstrumentModule } from "@/lib/instrumentRegistry";
import { emptyStreak, levelForXp, localDateKey, titleForLevel } from "@/lib/progression";
import {
  currentSlot,
  hasResumableWork,
  repSessionKey,
  type RepSessionSnapshot,
  type SlotKey,
} from "./slots/repResume";
import { resolveStatus } from "@/lib/skillTree";

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

  // Ear rounds: generate 3 rounds keyed by session+round
  const earRounds: EarRound[] = useMemo(() => {
    if (!plan || plan.mode === "first-back" || plan.mode === "just-play") return [];
    const out: EarRound[] = [];
    for (let i = 0; i < 3; i++) out.push(generateEarRound(state.earLevel, plan.ghostKey));
    return out;
  }, [plan, state.earLevel]);

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

  // V5 Start-Here card — show when any tier-0 setup node for the active instrument
  // is not yet learned. This fires for brand-new users who haven't touched Setup &
  // Orientation, nudging them to /tree rather than dropping them into warmup + drills
  // with zero context. Disappears once all setup nodes are learned (never nags again).
  const allNodes = module?.skillNodes ?? [];
  const setupNodes = allNodes.filter((n) => n.tier === 0 && n.category === "setup");
  const nodeStatus = resolveStatus(allNodes, state.skillProgress ?? {});
  const showStartHere = setupNodes.some((n) => nodeStatus.get(n.id) !== "learned");
  const instrumentDisplayName = module?.displayName ?? state.instrument;

  // ── V4 resume UX: derive per-slot done-state, the current "NOW" slot, and any
  // in-flight chain-drill rep session to resume. Done-state comes from the
  // persistent rep counters (warmup scale + chain drill); piece/ear/free have no
  // persistent completion so they fall to the NOW marker by order. Pure helpers
  // (currentSlot / hasResumableWork) are unit-tested in repResume.test.ts. ──
  const warmupDone = !!(plan.warmup && state.skillReps?.[scaleRepId(plan.ghostKey)]);
  const chainDone = !!(plan.chainDrill && state.skillReps?.[drillRepId(plan.chainDrill.id)]);
  const slotDone: Partial<Record<SlotKey, boolean>> = { warmup: warmupDone, chain: chainDone };
  const nowSlot: SlotKey = currentSlot(slotDone);
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
    setSessionLine(doneLineFor({
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
    }));
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
            <GoalRail nowSlot={nowSlot} />
          </aside>

          <div>
            {showStartHere && (
              <StartHereCard instrument={instrumentDisplayName} />
            )}
            <MentalPracticeCard firstBack={plan.mode === "first-back"} pieceTitle={piece?.title} />
            <div className="mt-5">
              <WarmupSlot module={module} warmup={plan.warmup} ghostName={ghost.name} ghostKey={plan.ghostKey} printAlways={printing} isNow={nowSlot === "warmup"} status={slotStatus("warmup")} />
              <PieceSlot module={module} piece={piece} printAlways={printing} isNow={nowSlot === "piece"} status={slotStatus("piece")} />
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
              <FreeSlot urlInitial={state.freeSlotUrl} journalInitial={journal} onJournalChange={setJournal} reviewSkills={plan.reviewSkills} printAlways={printing} isNow={nowSlot === "free"} status={slotStatus("free")} />
            </div>
          </div>
        </div>
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

/** A quiet "your goal right now" line in the desktop info rail — names the NOW
 *  slot so the rail reinforces where the stand is pointing the user. */
function GoalRail({ nowSlot }: { nowSlot: SlotKey }) {
  const LABELS: Record<SlotKey, string> = {
    warmup: "Warm up",
    piece: "Work your piece",
    chain: "Run the chain drill",
    ear: "Train your ear",
    free: "Free play",
  };
  return (
    <div className="hidden lg:block rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-1">Your goal</p>
      <p className="font-serif text-base text-[color:var(--ink)]">{LABELS[nowSlot]}</p>
      <p className="text-xs text-[color:var(--ink-3)] mt-1">Start here, then flow down the stand.</p>
    </div>
  );
}

function Header({ ghostName, ghostKey, instrumentLabel, mode, firstBackMessage, module }: { ghostName: string; ghostKey: import("@/lib/types").KeyId; instrumentLabel: string; mode?: string; firstBackMessage?: string | null; module?: InstrumentModule }) {
  // Instrument-aware focus eyebrow. Piano (focusKind "key") keeps the historical
  // "tonight's ghost" wording untouched; guitar (focusKind "chord") reads as
  // "chord of the week". The headline uses the module's own focusLabel so the
  // current focus reads in the instrument's terms (a key name vs a chord/riff
  // label). Falls back to the piano wording + the plan's ghost name if no module.
  const focusEyebrow = module?.focusKind === "chord" ? "Chord of the Week" : "Key of the Week";
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
            plain text for keys with no glossary entry (never a dead chip). */}
        <h1 className="font-serif text-[length:var(--text-3xl)] tracking-[-0.025em]" style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 50" }}>
          <TermChip term={ghostKeyToTermId(ghostKey)} label={focusName} className="text-[color:var(--ink)] decoration-1" />
        </h1>
        <GhostPicker current={ghostKey} />
      </div>
      {mode === "first-back" && firstBackMessage && (
        <p className="text-sm text-[color:var(--ink-2)] italic mt-2 fade-in">{firstBackMessage}</p>
      )}
      {mode === "just-play" && (
        <p className="text-sm text-[color:var(--ink-2)] italic mt-2">Free play. Anything you want.</p>
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
function MentalPracticeCard({ firstBack, pieceTitle }: { firstBack: boolean; pieceTitle?: string }) {
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
            {firstBack
              ? `Ease back in without touching a key. Close your eyes and hear ${subject}. Feel the fingering, beat by beat. Mental reps count.`
              : `Close your eyes and hear ${subject}. Feel the fingering in your hands. Even a minute of this strengthens the real thing.`}
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
  const isGuitar = instrument.toLowerCase().includes("guitar");
  const hint = isGuitar
    ? "New to this? Start with tuning and holding the guitar."
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
