"use client";
// Soul-First Learning (V4) — the Explain singleton.
//
// One popover open at a time, anywhere in the app. A TermChip calls `open(entry,
// anchorEl)`; the singleton <Explain> (mounted once by ExplainProvider) reads the
// open entry and renders the card anchored to that chip. `close()` dismisses it.
//
// Why a singleton: term chips appear in many surfaces (tree, panel, slots). A
// per-chip popover would mean N mounted listeners and the risk of two cards open
// at once. One provider owns the single open entry + anchor.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { GlossaryEntry } from "@/lib/explain/glossary";
import { Explain } from "./Explain";

interface ExplainState {
  entry: GlossaryEntry;
  anchor: HTMLElement;
}

interface ExplainCtx {
  open: (entry: GlossaryEntry, anchor: HTMLElement) => void;
  close: () => void;
  current: ExplainState | null;
}

const ExplainContext = createContext<ExplainCtx | null>(null);

export function ExplainProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ExplainState | null>(null);

  const open = useCallback((entry: GlossaryEntry, anchor: HTMLElement) => {
    setCurrent({ entry, anchor });
  }, []);
  const close = useCallback(() => setCurrent(null), []);

  const value = useMemo<ExplainCtx>(() => ({ open, close, current }), [open, close, current]);

  return (
    <ExplainContext.Provider value={value}>
      {children}
      {current && <Explain entry={current.entry} anchor={current.anchor} onClose={close} />}
    </ExplainContext.Provider>
  );
}

/**
 * Access the Explain singleton. Returns a no-op-safe shape when no provider is
 * present (e.g. a TermChip rendered in isolation in a test that does not wrap a
 * provider) so a chip never throws — it simply does nothing on click.
 */
export function useExplain(): ExplainCtx {
  const ctx = useContext(ExplainContext);
  if (!ctx) {
    return { open: () => {}, close: () => {}, current: null };
  }
  return ctx;
}
