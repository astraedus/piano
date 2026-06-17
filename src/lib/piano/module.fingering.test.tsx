import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { pianoModule } from "./module";
import { scale, KEY_META, keyPrefersFlats } from "../music";

// #4: the piano InstrumentVisual overlays finger numbers for the current key's
// scale when a scaleKey is passed — for ALL 24 keys now (black-key scales
// included), since fingerings.ts is the verified source of truth. With no
// scaleKey it shows notes only.

const Visual = pianoModule.InstrumentVisual;

// Finger numbers render as <text> nodes containing a single digit 1..5
// (labelNotes is off by default, so digits only appear as fingerings).
function fingerTexts(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("text"))
    .map((t) => t.textContent ?? "")
    .filter((s) => /^[1-5]$/.test(s));
}

function renderScale(scaleKey: Parameters<typeof keyPrefersFlats>[0], hand?: "right" | "left") {
  const meta = KEY_META[scaleKey];
  const notes = scale(meta.tonic, meta.mode, 2, 4, keyPrefersFlats(scaleKey));
  return render(<Visual notes={notes} rangeStart="C4" octaves={2} scaleKey={scaleKey} scaleHand={hand} />);
}

describe("PianoInstrumentVisual overlays scale fingerings for the current key", () => {
  it("shows finger numbers for a white-key key (C major)", () => {
    expect(fingerTexts(renderScale("C").container).length).toBeGreaterThan(0);
  });

  it("shows finger numbers for a black-key/flat key (Bb major) — no longer gated out", () => {
    expect(fingerTexts(renderScale("Bb").container).length).toBeGreaterThan(0);
  });

  it("shows finger numbers for Eb major and a black-key minor (F# minor)", () => {
    expect(fingerTexts(renderScale("Eb").container).length).toBeGreaterThan(0);
    expect(fingerTexts(renderScale("fsm").container).length).toBeGreaterThan(0);
  });

  it("renders LH fingerings when scaleHand='left'", () => {
    expect(fingerTexts(renderScale("C", "left").container).length).toBeGreaterThan(0);
  });

  it("shows NO finger numbers when no scaleKey is supplied (notes-only)", () => {
    const notes = scale(KEY_META.C.tonic, "major", 2, 4);
    const { container } = render(<Visual notes={notes} rangeStart="C4" octaves={2} />);
    expect(fingerTexts(container)).toEqual([]);
  });
});
