import { describe, it, expect } from "vitest";
import {
  XP_AWARDS,
  xpForSession,
  xpForLevel,
  levelForXp,
  titleForLevel,
  emptyStreak,
  localDateKey,
  updateStreak,
} from "./progression";
import type { SessionLog, SessionSlotLog } from "./types";

function log(partial: Partial<SessionLog> = {}): SessionLog {
  const slots: SessionSlotLog[] = partial.slotsTouched ?? [];
  return {
    id: "s1",
    startedAt: "2026-06-07T10:00:00.000Z",
    endedAt: "2026-06-07T10:30:00.000Z",
    minutes: 30,
    ghostKey: "C",
    phase: 1,
    mode: "full",
    ...partial,
    slotsTouched: slots,
  };
}

// ───────────────────────────── XP model ─────────────────────────────
describe("xpForSession", () => {
  it("awards the mode-scaled base for a bare session", () => {
    expect(xpForSession(log({ mode: "full" }))).toBe(XP_AWARDS.sessionBase.full);
    expect(xpForSession(log({ mode: "long" }))).toBe(XP_AWARDS.sessionBase.long);
    expect(xpForSession(log({ mode: "short" }))).toBe(XP_AWARDS.sessionBase.short);
    expect(xpForSession(log({ mode: "first-back" }))).toBe(XP_AWARDS.sessionBase["first-back"]);
    expect(xpForSession(log({ mode: "just-play" }))).toBe(XP_AWARDS.sessionBase["just-play"]);
  });

  it("adds +10 per engaged slot (only touched slots count)", () => {
    const slots: SessionSlotLog[] = [
      { slot: "warmup", touched: true },
      { slot: "chain", touched: true },
      { slot: "ear", touched: false }, // not engaged
    ];
    // full (50) + 2 engaged * 10 = 70
    expect(xpForSession(log({ mode: "full", slotsTouched: slots }))).toBe(70);
  });

  it("adds +5 per ear-correct, +40 per depth-up, +100 per node learned", () => {
    const xp = xpForSession(log({ mode: "full" }), {
      earCorrect: 3,   // +15
      depthUps: 2,     // +80
      nodesLearned: 1, // +100
    });
    expect(xp).toBe(50 + 15 + 80 + 100);
  });

  it("clamps negative context counts to zero", () => {
    const xp = xpForSession(log({ mode: "full" }), {
      earCorrect: -5,
      depthUps: -2,
      nodesLearned: -1,
    });
    expect(xp).toBe(50);
  });

  it("is data-driven and deterministic (same input → same output)", () => {
    const a = xpForSession(log({ mode: "short", slotsTouched: [{ slot: "ear", touched: true }] }), { earCorrect: 2 });
    const b = xpForSession(log({ mode: "short", slotsTouched: [{ slot: "ear", touched: true }] }), { earCorrect: 2 });
    expect(a).toBe(b);
    expect(a).toBe(30 + 10 + 10); // short base + 1 slot + 2 ear correct
  });
});

// ───────────────────────────── Levels ─────────────────────────────
describe("xpForLevel / levelForXp", () => {
  it("level 1 starts at 0 XP", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(levelForXp(0).level).toBe(1);
    expect(levelForXp(99).level).toBe(1);
  });

  it("uses the documented cumulative thresholds 0,100,250,450,700,1000,1400", () => {
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(250);
    expect(xpForLevel(4)).toBe(450);
    expect(xpForLevel(5)).toBe(700);
    expect(xpForLevel(6)).toBe(1000);
    expect(xpForLevel(7)).toBe(1400);
  });

  it("levelForXp lands on the right level at and just below each threshold", () => {
    expect(levelForXp(100).level).toBe(2);
    expect(levelForXp(249).level).toBe(2);
    expect(levelForXp(250).level).toBe(3);
    expect(levelForXp(700).level).toBe(5);
    expect(levelForXp(1399).level).toBe(6);
    expect(levelForXp(1400).level).toBe(7);
  });

  it("reports progress fraction and remaining xp into the next level", () => {
    // 175 XP → level 2 (floor 100, ceil 250, span 150, into 75 → 0.5)
    const info = levelForXp(175);
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(75);
    expect(info.xpForNextLevel).toBe(150);
    expect(info.xpToNextLevel).toBe(75);
    expect(info.progress).toBeCloseTo(0.5, 5);
  });

  it("curve is strictly increasing and gentle past the explicit table", () => {
    let prev = -1;
    for (let n = 1; n <= 30; n++) {
      const v = xpForLevel(n);
      expect(v).toBeGreaterThan(prev);
      prev = v;
    }
    // gaps keep growing (gentle increasing curve) past the table
    const g1 = xpForLevel(20) - xpForLevel(19);
    const g2 = xpForLevel(21) - xpForLevel(20);
    expect(g2).toBeGreaterThan(g1);
  });

  it("assigns musician-journey titles, clamped at the top tier", () => {
    expect(titleForLevel(1)).toBe("First Note");
    expect(titleForLevel(6)).toBe("Improviser");
    expect(titleForLevel(11)).toBe("Virtuoso");
    expect(titleForLevel(50)).toBe("Virtuoso"); // clamps
    expect(levelForXp(0).title).toBe("First Note");
  });

  it("floors fractional / clamps negative totalXp", () => {
    expect(levelForXp(150.9).xpIntoLevel).toBe(50);
    expect(levelForXp(-100).level).toBe(1);
  });
});

