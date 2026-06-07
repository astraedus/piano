import { describe, it, expect } from "vitest";
import { weekIdOf, ghostKeyFor } from "./ghostKey";
import { defaultState } from "./storage";
import type { AppState, KeyId } from "./types";
import "./piano/module"; // self-registers piano so ghostRotation resolves

function stateWith(partial: Partial<AppState> = {}): AppState {
  return { ...defaultState(), ...partial };
}

// Reproduces the exact week-id calc the Settings page now uses (weekIdOf), and
// the broken one it used before (Math.ceil(date/7) week-of-month) — to lock B5.
function legacyBrokenWeekId(now: Date): string {
  return `${now.getUTCFullYear()}-W${Math.ceil(now.getUTCDate() / 7)}`;
}

describe("weekIdOf — ISO week ids", () => {
  it("produces stable, zero-padded ISO week ids", () => {
    // 2026-06-07 is a Sunday in ISO week 23.
    expect(weekIdOf(new Date("2026-06-07T12:00:00Z"))).toBe("2026-W23");
    // 2026-01-01 (Thursday) is ISO week 01.
    expect(weekIdOf(new Date("2026-01-01T00:00:00Z"))).toBe("2026-W01");
  });

  it("is constant across every day of the same ISO week", () => {
    // Mon 2026-06-01 .. Sun 2026-06-07 are all ISO week 23.
    const ids = [1, 2, 3, 4, 5, 6, 7].map((d) =>
      weekIdOf(new Date(`2026-06-0${d}T00:00:00Z`)),
    );
    expect(new Set(ids).size).toBe(1);
    expect(ids[0]).toBe("2026-W23");
  });
});

describe("B5 — Settings ghost override weekId matches ghostKeyFor", () => {
  it("override set with weekIdOf is honored by ghostKeyFor in the same week", () => {
    const now = new Date("2026-06-07T12:00:00Z");
    const override = { key: "Eb" as KeyId, weekId: weekIdOf(now) };
    const state = stateWith({ ghostOverride: override });
    expect(ghostKeyFor(state, now)).toBe("Eb");
  });

  it("the OLD broken week-of-month id would NOT have matched (regression guard)", () => {
    const now = new Date("2026-06-07T12:00:00Z");
    // The pre-fix Settings page wrote this id; ghostKeyFor compares against weekIdOf.
    expect(legacyBrokenWeekId(now)).not.toBe(weekIdOf(now));
    const brokenState = stateWith({
      ghostOverride: { key: "Eb" as KeyId, weekId: legacyBrokenWeekId(now) },
    });
    // Broken override is ignored → falls through to the rotation, not "Eb".
    expect(ghostKeyFor(brokenState, now)).not.toBe("Eb");
  });

  it("an override from a different week is ignored (falls through to rotation)", () => {
    const thisWeek = new Date("2026-06-07T12:00:00Z");
    const lastWeek = new Date("2026-05-31T12:00:00Z");
    const state = stateWith({
      ghostOverride: { key: "Eb" as KeyId, weekId: weekIdOf(lastWeek) },
    });
    const fallenThrough = ghostKeyFor(state, thisWeek);
    // The stale override must not win.
    expect(fallenThrough).not.toBe("Eb");
  });
});
