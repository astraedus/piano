import { describe, it, expect } from "vitest";
import { getLesson, hasLesson, lessonNodeIds } from "./lessons";
import { GUITAR_NODES } from "./guitar/skillNodes";
import { PIANO_NODES } from "./piano/skillNodes";

// V5 content coverage: every skill-tree node must have a real authored lesson, and
// every lesson must be substantial (not a stub). This is the gate that proves the
// "machine has fuel" — no node renders a bare one-liner.
describe("lesson coverage", () => {
  it("every guitar node has a lesson", () => {
    const missing = GUITAR_NODES.filter((n) => !hasLesson("guitar", n.id)).map((n) => n.id);
    expect(missing).toEqual([]);
  });

  it("every piano node has a lesson", () => {
    const missing = PIANO_NODES.filter((n) => !hasLesson("piano", n.id)).map((n) => n.id);
    expect(missing).toEqual([]);
  });

  it("no orphan lessons (every lesson maps to a real node)", () => {
    const guitarIds = new Set(GUITAR_NODES.map((n) => n.id));
    const pianoIds = new Set(PIANO_NODES.map((n) => n.id));
    expect(lessonNodeIds("guitar").filter((id) => !guitarIds.has(id))).toEqual([]);
    expect(lessonNodeIds("piano").filter((id) => !pianoIds.has(id))).toEqual([]);
  });

  it("every lesson is substantial (what/why/goodWhen filled, 3+ steps)", () => {
    for (const inst of ["guitar", "piano"] as const) {
      for (const id of lessonNodeIds(inst)) {
        const l = getLesson(inst, id)!;
        expect(l.what.length, `${inst}/${id} what`).toBeGreaterThan(40);
        expect(l.why.length, `${inst}/${id} why`).toBeGreaterThan(40);
        expect(l.goodWhen.length, `${inst}/${id} goodWhen`).toBeGreaterThan(20);
        expect(l.steps.length, `${inst}/${id} steps`).toBeGreaterThanOrEqual(3);
        for (const s of l.steps) expect(s.do.length, `${inst}/${id} step.do`).toBeGreaterThan(10);
      }
    }
  });

  it("no em-dashes leaked into content (voice + guard rule)", () => {
    for (const inst of ["guitar", "piano"] as const) {
      for (const id of lessonNodeIds(inst)) {
        const blob = JSON.stringify(getLesson(inst, id));
        expect(blob.includes("—") || blob.includes("–"), `${inst}/${id}`).toBe(false);
      }
    }
  });
});
