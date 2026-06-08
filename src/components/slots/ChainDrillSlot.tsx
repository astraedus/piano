"use client";
import { useRef } from "react";
import { Slot } from "../Slot";
import type { ChainDrill, SessionQuality } from "@/lib/types";
import { drillRepId } from "@/lib/types";
import { KEY_META, midiToSpn, pitchMidi, progressionChords } from "@/lib/music";
import type { InstrumentModule } from "@/lib/instrumentRegistry";
import { ensureAudio, playProgression, playSequence } from "@/lib/audio";
import { useAppState } from "@/hooks/useAppState";
import { RepEngine } from "../RepEngine";
import { buildRepItems, type RepEngineConfig } from "@/lib/repEngine";
import type { InterleavePlan } from "@/lib/chainDrillPicker";

export function ChainDrillSlot({
  module,
  drill,
  interleave,
  printAlways,
  onQualityChangeAction,
}: {
  module?: InstrumentModule;
  drill?: ChainDrill | null;
  /** R4 — interleave plan from todayPlan; when present the rep-engine weaves skills. */
  interleave?: InterleavePlan | null;
  printAlways?: boolean;
  /** R8 — bubble the rep-engine's captured quality up to the session log. */
  onQualityChangeAction?: (quality: SessionQuality) => void;
}) {
  const { state, bumpRep } = useAppState();
  // Fire the legacy "tried it" rep counter exactly once per drill session.
  const bumpedRef = useRef(false);
  const summary = drill ? (
    <>{drill.name} · {drill.minutes} min</>
  ) : (
    <span className="text-[color:var(--ink-3)]">No chain drill tonight. Just the piece.</span>
  );

  if (!drill) {
    return (
      <Slot index={3} title="Chain drill" pillar="improv" summary={summary} printAlways={printAlways} />
    );
  }

  const meta = KEY_META[drill.ghostKey];
  const romans = meta.mode === "major" ? ["I", "IV", "V", "I"] : ["i", "iv", "V", "i"];
  const prog = progressionChords(drill.ghostKey, romans);
  const pentatonicIntervals = meta.mode === "major" ? [0, 2, 4, 7, 9, 12] : [0, 3, 5, 7, 10, 12];
  const rootMidi = pitchMidi(meta.tonic + "4");
  const pentatonicNotes = pentatonicIntervals.map((i) => midiToSpn(rootMidi + i));

  const rep = state.skillReps?.[drillRepId(drill.id)];

  // Build the rep-engine config from the resolved plan. R2/R5 read the drill's
  // own config; R4 weaves the interleave plan when present. Absent config ->
  // a plain flat run (graceful degrade, identical practice to before + quality).
  const repItems = buildRepItems({
    drill: { id: drill.id, name: drill.name },
    interleave: interleave
      ? { drills: interleave.drills.map((d) => ({ id: d.id, name: d.name })), repSequence: interleave.repSequence }
      : null,
    repBlocks: drill.repBlocks ?? null,
  });
  const interleaved = !!interleave && interleave.drills.length > 1;
  const engineConfig: RepEngineConfig = {
    reps: repItems,
    repBlocks: drill.repBlocks ?? null,
    bpmLadder: drill.bpmLadder ?? null,
    interleaved,
  };

  const interleaveNote = interleaved
    ? "Reps weave between skills tonight. It feels harder and less fluent than drilling one thing. That feeling is the point."
    : undefined;

  return (
    <Slot index={3} title="Chain drill" pillar="improv" duration={`${drill.minutes} min`} status={rep ? "done" : null} summary={summary} printAlways={printAlways}>
      <div className="space-y-4 text-sm">
        <ol className="space-y-1.5">
          {drill.steps.map((s, i) => (
            <li key={i} className="flex gap-3 items-baseline">
              <span className="text-[color:var(--ink-3)] text-xs font-serif tabular-nums w-6">{i + 1}.</span>
              <span className="flex-1 text-[color:var(--ink-2)]">{s.instruction}</span>
              <span className="text-[color:var(--ink-3)] text-xs tabular-nums">{fmtStep(s.durationSec)}</span>
            </li>
          ))}
        </ol>

        <div className="pt-2 border-t border-[color:var(--rule)] space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-1.5">
              progression · {romans.join(" — ")}
            </p>
            {module?.InstrumentVisual && (
              <module.InstrumentVisual notes={prog.flat()} rangeStart="C3" octaves={2} />
            )}
            <div className="mt-2 flex gap-2 no-print">
              <button
                type="button"
                onClick={async () => { await ensureAudio(); await playProgression(prog); }}
                className="chip text-xs px-3 py-1"
              >
                Hear the Loop
              </button>
              <button
                type="button"
                onClick={async () => { await ensureAudio(); await playSequence(pentatonicNotes); }}
                className="chip text-xs px-3 py-1"
              >
                Hear Pentatonic
              </button>
            </div>
          </div>
        </div>

        {/* The interactive rep-engine (R2/R4/R5/R8). */}
        <div className="pt-2 border-t border-[color:var(--rule)] no-print">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-2">
            Run the reps
          </p>
          <RepEngine
            config={engineConfig}
            noteText={interleaveNote}
            onQualityChangeAction={(q) => {
              onQualityChangeAction?.(q);
              // Keep the legacy "tried it" rep counter warm on the first clean rep
              // so the historical skillReps signal (and the "done" pill) still fire.
              // Guard with a ref so a parent re-render can't double-count it.
              if (!bumpedRef.current && (q.successes ?? 0) >= 1) {
                bumpedRef.current = true;
                bumpRep(drillRepId(drill.id), { bpm: q.bpmReached });
              }
            }}
          />
        </div>

        <div className="flex items-center gap-3 pt-1 no-print">
          {rep && (
            <span className="text-xs text-[color:var(--ink-3)] italic">
              {rep.count === 1 ? "First time" : `${rep.count} times so far`}
            </span>
          )}
          <span className="text-[color:var(--ink-3)] italic text-sm ml-auto">↑ {drill.closingNote}</span>
        </div>
      </div>
    </Slot>
  );
}

function fmtStep(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.round((sec / 60) * 10) / 10;
  return `${m} min`;
}
