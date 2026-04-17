"use client";
import { Slot } from "../Slot";
import type { ChainDrill } from "@/lib/types";
import { drillRepId } from "@/lib/types";
import { KEY_META, midiToSpn, pitchMidi, progressionChords } from "@/lib/music";
import { Keyboard } from "../Keyboard";
import { ensureAudio, playProgression, playSequence } from "@/lib/audio";
import { useAppState } from "@/hooks/useAppState";

export function ChainDrillSlot({ drill, printAlways }: { drill?: ChainDrill | null; printAlways?: boolean }) {
  const { state, bumpRep } = useAppState();
  const summary = drill ? (
    <>{drill.name} · {drill.minutes} min</>
  ) : (
    <span className="text-[color:var(--ink-3)]">today's chain is quiet — just the piece tonight.</span>
  );

  if (!drill) {
    return (
      <Slot index={3} title="Chain drill" summary={summary} printAlways={printAlways} />
    );
  }

  const meta = KEY_META[drill.ghostKey];
  const romans = meta.mode === "major" ? ["I", "IV", "V", "I"] : ["i", "iv", "V", "i"];
  const prog = progressionChords(drill.ghostKey, romans);
  const pentatonicIntervals = meta.mode === "major" ? [0, 2, 4, 7, 9, 12] : [0, 3, 5, 7, 10, 12];
  const rootMidi = pitchMidi(meta.tonic + "4");
  const pentatonicNotes = pentatonicIntervals.map((i) => midiToSpn(rootMidi + i));

  const rep = state.skillReps?.[drillRepId(drill.id)];

  return (
    <Slot index={3} title="Chain drill" duration={`${drill.minutes} min`} summary={summary} printAlways={printAlways}>
      <div className="space-y-3 text-sm">
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
            <Keyboard notes={prog.flat()} rangeStart="C3" octaves={2} />
            <div className="mt-2 flex gap-2 no-print">
              <button
                type="button"
                onClick={async () => { await ensureAudio(); await playProgression(prog); }}
                className="text-xs px-3 py-1 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-3)] hover:border-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
              >
                hear the loop
              </button>
              <button
                type="button"
                onClick={async () => { await ensureAudio(); await playSequence(pentatonicNotes); }}
                className="text-xs px-3 py-1 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-3)] hover:border-[color:var(--accent-soft)] hover:text-[color:var(--accent)]"
              >
                hear pentatonic
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1 no-print">
          <button
            type="button"
            onClick={() => bumpRep(drillRepId(drill.id))}
            className="text-xs px-3 py-1 rounded-full border border-[color:var(--accent-soft)] text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
          >
            tried it
          </button>
          {rep && (
            <span className="text-xs text-[color:var(--ink-3)] italic">
              {rep.count === 1 ? "first time" : `${rep.count} times so far`}
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
