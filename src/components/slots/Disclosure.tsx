"use client";
import { ReactNode, useId, useState } from "react";
import { clsx } from "clsx";

/**
 * A small reference-collapsing disclosure used inside the chain-drill slot. The
 * V4 audit found the rep engine (the ACTION) was buried under the step list and
 * the keyboard/progression (REFERENCE). The fix leads with the engine and tucks
 * the reference behind "Show steps" / "Hear it" toggles so the action is reachable
 * without scrolling past reference. Accessible (button controls a region) and
 * reduced-motion-safe (it is a plain show/hide, no animation required). 44px tap
 * target per the P2 audit fix.
 */
export function Disclosure({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="no-print">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="flex items-center gap-1.5 min-h-[44px] py-1 text-xs uppercase tracking-[0.16em] text-[color:var(--ink-3)] hover:text-[color:var(--ink-2)] transition-colors"
      >
        <span
          className={clsx("text-sm leading-none transition-transform", open && "rotate-90")}
          aria-hidden
        >
          ›
        </span>
        {label}
      </button>
      {open && (
        <div id={id} className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
}
