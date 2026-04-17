"use client";
import { useEffect, useRef, useState } from "react";
import { ensureAudio } from "@/lib/audio";

export function Metronome({ defaultBpm = 80, onBpmChangeAction }: { defaultBpm?: number; onBpmChangeAction?: (bpm: number) => void }) {
  const [bpm, setBpm] = useState(defaultBpm);
  const [running, setRunning] = useState(false);
  const nextTickRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const osc = useRef<{ ctx: AudioContext | null; click: () => void } | null>(null);

  useEffect(() => { onBpmChangeAction?.(bpm); }, [bpm, onBpmChangeAction]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureAudio();
      if (cancelled) return;
      const ctx = new AudioContext();
      osc.current = {
        ctx,
        click: () => {
          const t = ctx.currentTime;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.setValueAtTime(1400, t);
          g.gain.setValueAtTime(0.22, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
          o.connect(g).connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.05);
        },
      };
    })();
    return () => { cancelled = true; if (osc.current?.ctx) osc.current.ctx.close(); };
  }, []);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const interval = 60000 / bpm;
    nextTickRef.current = Date.now();
    const tick = () => {
      osc.current?.click();
      nextTickRef.current += interval;
      const wait = Math.max(5, nextTickRef.current - Date.now());
      timerRef.current = setTimeout(tick, wait);
    };
    tick();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [running, bpm]);

  return (
    <div className="inline-flex items-center gap-2 text-xs no-print">
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        className={
          "px-3 py-1 rounded-full border transition-colors " +
          (running
            ? "border-[color:var(--accent)] text-[color:var(--accent)] bg-[color:var(--accent)]/10"
            : "border-[color:var(--rule)] text-[color:var(--ink-3)] hover:border-[color:var(--accent-soft)]")
        }
      >
        {running ? "stop" : "metronome"}
      </button>
      <input
        type="range"
        min={40} max={200} step={1}
        value={bpm}
        onChange={(e) => setBpm(parseInt(e.target.value, 10))}
        className="w-24 accent-[color:var(--accent)]"
        aria-label="bpm"
      />
      <span className="tabular-nums text-[color:var(--ink-2)]">{bpm} <span className="text-[color:var(--ink-3)]">bpm</span></span>
    </div>
  );
}
