"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { defaultState, loadState, saveState } from "@/lib/storage";
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
    try {
      if (s.phase) document.documentElement.setAttribute("data-phase", String(s.phase));
      if (s.theme === "light") document.documentElement.setAttribute("data-theme", "light");
      else document.documentElement.removeAttribute("data-theme");
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === "piano.state" && e.newValue) {
        try { _setState(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setState = useCallback((next: AppState) => {
    _setState(next);
    saveState(next);
    try {
      if (next.phase) document.documentElement.setAttribute("data-phase", String(next.phase));
    } catch {}
  }, []);

  const patch = useCallback((partial: Partial<AppState>) => {
    _setState((prev) => {
      const next = { ...prev, ...partial };
      saveState(next);
      try {
        if (next.phase) document.documentElement.setAttribute("data-phase", String(next.phase));
      } catch {}
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
