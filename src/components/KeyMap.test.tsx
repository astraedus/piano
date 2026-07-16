import { describe, it, expect, vi } from "vitest";

// KeyMap pulls in the audio module at import; stub it so this pure-logic test never
// touches Web Audio.
vi.mock("@/lib/audio", () => ({
  ensureAudio: vi.fn(),
  playChord: vi.fn(),
  playSequence: vi.fn(),
  playProgression: vi.fn(),
}));

import { keyMapSummaryLine } from "./KeyMap";

describe("keyMapSummaryLine — circle-of-fifths territory line", () => {
  it("shows the orientation hint before anything is charted", () => {
    expect(keyMapSummaryLine(0, 24)).toContain("Clockwise goes up a fifth");
  });

  it("shows an honest, growing count while filling in (singular/plural)", () => {
    expect(keyMapSummaryLine(1, 24)).toBe("1 key charted so far. It only grows.");
    expect(keyMapSummaryLine(5, 24)).toBe("5 keys charted so far. It only grows.");
  });

  it("celebrates once every key is charted (mirrors GuitarMap's covered state)", () => {
    expect(keyMapSummaryLine(24, 24)).toBe(
      "All 24 keys charted — the whole circle is yours. Reviews keep it alive.",
    );
  });
});
