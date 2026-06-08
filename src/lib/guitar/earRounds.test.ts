import { describe, it, expect } from "vitest";
import { generateGuitarEarRound, GUITAR_EAR_ROUNDS } from "./earRounds";
import { GUITAR_GHOST_ROTATION } from "./curriculum";
import { lookupTerm } from "../explain/glossary";
import type { EarRound, KeyId } from "../types";

// Every KeyId the ghost rotation can hand to the generator as a focus id.
const FOCUS_IDS: KeyId[] = Array.from(
  new Set(Object.values(GUITAR_GHOST_ROTATION).flat()),
);
const LEVELS: EarRound["level"][] = [1, 2, 3, 4, 5, 6, 7];

// Audio kinds playEarRound (lib/audio.ts) actually supports. Guitar rounds must
// stay inside this set or they would play silently.
const SUPPORTED_AUDIO_KINDS = new Set([
  "interval",
  "triad",
  "cadence",
  "progression",
  "scale-degree",
  "tonicized-note",
]);

// Piano-only / theory vocabulary that should NEVER appear in a guitar ear round's
// player-facing copy (prompts + choice labels).
const PIANO_ONLY_TERMS = [
  "scale degree",
  "cadence",
  "tonic",
  "subdominant",
  "dominant",
  "I–", "ii–", "IV–", "V–", "vi–", // roman-numeral progressions
];

function everyRound(fn: (r: EarRound, ctx: string) => void) {
  for (const focusId of FOCUS_IDS) {
    for (const level of LEVELS) {
      // Generate several times to cover the randomized branch selection.
      for (let i = 0; i < 8; i++) {
        const r = generateGuitarEarRound(level, focusId);
        fn(r, `focus=${focusId} level=${level} iter=${i}`);
      }
    }
  }
}

describe("guitar ear rounds — well-formed", () => {
  it("the module export is the generator function", () => {
    expect(GUITAR_EAR_ROUNDS).toBe(generateGuitarEarRound);
    expect(GUITAR_EAR_ROUNDS).toBeTypeOf("function");
  });

  it("every round has an id, prompt, and at least two choices", () => {
    everyRound((r, ctx) => {
      expect(r.id, ctx).toBeTruthy();
      expect(r.prompt.length, ctx).toBeGreaterThan(0);
      expect(r.choices.length, ctx).toBeGreaterThanOrEqual(2);
    });
  });

  it("choice ids are unique within a round", () => {
    everyRound((r, ctx) => {
      const ids = r.choices.map((c) => c.id);
      expect(new Set(ids).size, ctx).toBe(ids.length);
    });
  });

  it("exactly one choice matches correctId", () => {
    everyRound((r, ctx) => {
      const matches = r.choices.filter((c) => c.id === r.correctId);
      expect(matches.length, ctx).toBe(1);
    });
  });

  it("every choice has a non-empty label", () => {
    everyRound((r, ctx) => {
      for (const c of r.choices) expect(c.label.length, `${ctx} choice ${c.id}`).toBeGreaterThan(0);
    });
  });

  it("audio uses a kind playEarRound supports, keyed to the focus id", () => {
    everyRound((r, ctx) => {
      expect(SUPPORTED_AUDIO_KINDS.has(r.audio.kind), `${ctx} kind ${r.audio.kind}`).toBe(true);
      expect(r.audio.key, ctx).toBeTruthy();
    });
  });

  it("interval rounds carry two audio notes; triad rounds carry chord tones", () => {
    everyRound((r, ctx) => {
      if (r.audio.kind === "interval") {
        expect(r.audio.notes?.length, ctx).toBe(2);
      } else if (r.audio.kind === "triad") {
        expect((r.audio.chords?.[0]?.length ?? 0), ctx).toBeGreaterThanOrEqual(3);
      }
    });
  });

  it("level is preserved as a valid ear-ladder level", () => {
    everyRound((r, ctx) => {
      expect([1, 2, 3, 4, 5, 6, 7], ctx).toContain(r.level);
    });
  });

  it("any choice termId resolves to a real glossary entry (no dead chips)", () => {
    everyRound((r, ctx) => {
      for (const c of r.choices) {
        if (c.termId === undefined) continue;
        expect(lookupTerm(c.termId), `${ctx} choice ${c.id} termId "${c.termId}"`).toBeDefined();
      }
    });
  });
});

describe("guitar ear rounds — guitar-native, no piano-only vocabulary", () => {
  it("no prompt or choice label uses piano-only / theory terms", () => {
    everyRound((r, ctx) => {
      const haystack = (r.prompt + " " + r.choices.map((c) => c.label).join(" ")).toLowerCase();
      for (const term of PIANO_ONLY_TERMS) {
        expect(haystack.includes(term.toLowerCase()), `${ctx} leaked term "${term}" in: ${haystack}`).toBe(false);
      }
    });
  });

  it("surfaces guitar-native concepts (3rds, chord quality, power chords)", () => {
    // Across many generations every focus should produce the guitar vocabulary at
    // some level: "3rd", "major/minor", and "power chord".
    const seen = new Set<string>();
    for (const focusId of FOCUS_IDS) {
      for (const level of LEVELS) {
        for (let i = 0; i < 12; i++) {
          const text = generateGuitarEarRound(level, focusId).prompt.toLowerCase();
          if (text.includes("3rd")) seen.add("third");
          if (text.includes("major") || text.includes("minor")) seen.add("quality");
          if (text.includes("power chord")) seen.add("power");
          if (text.includes("up or down")) seen.add("direction");
        }
      }
    }
    expect(seen.has("third")).toBe(true);
    expect(seen.has("quality")).toBe(true);
    expect(seen.has("power")).toBe(true);
  });
});
