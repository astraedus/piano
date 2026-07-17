"use client";
import { useEffect, useRef, useState } from "react";
import { Slot } from "../Slot";
import { TermChip, linkTerms } from "../explain";
import type { Warmup, KeyId } from "@/lib/types";
import { scaleRepId } from "@/lib/types";
import { KEY_META, keyPrefersFlats, scale } from "@/lib/music";
import { ghostKeyToTermId } from "@/lib/pathFilter";
import type { InstrumentModule } from "@/lib/instrumentRegistry";
import { isNonTonal } from "@/lib/focusNoun";
import { fillWarmupLine } from "@/lib/warmupLines";
import { Metronome } from "../Metronome";
import { ensureAudio, playSequence, playSticking } from "@/lib/audio";
import type { StickingCell } from "@/lib/types";
import { useAppState } from "@/hooks/useAppState";

/**
 * The "this week's reference" label above the warmup visual. Instrument-aware so it
 * agrees with the header: piano's weekly focus is a key → its SCALE; guitar's is a
 * chord/box → the pentatonic SHAPE you play over it; drums' is a RUDIMENT.
 * (Honest: the guitar visual is a pentatonic box, so it reads "shape", never a
 * literal "chord".) Pure — tested.
 */
export function warmupReferenceLabel(focusKind: "key" | "chord" | "rudiment" | undefined, label: string): string {
  if (focusKind === "chord") return `This week's shape · ${label}`;
  if (focusKind === "rudiment") return `This week's rudiment · ${label}`;
  return `This week's scale · ${label} · 2 octaves`;
}

// A slow single-stroke bar (R L R L …) — the "hear it" demo for a drums warmup
// (there is no scale to sound). Right hand leads, one accent on beat 1.
const WARMUP_STICKING: StickingCell[] = [
  { hand: "R", accent: true, count: "1" },
  { hand: "L", count: "2" },
  { hand: "R", count: "3" },
  { hand: "L", count: "4" },
];

