"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Slot } from "../Slot";
import { TermChip, useExplain } from "../explain";
import { lookupTerm } from "@/lib/explain/glossary";
import type { EarRound } from "@/lib/types";
import { ensureAudio, playEarRound } from "@/lib/audio";
import { clsx } from "clsx";

// R2 — a short consolidation pause between ear rounds. Ear rounds are the slot's
// "reps"; a brief rest between them gives the just-heard interval a beat to settle.
const EAR_REST_SEC = 8;

export function EarMomentSlot({
  rounds, muted, printAlways, isNow, status, onResultAction,
}: {
  rounds: EarRound[];
  muted?: boolean;
  printAlways?: boolean;
  isNow?: boolean;
  status?: "done" | "active" | null;
  onResultAction?: (correctIds: string[], wrongIds: string[]) => void;
}) {
  const reduce = useReducedMotion();
  const { open } = useExplain();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [resting, setResting] = useState(false);
  const [correct, setCorrect] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const playedRef = useRef(false);
  const choicesRef = useRef<HTMLDivElement>(null);

  const round = rounds[i];

  if (muted) {
    return (
      <Slot index={4} title="Ear Moment" pillar="ear" summary={<span className="text-[color:var(--ink-3)]">Muted for this session.</span>} muted mutedLine="Muted tonight. Back next session." printAlways={printAlways} status={status} />
    );
  }

  if (!round) {
    return (
      <Slot index={4} title="Ear Moment" pillar="ear" duration="60s" status={status ?? "done"} summary={<>All rounds done for tonight.</>} printAlways={printAlways}>
        <p className="text-sm text-[color:var(--ink-2)]">Three rounds done. Nice listening.</p>
      </Slot>
    );
  }

  const play = async () => {
    await ensureAudio();
    await playEarRound(round);
    playedRef.current = true;
  };

  const pick = (choiceId: string) => {
    if (picked) return;
    setPicked(choiceId);
    const right = choiceId === round.correctId;
    if (right) {
      const next = [...correct, round.id];
      setCorrect(next);
      onResultAction?.(next, wrong);
    } else {
      const next = [...wrong, round.id];
      setWrong(next);
      onResultAction?.(correct, next);
    }
    // Close the theory loop: auto-reveal the glossary card for the CORRECT
    // answer's term (the "ear → theory" bridge the audit flagged as missing).
    // Anchored to the choices grid; only fires when the correct choice carries a
    // real glossary term, so it never opens an empty card.
    const correctChoice = round.choices.find((c) => c.id === round.correctId);
    const entry = correctChoice?.termId ? lookupTerm(correctChoice.termId) : undefined;
    if (entry && choicesRef.current) {
      const anchor = choicesRef.current;
      setTimeout(() => open(entry, anchor), 450);
    }
    // After feedback, a brief micro-rest before the next round (R2), unless this
    // was the last round.
    const isLast = i >= rounds.length - 1;
    setTimeout(() => {
      setPicked(null);
      if (isLast) { setI((v) => v + 1); return; }
      setResting(true);
    }, 1200);
  };

  if (resting) {
    return (
      <Slot index={4} title="Ear Moment" pillar="ear" duration={`Round ${i + 1} of ${rounds.length}`} summary={<>A beat to let it settle.</>} printAlways={printAlways} isNow={isNow} status={status}>
        <EarRest
          reduce={!!reduce}
          onDoneAction={() => { setResting(false); setI((v) => v + 1); }}
        />
      </Slot>
    );
  }

  // V4 — ear-choice labels that map to a glossary term get an always-tappable
  // TermChip explainer beneath the choices. The pick buttons stay plain (a
  // TermChip is itself interactive, so nesting it inside the choice button would
  // be invalid + steal the tap); the explainer row is the "one tap away" path.
  const termChoices = round.choices.filter((c) => c.termId);

  return (
    <Slot index={4} title="Ear Moment" pillar="ear" duration={`Round ${i + 1} of ${rounds.length}`} summary={<>{round.prompt}</>} printAlways={printAlways} isNow={isNow} status={status}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 no-print">
          <button type="button" onClick={play} className="chip chip-accent text-xs px-3 py-1">Play</button>
          <span className="text-xs text-[color:var(--ink-3)]">You'll hear it twice.</span>
        </div>
        <div ref={choicesRef} className="grid grid-cols-2 gap-2 no-print">
          {round.choices.map((c) => {
            const isPicked = picked === c.id;
            const isRight = picked && c.id === round.correctId;
            return (
              <button
                key={c.id}
                type="button"
                disabled={!!picked}
                onClick={() => pick(c.id)}
                className={clsx(
                  "rounded-md border px-3 py-2 text-left text-[color:var(--ink)] transition-colors",
                  !picked && "border-[color:var(--rule)] hover:border-[color:var(--accent-soft)]",
                  isPicked && isRight && "border-[color:var(--accent)] bg-[color:var(--accent)]/10",
                  isPicked && !isRight && "border-[color:var(--rule)] opacity-70",
                  isRight && picked !== c.id && picked && "border-[color:var(--accent-soft)] bg-[color:var(--accent)]/5"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {termChoices.length > 0 && (
          <p className="text-xs text-[color:var(--ink-3)] flex flex-wrap items-baseline gap-x-2 gap-y-1 no-print">
            <span>New to these?</span>
            {termChoices.map((c) => (
              <TermChip key={c.id} term={c.termId!} label={c.label} variant="subtitle" />
            ))}
          </p>
        )}
        {picked && (
          <p className="text-xs text-[color:var(--ink-3)] italic fade-in">
            {picked === round.correctId ? "Correct. " + round.choices.find((c) => c.id === round.correctId)?.label + "." : "Not quite. It was " + round.choices.find((c) => c.id === round.correctId)?.label + ". Next one."}
          </p>
        )}
      </div>
    </Slot>
  );
}

/** A short calm rest between ear rounds (R2) — mirrors the rep-engine's rest cue. */
function EarRest({ reduce, onDoneAction }: { reduce: boolean; onDoneAction: () => void }) {
  const [left, setLeft] = useState(EAR_REST_SEC);
  useEffect(() => {
    const iv = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { clearInterval(iv); onDoneAction(); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onDoneAction]);

  return (
    <div className="rounded-lg border border-[color:var(--accent-soft)] bg-[color:var(--accent)]/5 px-4 py-4 text-center space-y-2">
      <div className="flex items-center justify-center gap-3">
        <span
          className={clsx("inline-block h-3 w-3 rounded-full bg-[color:var(--accent)]", !reduce && "rest-pulse")}
          aria-hidden
        />
        <span className="font-serif text-xl tabular-nums text-[color:var(--ink)]">{left}s</span>
      </div>
      <p className="text-sm text-[color:var(--ink-2)] font-medium">Rest. Let the sound settle.</p>
      <button type="button" onClick={onDoneAction} className="chip text-xs px-3 py-1">Skip rest</button>
    </div>
  );
}
