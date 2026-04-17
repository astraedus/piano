"use client";
import { Slot } from "../Slot";
import type { ChainDrill } from "@/lib/types";

export function ChainDrillSlot({ drill, printAlways }: { drill?: ChainDrill | null; printAlways?: boolean }) {
  const summary = drill ? (
    <>{drill.name} · {drill.minutes} min</>
  ) : (
    <span className="text-[color:var(--ink-3)]">today's chain is quiet — just the piece tonight.</span>
  );
  return (
    <Slot index={3} title="Chain drill" duration={drill ? `${drill.minutes} min` : undefined} summary={summary} printAlways={printAlways}>
      {drill && (
        <div className="space-y-2 text-sm">
          <ol className="space-y-1.5">
            {drill.steps.map((s, i) => (
              <li key={i} className="flex gap-3 items-baseline">
                <span className="text-[color:var(--ink-3)] text-xs font-serif tabular-nums w-6">{i + 1}.</span>
                <span className="flex-1 text-[color:var(--ink-2)]">{s.instruction}</span>
                <span className="text-[color:var(--ink-3)] text-xs tabular-nums">{fmtStep(s.durationSec)}</span>
              </li>
            ))}
          </ol>
          <p className="text-[color:var(--ink-3)] italic pt-2 text-sm">↑ {drill.closingNote}</p>
        </div>
      )}
    </Slot>
  );
}

function fmtStep(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.round((sec / 60) * 10) / 10;
  return `${m} min`;
}
