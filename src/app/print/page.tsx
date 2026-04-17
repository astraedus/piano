"use client";
import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppStateProvider, useAppState } from "@/hooks/useAppState";
import { computeTodayPlan } from "@/lib/todayPlan";
import { KEY_META } from "@/lib/music";
import { findDrill } from "@/lib/chainDrills";
import type { KeyId, ChainDrill } from "@/lib/types";

export default function PrintPage() {
  return (
    <AppStateProvider>
      <Suspense fallback={null}>
        <PrintSheet />
      </Suspense>
    </AppStateProvider>
  );
}

function PrintSheet() {
  const { state, ready } = useAppState();
  const searchParams = useSearchParams();
  const drillOverrideId = searchParams?.get("drill") ?? null;
  const ghostOverride = (searchParams?.get("ghost") ?? null) as KeyId | null;

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => { try { window.print(); } catch {} }, 350);
    return () => clearTimeout(t);
  }, [ready]);

  const plan = useMemo(() => ready ? computeTodayPlan(state, new Date()) : null, [state, ready]);
  if (!ready || !plan) return <div className="p-8 text-[color:var(--ink-3)]">preparing…</div>;

  // Allow overrides from query params so print matches the stand exactly.
  const effectiveDrill: ChainDrill | null = (drillOverrideId && findDrill(drillOverrideId)) || plan.chainDrill || null;
  const effectiveGhost = ghostOverride ?? plan.ghostKey;
  const ghost = KEY_META[effectiveGhost];
  const piece = state.pieces.find((p) => p.id === state.currentPieceId);
  const dateLine = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const weekSessions = (state.sessions ?? []).slice(-7).map((s) => new Date(s.startedAt).toISOString().slice(0, 10));
  const todayDots: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(d); day.setDate(d.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    todayDots.push(weekSessions.includes(key) ? "●" : "◦");
  }

  return (
    <div className="min-h-screen bg-white text-black p-10 print:p-0 font-serif">
      <div className="max-w-[700px] mx-auto">
        <header className="pb-4 border-b border-black/40">
          <p className="uppercase tracking-[0.2em] text-[11px] text-black/60">piano stand · {dateLine.toLowerCase()}</p>
          <h1 className="text-3xl mt-1">tonight's ghost — <span className="italic">{ghost.name}</span></h1>
        </header>

        <ol className="divide-y divide-black/30">
          <Item index={1} title="warmup" duration="90 seconds">
            <p className="italic text-black/70 mb-1">{plan.warmup.postureLine}</p>
            <ul className="list-none space-y-1">
              {plan.warmup.lines.map((l, i) => <li key={i}>→ {l}</li>)}
            </ul>
          </Item>

          <Item index={2} title="the piece">
            {piece ? (
              <>
                <p>{piece.title}{piece.composer ? ` — ${piece.composer}` : ""}{piece.section ? ` · ${piece.section}` : ""}</p>
                {piece.notes && <p className="italic text-black/70 whitespace-pre-wrap mt-1">{piece.notes}</p>}
              </>
            ) : (
              <p className="italic text-black/60">pick something you want to keep with you.</p>
            )}
          </Item>

          <Item index={3} title="chain drill" duration={effectiveDrill ? `${effectiveDrill.minutes} min` : undefined}>
            {effectiveDrill ? (
              <>
                <ol className="space-y-1">
                  {effectiveDrill.steps.map((s, i) => (
                    <li key={i}>{i + 1}) {s.instruction} — <span className="text-black/60">{s.durationSec}s</span></li>
                  ))}
                </ol>
                <p className="italic text-black/70 mt-2">↑ {effectiveDrill.closingNote}</p>
              </>
            ) : (
              <p className="italic text-black/60">quiet tonight. just the piece.</p>
            )}
          </Item>

          <Item index={4} title="ear" duration="60 seconds">
            <p className="italic text-black/60">do this on the app afterward.</p>
          </Item>

          <Item index={5} title="free">
            <p>play something you love.</p>
          </Item>
        </ol>

        <footer className="pt-5 mt-5 border-t border-black/40 flex items-baseline justify-between text-xs text-black/60">
          <span>sessions this week: <span className="tracking-widest">{todayDots.join(" ")}</span></span>
          <span className="italic">tape it to the piano.</span>
        </footer>
      </div>
    </div>
  );
}

function Item({ index, title, duration, children }: { index: number; title: string; duration?: string; children: React.ReactNode }) {
  return (
    <li className="py-4">
      <div className="flex items-baseline gap-3">
        <span className="text-black/50 tabular-nums">{index}.</span>
        <h3 className="text-xl uppercase tracking-[0.05em]">{title}</h3>
        {duration && <span className="text-xs text-black/60">— {duration}</span>}
      </div>
      <div className="pl-6 mt-1.5">{children}</div>
    </li>
  );
}
