import { describe, it, expect } from "vitest";
import { fmtTotalTime, formatNorthStarNudge } from "./format";

describe("fmtTotalTime", () => {
  it("shows an em-dash for zero or negative", () => {
    expect(fmtTotalTime(0)).toBe("—");
    expect(fmtTotalTime(-5)).toBe("—");
  });

  it("shows minutes under an hour", () => {
    expect(fmtTotalTime(1)).toBe("1 min");
    expect(fmtTotalTime(59)).toBe("59 min");
  });

  it("shows whole hours without a minute part", () => {
    expect(fmtTotalTime(60)).toBe("1h");
    expect(fmtTotalTime(120)).toBe("2h");
  });

  it("shows hours and minutes when there is a remainder", () => {
    expect(fmtTotalTime(90)).toBe("1h 30m");
    expect(fmtTotalTime(125)).toBe("2h 5m");
  });
});

describe("formatNorthStarNudge", () => {
  it("inserts a period separator when the goal has no ending punctuation", () => {
    expect(formatNorthStarNudge("To play Hallelujah")).toBe(
      "Your goal: To play Hallelujah. Keep going.",
    );
  });

  it("does not double punctuation when the goal already ends a sentence", () => {
    expect(formatNorthStarNudge("To pick up songs I hear.")).toBe(
      "Your goal: To pick up songs I hear. Keep going.",
    );
    expect(formatNorthStarNudge("Can I really do this?")).toBe(
      "Your goal: Can I really do this? Keep going.",
    );
    expect(formatNorthStarNudge("Finally!")).toBe("Your goal: Finally! Keep going.");
  });

  it("trims surrounding whitespace before formatting", () => {
    expect(formatNorthStarNudge("  feel at home  ")).toBe(
      "Your goal: feel at home. Keep going.",
    );
  });
});
