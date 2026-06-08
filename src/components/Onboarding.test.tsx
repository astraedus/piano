import { describe, it, expect } from "vitest";
import { learningPathPatch, PATH_OPTIONS } from "./Onboarding";

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
