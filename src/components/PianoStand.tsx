"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import { computeTodayPlan } from "@/lib/todayPlan";
import { endSession } from "@/lib/sessions";
import { doneLineFor } from "@/lib/doneLines";
import { KEY_META } from "@/lib/music";
import { WarmupSlot } from "./slots/WarmupSlot";
import { PieceSlot } from "./slots/PieceSlot";
import { ChainDrillSlot } from "./slots/ChainDrillSlot";
import { EarMomentSlot } from "./slots/EarMomentSlot";
import { FreeSlot } from "./slots/FreeSlot";
import { generateEarRound } from "@/lib/earRounds";
import type { EarRound } from "@/lib/types";
import { UnlockCardModal } from "./UnlockCardModal";

export function PianoStand() {
  const router = useRouter();
  const search = useSearchParams();
  const justPlayParam = search?.get("mode") === "just-play";
  const { state, setState, ready } = useAppState();

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

  const handlePrint = () => { router.push("/print"); };

  // Just-play mode: collapse to free slot only
  if (plan.mode === "just-play") {
    return (
      <div>
        <Header ghostName={ghost.name} mode="just-play" />
        <div className="mt-6">
          <FreeSlot journalInitial={journal} onJournalChange={setJournal} urlInitial={state.freeSlotUrl} expanded />
        </div>
        <Footer
          onDone={handleDone}
          onPrint={handlePrint}
          sessionLine={sessionLine}
          miniShelfLine={plan.miniShelfLine ?? null}
        />
        <UnlockQueue queue={unlocksQueue} onClose={() => setUnlocksQueue((q) => q.slice(1))} unlocks={state.unlocks} />
      </div>
    );
  }

  return (
    <div>
      <Header ghostName={ghost.name} onEdit={() => router.push("/settings?focus=ghost")} mode={plan.mode} firstBackMessage={plan.firstBackMessage} />
      <div className="mt-4">
        <WarmupSlot warmup={plan.warmup} ghostName={ghost.name} printAlways={printing} />
        <PieceSlot piece={piece} printAlways={printing} />
        <ChainDrillSlot drill={plan.chainDrill ?? null} printAlways={printing} />
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
      <UnlockQueue queue={unlocksQueue} onClose={() => setUnlocksQueue((q) => q.slice(1))} unlocks={state.unlocks} />
    </div>
  );
}

function Header({ ghostName, onEdit, mode, firstBackMessage }: { ghostName: string; onEdit?: () => void; mode?: string; firstBackMessage?: string | null }) {
  return (
    <header className="pb-5 border-b border-[color:var(--rule)]">
      <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">tonight's ghost</div>
      <div className="flex items-baseline gap-3 mt-1">
        <h1 className="font-serif text-3xl text-[color:var(--ink)]" style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 50" }}>{ghostName}</h1>
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)] no-print">edit</button>
        )}
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
    <footer className="mt-10 pb-10 space-y-6">
      {northStarNudge && (
        <div className="fade-in text-sm text-[color:var(--ink-2)] italic border-l-2 border-[color:var(--accent-soft)] pl-3">
          {northStarNudge}
        </div>
      )}
      {sessionLine ? (
        <div className="fade-in space-y-3">
          <p className="font-serif text-xl text-[color:var(--ink)]">{sessionLine}</p>
          <p className="text-sm text-[color:var(--ink-3)]">
            <Link href="/" className="hover:text-[color:var(--ink-2)]">back to the stand</Link>
            <span className="mx-2">·</span>
            <Link href="/timeline" className="hover:text-[color:var(--ink-2)]">timeline</Link>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 no-print">
          <button
            type="button"
            onClick={onDone}
            className="px-5 py-2 rounded-full bg-[color:var(--accent-deep)] text-[color:var(--ink)] hover:bg-[color:var(--accent-soft)] transition-colors text-sm"
          >
            done
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="px-4 py-2 text-sm text-[color:var(--ink-3)] hover:text-[color:var(--ink)] transition-colors"
          >
            print
          </button>
          <div className="ml-auto text-xs text-[color:var(--ink-3)] italic">
            {miniShelfLine}
          </div>
        </div>
      )}
    </footer>
  );
}

function UnlockQueue({ queue, onClose, unlocks }: { queue: string[]; onClose: () => void; unlocks: { id: string; title: string; tryLine: string }[] }) {
  const id = queue[0];
  if (!id) return null;
  const u = unlocks.find((x) => x.id === id);
  if (!u) return null;
  return <UnlockCardModal unlock={u} onCloseAction={onClose} />;
}
