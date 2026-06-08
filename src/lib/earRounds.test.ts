import { describe, it, expect } from "vitest";
import { generateEarRound } from "./earRounds";
import { lookupTerm } from "./explain/glossary";
import type { EarRound, KeyId } from "./types";

// A spread of keys (major + minor) the generator may receive as the ghost key.
const KEYS: KeyId[] = ["C", "G", "D", "A", "F", "Bb", "am", "em", "dm"];
const LEVELS: EarRound["level"][] = [1, 2, 3, 4, 5, 6, 7];

function everyRound(fn: (r: EarRound, ctx: string) => void) {
  for (const key of KEYS) {
    for (const level of LEVELS) {
      // Generate several times to cover randomized branches.
      for (let i = 0; i < 8; i++) {
        fn(generateEarRound(level, key), `key=${key} level=${level} iter=${i}`);
      }
    }
  }
}

describe("piano ear rounds — V4 term links", () => {
  it("any choice termId resolves to a real glossary entry (no dead chips)", () => {
    everyRound((r, ctx) => {
      for (const c of r.choices) {
        if (c.termId === undefined) continue;
        expect(lookupTerm(c.termId), `${ctx} choice ${c.id} termId "${c.termId}"`).toBeDefined();
      }
    });
  });

  it("Major/Minor choices are tagged with the major-vs-minor explainer", () => {
    // The maj-min round (level 1) always offers Major + Minor; both should link.
    let sawTagged = false;
    everyRound((r) => {
      const majMin = r.choices.filter((c) => c.label === "Major" || c.label === "Minor");
      for (const c of majMin) {
        if (c.termId === "major-vs-minor") sawTagged = true;
      }
    });
    expect(sawTagged).toBe(true);
  });
});
