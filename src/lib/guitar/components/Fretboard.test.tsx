import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Fretboard } from "./Fretboard";
import type { FretPosition } from "@/lib/types";

afterEach(cleanup);

// Note dots are the r=7 circles (inlay markers are r=3).
const dotCount = (c: HTMLElement) => c.querySelectorAll('circle[r="7"]').length;

describe("Fretboard rendering", () => {
  it("plots exactly one dot per supplied position", () => {
    const positions: FretPosition[] = [
      { string: 1, fret: 5, root: true },
      { string: 2, fret: 5 },
      { string: 3, fret: 7 },
    ];
    const { container } = render(<Fretboard positions={positions} />);
    expect(dotCount(container)).toBe(3);
  });

  it("falls back to the 12-dot Am pentatonic box when given no positions", () => {
    const { container } = render(<Fretboard />);
    expect(dotCount(container)).toBe(12);
  });

  it("renders a dot's label inside the neck", () => {
    const { container } = render(
      <Fretboard positions={[{ string: 6, fret: 7, label: "H" }]} />,
    );
    expect(container.textContent).toContain("H");
  });

  describe("fret-window auto-framing (no explicit startFret)", () => {
    it("frames an up-neck shape with a position label instead of the nut", () => {
      // min fret 7, nothing open/low → window starts at fret 6 ("6fr" label).
      const { container } = render(<Fretboard positions={[{ string: 1, fret: 7 }]} />);
      expect(container.textContent).toContain("6fr");
    });

    it("shows the nut (no position label) when a shape has open/low notes", () => {
      const { container } = render(
        <Fretboard positions={[{ string: 1, fret: 0 }, { string: 2, fret: 2 }]} />,
      );
      expect(container.textContent).not.toContain("fr");
    });

    it("respects an explicit startFret over the auto-frame", () => {
      const { container } = render(
        <Fretboard positions={[{ string: 1, fret: 9 }]} startFret={3} />,
      );
      expect(container.textContent).toContain("3fr");
    });
  });
});
