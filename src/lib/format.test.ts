import { describe, it, expect } from "vitest";
import { fmtTotalTime } from "./format";

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