// ───────────────────────────── Streak ─────────────────────────────
describe("localDateKey", () => {
  it("formats a local YYYY-MM-DD", () => {
    // construct a local date explicitly to avoid tz flakiness
    const d = new Date(2026, 5, 7, 13, 0, 0); // 2026-06-07 local
    expect(localDateKey(d)).toBe("2026-06-07");
  });
});

describe("updateStreak — forgiving (one missed day = grace)", () => {
  it("first ever practice sets current to 1 and tracks longest", () => {
    const s = updateStreak(emptyStreak(), "2026-06-07");
    expect(s.current).toBe(1);
    expect(s.longest).toBe(1);
    expect(s.lastPracticeDate).toBe("2026-06-07");
  });

  it("same calendar day → no change (idempotent)", () => {
    const day1 = updateStreak(emptyStreak(), "2026-06-07");
    const same = updateStreak(day1, "2026-06-07");
    expect(same).toEqual(day1);
    expect(same.current).toBe(1);
  });

  it("consecutive day (+1) increments the streak", () => {
    let s = updateStreak(emptyStreak(), "2026-06-07");
    s = updateStreak(s, "2026-06-08");
    expect(s.current).toBe(2);
    expect(s.longest).toBe(2);
  });

  it("one missed day (gap of 1 → +2) is auto-graced, streak continues", () => {
    let s = updateStreak(emptyStreak(), "2026-06-07"); // current 1
    s = updateStreak(s, "2026-06-08");                  // current 2
    // skip 06-09, practice 06-10 (gap of 1 missed day)
    s = updateStreak(s, "2026-06-10");
    expect(s.current).toBe(3); // graced, NOT reset
    expect(s.longest).toBe(3);
  });

  it("two or more missed days (gap >= 2 → +3) resets current to 1", () => {
    let s = updateStreak(emptyStreak(), "2026-06-07"); // current 1
    s = updateStreak(s, "2026-06-08");                  // current 2
    // skip 06-09 and 06-10, practice 06-11 (gap of 2 missed days)
    s = updateStreak(s, "2026-06-11");
    expect(s.current).toBe(1); // reset
    expect(s.lastPracticeDate).toBe("2026-06-11");
  });

  it("longest is preserved across a reset", () => {
    let s = updateStreak(emptyStreak(), "2026-06-07");
    s = updateStreak(s, "2026-06-08");
    s = updateStreak(s, "2026-06-09"); // current 3, longest 3
    s = updateStreak(s, "2026-06-20"); // big gap → reset to 1
    expect(s.current).toBe(1);
    expect(s.longest).toBe(3);
  });

  it("month boundary: +1 day across months still increments", () => {
    let s = updateStreak(emptyStreak(), "2026-06-30");
    s = updateStreak(s, "2026-07-01");
    expect(s.current).toBe(2);
  });

  it("grace across month boundary (one missed day) still continues", () => {
    let s = updateStreak(emptyStreak(), "2026-06-30"); // current 1
    // skip 07-01, practice 07-02 (one missed day)
    s = updateStreak(s, "2026-07-02");
    expect(s.current).toBe(2);
  });

  it("out-of-order / clock-skew date (earlier than last) is treated as same-day no-op", () => {
    let s = updateStreak(emptyStreak(), "2026-06-10");
    s = updateStreak(s, "2026-06-05"); // earlier → no change
    expect(s.current).toBe(1);
    expect(s.lastPracticeDate).toBe("2026-06-10");
  });
});
