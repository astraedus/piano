import { describe, it, expect, beforeEach } from "vitest";
import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  loadState,
  saveState,
  migrateV1toV2,
  migrateV2toV3,
  migrateV3toV4,
  migrateV4toV5,
  migrateV5toV6,
  migrateToCurrent,
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

// A representative v2 blob: instrument present, skillProgress present, real
// practice history, but NO gamification fields yet.
function v2Blob(): Record<string, unknown> {
  return {
    version: 2,
    instrument: "guitar",
    firstOpenedAt: "2025-01-01T00:00:00.000Z",
    name: "Anti",
    phase: 4,
    grade: "g5",
    earLevel: 5,
    pieces: [{ id: "p1", title: "Smoke", status: "yours", startedAt: "2025-01-01", minutes: 300 }],
    keyDepths: { C: 5, am: 4 },
    sessions: [{ id: "s1", startedAt: "2025-01-01", endedAt: "2025-01-01", minutes: 30, ghostKey: "C", phase: 4, mode: "full", slotsTouched: [] }],
    arc: [{ id: "a1", at: "2025-01-01", kind: "instrument-begins", label: "guitar begins" }],
    unlocks: [{ id: "u1", phase: 1, title: "t", tryLine: "y", addedAt: "2025-01-01" }],
    pendingUnlocks: [],
    recentDrillIds: ["d1"],
    skillProgress: { "g-t0-anatomy": { status: "learned", reps: 2 } },
  };
}

describe("migrateV2toV3 (pure)", () => {
  it("injects gamification defaults (xp/level/streak/pendingLevelUps)", () => {
    const m = migrateV2toV3(v2Blob());
    expect(m.version).toBe(3);
    expect(m.xp).toBe(0);
    expect(m.level).toBe(1);
    expect(m.streak).toEqual({ current: 0, longest: 0, lastPracticeDate: undefined });
    expect(m.pendingLevelUps).toEqual([]);
  });

  it("preserves ALL existing v2 practice data (no loss)", () => {
    const m = migrateV2toV3(v2Blob());
    expect(m.instrument).toBe("guitar");
    expect(m.name).toBe("Anti");
    expect(m.phase).toBe(4);
    expect(m.grade).toBe("g5");
    expect(m.keyDepths).toEqual({ C: 5, am: 4 });
    expect(m.pieces).toHaveLength(1);
    expect(m.sessions).toHaveLength(1);
    expect(m.unlocks).toHaveLength(1);
    expect(m.recentDrillIds).toEqual(["d1"]);
    expect(m.skillProgress?.["g-t0-anatomy"]?.status).toBe("learned");
  });

  it("respects already-present gamification values (idempotent)", () => {
    const blob = { ...v2Blob(), version: 3, xp: 555, level: 4, streak: { current: 7, longest: 9, lastPracticeDate: "2026-06-01" }, pendingLevelUps: [4] };
    const m = migrateV2toV3(blob);
    expect(m.xp).toBe(555);
    expect(m.level).toBe(4);
    expect(m.streak).toEqual({ current: 7, longest: 9, lastPracticeDate: "2026-06-01" });
    expect(m.pendingLevelUps).toEqual([4]);
  });
});

describe("migrateV3toV4 (pure)", () => {
  it("injects the spaced-review queue default (skillReview: {})", () => {
    const v3 = { ...migrateV2toV3(v2Blob()), version: 3 } as unknown as Record<string, unknown>;
    const m = migrateV3toV4(v3);
    expect(m.version).toBe(4);
    expect(m.skillReview).toEqual({});
  });

  it("preserves an existing skillReview queue (idempotent)", () => {
    const v3 = {
      ...migrateV2toV3(v2Blob()),
      version: 3,
      skillReview: { "g-t0-anatomy": { dueAt: "2026-06-10T00:00:00.000Z", intervalIndex: 1 } },
    } as unknown as Record<string, unknown>;
    const m = migrateV3toV4(v3);
    expect(m.skillReview?.["g-t0-anatomy"]).toEqual({ dueAt: "2026-06-10T00:00:00.000Z", intervalIndex: 1 });
  });

  it("preserves the gamification + practice data carried up from v3", () => {
    const v3 = { ...migrateV2toV3(v2Blob()), version: 3 } as unknown as Record<string, unknown>;
    const m = migrateV3toV4(v3);
    expect(m.instrument).toBe("guitar");
    expect(m.skillProgress?.["g-t0-anatomy"]?.status).toBe("learned");
    expect(m.xp).toBe(0);
  });
});

