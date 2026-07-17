import { describe, it, expect } from "vitest";
import { generateEarRound, generateEarRoundForModule } from "./earRounds";
import { lookupTerm } from "./explain/glossary";
import { pianoModule } from "./piano/module";
import { guitarModule } from "./guitar/module";
import type { InstrumentModule } from "./instrumentRegistry";
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

describe("generateEarRoundForModule — instrument-aware routing", () => {
  // Piano-only / theory vocabulary a GUITAR round must never surface (mirrors the
  // guitar earRounds guard). If PracticeStand served piano rounds to a guitarist,
  // one of these would leak.
  const PIANO_ONLY_TERMS = ["scale degree", "cadence"];

  it("piano (no module.earRounds) falls back to the shared piano generator", () => {
    // A cadence round (piano L4) can only come from the shared generator, so seeing
    // guitar-native power/interval prompts here would prove wrong routing. Instead
    // assert the piano generator's own contract: level-appropriate piano types.
    for (let i = 0; i < 30; i++) {
      const r = generateEarRoundForModule(pianoModule, 4, "C");
      // Piano L4 is a cadence round (Roman-numeral labels) OR an interval mix-in.
      expect(["cadence", "interval"]).toContain(r.type);
    }
  });

  it("guitar (function generator) serves guitar-native rounds with no piano vocabulary", () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      for (let i = 0; i < 20; i++) {
        const r = generateEarRoundForModule(guitarModule, level, "am");
        const haystack = (r.prompt + " " + r.choices.map((c) => c.label).join(" ")).toLowerCase();
        for (const term of PIANO_ONLY_TERMS) {
          expect(haystack.includes(term), `level ${level} leaked "${term}": ${haystack}`).toBe(false);
        }
        // Guitar rounds use interval/maj-min/updown types, never cadence/progression/scale-degree.
        expect(["cadence", "progression", "scale-degree", "quality"]).not.toContain(r.type);
      }
    }
  });

  it("an array-form earRounds returns the level-matched entry (else the first)", () => {
    const authored: EarRound[] = [
      { id: "a2", type: "quality", level: 2, prompt: "p2", correctId: "x", choices: [{ id: "x", label: "X" }, { id: "y", label: "Y" }], audio: { kind: "triad", key: "C" } },
      { id: "a4", type: "cadence", level: 4, prompt: "p4", correctId: "x", choices: [{ id: "x", label: "X" }, { id: "y", label: "Y" }], audio: { kind: "cadence", key: "C" } },
    ];
    const mod = { ...pianoModule, earRounds: authored } as InstrumentModule;
    expect(generateEarRoundForModule(mod, 4, "C").id).toBe("a4");
    // No level-3 entry → falls back to the first authored round.
    expect(generateEarRoundForModule(mod, 3, "C").id).toBe("a2");
  });

  it("an undefined module falls back to the shared generator without throwing", () => {
    const r = generateEarRoundForModule(undefined, 1, "C");
    expect(r.type).toBe("maj-min");
  });
});
