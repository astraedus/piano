import type { AppState, ArcEvent } from "./types";
import { emptyStreak } from "./progression";

// v3 key. The old v1 blob lived at "piano.state"; we migrate it to "practice.state"
// and leave the old key in place as a backup (the owner's real practice history).
export const STORAGE_KEY = "practice.state";
export const LEGACY_STORAGE_KEY = "piano.state";
const VERSION = 6 as const;

export function defaultState(): AppState {
  return {
    version: VERSION,
    instrument: "piano",
    firstOpenedAt: undefined,
    phase: 1,
    grade: "initial",
    earLevel: 1,
    // Ear content floor. A fresh install claims nothing and has an empty tree, so
    // it starts at 1; onboarding raises it to the self-reported level. Existing
    // profiles are clamped to 1 by the v5→v6 migration (tree-taught content only).
    earLevelFloor: 1,
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
    // V3 motor-learning defaults (storage v4).
    skillReview: {},
    // V4 soul-first learning defaults (storage v5). learningPath undefined =
    // show everything (back-compat); theory off until opted in or go-deep chosen.
    learningPath: undefined,
    theoryEnabled: false,
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
 * Run the full migration ladder (v1→v2→v3→v4→v5→v6) for any pre-current blob.
 * Older blobs enter the ladder at the right rung: v1 (or missing) runs every step;
 * v2 skips v1→v2; v3 skips to v3→v4; …; v5 only runs the final v5→v6 pass.
 * Idempotent on already-current blobs (every step is a non-destructive merge).
 */
export function migrateToCurrent(old: Record<string, unknown>): AppState {
  const version = Number((old as { version?: unknown }).version ?? 1);
  // v1 (or missing/0) blobs need the v1→v2 pass first; v2+ blobs are already v2.
  const v2 = version >= 2 ? (old as unknown as AppState) : migrateV1toV2(old);
  // v3+ blobs are already v3-shaped; v2 blobs gain the gamification spine here.
  const v3 = version >= 3 ? (v2 as unknown as AppState) : migrateV2toV3(v2 as unknown as Record<string, unknown>);
  // v4+ blobs are already v4-shaped; v3 blobs gain the spaced-review queue here.
  const v4 = version >= 4 ? (v3 as unknown as AppState) : migrateV3toV4(v3 as unknown as Record<string, unknown>);
  // v5+ blobs are already v5-shaped; v4 blobs gain the soul-first fields here.
  const v5 = version >= 5 ? (v4 as unknown as AppState) : migrateV4toV5(v4 as unknown as Record<string, unknown>);
  return migrateV5toV6(v5 as unknown as Record<string, unknown>);
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
 * no practice history is dropped. Returns a v3-shaped blob; the v3→v4 step layers
 * the spaced-review queue on top.
 */
export function migrateV2toV3(old: Record<string, unknown>): AppState {
  const o = old as Partial<AppState>;
  return {
    ...defaultState(),
    ...o,
    version: 3 as AppState["version"],
    xp: typeof o.xp === "number" ? o.xp : 0,
    level: typeof o.level === "number" ? o.level : 1,
    streak: o.streak ?? emptyStreak(),
    pendingLevelUps: o.pendingLevelUps ?? [],
  } as AppState;
}

/**
 * Real v3 → v4 migration. Injects the V3 motor-learning state (skillReview
 * spaced-retrieval queue) with safe defaults, preserving any values already
 * present. All prior fields (including the full practice history) pass through
 * untouched. Idempotent on a partial v4 blob. Stamps version 4 explicitly (NOT
 * the moving VERSION const) so a v3 blob lands at v4 and the v4→v5 step runs next.
 */
export function migrateV3toV4(old: Record<string, unknown>): AppState {
  const o = old as Partial<AppState>;
  return {
    ...defaultState(),
    ...o,
    version: 4 as AppState["version"],
    skillReview: o.skillReview ?? {},
  } as AppState;
}

/**
 * Real v4 → v5 migration. Injects the V4 soul-first learning state
 * (learningPath / theoryEnabled) with safe defaults, preserving any values
 * already present. All prior fields (full practice history, gamification, the
 * spaced-review queue) pass through untouched. Idempotent on a partial v5 blob.
 * Stamps version 5 explicitly (NOT the moving VERSION const) so a v4 blob lands
 * at v5 and the v5→v6 step runs next.
 *
 * Defaults are intentionally back-compatible: an existing user (who never picked
 * a path) gets `learningPath: undefined` → the tree keeps showing everything, and
 * `theoryEnabled: false` → theory nodes stay hidden until they opt in.
 */
export function migrateV4toV5(old: Record<string, unknown>): AppState {
  const o = old as Partial<AppState>;
  return {
    ...defaultState(),
    ...o,
    version: 5 as AppState["version"],
    learningPath: o.learningPath ?? undefined,
    theoryEnabled: o.theoryEnabled ?? false,
  } as AppState;
}

/**
 * Real v5 → v6 migration. Injects the ear-level FLOOR (earLevelFloor) with a safe
 * default, preserving any value already present. All prior fields (full practice
 * history, gamification, the spaced-review queue, soul-first paths) pass through
 * untouched. Idempotent on a partial v6 blob.
 *
 * The default is intentionally CONSERVATIVE: every pre-existing profile lands at
 * `earLevelFloor: 1`, which clamps its ear content back to what the skill tree has
 * actually taught (see earProgression.maxAllowedEarLevel). This is the whole point
 * of the migration — an existing user whose earLevel drifted up on accuracy alone
 * stops being quizzed on Roman-numeral cadences/progressions they were never
 * taught. New users get their self-reported floor written by onboarding instead.
 */
export function migrateV5toV6(old: Record<string, unknown>): AppState {
  const o = old as Partial<AppState>;
  return {
    ...defaultState(),
    ...o,
    version: VERSION,
    earLevelFloor: o.earLevelFloor ?? 1,
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
