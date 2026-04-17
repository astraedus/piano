import type { AppState } from "./types";

export const STORAGE_KEY = "piano.state";
const VERSION = 1 as const;

export function defaultState(): AppState {
  return {
    version: VERSION,
    firstOpenedAt: undefined,
    phase: 1,
    grade: "initial",
    earLevel: 1,
    pieces: [],
    keyDepths: {},
    sessions: [],
    arc: [],
    unlocks: [],
    pendingUnlocks: [],
    ghostOverride: null,
    theme: "dark",
    notifyAfter5Days: false,
    recentDrillIds: [],
  };
}

function hasWindow() { return typeof window !== "undefined"; }

export function loadState(): AppState {
  if (!hasWindow()) return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultState();
    if (parsed.version !== VERSION) {
      // future migrations would branch here; for MVP reset on mismatch
      return { ...defaultState(), ...migrateV0(parsed) };
    }
    return { ...defaultState(), ...parsed } as AppState;
  } catch {
    return defaultState();
  }
}

function migrateV0(old: Record<string, unknown>): Partial<AppState> {
  // No real migration needed yet
  return { ...(old as Partial<AppState>), version: VERSION };
}

export function saveState(state: AppState): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or permission; ignore for now
  }
}

export function clearState(): void {
  if (!hasWindow()) return;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function exportStateJson(): string {
  const s = loadState();
  return JSON.stringify(s, null, 2);
}

export function importStateJson(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return false;
    const merged = { ...defaultState(), ...parsed, version: VERSION } as AppState;
    saveState(merged);
    return true;
  } catch {
    return false;
  }
}
