"use client";
import { ReactNode, useState } from "react";
import { clsx } from "clsx";

interface SlotProps {
  index: number;
  title: string;
  duration?: string; // "90s", "4 min"
  summary: ReactNode; // compact line shown collapsed
  children?: ReactNode; // detail shown when expanded
  defaultOpen?: boolean;
  muted?: boolean; // for first-session-back's muted ear moment
  mutedLine?: string;
  onLongPress?: () => void; // for swap
  printAlways?: boolean;
}

export function Slot({ index, title, duration, summary, children, defaultOpen, muted, mutedLine, onLongPress, printAlways }: SlotProps) {
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
      className={clsx(
        "border-b border-[color:var(--rule)] py-4",
        muted && "opacity-60"
      )}
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
        <span className="text-[color:var(--ink-3)] font-serif text-sm">{index}</span>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-[color:var(--ink)] text-lg">
              {title}
            </h3>
            {duration && (
              <span className="text-xs text-[color:var(--ink-3)] tabular-nums">· {duration}</span>
            )}
          </div>
          <div className="text-sm text-[color:var(--ink-2)] mt-0.5">
            {muted ? (mutedLine ?? summary) : summary}
          </div>
        </div>
        <span
          className={clsx(
            "text-[color:var(--ink-3)] transition-transform text-lg leading-none no-print",
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
            <div className="pl-6 text-[color:var(--ink-2)] leading-relaxed">{children}</div>
          )}
        </div>
      </div>
    </section>
  );
}
