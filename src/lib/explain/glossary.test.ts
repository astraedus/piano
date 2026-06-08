import { describe, it, expect } from "vitest";
import { GLOSSARY, lookupTerm } from "./glossary";
import type { GlossaryEntry } from "./glossary";
import { ghostKeyToTermId, nodeToTermId } from "../pathFilter";

const SEE_KINDS = new Set(["fretboard", "keyboard", "chord-diagram", "text"]);
// Scientific Pitch Notation: letter A-G, optional # or b, octave (e.g. "C4", "F#5").
const SPN = /^[A-Ga-g][#b]?-?\d+$/;

// Node ids whose subject is a single glossary concept — every nodeToTermId value
// must resolve, or a TermChip on the tree would point at nothing. Mirrors the
// NODE_TERM_IDS map in pathFilter.ts.
const NODE_IDS_WITH_TERMS = [
  "g-t1-power", "g-t1-palmmute", "g-t1-strum", "g-t1-altpick", "g-t1-downpick",
  "g-t1-fretting", "g-t2-hammer", "g-t2-pulloff", "g-t2-slide", "g-t2-bend",
  "g-t2-vibrato", "g-t2-pent-box1", "g-t2-pent-box2", "g-t2-barre-E", "g-t2-barre-A",
  "g-t3-blues12", "g-t3-phrasing", "g-t3-licks", "g-t0-tab", "g-t1-tabrhythm",
  "g-t3-syncopation", "p-t0-staff", "p-t1-first-improv", "p-t1-echo-ear",
  "p-t1-three-moods", "p-t2-pop-formula", "p-t2-transcribe", "p-t3-lead-sheet",
  "p-t3-ii-v-i", "p-t3-blues", "p-key-C", "p-key-G", "p-key-am",
];

const GHOST_KEYS = ["C", "G", "am", "D", "em", "F", "Bb"] as const;

describe("GLOSSARY integrity", () => {
  it("has unique ids", () => {
    const ids = GLOSSARY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry is well-formed (required text fields, valid seeKind, callable hear)", () => {
    for (const e of GLOSSARY) {
      expect(e.id, `id on ${e.title}`).toBeTruthy();
      expect(e.title, `title on ${e.id}`).toBeTruthy();
      expect(e.what.length, `what on ${e.id}`).toBeGreaterThan(0);
      expect(e.why.length, `why on ${e.id}`).toBeGreaterThan(0);
      expect(Array.isArray(e.aliases), `aliases on ${e.id}`).toBe(true);
      expect(typeof e.hear, `hear on ${e.id}`).toBe("function");
      expect(SEE_KINDS.has(e.seeKind), `seeKind on ${e.id}`).toBe(true);
    }
  });

  it("seeKind matches the SEE payload it dispatches on", () => {
    for (const e of GLOSSARY) {
      if (e.seeKind === "keyboard" || e.seeKind === "fretboard") {
        expect(Array.isArray(e.seeNotes), `seeNotes required for ${e.id}`).toBe(true);
        expect(e.seeNotes!.length, `seeNotes non-empty for ${e.id}`).toBeGreaterThan(0);
      }
      if (e.seeKind === "chord-diagram") {
        expect(Array.isArray(e.seeChordShape), `seeChordShape required for ${e.id}`).toBe(true);
        expect(e.seeChordShape!.length, `chord shape is 6 strings for ${e.id}`).toBe(6);
      }
      if (e.seeKind === "text") {
        expect(typeof e.seeText, `seeText required for ${e.id}`).toBe("string");
        expect(e.seeText!.length, `seeText non-empty for ${e.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("every seeNotes pitch is valid Scientific Pitch Notation", () => {
    for (const e of GLOSSARY) {
      if (!e.seeNotes) continue;
      for (const n of e.seeNotes) {
        expect(SPN.test(n), `"${n}" on ${e.id} is valid SPN`).toBe(true);
      }
    }
  });

  it("every chord shape value is in range (-1 muted .. high fret)", () => {
    for (const e of GLOSSARY) {
      if (!e.seeChordShape) continue;
      for (const f of e.seeChordShape) {
        expect(Number.isInteger(f), `fret on ${e.id} is an integer`).toBe(true);
        expect(f, `fret on ${e.id} >= -1`).toBeGreaterThanOrEqual(-1);
        expect(f, `fret on ${e.id} <= 24`).toBeLessThanOrEqual(24);
      }
    }
  });
});

describe("lookupTerm", () => {
  it("resolves by id, title, and alias (case-insensitive)", () => {
    const pc = lookupTerm("power-chord");
    expect(pc?.id).toBe("power-chord");
    expect(lookupTerm("Power Chords")?.id).toBe("power-chord"); // title
    expect(lookupTerm("rock chord")?.id).toBe("power-chord"); // alias
    expect(lookupTerm("  POWER CHORD  ")?.id).toBe("power-chord"); // trim + case
  });

  it("returns undefined for an unknown term (so chips degrade gracefully)", () => {
    expect(lookupTerm("does-not-exist")).toBeUndefined();
  });

  it("every id resolves to itself", () => {
    for (const e of GLOSSARY) {
      expect(lookupTerm(e.id)?.id, `id ${e.id} resolves`).toBe(e.id);
    }
  });

  it("every alias resolves to an entry", () => {
    for (const e of GLOSSARY) {
      for (const a of e.aliases) {
        const hit = lookupTerm(a);
        expect(hit, `alias "${a}" (on ${e.id}) resolves`).toBeDefined();
      }
    }
  });

  it("every title resolves to an entry", () => {
    for (const e of GLOSSARY) {
      expect(lookupTerm(e.title)?.id, `title "${e.title}" resolves`).toBe(e.id);
    }
  });
});

describe("term-link helpers point at real glossary entries (no dead chips)", () => {
  it("every nodeToTermId target exists in the glossary", () => {
    for (const id of NODE_IDS_WITH_TERMS) {
      const term = nodeToTermId(id);
      expect(term, `nodeToTermId(${id}) is mapped`).toBeDefined();
      expect(lookupTerm(term!), `nodeToTermId(${id}) -> "${term}" exists`).toBeDefined();
    }
  });

  it("every ghostKeyToTermId target exists in the glossary", () => {
    for (const key of GHOST_KEYS) {
      const term = ghostKeyToTermId(key);
      expect(lookupTerm(term), `ghostKeyToTermId(${key}) -> "${term}" exists`).toBeDefined();
    }
  });

  it("ships the guitar-first core set called out by the spec", () => {
    const required = [
      "power-chord", "minor-pentatonic", "pentatonic-box", "string-bending",
      "vibrato", "palm-muting", "barre-chord", "hammer-on", "g-major",
      "a-minor", "tonic", "chord-progression", "12-bar-blues", "c-major",
      "major-vs-minor", "triad", "scale", "improvisation",
    ];
    for (const id of required) {
      expect(GLOSSARY.find((e: GlossaryEntry) => e.id === id), `ship-set term ${id}`).toBeDefined();
    }
  });
});
