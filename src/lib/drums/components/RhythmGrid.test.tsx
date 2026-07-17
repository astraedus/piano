import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RhythmGrid, stickingToText, countRowText } from "./RhythmGrid";
import type { StickingCell } from "../../types";

afterEach(cleanup);

const PATTERN: StickingCell[] = [
  { hand: "R", accent: true, count: "1" },
  { hand: "L", count: "&" },
  { rest: true, count: "2" },
  { hand: "R", count: "&" },
];

describe("RhythmGrid", () => {
  it("renders the sticking row: hands, a rest as '–', in order", () => {
    render(<RhythmGrid pattern={PATTERN} />);
    expect(screen.getByTestId("rg-stick-0").textContent).toBe("R");
    expect(screen.getByTestId("rg-stick-1").textContent).toBe("L");
    expect(screen.getByTestId("rg-stick-2").textContent).toBe("–"); // rest
    expect(screen.getByTestId("rg-stick-3").textContent).toBe("R");
  });

  it("renders the count syllables and an accent wedge for accented hits", () => {
    const { container } = render(<RhythmGrid pattern={PATTERN} />);
    const text = container.textContent ?? "";
    expect(text).toContain("1");
    expect(text).toContain("&");
    expect(text).toContain(">"); // the accent on beat 1
  });

  it("falls back to a default single-stroke bar when given no pattern", () => {
    render(<RhythmGrid />);
    // Default is R L R L quarters.
    expect(screen.getByTestId("rg-stick-0").textContent).toBe("R");
    expect(screen.getByTestId("rg-stick-1").textContent).toBe("L");
  });

  it("exposes an accessible label describing the pattern", () => {
    render(<RhythmGrid pattern={PATTERN} ariaLabel="the paradiddle" />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("the paradiddle");
  });
});

describe("RhythmGrid pure helpers", () => {
  it("stickingToText marks accents with '>' and rests with '–'", () => {
    expect(stickingToText(PATTERN)).toBe("R> L – R");
  });

  it("countRowText joins the count syllables", () => {
    expect(countRowText(PATTERN)).toBe("1 & 2 &");
  });
});
