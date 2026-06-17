"use client";
import { useRef } from "react";
import { Slot } from "../Slot";
import { Disclosure } from "./Disclosure";
import { TermChip, linkTerms } from "../explain";
import type { ChainDrill, SessionQuality, SkillNode } from "@/lib/types";
import { drillRepId } from "@/lib/types";
import { KEY_META, keyPrefersFlats, pentatonic, progressionChords } from "@/lib/music";
import type { InstrumentModule } from "@/lib/instrumentRegistry";
import { ensureAudio, playProgression, playSequence } from "@/lib/audio";
import { useAppState } from "@/hooks/useAppState";
import { RepEngine } from "../RepEngine";
import { buildRepItems, type RepEngineConfig } from "@/lib/repEngine";
import type { InterleavePlan } from "@/lib/chainDrillPicker";
import { getLesson } from "@/lib/lessons";

export function ChainDrillSlot({
  module,
  drill,
  interleave,
  printAlways,
  forceOpen,
  status,
  onQualityChangeAction,
}: {
  module?: InstrumentModule;
  drill?: ChainDrill | null;
  /** R4 — interleave plan from todayPlan; when present the rep-engine weaves skills. */
  interleave?: InterleavePlan | null;
  printAlways?: boolean;
  /** V4 resume UX — auto-expand this slot when it is the current "NOW" slot. */
  forceOpen?: boolean;
  /** V4 resume UX — slot status override from the stand (NOW / done). */
  status?: "done" | "active" | null;
  /** R8 — bubble the rep-engine's captured quality up to the session log. */
  onQualityChangeAction?: (quality: SessionQuality) => void;
}) {
  // V5 — build a chainDrillId -> node lookup once so we can find which skill node
  // this drill trains, then surface the authored lesson's "what" + "why" block.
  // Module skill nodes are available when the instrument has registered (always true
  // in practice — the module self-registers at app init). Lookup is O(n) and
  // cached inside the render; n <= ~30 nodes per instrument.
  const drillNode: SkillNode | undefined = drill?.id
    ? (module?.skillNodes ?? []).find((n) => n.chainDrillId === drill.id)
    : undefined;
  const drillLesson = drillNode && drill
    ? getLesson(drill.instrument, drillNode.id)
    : undefined;
  const { state, bumpRep } = useAppState();
  // Fire the legacy "tried it" rep counter exactly once per drill session.
  const bumpedRef = useRef(false);
  // V4 soul-first: lead with the feeling/outcome name when present; the theory
  // drill name becomes a tappable subtitle TermChip (degrades to plain text).
  const heading = drill?.soulName ?? drill?.name ?? "Chain drill";
  const summary = drill ? (
    drill.soulName ? (
      <span className="flex flex-wrap items-baseline gap-x-1.5">
        <span>{drill.soulName}</span>
        <span className="text-[color:var(--ink-3)]">·</span>
        <TermChip term={drill.name} label={drill.name} variant="subtitle" />
      </span>
    ) : (
      <>{drill.name} · {drill.minutes} min</>
    )
  ) : (
    <span className="text-[color:var(--ink-3)]">No chain drill tonight. Just the piece.</span>
  );

  if (!drill) {
    return (
      <Slot index={3} title="Chain drill" pillar="improv" summary={summary} printAlways={printAlways} status={status} />
    );
  }

  const meta = KEY_META[drill.ghostKey];
  const romans = meta.mode === "major" ? ["I", "IV", "V", "I"] : ["i", "iv", "V", "i"];
  const prog = progressionChords(drill.ghostKey, romans);
  const pentatonicNotes = pentatonic(meta.tonic, meta.mode, 4, keyPrefersFlats(drill.ghostKey));

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
    <Slot
      index={3}
      title={heading}
      pillar="improv"
      duration={`${drill.minutes} min`}
      status={status ?? (rep ? "done" : null)}
      summary={summary}
      printAlways={printAlways}
      defaultOpen={forceOpen}
    >
      {/* V4 progressive disclosure: lead with the rep ENGINE (the action) so it is
          reachable without scrolling past reference. The step list and the
          progression/keyboard (reference) collapse behind "Show steps" / "Hear
          it" toggles. */}
      <div className="space-y-4 text-sm">
        {/* V5 — "Tonight:" lesson block. Surfaces the authored what/why for the
            skill node this drill trains. Shows when a lesson exists; skips
            gracefully when none is authored yet (no regression). */}
        {drillLesson && (
          <div
            data-testid="chain-lesson-block"
            className="rounded-lg bg-[color:var(--bg-surface-2)] border border-[color:var(--rule)] px-4 py-3 space-y-1.5"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)]">Tonight</p>
            <p className="font-serif text-base text-[color:var(--ink)] leading-snug">
              {linkTerms(drillLesson.what, "cw")}
            </p>
            <p className="text-xs text-[color:var(--ink-2)] leading-relaxed">
              {linkTerms(drillLesson.why, "cy")}
            </p>
            {drillLesson.steps.length > 0 && (
              <p className="text-xs text-[color:var(--ink-3)] italic pt-0.5">
                Step 1: {drillLesson.steps[0].do}
                {drillLesson.steps[0].feel && (
                  <span className="not-italic"> ({drillLesson.steps[0].feel})</span>
                )}
              </p>
            )}
          </div>
        )}

        {/* The interactive rep-engine (R2/R4/R5/R8) — pinned at the top. */}
        <div className="no-print">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-2">
            Run the reps
          </p>
          <RepEngine
            config={engineConfig}
            noteText={interleaveNote}
            resumeKey={drillRepId(drill.id)}
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

        {/* Reference 1 — the step list, collapsed by default. */}
        <Disclosure label="Show steps">
          <ol className="space-y-1.5">
            {drill.steps.map((s, i) => (
              <li key={i} className="flex gap-3 items-baseline">
                <span className="text-[color:var(--ink-3)] text-xs font-serif tabular-nums w-6">{i + 1}.</span>
                <span className="flex-1 text-[color:var(--ink-2)]">{s.richInstruction ?? s.instruction}</span>
                <span className="text-[color:var(--ink-3)] text-xs tabular-nums">{fmtStep(s.durationSec)}</span>
              </li>
            ))}
          </ol>
        </Disclosure>

        {/* Reference 2 — the progression + keyboard + hear buttons, collapsed. */}
        <Disclosure label="Hear it · see the shape">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-1.5">
            progression · {romans.join(" — ")}
          </p>
          {/* overflow guard so the keyboard never clips at the card edge (P2). */}
          <div className="overflow-x-auto">
            {module?.InstrumentVisual && (
              <module.InstrumentVisual notes={prog.flat()} rangeStart="C3" octaves={2} />
            )}
          </div>
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
        </Disclosure>

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
