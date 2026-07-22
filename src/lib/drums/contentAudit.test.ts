import { describe, it, expect } from "vitest";
import { DRUMS_NODES } from "./skillNodes";
import { DRUMS_CHAIN_DRILLS } from "./chainDrills";
import { DRUMS_WARMUPS } from "./warmups";
import { DRUMS_UNLOCK_LIBRARY } from "./unlocks";
import { DRUMS_LESSONS } from "./lessons";

// Content audit (mirrors guitar/contentAudit.test.ts): drums content must never
// use tonal or other-instrument vocabulary — a pad has no scale, key, or chord.
// NOTE: "left hand" / "right hand" are ALLOWED for drums (the hands ARE the
// instrument), unlike piano/guitar; we forbid the tonal-reading words instead.
const FORBIDDEN_TERMS = [
  "chord",
  "fret",
  "strum",
  "keyboard",
  "pedal",
  "melody",
  "octave",
  "treble",
  "clef",
  "scale", // the tonal sense — drums copy says "pattern" / "sticking"
];

function gather(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const n of DRUMS_NODES) {
    out.push({ where: `node ${n.id} title`, text: n.title });
    out.push({ where: `node ${n.id} masteryDrill`, text: n.masteryDrill });
    out.push({ where: `node ${n.id} unlock`, text: n.unlock });
  }
  for (const d of DRUMS_CHAIN_DRILLS) {
    out.push({ where: `drill ${d.id} name`, text: d.name });
    if (d.soulName) out.push({ where: `drill ${d.id} soulName`, text: d.soulName });
    out.push({ where: `drill ${d.id} closingNote`, text: d.closingNote });
    for (const s of d.steps) out.push({ where: `drill ${d.id} step`, text: s.instruction });
  }
  for (const w of Object.values(DRUMS_WARMUPS)) {
    out.push({ where: `warmup ${w.label} label`, text: w.label });
    if (w.soulSummary) out.push({ where: `warmup ${w.label} soulSummary`, text: w.soulSummary });
    out.push({ where: `warmup ${w.label} postureLine`, text: w.postureLine });
    for (const l of w.lines) out.push({ where: `warmup ${w.label} line`, text: l });
  }
  for (const c of DRUMS_UNLOCK_LIBRARY) {
    out.push({ where: `unlock ${c.id} title`, text: c.title });
    out.push({ where: `unlock ${c.id} tryLine`, text: c.tryLine });
  }
  // Lessons too — the design doc's zero-jargon bar applies to the taught prose.
  for (const [id, lesson] of Object.entries(DRUMS_LESSONS)) {
    out.push({ where: `lesson ${id} what`, text: lesson.what });
    out.push({ where: `lesson ${id} why`, text: lesson.why });
    out.push({ where: `lesson ${id} goodWhen`, text: lesson.goodWhen });
    if (lesson.watchOut) out.push({ where: `lesson ${id} watchOut`, text: lesson.watchOut });
    for (const s of lesson.steps) {
      out.push({ where: `lesson ${id} step.do`, text: s.do });
      if (s.feel) out.push({ where: `lesson ${id} step.feel`, text: s.feel });
    }
    if (lesson.song) {
      out.push({ where: `lesson ${id} song.name`, text: lesson.song.name });
      out.push({ where: `lesson ${id} song.note`, text: lesson.song.note });
    }
    // "Go deeper" resource labels + notes face the learner too — hold them to the
    // same zero-jargon bar (URLs are not prose, so they are not audited).
    for (const r of lesson.resources ?? []) {
      out.push({ where: `lesson ${id} resource.name`, text: r.name });
      out.push({ where: `lesson ${id} resource.note`, text: r.note });
    }
  }
  return out;
}

describe("drums content audit — no tonal / other-instrument terms", () => {
  const corpus = gather();
  for (const term of FORBIDDEN_TERMS) {
    it(`never uses "${term}"`, () => {
      const hits = corpus.filter((c) => c.text.toLowerCase().includes(term));
      expect(hits.map((h) => h.where)).toEqual([]);
    });
  }

  it("left/right hand ARE allowed (hands are the instrument)", () => {
    // Sanity: the audit must NOT forbid the hands — assert none of those words are
    // in the forbidden list (a regression guard on the list itself).
    expect(FORBIDDEN_TERMS).not.toContain("left hand");
    expect(FORBIDDEN_TERMS).not.toContain("right hand");
  });

  it("uses drums vocabulary somewhere (sanity: this corpus is actually drums)", () => {
    const blob = corpus.map((c) => c.text.toLowerCase()).join(" ");
    expect(blob).toContain("stick");
    expect(blob).toContain("bounce");
    expect(blob).toContain("stroke");
  });
});
