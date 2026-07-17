// Class guard for the 2026-07-17 QA copy-leak bug: shared spine surfaces showed
// piano/tonal wording on drums ("One key, seven days", "Feel the fingering",
// "The piano is here when you are", tonal ear-level names). Every shared-surface
// copy helper is swept here for EVERY registered instrument against the
// vocabulary that belongs to the OTHER instruments — so the next leak in these
// helpers fails a test instead of a live QA pass.
import { describe, expect, it } from "vitest";
import "@/lib/piano/module";
import "@/lib/guitar/module";
import "@/lib/drums/module";
import { getModuleSync } from "@/lib/instrumentRegistry";
import type { Instrument } from "@/lib/types";
import { earLevelLabel } from "@/lib/earProgression";
import { PATH_OPTIONS } from "@/components/Onboarding";
import {
  weeklyFocusBlurb,
  mentalPracticeCopy,
  reminderExampleQuote,
  touchNoun,
  handMemoryNoun,
} from "@/lib/sharedCopy";

const INSTRUMENTS: Instrument[] = ["piano", "guitar", "drums"];

// Vocabulary that must never appear on ANOTHER instrument's shared copy.
// (Scoped to shared-surface phrasing; module-authored content has its own
// per-module contentAudit tests.)
const FORBIDDEN: Record<Instrument, RegExp> = {
  // On piano surfaces: no guitar/drums physicality.
  piano: /\b(fret|strum|riff|sticking|rudiment|drum|pad)\b/i,
  // On guitar surfaces: no piano/drums physicality ("key" is fine — guitar is tonal).
  guitar: /\b(pedal|keyboard|sticking|rudiment|drum|pad)\b/i,
  // On drums surfaces: nothing tonal, nothing pitched-instrument. Bare "note"
  // is allowed — "eighth note" is a duration, legit percussion vocabulary
  // (matches drums/contentAudit.test.ts policy, which forbids tonal readings).
  drums: /\b(key|keys|chord|scale|major|minor|piano|guitar|fret|riff|fingering|pedal|melody|octave)\b/i,
};

function sharedSurfaceStrings(instrument: Instrument): string[] {
  const module = getModuleSync(instrument);
  expect(module, `module ${instrument} must be registered`).toBeTruthy();
  const strings = [
    weeklyFocusBlurb(module?.focusKind),
    mentalPracticeCopy(instrument, true, "this piece"),
    mentalPracticeCopy(instrument, false, "this piece"),
    reminderExampleQuote(module),
    touchNoun(instrument),
    handMemoryNoun(instrument),
    ...PATH_OPTIONS.map((o) => o.sub(instrument)),
  ];
  for (const level of [1, 2, 3, 4, 5] as const) {
    strings.push(earLevelLabel(level, module?.focusKind));
  }
  return strings;
}

describe("shared-surface copy adapts to the active instrument (QA 2026-07-17 class guard)", () => {
  for (const instrument of INSTRUMENTS) {
    it(`${instrument}: no cross-instrument vocabulary on shared surfaces`, () => {
      for (const s of sharedSurfaceStrings(instrument)) {
        expect(s, `leaked on ${instrument}: "${s}"`).not.toMatch(FORBIDDEN[instrument]);
      }
    });
  }

  it("the specific QA leaks are gone on drums", () => {
    const module = getModuleSync("drums");
    expect(weeklyFocusBlurb(module?.focusKind)).toBe(
      "One rudiment, seven days. The week picks it, so you don't have to.",
    );
    expect(earLevelLabel(1, module?.focusKind)).not.toBe("Major vs Minor");
    expect(reminderExampleQuote(module)).toBe("The pad is here when you are.");
    expect(mentalPracticeCopy("drums", false, "this piece")).toContain("sticking");
    for (const o of PATH_OPTIONS) {
      expect(o.sub("drums")).not.toMatch(/piano|guitar|chord|riff/i);
    }
  });

  it("piano and guitar copy is unchanged in spirit", () => {
    expect(weeklyFocusBlurb(getModuleSync("piano")?.focusKind)).toContain("One key");
    expect(weeklyFocusBlurb(getModuleSync("guitar")?.focusKind)).toContain("One chord");
    expect(reminderExampleQuote(getModuleSync("piano"))).toBe("The piano is here when you are.");
    expect(mentalPracticeCopy("piano", false, "x")).toContain("fingering");
  });
});
