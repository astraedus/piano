"use client";
import { useEffect, useRef, useState } from "react";
import { Slot } from "../Slot";
import type { Warmup } from "@/lib/types";

export function WarmupSlot({ warmup, ghostName, printAlways }: { warmup: Warmup; ghostName: string; printAlways?: boolean }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      const t0 = Date.now() - elapsed * 1000;
      iv.current = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 500);
    } else if (iv.current) {
      clearInterval(iv.current);
    }
    return () => { if (iv.current) clearInterval(iv.current); };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Slot
      index={1}
      title="Warmup"
      duration="90s"
      summary={
        <>
          {warmup.label} · {ghostName}
        </>
      }
      defaultOpen={false}
      printAlways={printAlways}
    >
      <div className="space-y-3 text-sm">
        <div className="text-[color:var(--ink-3)] italic">
          {warmup.postureLine}
        </div>
        <ul className="space-y-1 font-serif text-base text-[color:var(--ink)]">
          {warmup.lines.map((l, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[color:var(--ink-3)] text-sm mt-0.5">→</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
        <div className="pt-2 flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="text-xs px-3 py-1 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)] hover:text-[color:var(--accent)] transition-colors"
          >
            {running ? "pause" : "start"} the minute
          </button>
          <span className="text-xs tabular-nums text-[color:var(--ink-3)]">
            {fmtSec(elapsed)}
          </span>
          <span className="text-xs text-[color:var(--ink-3)]">
            · no bell. just a little nudge.
          </span>
        </div>
      </div>
    </Slot>
  );
}

function fmtSec(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, "0")}`;
}
