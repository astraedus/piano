import { describe, it, expect } from "vitest";
import { freePlayHref } from "./JustPlayButton";

describe("freePlayHref — the header escape-hatch toggle target", () => {
  it("routes into free play from the guided plan", () => {
    expect(freePlayHref(false)).toBe("/?mode=just-play");
  });

  it("routes back to tonight's plan when already in free play", () => {
    expect(freePlayHref(true)).toBe("/");
  });
});
