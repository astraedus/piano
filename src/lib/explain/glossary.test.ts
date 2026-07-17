import { describe, it, expect } from "vitest";
import { GLOSSARY, lookupTerm } from "./glossary";
import type { GlossaryEntry } from "./glossary";
import { ghostKeyToTermId, nodeToTermId } from "../pathFilter";

const SEE_KINDS = new Set(["fretboard", "keyboard", "chord-diagram", "text"]);
// Scientific Pitch Notation: letter A-G, optional # or b, octave (e.g. "C4", "F#5").
const SPN = /^[A-Ga-g][#b]?-?\d+$/;

// A SEE payload must carry the data its seeKind dispatches on. fretboard now
// dispatches on seePositions (authored string/fret dots), NOT seeNotes — a guitar
// pitch maps to several spots, so positions are the honest, unambiguous view.
type SeeLike = {
  seeKind: string;
  seeNotes?: string[];
  seePositions?: { string: number; fret: number }[];
  seeChordShape?: number[];
  seeText?: string;
};
function validateSee(see: SeeLike, where: string) {
  if (see.seeKind === "keyboard") {
    expect(Array.isArray(see.seeNotes), `seeNotes required for ${where}`).toBe(true);
    expect(see.seeNotes!.length, `seeNotes non-empty for ${where}`).toBeGreaterThan(0);
  }
  if (see.seeKind === "fretboard") {
    expect(Array.isArray(see.seePositions), `seePositions required for ${where}`).toBe(true);
    expect(see.seePositions!.length, `seePositions non-empty for ${where}`).toBeGreaterThan(0);
  }
  if (see.seeKind === "chord-diagram") {
    expect(Array.isArray(see.seeChordShape), `seeChordShape required for ${where}`).toBe(true);
    expect(see.seeChordShape!.length, `chord shape is 6 strings for ${where}`).toBe(6);
  }
  if (see.seeKind === "text") {
    expect(typeof see.seeText, `seeText required for ${where}`).toBe("string");
    expect(see.seeText!.length, `seeText non-empty for ${where}`).toBeGreaterThan(0);
  }
}

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
  // Batch 3b — new subject-nodes whose title chip points at a single term.
  "p-t1-articulation", "p-t2-hands-together",
  // Visual-pipeline fix — pedal + inversions lessons now render their own term.
  "p-t2-pedal", "p-t2-inversions",
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

  it("seeKind matches the SEE payload it dispatches on (primary + overrides)", () => {
    for (const e of GLOSSARY) {
      validateSee(e, e.id);
      for (const [inst, see] of Object.entries(e.seeByInstrument ?? {})) validateSee(see, `${e.id}.${inst}`);
    }
  });

  // Class guard for the visual-pipeline bug: EVERY fretboard term must author its
  // own positions, so none silently renders the identical default box.
  it("every fretboard term authors seePositions (no silent default box)", () => {
    const fretboard = GLOSSARY.filter((e) => e.seeKind === "fretboard");
    expect(fretboard.length).toBeGreaterThan(0);
    for (const e of fretboard) {
      expect(e.seePositions, `${e.id} authors seePositions`).toBeDefined();
      expect(e.seePositions!.length, `${e.id} seePositions non-empty`).toBeGreaterThan(0);
    }
  });

  // Class guard for the wrong-instrument bug: a SHARED fretboard concept must
  // carry a piano keyboard override, so a piano lesson never shows a guitar neck.
  it("a shared fretboard term has a piano keyboard override", () => {
    for (const e of GLOSSARY) {
      if (e.seeKind !== "fretboard") continue;
      if (e.instrument && e.instrument !== "both") continue; // guitar-only is fine
      const piano = e.seeByInstrument?.piano;
      expect(piano, `${e.id} (shared fretboard) has a piano SEE override`).toBeDefined();
      expect(piano!.seeKind, `${e.id} piano override is a keyboard`).toBe("keyboard");
    }
  });

  it("every seeNotes pitch (primary + per-instrument overrides) is valid SPN", () => {
    for (const e of GLOSSARY) {
      for (const n of e.seeNotes ?? []) {
        expect(SPN.test(n), `"${n}" on ${e.id} is valid SPN`).toBe(true);
      }
      for (const [inst, see] of Object.entries(e.seeByInstrument ?? {})) {
        for (const n of see.seeNotes ?? []) {
          expect(SPN.test(n), `"${n}" on ${e.id}.${inst} is valid SPN`).toBe(true);
        }
      }
    }
  });

  it("every fretboard position is a valid string (1..6) and fret (0..24)", () => {
    const check = (pos: readonly { string: number; fret: number }[] | undefined, where: string) => {
      for (const p of pos ?? []) {
        expect(p.string, `${where} string`).toBeGreaterThanOrEqual(1);
        expect(p.string, `${where} string`).toBeLessThanOrEqual(6);
        expect(p.fret, `${where} fret`).toBeGreaterThanOrEqual(0);
        expect(p.fret, `${where} fret`).toBeLessThanOrEqual(24);
      }
    };
    for (const e of GLOSSARY) {
      check(e.seePositions, e.id);
      for (const [inst, see] of Object.entries(e.seeByInstrument ?? {})) check(see.seePositions, `${e.id}.${inst}`);
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

// Batch 3a — the glossary is a lookup space, so every term string (id / title /
// alias) must resolve to exactly ONE entry. This locks the class of bug the batch-3a
// fact-check caught: two writers each proposing an "octave" (and a "gain") entry,
// which would silently shadow each other via lookupTerm's first-match resolution.
describe("glossary resolution is unambiguous (no shadowed terms)", () => {
  it("no term string (id, title, or alias) is claimed by more than one entry", () => {
    const owners = new Map<string, Set<string>>();
    for (const e of GLOSSARY) {
      for (const s of [e.id, e.title, ...e.aliases]) {
        const k = s.toLowerCase().trim();
        if (!owners.has(k)) owners.set(k, new Set());
        owners.get(k)!.add(e.id);
      }
    }
    const collisions = [...owners.entries()]
      .filter(([, ids]) => ids.size > 1)
      .map(([term, ids]) => `"${term}" claimed by ${[...ids].join(", ")}`);
    expect(collisions).toEqual([]);
  });

  it("deduped batch-3a terms (octave, gain) exist as exactly one entry each", () => {
    for (const id of ["octave", "gain"]) {
      expect(GLOSSARY.filter((e) => e.id === id).length, `"${id}" appears exactly once`).toBe(1);
    }
  });

  // Batch 3b — the new piano terms must each resolve to exactly one entry. `legato`
  // in particular was moved off the guitar hammer-on alias into its own entry so a
  // piano articulation lesson chips to the right (piano) explainer, not a guitar
  // technique — the no-shadow test above guards the move, this guards existence.
  it("batch-3b terms (hands-together, articulation, legato, staccato) exist as exactly one entry each", () => {
    for (const id of ["hands-together", "articulation", "legato", "staccato"]) {
      expect(GLOSSARY.filter((e) => e.id === id).length, `"${id}" appears exactly once`).toBe(1);
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
