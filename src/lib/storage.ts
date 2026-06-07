import type { AppState, ArcEvent } from "./types";
import { emptyStreak } from "./progression";

// v3 key. The old v1 blob lived at "piano.state"; we migrate it to "practice.state"
// and leave the old key in place as a backup (the owner's real practice history).
export const STORAGE_KEY = "practice.state";
export const LEGACY_STORAGE_KEY = "piano.state";
const VERSION = 3 as const;

export function defaultState(): AppState {
  return {
    version: VERSION,
    instrument: "piano",
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
    theme: undefined, // light-first: unset lets CSS + OS preference decide (dark is opt-in)
    notifyAfter5Days: false,
    recentDrillIds: [],
    skillProgress: {},
    // V2 gamification defaults (storage v3).
    xp: 0,
    level: 1,
    streak: emptyStreak(),
    pendingLevelUps: [],
  };
}

function hasWindow() { return typeof window !== "undefined"; }

export function loadState(): AppState {
  if (!hasWindow()) return defaultState();
  try {
    // Prefer the v2 key; fall back to the legacy v1 key for first-load-after-upgrade.
    let raw = window.localStorage.getItem(STORAGE_KEY);
    let fromLegacy = false;
    if (!raw) {
      raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      fromLegacy = true;
    }
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultState();

    const version = (parsed as { version?: unknown }).version;
    if (version === VERSION) {
      // Already current. Merge over defaults to backfill any new optional fields.
      return { ...defaultState(), ...(parsed as Partial<AppState>) } as AppState;
    }

    // Anything older (v1, v2, or missing version) → run the migration ladder to
    // the current version, injecting any new fields with safe defaults.
    // `fromLegacy` distinguishes a copy from the old "piano.state" key vs an
    // in-place upgrade of a partially-written "practice.state" blob; either way
    // we persist the migrated result under the new key and keep the legacy backup.
    void fromLegacy;
    const migrated = migrateToCurrent(parsed as Record<string, unknown>);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); } catch {}
    return migrated;
  } catch {
    return defaultState();
  }
}

/**
 * Run the full migration ladder (v1→v2→v3) for any pre-current blob. v2 blobs
 * skip the v1→v2 step (no piano-begins/instrument injection needed) but still
 * get the v2→v3 gamification defaults. Idempotent on already-current blobs.
 */
export function migrateToCurrent(old: Record<string, unknown>): AppState {
  const version = Number((old as { version?: unknown }).version ?? 1);
  // v1 (or missing/0) blobs need the v1→v2 pass first; v2 blobs are already v2.
  const v2 = version >= 2 ? (old as unknown as AppState) : migrateV1toV2(old);
  return migrateV2toV3(v2 as unknown as Record<string, unknown>);
}

/**
 * Real v1 → v2 migration. Injects instrument identity + skill-DAG progress,
 * rewrites the renamed arc-event kind, and is non-destructive: it never deletes
 * the legacy "piano.state" key (kept as a safety backup of real practice history).
 * Returns a v2-shaped blob; the v2→v3 step layers gamification on top.
 */
export function migrateV1toV2(old: Record<string, unknown>): AppState {
  const base = defaultState();

  // Rewrite the renamed arc-event kind: "piano-begins" → "instrument-begins".
  const oldArc = Array.isArray((old as { arc?: unknown }).arc)
    ? ((old as { arc: ArcEvent[] }).arc)
    : [];
  const arc: ArcEvent[] = oldArc.map((ev) => {
    const kind = (ev as { kind?: string }).kind;
    if (kind === "piano-begins") {
      return { ...ev, kind: "instrument-begins" as const };
    }
    return ev;
  });

  return {
    ...base,
    ...(old as Partial<AppState>),
    version: 2 as AppState["version"],
    instrument: ((old as { instrument?: AppState["instrument"] }).instrument) ?? "piano",
    skillProgress: ((old as { skillProgress?: AppState["skillProgress"] }).skillProgress) ?? {},
    arc,
  };
}

/**
 * Real v2 → v3 migration. Injects the gamification spine (xp / level / streak /
 * pendingLevelUps) with safe defaults, preserving any values already present
 * (so re-running is non-destructive). All prior fields pass through untouched —
 * no practice history is dropped. Idempotent on a partial v3 blob.
 */
export function migrateV2toV3(old: Record<string, unknown>): AppState {
  const o = old as Partial<AppState>;
  return {
    ...defaultState(),
    ...o,
    version: VERSION,
    xp: typeof o.xp === "number" ? o.xp : 0,
    level: typeof o.level === "number" ? o.level : 1,
    streak: o.streak ?? emptyStreak(),
    pendingLevelUps: o.pendingLevelUps ?? [],
  } as AppState;
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
    // Route imports through the migration ladder so older exported blobs upgrade
    // cleanly all the way to the current version.
    const version = (parsed as { version?: unknown }).version;
    const merged: AppState = version === VERSION
      ? { ...defaultState(), ...(parsed as Partial<AppState>), version: VERSION }
      : migrateToCurrent(parsed as Record<string, unknown>);
    saveState(merged);
    return true;
  } catch {
    return false;
  }
}
