import { describe, it, expect } from "vitest";
import { computeTodayPlan } from "../todayPlan";
import { generateEarRoundForModule } from "../earRounds";
import { getModuleSync } from "../instrumentRegistry";
import { defaultState } from "../storage";
import type { AppState } from "../types";
import "./module"; // self-register drums

// The DoD's core claim: switching to Drums yields a WORKING nightly practice loop.
// This exercises the real spine (computeTodayPlan + the shared ear-round router)
// against a drums profile — the integration unit tests can't see.
function drumsState(): AppState {
  return { ...defaultState(), instrument: "drums", phase: 1 };
}

describe("drums nightly loop assembles (integration)", () => {
  it("computeTodayPlan returns a rudiment token, a pad warmup, and a Tier-0 drill", () => {
    const plan = computeTodayPlan(drumsState(), new Date());
    const module = getModuleSync("drums");
    // Ghost token is a phase-1 drums rotation token (Stage B: singles/doubles/
    // accents — C/G/D), labeled as a rudiment, never a raw tonal key.
    expect(module!.ghostRotation[1]).toContain(plan.ghostKey);
    const label = module!.focusLabel(plan.ghostKey);
    expect(["Single Stroke Roll", "Double Stroke Roll", "Accents & Taps"]).toContain(label);
    expect(label).not.toMatch(/major|minor/i);
    // A warmup + a chain drill are present (the loop is playable).
    expect(plan.warmup).toBeDefined();
    expect(plan.warmup?.instrument).toBe("drums");
    expect(plan.chainDrill).toBeTruthy();
    expect(plan.chainDrill?.instrument).toBe("drums");
    expect(plan.chainDrill?.id).toMatch(/^d-t0-/);
  });

  it("the shared ear-round router serves the drums generator (never the pitched fallback)", () => {
    const module = getModuleSync("drums");
    const round = generateEarRoundForModule(module, 1, "C");
    // A rhythm-dictation round with percussion audio — not scale-degree/cadence.
    expect(round.type).toBe("rhythm");
    expect(round.audio.kind).toBe("sticking");
    expect(round.level).toBe(1);
  });
});
