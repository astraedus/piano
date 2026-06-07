"use client";
import { ReactNode, useState } from "react";
import { clsx } from "clsx";

export type Pillar =
  | "technique"
  | "ear"
  | "expression"
  | "leadsheet"
  | "improv"
  | "repertoire";

const PILLAR_VAR: Record<Pillar, string> = {
  technique: "var(--color-pillar-technique)",
  ear: "var(--color-pillar-ear)",
  expression: "var(--color-pillar-expression)",
  leadsheet: "var(--color-pillar-leadsheet)",
  improv: "var(--color-pillar-improv)",
  repertoire: "var(--color-pillar-repertoire)",
};

interface SlotProps {
  index: number;
  title: string;
  pillar?: Pillar; // left-edge strip color
  duration?: string; // "90s", "4 min"
  summary: ReactNode; // compact line shown collapsed
  status?: "done" | "active" | null; // right-aligned status pill
  children?: ReactNode; // detail shown when expanded
  defaultOpen?: boolean;
  muted?: boolean; // for first-session-back's muted ear moment
  mutedLine?: string;
  onLongPress?: () => void; // for swap
  printAlways?: boolean;
}

export function Slot({ index, title, pillar = "technique", duration, summary, status, children, defaultOpen, muted, mutedLine, onLongPress, printAlways }: SlotProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  // Long-press handler
  let lpTimer: ReturnType<typeof setTimeout> | null = null;
  const startLp = () => {
    if (!onLongPress) return;
    lpTimer = setTimeout(() => onLongPress(), 520);
  };
  const cancelLp = () => { if (lpTimer) clearTimeout(lpTimer); };

  return (
    <section
      data-open={open || !!printAlways}
      className={clsx("slot-card mb-3 px-4 py-3.5", muted && "opacity-60")}
      style={{ ["--pillar" as string]: PILLAR_VAR[pillar] }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerDown={startLp}
        onPointerUp={cancelLp}
        onPointerLeave={cancelLp}
        className="w-full text-left flex items-baseline gap-3 group"
        aria-expanded={open}
      >
        <span className="text-[color:var(--ink-3)] font-serif text-sm tabular-nums w-4 shrink-0">{index}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-serif text-[color:var(--ink)] text-lg tracking-[-0.01em]">
              {title}
            </h3>
            {duration && (
              <span className="text-xs text-[color:var(--ink-3)] tabular-nums">· {duration}</span>
            )}
            {status === "done" && (
              <span className="status-done text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ml-auto">done</span>
            )}
            {status === "active" && (
              <span className="text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ml-auto text-[color:var(--accent-deep)] bg-[color:var(--accent)]/12">now</span>
            )}
          </div>
          <div className="text-sm text-[color:var(--ink-2)] mt-0.5">
            {muted ? (mutedLine ?? summary) : summary}
          </div>
        </div>
        <span
          className={clsx(
            "text-[color:var(--ink-3)] transition-transform text-lg leading-none no-print shrink-0",
            open && "rotate-90"
          )}
          aria-hidden
        >
          ›
        </span>
      </button>

      <div
        className={clsx(
          "grid slot-body overflow-hidden",
          (open || printAlways) ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]",
          printAlways && "print:!grid-rows-[1fr]"
        )}
      >
        <div className="min-h-0">
          {(open || printAlways) && !muted && (
            <div className="pl-7 text-[color:var(--ink-2)] leading-relaxed">{children}</div>
          )}
        </div>
      </div>
    </section>
  );
}
