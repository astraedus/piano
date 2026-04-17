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

  return (
    <AppStateContext.Provider value={{ state, ready, setState, patch, dismissUnlock }}>
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
