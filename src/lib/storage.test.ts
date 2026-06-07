import { describe, it, expect, beforeEach } from "vitest";
import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  loadState,
  saveState,
  migrateV1toV2,
  defaultState,
  importStateJson,
} from "./storage";
import type { AppState, ArcEvent } from "./types";

// A representative v1 blob (the shape that lives in a real user's localStorage
// before this refactor): version 1, no instrument, a piano-begins arc event.
function v1Blob(): Record<string, unknown> {
  return {
    version: 1,
    firstOpenedAt: "2024-01-01T00:00:00.000Z",
    name: "Anti",
    phase: 3,
    grade: "g4",
    earLevel: 4,
    pieces: [{ id: "p1", title: "Once Upon A Time", status: "yours", startedAt: "2019-11-01", minutes: 120 }],
    keyDepths: { C: 4, am: 3 },
    sessions: [{ id: "s1", startedAt: "2024-01-01", endedAt: "2024-01-01", minutes: 30, ghostKey: "C", phase: 3, mode: "full", slotsTouched: [] }],
    arc: [
      { id: "piano-begins-2019-11-01", at: "2019-11-01T00:00:00.000Z", kind: "piano-begins", label: "piano begins" },
      { id: "phase-2", at: "2020-01-01", kind: "phase-begins", label: "phase 2 begins" },
    ],
    unlocks: [],
    pendingUnlocks: [],
    theme: "light",
    recentDrillIds: ["d1", "d2"],
    skillReps: { "scale:C:hs": { count: 3 } },
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("migrateV1toV2 (pure)", () => {
  it("injects instrument:piano and an empty skillProgress", () => {
    const m = migrateV1toV2(v1Blob());
    expect(m.version).toBe(2);
    expect(m.instrument).toBe("piano");
    expect(m.skillProgress).toEqual({});
  });

  it("rewrites the renamed arc-event kind piano-begins → instrument-begins", () => {
    const m = migrateV1toV2(v1Blob());
    const begins = m.arc.find((e: ArcEvent) => e.id.startsWith("piano-begins"));
    expect(begins?.kind).toBe("instrument-begins");
    // unrelated arc events are untouched
    const phase = m.arc.find((e: ArcEvent) => e.kind === "phase-begins");
    expect(phase).toBeTruthy();
  });

  it("preserves all existing v1 data (no loss)", () => {
    const m = migrateV1toV2(v1Blob());
    expect(m.name).toBe("Anti");
    expect(m.phase).toBe(3);
    expect(m.grade).toBe("g4");
    expect(m.keyDepths).toEqual({ C: 4, am: 3 });
    expect(m.pieces).toHaveLength(1);
    expect(m.sessions).toHaveLength(1);
    expect(m.theme).toBe("light");
    expect(m.recentDrillIds).toEqual(["d1", "d2"]);
    expect(m.skillReps).toEqual({ "scale:C:hs": { count: 3 } });
  });

  it("respects an already-set instrument and skillProgress if present", () => {
    const blob = { ...v1Blob(), instrument: "guitar", skillProgress: { "g-t0-anatomy": { status: "learned", reps: 1 } } };
    const m = migrateV1toV2(blob);
    expect(m.instrument).toBe("guitar");
    expect(m.skillProgress?.["g-t0-anatomy"]?.status).toBe("learned");
  });
});

describe("loadState v1→v2 round-trip via localStorage", () => {
  it("reads a legacy piano.state blob, migrates it, and persists under practice.state", () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(v1Blob()));
    const loaded = loadState();
    expect(loaded.version).toBe(2);
    expect(loaded.instrument).toBe("piano");
    expect(loaded.name).toBe("Anti");

    // migrated blob is now written to the v2 key
    const newRaw = window.localStorage.getItem(STORAGE_KEY);
    expect(newRaw).toBeTruthy();
    expect(JSON.parse(newRaw!).version).toBe(2);
  });

  it("leaves the legacy piano.state key in place as a backup", () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(v1Blob()));
    loadState();
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    expect(legacy).toBeTruthy();
    expect(JSON.parse(legacy!).version).toBe(1); // untouched
  });

  it("prefers the v2 key when both exist", () => {
    const v2: AppState = { ...defaultState(), name: "v2-user", instrument: "guitar" };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v2));
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(v1Blob()));
    const loaded = loadState();
    expect(loaded.name).toBe("v2-user");
    expect(loaded.instrument).toBe("guitar");
  });

  it("returns defaultState when storage is empty", () => {
    const loaded = loadState();
    expect(loaded).toEqual(defaultState());
  });

  it("round-trips a saved v2 state losslessly", () => {
    const s: AppState = { ...defaultState(), name: "Round", phase: 4, instrument: "piano" };
    saveState(s);
    const loaded = loadState();
    expect(loaded.name).toBe("Round");
    expect(loaded.phase).toBe(4);
    expect(loaded.version).toBe(2);
  });
});

describe("importStateJson", () => {
  it("migrates an imported v1 blob to v2", () => {
    const ok = importStateJson(JSON.stringify(v1Blob()));
    expect(ok).toBe(true);
    const loaded = loadState();
    expect(loaded.version).toBe(2);
    expect(loaded.instrument).toBe("piano");
  });

  it("rejects invalid json", () => {
    expect(importStateJson("not json")).toBe(false);
  });
});
