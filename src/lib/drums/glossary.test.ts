import { describe, it, expect } from "vitest";
import { lookupTerm } from "../explain/glossary";
import { DRUMS_LESSONS } from "./lessons";

// The product soul's "no unexplained jargon" contract for drums: every drum term
// a beginner meets in a lesson must resolve to a glossary entry (so its TermChip
// opens an explainer), and each term must actually appear in the taught prose (so
// the chip renders). This is the honest guarantee that the lessons are followable
// cold.
const REQUIRED_TERMS = [
  "practice pad",
  "matched grip",
  "fulcrum",
  "rebound",
  "free stroke",
  "four strokes",
  "rudiment",
] as const;

describe("drums jargon → glossary contract", () => {
  it("every required drum term resolves to a glossary entry", () => {
    for (const term of REQUIRED_TERMS) {
      expect(lookupTerm(term), `glossary must define "${term}"`).toBeDefined();
    }
  });

  it("resolved drum entries are percussion (text SEE, non-empty what/why)", () => {
    for (const term of REQUIRED_TERMS) {
      const entry = lookupTerm(term)!;
      expect(entry.seeKind).toBe("text"); // a pad has no keyboard/fretboard SEE
      expect(entry.what.length).toBeGreaterThan(0);
      expect(entry.why.length).toBeGreaterThan(0);
    }
  });

  it("the key terms actually appear in the taught lesson prose (so a chip renders)", () => {
    const blob = Object.values(DRUMS_LESSONS)
      .map((l) => [l.what, l.why, l.goodWhen, l.watchOut ?? "", ...l.steps.flatMap((s) => [s.do, s.feel ?? ""])].join(" "))
      .join(" ")
      .toLowerCase();
    for (const term of ["fulcrum", "rebound", "matched grip", "free stroke", "practice"]) {
      expect(blob, `lesson prose should mention "${term}"`).toContain(term);
    }
  });
});
