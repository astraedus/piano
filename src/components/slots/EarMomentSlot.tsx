"use client";
import { useRef, useState } from "react";
import { Slot } from "../Slot";
import type { EarRound } from "@/lib/types";
import { ensureAudio, playEarRound } from "@/lib/audio";
import { clsx } from "clsx";

export function EarMomentSlot({
  rounds, muted, printAlways, onResultAction,
}: {
  rounds: EarRound[];
  muted?: boolean;
  printAlways?: boolean;
  onResultAction?: (correctIds: string[], wrongIds: string[]) => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const playedRef = useRef(false);

  const round = rounds[i];

  if (muted) {
    return (
      <Slot index={4} title="Ear moment" summary={<span className="text-[color:var(--ink-3)]">muted for this session.</span>} muted mutedLine="muted tonight. back next session." printAlways={printAlways} />
    );
  }

  if (!round) {
    return (
      <Slot index={4} title="Ear moment" duration="60s" summary={<>that's enough listening for now.</>} printAlways={printAlways}>
        <p className="text-sm text-[color:var(--ink-2)]">three rounds done. ears open.</p>
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
    setTimeout(() => {
      setPicked(null);
      setI((v) => v + 1);
    }, 1200);
  };

  return (
    <Slot index={4} title="Ear moment" duration={`round ${i + 1} of ${rounds.length}`} summary={<>{round.prompt}</>} printAlways={printAlways}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 no-print">
          <button type="button" onClick={play} className="text-xs px-3 py-1 rounded-full border border-[color:var(--accent-soft)] text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10">play</button>
          <span className="text-xs text-[color:var(--ink-3)]">you'll hear it twice.</span>
        </div>
        <div className="grid grid-cols-2 gap-2 no-print">
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
        {picked && (
          <p className="text-xs text-[color:var(--ink-3)] italic fade-in">
            {picked === round.correctId ? "yes — " + round.choices.find((c) => c.id === round.correctId)?.label.toLowerCase() + "." : "nope — it was " + round.choices.find((c) => c.id === round.correctId)?.label.toLowerCase() + ". next one."}
          </p>
        )}
      </div>
    </Slot>
  );
}
