import { describe, it, expect } from "vitest";
import { generateDrumsEarRound, DRUMS_EAR_LEVEL_GATES } from "./earRounds";
import { DRUMS_NODES } from "./skillNodes";

describe("drums ear rounds (rhythm dictation)", () => {
  it("L1 is a subdivision round: sticking audio, 3 choices, correct id in the set", () => {
    for (let i = 0; i < 30; i++) {
      const r = generateDrumsEarRound(1, "C");
      expect(r.type).toBe("rhythm");
      expect(r.level).toBe(1);
      expect(r.audio.kind).toBe("sticking");
      expect((r.audio.sticking ?? []).length).toBeGreaterThan(0);
      expect(r.audio.bpm).toBeGreaterThan(0);
      expect(r.choices.length).toBe(3);
      expect(r.choices.map((c) => c.id)).toContain(r.correctId);
    }
  });

  it("L2 is a pattern round: two choices, one rest each, distinct, correct id in the set", () => {
    for (let i = 0; i < 30; i++) {
      const r = generateDrumsEarRound(2, "C");
      expect(r.level).toBe(2);
      expect(r.audio.kind).toBe("sticking");
      expect(r.choices.length).toBe(2);
      expect(r.choices.map((c) => c.id)).toContain(r.correctId);
      // Each choice is a count grid that marks its rest with "–".
      for (const c of r.choices) expect(c.label).toContain("–");
      // The two patterns differ.
      expect(r.choices[0].label).not.toBe(r.choices[1].label);
      // The played pattern carries exactly one rest.
      const rests = (r.audio.sticking ?? []).filter((s) => s.rest);
      expect(rests.length).toBe(1);
    }
  });

  it("every round's correctId always resolves to a real choice", () => {
    for (const level of [1, 2] as const) {
      for (let i = 0; i < 25; i++) {
        const r = generateDrumsEarRound(level, "C");
        expect(r.choices.some((c) => c.id === r.correctId)).toBe(true);
      }
    }
  });

  it("gates L2 on the click node (which exists), and L1 is ungated", () => {
    const ids = new Set(DRUMS_NODES.map((n) => n.id));
    // L1 is not in the gate map (always allowed).
    expect((DRUMS_EAR_LEVEL_GATES as Record<number, unknown>)[1]).toBeUndefined();
    const gate2 = DRUMS_EAR_LEVEL_GATES[2] ?? [];
    expect(gate2.length).toBeGreaterThan(0);
    for (const id of gate2) expect(ids.has(id)).toBe(true);
    expect(gate2).toContain("d-t0-click");
  });
});
