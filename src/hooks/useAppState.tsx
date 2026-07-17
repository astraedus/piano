"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { STORAGE_KEY, defaultState, loadState, saveState } from "@/lib/storage";
import { setRootAttrs } from "@/lib/domAttrs";
import { advanceReview } from "@/lib/skillReview";
import { markNodeFluent } from "@/lib/skillTree";
import type { AppState, UnlockCard } from "@/lib/types";
// Importing the piano module self-registers it into the instrument-registry sync
// cache (registerInstrumentModule runs at import time). This warms the cache at
// app init — before any computeTodayPlan / ghostKeyFor read — for every page that
// renders state through this provider. (P4 adds a guitar import here likewise.)
import "@/lib/piano/module";
// Guitar module self-registers likewise — warms the sync cache so guitar content
// (chain drills, skill nodes, unlocks) resolves the moment a profile is on guitar.
import "@/lib/guitar/module";
// Drums module self-registers likewise — warms the sync cache so drums content
// (chain drills, skill nodes, unlocks, ear rounds) resolves the moment a profile
// is on drums.
import "@/lib/drums/module";

interface Ctx {
  state: AppState;
  ready: boolean;
  setState: (next: AppState) => void;
  patch: (partial: Partial<AppState>) => void;
  dismissUnlock: (id: string) => void;
  dismissLevelUp: (level: number) => void;
  bumpRep: (id: string, opts?: { bpm?: number }) => void;
  // R7 — mark a spaced-retrieval review done: advance that node's interval ladder.
  reviewSkill: (nodeId: string) => void;
  // R10 — mark a node fluent (passed its autonomous fluency test).
  markFluent: (nodeId: string) => void;
}

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, _setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);

  // Hydrate on mount.
  useEffect(() => {
    const s = loadState();
    _setState(s);
    setReady(true);
    setRootAttrs({ phase: s.phase, instrument: s.instrument, theme: s.theme });
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { _setState(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setState = useCallback((next: AppState) => {
    _setState(next);
    saveState(next);
    setRootAttrs({ phase: next.phase, instrument: next.instrument });
  }, []);

  const patch = useCallback((partial: Partial<AppState>) => {
    _setState((prev) => {
      const next = { ...prev, ...partial };
      saveState(next);
      setRootAttrs({ phase: next.phase, instrument: next.instrument });
      return next;
    });
  }, []);

  const dismissUnlock = useCallback((id: string) => {
    // Remove the card from the pending queue once it's been shown/acknowledged.
    // Earned unlocks still live permanently in state.unlocks; pendingUnlocks is
    // only the "show this after the next Done" queue.
    _setState((prev) => {
      const pendingUnlocks = (prev.pendingUnlocks ?? []).filter((u) => u.id !== id);
      if (pendingUnlocks.length === (prev.pendingUnlocks ?? []).length) return prev;
      const next = { ...prev, pendingUnlocks };
      saveState(next);
      return next;
    });
  }, []);

  const dismissLevelUp = useCallback((level: number) => {
    // Shift the acknowledged level out of the pendingLevelUps queue. Mirrors
    // dismissUnlock: the level is permanently reflected in state.level/state.xp
    // already; pendingLevelUps is only the "show this reward moment next" queue.
    // Removes the FIRST matching entry so a multi-level jump shows each in turn.
    _setState((prev) => {
      const pending = prev.pendingLevelUps ?? [];
      const idx = pending.indexOf(level);
      if (idx === -1) return prev;
      const pendingLevelUps = [...pending.slice(0, idx), ...pending.slice(idx + 1)];
      const next = { ...prev, pendingLevelUps };
      saveState(next);
      return next;
    });
  }, []);

  const bumpRep = useCallback((id: string, opts?: { bpm?: number }) => {
    _setState((prev) => {
      const reps = { ...(prev.skillReps ?? {}) };
      const cur = reps[id] ?? { count: 0 };
      reps[id] = {
        count: cur.count + 1,
        maxBpm: opts?.bpm != null ? Math.max(cur.maxBpm ?? 0, opts.bpm) : cur.maxBpm,
        lastAt: new Date().toISOString(),
      };
      const next = { ...prev, skillReps: reps };
      saveState(next);
      return next;
    });
  }, []);

  const reviewSkill = useCallback((nodeId: string) => {
    // R7 — advance the node's review interval (1→3→7→14). No-op (returns the same
    // map) when the node isn't queued, so this never creates a phantom schedule.
    _setState((prev) => {
      const skillReview = advanceReview(prev.skillReview ?? {}, nodeId, new Date().toISOString());
      if (skillReview === (prev.skillReview ?? {})) return prev;
      const next = { ...prev, skillReview };
      saveState(next);
      return next;
    });
  }, []);

  const markFluent = useCallback((nodeId: string) => {
    // R10 — record that the node's autonomous fluency test was passed. Does not
    // touch DAG status; fluency is a second dimension alongside `learned`.
    _setState((prev) => {
      const skillProgress = markNodeFluent(prev.skillProgress ?? {}, nodeId, new Date().toISOString());
      const next = { ...prev, skillProgress };
      saveState(next);
      return next;
    });
  }, []);

  return (
    <AppStateContext.Provider value={{ state, ready, setState, patch, dismissUnlock, dismissLevelUp, bumpRep, reviewSkill, markFluent }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): Ctx {
  const v = useContext(AppStateContext);
  if (!v) {
    // Fallback: this should not happen in practice because pages wrap in provider.
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return v;
}

export type { UnlockCard };
