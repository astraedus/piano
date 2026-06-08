"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
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
  /** V4 resume UX — this slot is the current "NOW / start here" slot. Gets a clear
   *  ring treatment, a "Start here" pill, auto-expands, and scrolls into view. */
  isNow?: boolean;
  muted?: boolean; // for first-session-back's muted ear moment
  mutedLine?: string;
  onLongPress?: () => void; // for swap
  printAlways?: boolean;
}

export function Slot({ index, title, pillar = "technique", duration, summary, status, children, defaultOpen, isNow, muted, mutedLine, onLongPress, printAlways }: SlotProps) {
  const [open, setOpen] = useState((defaultOpen ?? false) || !!isNow);
  const sectionRef = useRef<HTMLElement>(null);
  const scrolledRef = useRef(false);

  // V4 resume UX — when this becomes the NOW slot, auto-expand it and scroll it
  // into view ONCE on load so a returning user lands on "start here" without
  // hunting. Honors reduced motion (instant scroll when the user prefers it).
  useEffect(() => {
    if (!isNow || scrolledRef.current) return;
    scrolledRef.current = true;
    setOpen(true);
    const el = sectionRef.current;
    if (!el) return;
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [isNow]);

  // Done slots read as completed: a muted, lower-emphasis card with a checkmark.
  const isDone = status === "done";

  // Long-press handler
  let lpTimer: ReturnType<typeof setTimeout> | null = null;
  const startLp = () => {
    if (!onLongPress) return;
    lpTimer = setTimeout(() => onLongPress(), 520);
  };
  const cancelLp = () => { if (lpTimer) clearTimeout(lpTimer); };

  return (
    <section
      ref={sectionRef}
      data-open={open || !!printAlways}
      data-now={isNow || undefined}
      className={clsx(
        "slot-card mb-3 px-4 py-3.5",
        muted && "opacity-60",
        isDone && !isNow && "slot-card-done",
        isNow && "slot-card-now",
      )}
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
        <span className="font-serif text-sm tabular-nums w-4 shrink-0 text-[color:var(--ink-3)]">
          {isDone ? (
            <span className="text-[color:var(--success)]" aria-label="done">✓</span>
          ) : (
            index
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className={clsx(
              "font-serif text-lg tracking-[-0.01em]",
              isDone && !isNow ? "text-[color:var(--ink-2)]" : "text-[color:var(--ink)]",
            )}>
              {title}
            </h3>
            {duration && (
              <span className="text-xs text-[color:var(--ink-3)] tabular-nums">· {duration}</span>
            )}
            {isNow ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ml-auto text-white bg-[color:var(--accent)]">
                Start here
              </span>
            ) : status === "done" ? (
              <span className="status-done text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ml-auto">done</span>
            ) : status === "active" ? (
              <span className="text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ml-auto text-[color:var(--accent-deep)] bg-[color:var(--accent)]/12">now</span>
            ) : null}
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
