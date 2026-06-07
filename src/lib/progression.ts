// Gamification engine — XP, levels, and forgiving streaks. Pure, fully testable,
// zero side effects, zero React, zero Date.now() (callers pass the date in).
//
// This LAYERS ON TOP of the existing capability/territory/skill-tree progression
// (skill nodes, key depths, phases, arc). It does not replace or gate any of it;
// it reads a completed session's effects and turns them into points/levels/streak
// so the gamification UI (Phase B2) has a data-driven, instrument-agnostic spine.

import type { SessionLog, StreakState, TodayMode } from "./types";

export type { StreakState };

// ─────────────────────────────── XP model ───────────────────────────────
//
// XP is computed purely from a completed SessionLog plus a small context object
// describing what the session caused (nodes newly learned, key/area depth-ups,
// ear rounds answered correctly). Every award is a named constant so the rules
// are documented, testable, and tunable in one place.

export const XP_AWARDS = {
  /** Base award for completing a session, scaled by mode (the daily-loop shape). */
  sessionBase: {
    full: 50,
    long: 70,
    short: 30,
    "first-back": 20,
    "just-play": 15,
  } satisfies Record<TodayMode, number>,
  /** Per practice slot actually engaged (warmup / piece / chain / ear / free). */
  perSlotEngaged: 10,
  /** Per ear-training round answered correctly. */
  perEarCorrect: 5,
  /** Per key/area that gained depth this session (Heard→…→Home). */
  perDepthUp: 40,
  /** Per skill-tree node newly reaching `learned` this session. */
  perNodeLearned: 100,
} as const;

/** Context describing what a session caused — everything XP keys off, so the
 *  whole computation stays pure and unit-testable without a real app state. */
export interface XpContext {
  /** Count of skill-tree nodes that newly became `learned` this session. */
  nodesLearned?: number;
  /** Count of keys/areas that gained at least one depth level this session. */
  depthUps?: number;
  /** Count of ear-training rounds answered correctly this session. */
  earCorrect?: number;
}

/** Compute XP earned from one completed session + its effects. Pure. */
export function xpForSession(log: SessionLog, ctx: XpContext = {}): number {
  const base = XP_AWARDS.sessionBase[log.mode] ?? XP_AWARDS.sessionBase.full;

  const slotsEngaged = (log.slotsTouched ?? []).filter((s) => s.touched).length;
  const slotXp = slotsEngaged * XP_AWARDS.perSlotEngaged;

  const earXp = Math.max(0, ctx.earCorrect ?? 0) * XP_AWARDS.perEarCorrect;
  const depthXp = Math.max(0, ctx.depthUps ?? 0) * XP_AWARDS.perDepthUp;
  const nodeXp = Math.max(0, ctx.nodesLearned ?? 0) * XP_AWARDS.perNodeLearned;

  return base + slotXp + earXp + depthXp + nodeXp;
}

// ─────────────────────────────── Levels ───────────────────────────────
//
// A gentle, increasing curve. CUMULATIVE thresholds are the total XP required to
// HAVE REACHED each level. Level 1 starts at 0 XP (everyone is at least level 1).
// Beyond the explicit table, each further level costs a steadily larger amount so
// the curve keeps rising without a hard ceiling.

/** Cumulative total-XP thresholds to reach level (index+1). 0,100,250,... */
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 4900, 5900, 7000, 8200, 9500,
] as const;

// After the explicit table, each level costs this much more than the previous
// gap (a linear-growth step keeps the curve gentle but unbounded).
const POST_TABLE_BASE_GAP = 1400; // gap between the last two table entries
const POST_TABLE_GAP_GROWTH = 200;

// Musician-journey flavored titles per tier. Index = level-1, clamped to last.
const LEVEL_TITLES = [
  "First Note",      // 1
  "Tinkerer",        // 2
  "Practiced Hand",  // 3
  "Steady Player",   // 4
  "Phrase Maker",    // 5
  "Improviser",      // 6
  "Voice of Your Own", // 7
  "Stylist",         // 8
  "Performer",       // 9
  "Composer",        // 10
  "Virtuoso",        // 11+
] as const;

