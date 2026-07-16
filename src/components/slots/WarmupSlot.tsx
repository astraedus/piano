"use client";
import { useEffect, useRef, useState } from "react";
import { Slot } from "../Slot";
import { TermChip } from "../explain";
import type { Warmup, KeyId } from "@/lib/types";
import { scaleRepId } from "@/lib/types";
import { KEY_META, keyPrefersFlats, scale } from "@/lib/music";
import { ghostKeyToTermId } from "@/lib/pathFilter";
import type { InstrumentModule } from "@/lib/instrumentRegistry";
import { Metronome } from "../Metronome";
import { ensureAudio, playSequence } from "@/lib/audio";
import { useAppState } from "@/hooks/useAppState";

/**
 * The "this week's reference" label above the warmup visual. Instrument-aware so it
 * agrees with the header: piano's weekly focus is a key → its SCALE; guitar's is a
 * chord/box → the pentatonic SHAPE you play over it. (Honest: the guitar visual is
 * a pentatonic box, so it reads "shape", never a literal "chord".) Pure — tested.
 */
export function warmupReferenceLabel(focusKind: "key" | "chord" | undefined, keyName: string): string {
  return focusKind === "chord"
    ? `This week's shape · ${keyName}`
    : `This week's scale · ${keyName} · 2 octaves`;
}

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
  // The 2-octave scale of the ghost key, spelled correctly (flats for flat keys).
  const scaleNotes = scale(KEY_META[ghostKey].tonic, KEY_META[ghostKey].mode, 2, 4, keyPrefersFlats(ghostKey));
  // #4 — the "bring your thumb up here" cue for the current key + hand (piano).
  // Undefined for instruments with no such cue (guitar) → the hand toggle/cue hide.
  const fingeringCue = module?.scaleFingeringCue?.(ghostKey, hand) ?? null;
  const showFingerGuidance = !!module?.scaleFingeringCue;

  // #3 — derive key-relative warmup content. The five-finger pattern (1-2-3-4-5-
  // 4-3-2-1, note names) for THIS week's key, substituted into any `{fiveFinger}`
  // placeholder so the warmup never hardcodes C in an A-major (etc.) week.
  const fiveFingerUpDown = (() => {
    const deg = scaleNotes.slice(0, 5).map((n) => n.replace(/-?\d+$/, "")); // 1..5, no octave
    return [...deg, ...deg.slice(0, 4).reverse()].join(" ");
  })();
  const fillWarmupLine = (line: string) =>
    line.replace(/\{fiveFinger\}/g, fiveFingerUpDown);

  // V4 soul-first: lead with the feeling-first summary when present, with the
  // theory key name as an always-tappable TermChip; else wrap the ghost key name
  // inline so the theory term is still explainable (degrades to plain text).
  const summary = warmup.soulSummary ? (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <span>{warmup.soulSummary}</span>
      <span className="text-[color:var(--ink-3)]">·</span>
      <TermChip term={ghostKeyToTermId(ghostKey)} label={ghostName} variant="subtitle" />
    </span>
  ) : (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <span>{warmup.label} ·</span>
      <TermChip term={ghostKeyToTermId(ghostKey)} label={ghostName} />
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
              <span>{fillWarmupLine(l)}</span>
            </li>
          ))}
        </ul>
        {/* #4 — "This week's scale + fingering" — ALWAYS shown (independent of the
            week's warmup type), so a learner always sees, for the current key, a
            keyboard with finger numbers + the thumb-tuck note ringed. This is the
            headline of the owner's ask ("people should know what fingers to use
            and when to bring the thumb up"). */}
        <div className="pt-2 rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-3 py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div data-testid="warmup-week-label" className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)]">
              {warmupReferenceLabel(module?.focusKind, KEY_META[ghostKey].name)}
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
            <InstrumentVisual notes={scaleNotes} rangeStart="C4" octaves={2} scaleKey={ghostKey} scaleHand={hand} />
          )}
          {/* The owner's "when do I bring my thumb up?" cue (piano). */}
          {fingeringCue && (
            <p className="text-xs text-[color:var(--ink-2)] mt-2" data-testid="fingering-cue">
              <span className="text-[color:var(--accent-deep)] font-medium">Fingering ({hand === "right" ? "right hand" : "left hand"}):</span>{" "}
              {fingeringCue}. <span className="text-[color:var(--ink-3)]">The ringed key is where the thumb passes under.</span>
            </p>
          )}
          {/* #4 — surface the scale in standard notation (piano Staff / guitar
              Tab), built but previously only used on the KeyMap reference page. */}
          {NotationVisual && (
            <div className="mt-2 overflow-x-auto">
              <NotationVisual notes={scaleNotes} ariaLabel={`${KEY_META[ghostKey].name} scale in notation`} />
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-3 items-center no-print">
            <button
              type="button"
              onClick={async () => {
                await ensureAudio();
                await playSequence(scale(KEY_META[ghostKey].tonic, KEY_META[ghostKey].mode, 1, 4, keyPrefersFlats(ghostKey)), { noteDurationSec: 0.34 });
              }}
              className="chip text-xs px-3 py-1"
            >
              Hear the Scale
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
              {reps.count} rep{reps.count === 1 ? "" : "s"} of this scale
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