describe("migrateV4toV5 (pure)", () => {
  // A representative v4 blob: full practice history + gamification + review queue,
  // but NO soul-first learning fields yet.
  function v4Blob(): Record<string, unknown> {
    return { ...migrateV3toV4({ ...migrateV2toV3(v2Blob()), version: 3 } as unknown as Record<string, unknown>) };
  }

  it("injects soul-first defaults (learningPath undefined, theoryEnabled false)", () => {
    const m = migrateV4toV5(v4Blob());
    expect(m.version).toBe(5);
    expect(m.learningPath).toBeUndefined();
    expect(m.theoryEnabled).toBe(false);
  });

  it("preserves an existing learningPath + theoryEnabled (idempotent)", () => {
    const blob = { ...v4Blob(), version: 5, learningPath: "go-deep", theoryEnabled: true };
    const m = migrateV4toV5(blob);
    expect(m.learningPath).toBe("go-deep");
    expect(m.theoryEnabled).toBe(true);
  });

  it("preserves the practice + gamification + review data carried up from v4", () => {
    const m = migrateV4toV5(v4Blob());
    expect(m.instrument).toBe("guitar");
    expect(m.skillProgress?.["g-t0-anatomy"]?.status).toBe("learned");
    expect(m.xp).toBe(0);
    expect(m.skillReview).toEqual({});
  });
});

describe("migrateV5toV6 (pure)", () => {
  // A representative v5 blob: full practice history + gamification + review queue +
  // soul-first paths, but NO ear-level floor yet (an existing user's real shape).
  function v5Blob(): Record<string, unknown> {
    const v3 = { ...migrateV2toV3(v2Blob()), version: 3 } as unknown as Record<string, unknown>;
    const v4 = { ...migrateV3toV4(v3), version: 4 } as unknown as Record<string, unknown>;
    return { ...migrateV4toV5(v4) };
  }

  it("injects earLevelFloor default 1 (clamps existing users to tree-taught content)", () => {
    const m = migrateV5toV6(v5Blob());
    expect(m.version).toBe(6);
    expect(m.earLevelFloor).toBe(1);
    // The clamp intent: the stored earLevel is preserved (v2Blob had 5) but the
    // FLOOR is 1, so effective ear content falls back to what the tree taught.
    expect(m.earLevel).toBe(5);
  });

  it("preserves an existing earLevelFloor (idempotent)", () => {
    const blob = { ...v5Blob(), version: 6, earLevelFloor: 4 };
    const m = migrateV5toV6(blob);
    expect(m.earLevelFloor).toBe(4);
  });

  it("preserves the practice + soul-first data carried up from v5", () => {
    const m = migrateV5toV6(v5Blob());
    expect(m.instrument).toBe("guitar");
    expect(m.skillProgress?.["g-t0-anatomy"]?.status).toBe("learned");
    expect(m.theoryEnabled).toBe(false);
    expect(m.skillReview).toEqual({});
  });
});

