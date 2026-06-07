import { describe, it, expect } from "vitest";
import { GUITAR_NODES } from "./skillNodes";
import { GUITAR_CHAIN_DRILLS } from "./chainDrills";
import { GUITAR_WARMUPS } from "./warmups";
import { GUITAR_UNLOCK_LIBRARY } from "./unlocks";

// Content audit (plan §5 P3 test 11): guitar content must never use piano-only
// vocabulary. Catches copy-paste contamination from the piano module — a guitar
// node that says "keyboard" or "left hand comps" is a bug.
const PIANO_ONLY_TERMS = [
  "piano",
  "keyboard",
  "treble clef",
  "bass clef",
  "left hand",
  "right hand",
  "pedal",
  "octave higher", // piano-ism; guitar uses frets/strings
  "hands separate",
  "both hands",
];

function gather(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const n of GUITAR_NODES) {
    out.push({ where: `node ${n.id} title`, text: n.title });
    out.push({ where: `node ${n.id} masteryDrill`, text: n.masteryDrill });
    out.push({ where: `node ${n.id} unlock`, text: n.unlock });
  }
  for (const d of GUITAR_CHAIN_DRILLS) {
    out.push({ where: `drill ${d.id} name`, text: d.name });
    out.push({ where: `drill ${d.id} closingNote`, text: d.closingNote });
    for (const s of d.steps) out.push({ where: `drill ${d.id} step`, text: s.instruction });
  }
  for (const w of Object.values(GUITAR_WARMUPS)) {
    out.push({ where: `warmup ${w.label} postureLine`, text: w.postureLine });
    for (const l of w.lines) out.push({ where: `warmup ${w.label} line`, text: l });
  }
  for (const c of GUITAR_UNLOCK_LIBRARY) {
    out.push({ where: `unlock ${c.id} title`, text: c.title });
    out.push({ where: `unlock ${c.id} tryLine`, text: c.tryLine });
  }
  return out;
}

describe("guitar content audit — no piano-only terms", () => {
  const corpus = gather();
  for (const term of PIANO_ONLY_TERMS) {
    it(`never uses "${term}"`, () => {
      const hits = corpus.filter((c) => c.text.toLowerCase().includes(term));
      expect(hits.map((h) => h.where)).toEqual([]);
    });
  }

  it("uses guitar vocabulary somewhere (sanity: this corpus is actually guitar)", () => {
    const blob = corpus.map((c) => c.text.toLowerCase()).join(" ");
    expect(blob).toContain("string");
    expect(blob).toContain("fret");
    expect(blob).toContain("pick");
  });
});
