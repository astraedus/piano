"use client";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/hooks/useAppState";
import { CIRCLE_MAJORS, CIRCLE_MINORS, KEY_META } from "@/lib/music";
import { setGhostOverride } from "@/lib/ghostKey";
import { getModuleSync, type InstrumentModule } from "@/lib/instrumentRegistry";
import { focusNoun, isNonTonal } from "@/lib/focusNoun";
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

  const module = getModuleSync(state.instrument);
  const nonTonal = isNonTonal(module?.focusKind);
  const phaseKeys = module?.ghostRotation[state.phase] ?? [];
  // The full 24-key wheel is a TONAL override; drums scope only to their own
  // rotation tokens (labeled as rudiments), so no key wheel reaches a drum stand.
  const allKeys: KeyId[] = [...CIRCLE_MAJORS, ...CIRCLE_MINORS];
  const pick = (k: KeyId) => {
    setState(setGhostOverride(state, k, new Date()));
    setOpen(false);
    onDoneAction?.();
  };

  return (
    <div className="relative inline-block no-print" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
        aria-expanded={open}
      >
        Change
      </button>
      {open && (
        <div className="absolute left-0 mt-1 z-20 warm-card p-4 w-[min(360px,90vw)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-3)] mb-2">
            This Week&apos;s {focusNoun(module?.focusKind)}s
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {phaseKeys.map((k) => (
              <FocusChip key={k} k={k} active={k === current} module={module} onClickAction={() => pick(k)} />
            ))}
          </div>
          {!nonTonal && (
            <details>
              <summary className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-3)] cursor-pointer">All Keys</summary>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allKeys.map((k) => (
                  <FocusChip key={k} k={k} active={k === current} module={module} onClickAction={() => pick(k)} />
                ))}
              </div>
            </details>
          )}
          <p className="text-[10px] text-[color:var(--ink-3)] italic mt-3">Just this week. The rotation comes back next week.</p>
        </div>
      )}
    </div>
  );
}

// A rotation-token chip, labeled in the instrument's own terms: a key name for
// tonal instruments, the module's focusLabel (a rudiment name) for drums.
function FocusChip({ k, active, module, onClickAction }: { k: KeyId; active: boolean; module?: InstrumentModule; onClickAction: () => void }) {
  const label = isNonTonal(module?.focusKind) && module
    ? module.focusLabel(k)
    : KEY_META[k].name.replace(" major", "").replace(" minor", "m");
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
      {label}
    </button>
  );
}
