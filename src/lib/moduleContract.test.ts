import { describe, it, expect } from "vitest";
import { allRegisteredModules } from "./instrumentRegistry";
// Import every module so the sync cache is warm (each self-registers on import).
import "./piano/module";
import "./guitar/module";
import "./drums/module";

// Registry-wide class guards (design decision 4). These hold for EVERY registered
// instrument module, so a future instrument that violates the contract fails here
// automatically — no per-instrument copy of the assertion.
describe("instrument module contract (registry-wide)", () => {
  const modules = allRegisteredModules();

  it("has at least the three shipped modules registered", () => {
    const ids = modules.map((m) => m.id).sort();
    expect(ids).toEqual(["drums", "guitar", "piano"]);
  });

  it("every module supplies focusLabel + a valid progressMapKind", () => {
    for (const m of modules) {
      expect(m.focusLabel, `${m.id}.focusLabel`).toBeTypeOf("function");
      expect(["keymap", "fretboard", "rudiments"]).toContain(m.progressMapKind);
    }
  });

  // The bug class this guards: a non-tonal module falling back to the SHARED
  // (pitched piano) ear generator, which quizzes a pad learner on scale degrees.
  it("every NON-TONAL module (focusKind 'rudiment') ships its own earRounds + earLevelGates", () => {
    const nonTonal = modules.filter((m) => m.focusKind === "rudiment");
    expect(nonTonal.length).toBeGreaterThan(0); // drums is the first
    for (const m of nonTonal) {
      expect(m.earRounds, `${m.id}.earRounds must be defined (never fall back to the pitched generator)`).toBeDefined();
      const gates = m.earLevelGates ?? {};
      expect(Object.values(gates).flat().length, `${m.id}.earLevelGates must gate at least one level`).toBeGreaterThan(0);
    }
  });

  it("focusKind is one of the three known kinds for every module", () => {
    for (const m of modules) {
      expect(["key", "chord", "rudiment"]).toContain(m.focusKind);
    }
  });
});
