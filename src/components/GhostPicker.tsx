"use client";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/hooks/useAppState";
import { CIRCLE_MAJORS, CIRCLE_MINORS, KEY_META } from "@/lib/music";
import { setGhostOverride } from "@/lib/ghostKey";
import { GHOST_ROTATION_PER_PHASE } from "@/lib/trinity";
import type { KeyId } from "@/lib/types";

export function GhostPicker({ current, onDoneAction }: { current: KeyId; onDoneAction?: () => void }) {
  const { state, setState } = useAppState();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const phaseKeys = GHOST_ROTATION_PER_PHASE[state.phase] ?? [];
  const allKeys: KeyId[] = [...CIRCLE_MAJORS, ...CIRCLE_MINORS];

  return (
    <div className="relative inline-block no-print" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
        aria-expanded={open}
      >
        change
      </button>
      {open && (
        <div className="absolute left-0 mt-1 z-20 bg-[color:var(--surface-2)] border border-[color:var(--rule)] rounded-lg shadow-xl p-4 w-[min(360px,90vw)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-3)] mb-2">this week's keys</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {phaseKeys.map((k) => (
              <KeyChip
                key={k}
                k={k}
                active={k === current}
                onClickAction={() => {
                  setState(setGhostOverride(state, k, new Date()));
                  setOpen(false);
                  onDoneAction?.();
                }}
              />
            ))}
          </div>
          <details>
            <summary className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-3)] cursor-pointer">all keys</summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {allKeys.map((k) => (
                <KeyChip
                  key={k}
                  k={k}
                  active={k === current}
                  onClickAction={() => {
                    setState(setGhostOverride(state, k, new Date()));
                    setOpen(false);
                    onDoneAction?.();
                  }}
                />
              ))}
            </div>
          </details>
          <p className="text-[10px] text-[color:var(--ink-3)] italic mt-3">just this week. the rotation comes back next week.</p>
        </div>
      )}
    </div>
  );
}

function KeyChip({ k, active, onClickAction }: { k: KeyId; active: boolean; onClickAction: () => void }) {
  return (
    <button
      type="button"
      onClick={onClickAction}
      className={
        "text-xs px-2 py-1 rounded border transition-colors " +
        (active
          ? "border-[color:var(--accent)] text-[color:var(--accent)] bg-[color:var(--accent)]/10"
          : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
      }
    >
      {KEY_META[k].name.replace(" major", "").replace(" minor", "m")}
    </button>
  );
}
