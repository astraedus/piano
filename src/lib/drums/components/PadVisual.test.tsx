import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PadVisual } from "./PadVisual";

afterEach(cleanup);

describe("PadVisual", () => {
  it("renders an accessible pad SVG with both hand labels", () => {
    render(<PadVisual />);
    const svg = screen.getByRole("img");
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg.getAttribute("aria-label")).toMatch(/practice pad/i);
    const labels = Array.from(svg.querySelectorAll("text")).map((t) => t.textContent);
    expect(labels).toContain("R");
    expect(labels).toContain("L");
  });

  it("uses a custom aria-label when given", () => {
    render(<PadVisual ariaLabel="the four strokes on the practice pad" />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("the four strokes on the practice pad");
  });

  it("adds a strike ripple only when a hand is highlighted", () => {
    const { container: plain } = render(<PadVisual />);
    const plainEllipses = plain.querySelectorAll("ellipse").length;
    cleanup();
    const { container: lit } = render(<PadVisual highlight="R" />);
    const litEllipses = lit.querySelectorAll("ellipse").length;
    // The two ripple ellipses appear only in the highlighted state.
    expect(litEllipses).toBeGreaterThan(plainEllipses);
  });
});
