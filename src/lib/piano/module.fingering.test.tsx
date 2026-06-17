import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { pianoModule } from "./module";
import { scale, KEY_META } from "../music";

// #4 MAJOR regression: the piano InstrumentVisual must only overlay finger
// numbers for keys with a CANONICAL fingering. Black-key keys (Bb/Eb/Ab/Db/Gb/
// B/Fs and black-key minors) have no canonical pattern in fingerings.ts, so the
// visual must show NO finger numbers (notes-only), not the wrong C-major-fallback
// ones.

const Visual = pianoModule.InstrumentVisual;

// The Keyboard renders finger numbers as <text> nodes whose content is the
// digit; labelNotes is off by default so digits 1..5 only appear as fingerings.
function fingerTexts(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("text"))
    .map((t) => t.textContent ?? "")
    .filter((s) => /^[1-5]$/.test(s));
}

describe("PianoInstrumentVisual fingering overlay is canonical-only", () => {
  it("shows finger numbers for a canonical key (C major)", () => {
    const notes = scale(KEY_META.C.tonic, "major", 2, 4);
    const { container } = render(<Visual notes={notes} rangeStart="C4" octaves={2} scaleKey="C" />);
    expect(fingerTexts(container).length).toBeGreaterThan(0);
  });

  it("shows NO finger numbers for a non-canonical black-key key (Bb major)", () => {
    const notes = scale(KEY_META.Bb.tonic, "major", 2, 4, true);
    const { container } = render(<Visual notes={notes} rangeStart="C4" octaves={2} scaleKey="Bb" />);
    expect(fingerTexts(container)).toEqual([]);
  });

  it("shows NO finger numbers for Eb major (another non-canonical key)", () => {
    const notes = scale(KEY_META.Eb.tonic, "major", 2, 4, true);
    const { container } = render(<Visual notes={notes} rangeStart="C4" octaves={2} scaleKey="Eb" />);
    expect(fingerTexts(container)).toEqual([]);
  });

  it("shows NO finger numbers when no scaleKey is supplied (notes-only)", () => {
    const notes = scale(KEY_META.C.tonic, "major", 2, 4);
    const { container } = render(<Visual notes={notes} rangeStart="C4" octaves={2} />);
    expect(fingerTexts(container)).toEqual([]);
  });
});
