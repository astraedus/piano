import { describe, it, expect } from "vitest";
import { lookupTerm } from "../explain/glossary";
import { DRUMS_LESSONS } from "./lessons";

// The product soul's "no unexplained jargon" contract for drums: every drum term
// a beginner meets in a lesson must resolve to a glossary entry (so its TermChip
// opens an explainer), and each term must actually appear in the taught prose (so
// the chip renders). This is the honest guarantee that the lessons are followable
// cold. Stage B extends the set to the full Tier-1..3 rudiment + reading vocabulary.
const REQUIRED_TERMS = [
  // Tier-0 foundations
  "practice pad",
  "matched grip",
  "fulcrum",
  "rebound",
  "free stroke",
  "four strokes",
  "rudiment",
  // Tier-1..3 rudiment + reading vocabulary
  "subdivision",
  "sixteenth notes",
  "accent",
  "single stroke roll",
  "double stroke roll",
  "paradiddle",
  "flam",
  "drag",
  "five stroke roll",
  "buzz roll",
  "moeller",
  // Curriculum audit v1.1 — words that already appeared untappable in drums prose
  // (backbeat, grace note, ghost note, click) plus the new triplets vocabulary.
  "triplet",
  "backbeat",
  "ghost note",
  "grace note",
  "click",
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
      expect(entry.seeKind, `${term} SEE is text (a pad has no keyboard/fretboard)`).toBe("text");
      expect(entry.what.length, `${term} what`).toBeGreaterThan(0);
      expect(entry.why.length, `${term} why`).toBeGreaterThan(0);
    }
  });

  it("every required term actually appears in the taught lesson prose (so a chip renders)", () => {
    const blob = Object.values(DRUMS_LESSONS)
      .map((l) => [l.what, l.why, l.goodWhen, l.watchOut ?? "", ...l.steps.flatMap((s) => [s.do, s.feel ?? ""])].join(" "))
      .join(" ")
      .toLowerCase();
    for (const term of REQUIRED_TERMS) {
      // "free stroke" is taught in the Tier-0 rebound lesson but under the word
      // "free stroke"; "practice pad" appears as "practice pad exists". Both are
      // exact-substring present — assert the whole set to keep the contract honest.
      expect(blob, `lesson prose should mention "${term}"`).toContain(term);
    }
  });
});
