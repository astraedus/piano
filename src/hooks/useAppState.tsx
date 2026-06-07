"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { STORAGE_KEY, defaultState, loadState, saveState } from "@/lib/storage";
import { setRootAttrs } from "@/lib/domAttrs";
import type { AppState, UnlockCard } from "@/lib/types";

interface Ctx {
  state: AppState;
  ready: boolean;
  setState: (next: AppState) => void;
  patch: (partial: Partial<AppState>) => void;
  dismissUnlock: (id: string) => void;
  bumpRep: (id: string, opts?: { bpm?: number }) => void;
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
    setRootAttrs({ phase: s.phase, instrument: s.instrument, theme: s.theme ?? "dark" });
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

  const dismissUnlock = useCallback((_id: string) => {
    // For now there's no "dismissed" state — unlocks live in state.unlocks.
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

  return (
    <AppStateContext.Provider value={{ state, ready, setState, patch, dismissUnlock, bumpRep }}>
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
