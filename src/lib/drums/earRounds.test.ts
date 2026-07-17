import { describe, it, expect } from "vitest";
import { generateDrumsEarRound, DRUMS_EAR_LEVEL_GATES } from "./earRounds";
import { DRUMS_NODES } from "./skillNodes";
import { drumsFocusFor } from "./focus";

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

  it("L2 is a 2-choice eighth-pattern round: one rest each, distinct, correct id in the set", () => {
    for (let i = 0; i < 30; i++) {
      const r = generateDrumsEarRound(2, "C");
      expect(r.level).toBe(2);
      expect(r.audio.kind).toBe("sticking");
      expect(r.choices.length).toBe(2);
      expect(r.choices.map((c) => c.id)).toContain(r.correctId);
      for (const c of r.choices) expect(c.label).toContain("–"); // count grid with rest
      expect(r.choices[0].label).not.toBe(r.choices[1].label);   // the two differ
      const rests = (r.audio.sticking ?? []).filter((s) => s.rest);
      expect(rests.length).toBe(1); // the played bar carries exactly one rest
      expect((r.audio.sticking ?? []).length).toBe(8); // eighth-note bar
    }
  });

  it("L3 is a 3-choice sixteenth-pattern round: denser grid, distinct choices, correct id in set", () => {
    for (let i = 0; i < 30; i++) {
      const r = generateDrumsEarRound(3, "C");
      expect(r.level).toBe(3);
      expect(r.audio.kind).toBe("sticking");
      expect(r.choices.length).toBe(3);
      expect(r.choices.map((c) => c.id)).toContain(r.correctId);
      for (const c of r.choices) expect(c.label).toContain("–");
      expect(new Set(r.choices.map((c) => c.label)).size).toBe(3); // all three distinct
      expect((r.audio.sticking ?? []).length).toBe(16); // sixteenth-note bar
      expect(r.audio.bpm).toBeGreaterThan(generateDrumsEarRound(2, "C").audio.bpm!); // denser pulse than L2
    }
  });

  it("L4 is an accent-location round: 4 beat choices, exactly one accented cell, correct beat named", () => {
    for (let i = 0; i < 30; i++) {
      const r = generateDrumsEarRound(4, "C");
      expect(r.level).toBe(4);
      expect(r.audio.kind).toBe("sticking");
      expect(r.choices.map((c) => c.id)).toEqual(["1", "2", "3", "4"]);
      expect(r.choices.map((c) => c.id)).toContain(r.correctId);
      const accents = (r.audio.sticking ?? []).filter((s) => s.accent);
      expect(accents.length).toBe(1); // exactly one loud note
      // The accented cell sits on the correct beat (even eighth-cell index).
      const cells = r.audio.sticking ?? [];
      const accentIdx = cells.findIndex((s) => s.accent);
      expect(accentIdx).toBe((Number(r.correctId) - 1) * 2);
    }
  });

  it("L5 is a which-rudiment round: 3 named rudiments, the heard one is the correct id", () => {
    for (let i = 0; i < 30; i++) {
      const r = generateDrumsEarRound(5, "C");
      expect(r.level).toBe(5);
      expect(r.audio.kind).toBe("sticking");
      expect(r.choices.length).toBe(3);
      expect(r.choices.map((c) => c.id)).toEqual(["C", "G", "A"]); // singles/doubles/paradiddle
      // Labels are the real focus rudiment names (never a raw key), and the heard
      // sticking is that rudiment's own pattern.
      for (const c of r.choices) expect(c.label).toBe(drumsFocusFor(c.id).label);
      expect(r.choices.map((c) => c.id)).toContain(r.correctId);
      expect(r.audio.sticking).toEqual(drumsFocusFor(r.correctId).pattern);
    }
  });

  it("every round's correctId always resolves to a real choice (L1–L5)", () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      for (let i = 0; i < 25; i++) {
        const r = generateDrumsEarRound(level, "C");
        expect(r.choices.some((c) => c.id === r.correctId)).toBe(true);
      }
    }
  });

  it("gates L2–L5 on real Tier-1/2 nodes; L1 is ungated", () => {
    const ids = new Set(DRUMS_NODES.map((n) => n.id));
    // L1 is not in the gate map (always allowed).
    expect((DRUMS_EAR_LEVEL_GATES as Record<number, unknown>)[1]).toBeUndefined();
    // Every gated level references only nodes that exist (dead-link guard).
    for (const level of [2, 3, 4, 5] as const) {
      const gate = DRUMS_EAR_LEVEL_GATES[level] ?? [];
      expect(gate.length, `L${level} is gated`).toBeGreaterThan(0);
      for (const id of gate) expect(ids.has(id), `L${level} gate node ${id} exists`).toBe(true);
    }
    // The design-doc ear-gate table (Stage B re-points L2 off d-t0-click).
    expect(DRUMS_EAR_LEVEL_GATES[2]).toContain("d-t1-counting");
    expect(DRUMS_EAR_LEVEL_GATES[3]).toContain("d-t2-16ths");
    expect(DRUMS_EAR_LEVEL_GATES[4]).toContain("d-t1-accents");
    expect(DRUMS_EAR_LEVEL_GATES[5]).toContain("d-t2-paradiddle");
  });
});