export function WarmupSlot({ module, warmup, ghostName, ghostKey, printAlways, isNow, status }: { module?: InstrumentModule; warmup?: Warmup; ghostName: string; ghostKey: KeyId; printAlways?: boolean; isNow?: boolean; status?: "done" | "active" | null }) {
  const { state, bumpRep } = useAppState();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bpm, setBpm] = useState(80);
  const [hand, setHand] = useState<"right" | "left">("right");
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

  // Module/warmup always present in practice (piano registers at init); guard for types.
  if (!warmup) return null;
  const InstrumentVisual = module?.InstrumentVisual;
  const NotationVisual = module?.NotationVisual;
  // Non-tonal instruments (drums) have no scale, key wheel, or fingering — every
  // tonal reference below is gated on this one derived predicate (design D2/D3).
  const nonTonal = isNonTonal(module?.focusKind);
  // The instrument's own name for this week's focus: a key name for piano, a
  // chord/riff label for guitar, a rudiment name for drums.
  const focusDisplay = nonTonal ? (module?.focusLabel(ghostKey) ?? ghostName) : ghostName;
  // The 2-octave scale of the ghost key, spelled correctly (flats for flat keys).
  // Skipped entirely for non-tonal instruments (no scale to show/sound).
  const scaleNotes = nonTonal ? [] : scale(KEY_META[ghostKey].tonic, KEY_META[ghostKey].mode, 2, 4, keyPrefersFlats(ghostKey));
  // #4 — the "bring your thumb up here" cue for the current key + hand (piano).
  // Undefined for instruments with no such cue (guitar/drums) → the toggle/cue hide.
  const fingeringCue = nonTonal ? null : (module?.scaleFingeringCue?.(ghostKey, hand) ?? null);
  const showFingerGuidance = !nonTonal && !!module?.scaleFingeringCue;

  // V4 soul-first: lead with the feeling-first summary when present, with the
  // focus name as a tappable TermChip on TONAL instruments (the chip opens the
  // key/chord explainer); non-tonal drums show the rudiment name as plain text
  // (its glossary token is not a tonal key, so no tonal chip is offered).
  const focusPart = nonTonal ? (
    <span className="text-[color:var(--ink-2)]">{focusDisplay}</span>
  ) : (
    <TermChip term={ghostKeyToTermId(ghostKey)} label={ghostName} variant={warmup.soulSummary ? "subtitle" : undefined} />
  );
  const summary = warmup.soulSummary ? (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <span>{warmup.soulSummary}</span>
      <span className="text-[color:var(--ink-3)]">·</span>
      {focusPart}
    </span>
  ) : (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <span>{warmup.label} ·</span>
      {focusPart}
    </span>
  );

  return (
    <Slot
      index={1}
      title="Warmup"
      pillar="technique"
      duration="90s"
      status={status ?? (reps ? "done" : null)}
      summary={summary}
      defaultOpen={false}
      isNow={isNow}
      printAlways={printAlways}
    >
      <div className="space-y-3 text-sm">
        {/* V5 — lead with the soul summary as a concrete instruction heading.
            When present, this replaces the bare label so the user reads an
            outcome ("Make chord switches feel automatic") not an exercise name.
            Falls back to the label when no soulSummary is authored. */}
        <p
          data-testid="warmup-soul-summary"
          className="font-serif text-base text-[color:var(--ink)]"
        >
          {warmup.soulSummary ?? warmup.label}
        </p>
        <div className="text-[color:var(--ink-3)] italic">
          {warmup.postureLine}
        </div>
        <ul className="space-y-1 text-sm text-[color:var(--ink-2)]">
          {warmup.lines.map((l, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[color:var(--ink-3)] text-sm mt-0.5">→</span>
              <span>{linkTerms(fillWarmupLine(l, ghostKey), `wl${i}`)}</span>
            </li>
          ))}
        </ul>
        {/* #4 — "This week's reference" card. TONAL instruments (piano/guitar) show
            the week's scale on a keyboard/fretboard with finger numbers + the
            thumb-tuck note ringed + standard notation; NON-TONAL drums show the
            practice pad (no scale, no fingering, no key wheel — none of it exists
            for a pad). Gated on `nonTonal` (design D3). */}
        <div className="pt-2 rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-3 py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div data-testid="warmup-week-label" className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)]">
              {warmupReferenceLabel(module?.focusKind, nonTonal ? focusDisplay : KEY_META[ghostKey].name)}
            </div>
            {showFingerGuidance && (
              <div className="flex gap-1 no-print" role="group" aria-label="Hand for fingering">
                {(["right", "left"] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-pressed={hand === h}
                    onClick={() => setHand(h)}
                    className={`text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded ${hand === h ? "chip-accent" : "chip"}`}
                  >
                    {h === "right" ? "RH" : "LH"}
                  </button>
                ))}
              </div>
            )}
          </div>
          {InstrumentVisual && (
            nonTonal
              ? <div className="flex justify-center"><InstrumentVisual /></div>
              : <InstrumentVisual notes={scaleNotes} rangeStart="C4" octaves={2} scaleKey={ghostKey} scaleHand={hand} />
          )}
          {/* The owner's "when do I bring my thumb up?" cue (piano). */}
          {fingeringCue && (
            <p className="text-xs text-[color:var(--ink-2)] mt-2" data-testid="fingering-cue">
              <span className="text-[color:var(--accent-deep)] font-medium">Fingering ({hand === "right" ? "right hand" : "left hand"}):</span>{" "}
              {fingeringCue}. <span className="text-[color:var(--ink-3)]">The ringed key is where the thumb passes under.</span>
            </p>
          )}
          {/* Standard notation (piano Staff / guitar Tab) for the scale — tonal only. */}
          {!nonTonal && NotationVisual && (
            <div className="mt-2 overflow-x-auto">
              <NotationVisual notes={scaleNotes} ariaLabel={`${KEY_META[ghostKey].name} scale in notation`} />
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-3 items-center no-print">
            <button
              type="button"
              onClick={async () => {
                await ensureAudio();
                if (nonTonal) {
                  await playSticking(WARMUP_STICKING, bpm);
                } else {
                  await playSequence(scale(KEY_META[ghostKey].tonic, KEY_META[ghostKey].mode, 1, 4, keyPrefersFlats(ghostKey)), { noteDurationSec: 0.34 });
                }
              }}
              className="chip text-xs px-3 py-1"
            >
              {nonTonal ? "Hear It" : "Hear the Scale"}
            </button>
            <button
              type="button"
              onClick={() => bumpRep(repId, { bpm })}
              className="chip chip-accent text-xs px-3 py-1"
            >
              I Played It
            </button>
            <Metronome defaultBpm={80} onBpmChangeAction={setBpm} />
          </div>
          {reps && (
            <p className="text-xs text-[color:var(--ink-3)] italic mt-2">
              {reps.count} rep{reps.count === 1 ? "" : "s"} of this {nonTonal ? "warmup" : "scale"}
              {reps.maxBpm ? ` · best ${reps.maxBpm} BPM` : ""}.
            </p>
          )}
        </div>
        <div className="pt-2 flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="chip text-xs px-3 py-1"
          >
            {running ? "Pause" : "Start"} the Minute
          </button>
          <span className="text-xs tabular-nums text-[color:var(--ink-3)]">
            {fmtSec(elapsed)}
          </span>
          <span className="text-xs text-[color:var(--ink-3)]">
            · No bell. Just a gentle timer.
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
