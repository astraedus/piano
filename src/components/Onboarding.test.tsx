import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { learningPathPatch, PATH_OPTIONS, onboardingSeeds } from "./Onboarding";

// Capture the patch/push spies (hoisted so the vi.mock factories can reference them).
const mocks = vi.hoisted(() => ({ patch: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/hooks/useAppState", () => ({
  useAppState: () => ({ state: { arc: [], pieces: [], firstOpenedAt: undefined }, patch: mocks.patch }),
}));
import { Onboarding } from "./Onboarding";

afterEach(cleanup);

describe("learningPathPatch — the orthogonal theory rule", () => {
  it("Go Deep forces theory on, even when theory was off", () => {
    expect(learningPathPatch("go-deep", false)).toEqual({
      learningPath: "go-deep",
      theoryEnabled: true,
    });
  });

  it("Go Deep keeps theory on when it was already on", () => {
    expect(learningPathPatch("go-deep", true)).toEqual({
      learningPath: "go-deep",
      theoryEnabled: true,
    });
  });

  it("Just Play preserves theory-off", () => {
    expect(learningPathPatch("just-play", false)).toEqual({
      learningPath: "just-play",
      theoryEnabled: false,
    });
  });

  it("Play With Soul preserves theory-off", () => {
    expect(learningPathPatch("play-with-soul", false)).toEqual({
      learningPath: "play-with-soul",
      theoryEnabled: false,
    });
  });

  it("switching AWAY from Go Deep does NOT force theory off (user-controlled)", () => {
    // User was on Go Deep (theory on), now picks Just Play. Theory must stay on:
    // the user turned it on, only the user turns it off.
    expect(learningPathPatch("just-play", true)).toEqual({
      learningPath: "just-play",
      theoryEnabled: true,
    });
    expect(learningPathPatch("play-with-soul", true)).toEqual({
      learningPath: "play-with-soul",
      theoryEnabled: true,
    });
  });

  it("treats undefined currentTheoryEnabled as off for non-Go-Deep paths", () => {
    expect(learningPathPatch("just-play", undefined)).toEqual({
      learningPath: "just-play",
      theoryEnabled: false,
    });
  });
});

describe("PATH_OPTIONS", () => {
  it("offers exactly the three paths in soul-first order", () => {
    expect(PATH_OPTIONS.map((o) => o.tag)).toEqual([
      "just-play",
      "play-with-soul",
      "go-deep",
    ]);
  });

  it("adapts the Play With Soul copy per instrument", () => {
    const soul = PATH_OPTIONS.find((o) => o.tag === "play-with-soul")!;
    expect(soul.sub("guitar")).toContain("guitar");
    expect(soul.sub("piano")).toContain("piano");
  });
});

describe("onboardingSeeds — honest fresh start", () => {
  // Regression guard for the seeded-demo-data fix: a fresh install must NOT
  // fabricate pieces (the old "Once Upon A Time — yours" 2019 piece) or pre-chart
  // keys. Product soul: honest progress numbers, no faking.
  it("seeds no pieces and no charted keys", () => {
    const seeds = onboardingSeeds();
    expect(seeds.pieces).toEqual([]);
    expect(seeds.seedDepths).toEqual({});
  });
});

// Walk the whole onboarding flow (piano, given phase label, just-play, no goal,
// "Not yet") and return the object the finish step passed to patch().
function walkOnboarding(phaseLabel: string): Record<string, unknown> {
  cleanup(); // fresh DOM each walk (the loop test renders several in one `it`)
  mocks.patch.mockClear();
  render(<Onboarding />);
  fireEvent.click(document.querySelector('[data-instrument-choice="piano"]')!);
  fireEvent.click(screen.getByRole("button", { name: "Next" }));       // → phase step
  fireEvent.click(screen.getByText(phaseLabel));
  fireEvent.click(screen.getByRole("button", { name: "Next" }));       // → path step
  fireEvent.click(document.querySelector('[data-path-choice="just-play"]')!);
  fireEvent.click(screen.getByRole("button", { name: "Next" }));       // → goal step
  fireEvent.click(screen.getByRole("button", { name: "Next" }));       // → keyboard step
  fireEvent.click(screen.getByText("Not yet"));
  fireEvent.click(screen.getByRole("button", { name: "Open the App" }));
  return mocks.patch.mock.calls.at(-1)?.[0] as Record<string, unknown>;
}

describe("Onboarding finish — writes the ear-level floor", () => {
  it("a never-touched beginner is written with earLevel 1 AND earLevelFloor 1", () => {
    const patched = walkOnboarding("I've never touched one.");
    expect(patched.earLevel).toBe(1);
    expect(patched.earLevelFloor).toBe(1);
  });

  it("an advanced self-report is written with a matching floor (trusted, not gated)", () => {
    const patched = walkOnboarding("Higher than that. I mostly want to improvise and play by ear.");
    // This option claims ear level 5; the floor must match so an advanced learner
    // keeps access to the higher ear content even with an empty tree.
    expect(patched.earLevel).toBe(5);
    expect(patched.earLevelFloor).toBe(5);
  });

  it("the floor always equals the written ear level (never diverges)", () => {
    for (const label of [
      "I've never touched one.",
      "I know a few things. Some scales, some pieces.",
      "Around grade 2 or 3 (a couple of years in), trying to go further.",
      "Higher than that. I mostly want to improvise and play by ear.",
    ]) {
      const patched = walkOnboarding(label);
      expect(patched.earLevelFloor).toBe(patched.earLevel);
    }
  });
});
