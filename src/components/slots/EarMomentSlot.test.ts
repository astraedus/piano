import { describe, it, expect } from "vitest";
import { earAdvanceTarget } from "./EarMomentSlot";

describe("earAdvanceTarget", () => {
  it("goes to the rest beat with a Continue label on a non-final round", () => {
    // 3 rounds total, currently on round 0 and round 1.
    expect(earAdvanceTarget(0, 3)).toEqual({ next: "rest", label: "Continue" });
    expect(earAdvanceTarget(1, 3)).toEqual({ next: "rest", label: "Continue" });
  });

  it("goes to done with a Finish label on the final round", () => {
    expect(earAdvanceTarget(2, 3)).toEqual({ next: "done", label: "Finish" });
  });

  it("treats a single-round set as immediately final", () => {
    expect(earAdvanceTarget(0, 1)).toEqual({ next: "done", label: "Finish" });
  });
});