/** Cumulative XP required to reach level `n` (n >= 1). xpForLevel(1) === 0. */
export function xpForLevel(n: number): number {
  if (n <= 1) return 0;
  const idx = n - 1; // threshold index for level n
  if (idx < LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[idx];

  // Extend past the table: keep cumulating with a growing gap.
  let total = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  let gap = POST_TABLE_BASE_GAP;
  for (let level = LEVEL_THRESHOLDS.length + 1; level <= n; level++) {
    gap += POST_TABLE_GAP_GROWTH;
    total += gap;
  }
  return total;
}

export interface LevelInfo {
  level: number;            // current level (>= 1)
  title: string;            // musician-journey flavor for this level
  totalXp: number;          // echo of the input
  xpIntoLevel: number;      // xp accrued beyond the current level's threshold
  xpForNextLevel: number;   // xp span from this level to the next
  xpToNextLevel: number;    // remaining xp until next level
  progress: number;         // fraction 0..1 through the current level
}

/** Resolve total XP → current level + progress into the next. Pure. */
export function levelForXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));

  // Find the highest level whose threshold we've met.
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;

  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const xpForNextLevel = ceil - floor;
  const xpIntoLevel = xp - floor;
  const xpToNextLevel = Math.max(0, ceil - xp);
  const progress = xpForNextLevel > 0
    ? Math.min(1, xpIntoLevel / xpForNextLevel)
    : 1;

  return {
    level,
    title: titleForLevel(level),
    totalXp: xp,
    xpIntoLevel,
    xpForNextLevel,
    xpToNextLevel,
    progress,
  };
}

export function titleForLevel(level: number): string {
  if (level <= 0) return LEVEL_TITLES[0];
  const idx = Math.min(level - 1, LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[idx];
}

// ─────────────────────────────── Streak ───────────────────────────────
//
// FORGIVING per the app's anti-dropoff soul: a single missed day does NOT break
// the streak (auto-grace). Comparison is calendar-day based — the caller passes a
// "YYYY-MM-DD" local date string so the function stays pure and timezone-free.

/** Default empty streak (no practice yet). */
export function emptyStreak(): StreakState {
  return { current: 0, longest: 0, lastPracticeDate: undefined };
}

/**
 * Format a Date as a LOCAL "YYYY-MM-DD" calendar-day key. Use this at the call
 * site to derive the `todayDate` string passed into updateStreak — keeping the
 * pure streak logic free of any Date dependency.
 */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole-day difference between two "YYYY-MM-DD" keys (b - a). */
function dayDiff(a: string, b: string): number {
  // Parse as UTC midnight so DST never shifts the day count.
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const aMs = Date.UTC(ay, am - 1, ad);
  const bMs = Date.UTC(by, bm - 1, bd);
  return Math.round((bMs - aMs) / 86400000);
}

/**
 * Advance a streak for practice on `todayDate` ("YYYY-MM-DD"). Pure.
 *
 *   - first ever practice            → current 1
 *   - same calendar day              → no change (idempotent within a day)
 *   - next calendar day (+1)         → current + 1
 *   - one missed day (+2, gap of 1)  → GRACE: still current + 1 (no reset)
 *   - 2+ missed days (>= +3)         → reset to 1
 *
 * `longest` always tracks the maximum `current` ever seen. A future-dated or
 * out-of-order `todayDate` (diff <= 0 but not same day) is treated as same-day
 * (no change) to avoid corrupting the streak from a clock skew.
 */
export function updateStreak(prev: StreakState, todayDate: string): StreakState {
  const last = prev.lastPracticeDate;
  if (!last) {
    const current = 1;
    return { current, longest: Math.max(prev.longest, current), lastPracticeDate: todayDate };
  }

  const diff = dayDiff(last, todayDate);

  // Same day (or any non-advancing date) — idempotent, nothing changes.
  if (diff <= 0) return prev;

  // diff === 1 → consecutive day.
  // diff === 2 → exactly one missed day → auto-grace, still counts as continued.
  // diff >= 3  → two or more missed days → streak broken, restart at 1.
  const current = diff <= 2 ? prev.current + 1 : 1;

  return {
    current,
    longest: Math.max(prev.longest, current),
    lastPracticeDate: todayDate,
  };
}