describe("migrateToCurrent ladder", () => {
  it("runs a v1 blob all the way to v6 (instrument + gamification + review queue + paths + ear floor)", () => {
    const m = migrateToCurrent(v1Blob());
    expect(m.version).toBe(6);
    expect(m.instrument).toBe("piano");
    expect(m.xp).toBe(0);
    expect(m.skillReview).toEqual({});
    expect(m.learningPath).toBeUndefined();
    expect(m.theoryEnabled).toBe(false);
    expect(m.earLevelFloor).toBe(1); // existing user clamped to tree-taught content
    // v1→v2 arc rewrite still happened en route
    expect(m.arc.find((e) => e.id.startsWith("piano-begins"))?.kind).toBe("instrument-begins");
  });

  it("runs a v2 blob to v6 without re-running the v1→v2 instrument injection", () => {
    const m = migrateToCurrent(v2Blob());
    expect(m.version).toBe(6);
    expect(m.instrument).toBe("guitar"); // preserved, not forced to piano
    expect(m.xp).toBe(0);
    expect(m.skillReview).toEqual({});
    expect(m.theoryEnabled).toBe(false);
    expect(m.earLevelFloor).toBe(1);
  });

  it("runs a v3 blob to v6, layering review queue + paths + ear floor (gamification untouched)", () => {
    const v3 = { ...migrateV2toV3(v2Blob()), version: 3, xp: 420, level: 4 } as unknown as Record<string, unknown>;
    const m = migrateToCurrent(v3);
    expect(m.version).toBe(6);
    expect(m.xp).toBe(420); // preserved, not reset to 0
    expect(m.level).toBe(4);
    expect(m.skillReview).toEqual({});
    expect(m.learningPath).toBeUndefined();
    expect(m.earLevelFloor).toBe(1);
  });

  it("runs a v4 blob to v6, layering the soul-first defaults + ear floor", () => {
    const v4 = { ...migrateV3toV4({ ...migrateV2toV3(v2Blob()), version: 3 } as unknown as Record<string, unknown>), xp: 99 } as unknown as Record<string, unknown>;
    const m = migrateToCurrent(v4);
    expect(m.version).toBe(6);
    expect(m.xp).toBe(99); // preserved
    expect(m.theoryEnabled).toBe(false);
    expect(m.learningPath).toBeUndefined();
    expect(m.earLevelFloor).toBe(1);
  });

  it("runs a v5 blob to v6, layering only the ear floor (paths untouched)", () => {
    const v5 = {
      ...migrateV4toV5({ ...migrateV3toV4({ ...migrateV2toV3(v2Blob()), version: 3 } as unknown as Record<string, unknown>), version: 4 } as unknown as Record<string, unknown>),
      learningPath: "go-deep",
      theoryEnabled: true,
    } as unknown as Record<string, unknown>;
    const m = migrateToCurrent(v5);
    expect(m.version).toBe(6);
    expect(m.learningPath).toBe("go-deep"); // preserved
    expect(m.theoryEnabled).toBe(true);
    expect(m.earLevelFloor).toBe(1);
  });
});

describe("loadState v1→v6 round-trip via localStorage", () => {
  it("reads a legacy piano.state blob, migrates it to current, and persists under practice.state", () => {
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(v1Blob()));
    const loaded = loadState();
    expect(loaded.version).toBe(6);
    expect(loaded.instrument).toBe("piano");
    expect(loaded.name).toBe("Anti");
    // gamification defaults injected by the v2→v3 step
    expect(loaded.xp).toBe(0);
    expect(loaded.level).toBe(1);
    expect(loaded.streak).toEqual({ current: 0, longest: 0, lastPracticeDate: undefined });
    // spaced-review queue injected by the v3→v4 step
    expect(loaded.skillReview).toEqual({});
    // soul-first defaults injected by the v4→v5 step
    expect(loaded.learningPath).toBeUndefined();
    expect(loaded.theoryEnabled).toBe(false);
    // ear floor injected by the v5→v6 step (existing user clamped to tree-taught)
    expect(loaded.earLevelFloor).toBe(1);

    // migrated blob is now written to the current key at current version
    const newRaw = window.localStorage.getItem(STORAGE_KEY);
    expect(newRaw).toBeTruthy();
    expect(JSON.parse(newRaw!).version).toBe(6);
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

  it("round-trips a saved current state losslessly", () => {
    const s: AppState = { ...defaultState(), name: "Round", phase: 4, instrument: "piano" };
    saveState(s);
    const loaded = loadState();
    expect(loaded.name).toBe("Round");
    expect(loaded.phase).toBe(4);
    expect(loaded.version).toBe(6);
  });
});

describe("importStateJson", () => {
  it("migrates an imported v1 blob to the current version", () => {
    const ok = importStateJson(JSON.stringify(v1Blob()));
    expect(ok).toBe(true);
    const loaded = loadState();
    expect(loaded.version).toBe(6);
    expect(loaded.instrument).toBe("piano");
    expect(loaded.xp).toBe(0);
    expect(loaded.earLevelFloor).toBe(1);
  });

  it("rejects invalid json", () => {
    expect(importStateJson("not json")).toBe(false);
  });
});
