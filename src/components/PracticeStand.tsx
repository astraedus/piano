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
import type { EarRound } from "@/lib/types";
import { UnlockCardModal } from "./UnlockCardModal";
import { LevelUpModal } from "./LevelUpModal";
import { XPBar } from "./XPBar";
import { StreakFlame } from "./StreakFlame";
import { Horizons } from "./Horizons";
import { GhostPicker } from "./GhostPicker";
import type { InstrumentModule } from "@/lib/instrumentRegistry";
import { emptyStreak } from "@/lib/progression";

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

  if (!ready || !plan) {
    return <div className="text-[color:var(--ink-3)] font-serif italic">sitting down…</div>;
  }

  // First-opened redirect handled in page.tsx
  const ghost = KEY_META[plan.ghostKey];
  const piece = state.pieces.find((p) => p.id === state.currentPieceId);
  const printing = false;

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
    };
    const { state: next, newUnlocks } = endSession(state, logBase, new Date());
    setState(next);
    setSessionLine(doneLineFor({ minutes: logBase.minutes, ghostKeyName: ghost.name, pieceTitle: piece?.title }));
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
            <FreeSlot journalInitial={journal} onJournalChange={setJournal} urlInitial={state.freeSlotUrl} expanded />
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
        <StatsStrip xp={state.xp ?? 0} streak={state.streak ?? emptyStreak()} />
        <div className="mt-5">
          <WarmupSlot module={module} warmup={plan.warmup} ghostName={ghost.name} ghostKey={plan.ghostKey} printAlways={printing} />
          <PieceSlot module={module} piece={piece} printAlways={printing} />
          <ChainDrillSlot module={module} drill={plan.chainDrill ?? null} printAlways={printing} />
          <EarMomentSlot
            rounds={earRounds}
            muted={plan.mode === "first-back"}
            printAlways={printing}
            onResultAction={(correct: string[], wrong: string[]) => { setEarCorrect(correct); setEarWrong(wrong); }}
          />
          <FreeSlot urlInitial={state.freeSlotUrl} journalInitial={journal} onJournalChange={setJournal} printAlways={printing} />
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

function Header({ ghostName, ghostKey, instrumentLabel, mode, firstBackMessage, module }: { ghostName: string; ghostKey: import("@/lib/types").KeyId; instrumentLabel: string; mode?: string; firstBackMessage?: string | null; module?: InstrumentModule }) {
  // Instrument-aware focus eyebrow. Piano (focusKind "key") keeps the historical
  // "tonight's ghost" wording untouched; guitar (focusKind "chord") reads as
  // "chord of the week". The headline uses the module's own focusLabel so the
  // current focus reads in the instrument's terms (a key name vs a chord/riff
  // label). Falls back to the piano wording + the plan's ghost name if no module.
  const focusEyebrow = module?.focusKind === "chord" ? "chord of the week" : "tonight's ghost";
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
        <h1 className="font-serif text-[length:var(--text-3xl)] text-[color:var(--ink)] tracking-[-0.025em]" style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 50" }}>{focusName}</h1>
        <GhostPicker current={ghostKey} />
      </div>
      {mode === "first-back" && firstBackMessage && (
        <p className="text-sm text-[color:var(--ink-2)] italic mt-2 fade-in">{firstBackMessage}</p>
      )}
      {mode === "just-play" && (
        <p className="text-sm text-[color:var(--ink-2)] italic mt-2">just play. nothing else tonight.</p>
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
            <Link href="/" className="hover:text-[color:var(--ink-2)]">back to the stand</Link>
            <span className="mx-2">·</span>
            <Link href="/timeline" className="hover:text-[color:var(--ink-2)]">timeline</Link>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={onDone}
            className="cta-pill text-sm font-semibold tracking-[0.04em] px-6 py-2.5"
          >
            done for tonight
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="text-sm text-[color:var(--ink-3)] hover:text-[color:var(--ink)] transition-colors"
          >
            print
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
