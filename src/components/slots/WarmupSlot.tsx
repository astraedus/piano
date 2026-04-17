"use client";
import { useEffect, useRef, useState } from "react";
import { Slot } from "../Slot";
import type { Warmup, KeyId } from "@/lib/types";
import { scaleRepId } from "@/lib/types";
import { KEY_META, scale } from "@/lib/music";
import { Keyboard } from "../Keyboard";
import { Metronome } from "../Metronome";
import { ensureAudio, playSequence } from "@/lib/audio";
import { useAppState } from "@/hooks/useAppState";

export function WarmupSlot({ warmup, ghostName, ghostKey, printAlways }: { warmup: Warmup; ghostName: string; ghostKey: KeyId; printAlways?: boolean }) {
  const { state, bumpRep } = useAppState();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bpm, setBpm] = useState(80);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const repId = scaleRepId(ghostKey);
  const reps = state.skillReps?.[repId];

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
        {(warmup.id === "ghost-scale" || warmup.id === "mirror") && (
          <div className="pt-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-2">
              {KEY_META[ghostKey].name} scale · 2 octaves
            </div>
            <Keyboard notes={scale(KEY_META[ghostKey].tonic, KEY_META[ghostKey].mode, 2)} rangeStart="C4" octaves={2} />
            <div className="mt-2 flex flex-wrap gap-3 items-center no-print">
              <button
                type="button"
                onClick={async () => {
                  await ensureAudio();
                  await playSequence(scale(KEY_META[ghostKey].tonic, KEY_META[ghostKey].mode, 1), { noteDurationSec: 0.34 });
                }}
                className="text-xs px-3 py-1 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-3)] hover:border-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
              >
                hear the scale
              </button>
              <button
                type="button"
                onClick={() => bumpRep(repId, { bpm })}
                className="text-xs px-3 py-1 rounded-full border border-[color:var(--accent-soft)] text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
              >
                I played it
              </button>
              <Metronome defaultBpm={80} onBpmChangeAction={setBpm} />
            </div>
            {reps && (
              <p className="text-xs text-[color:var(--ink-3)] italic mt-2">
                {reps.count} rep{reps.count === 1 ? "" : "s"} of this scale
                {reps.maxBpm ? ` · best ${reps.maxBpm} bpm` : ""}.
              </p>
            )}
          </div>
        )}
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
