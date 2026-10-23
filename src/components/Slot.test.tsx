import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Slot } from "./Slot";

// jsdom has no scrollIntoView; the NOW slot calls it after a timeout.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("Slot — honest, labeled toggle affordance", () => {
  it("the NOW block's toggle is an aria-labeled expand/collapse naming it the start-here block", () => {
    render(
      <Slot index={1} title="Warmup" summary="warm up" isNow status="active">
        body
      </Slot>,
    );
    const btn = screen.getByRole("button", { name: /Warmup block.*start here/i });
    // NOW slots auto-expand, so the toggle reports expanded.
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("a non-NOW block's toggle is labeled without the start-here marker", () => {
    render(
      <Slot index={2} title="The Piece" summary="piece">
        body
      </Slot>,
    );
    const btn = screen.getByRole("button", { name: /The Piece block/i });
    expect(btn.getAttribute("aria-label")).not.toContain("start here");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });
});

// Regression (390px warmup overflow, 2026-10-23). jsdom has no layout engine, so the
// guard is on the class that carries the fix: the body is a single-column grid under
// `overflow-hidden`, and a grid item's automatic minimum width is its content's
// min-content width. Without `min-w-0`, one intrinsically wide child (the 540px
// notation SVG) stretched the column and everything past the card was silently
// clipped. Verified in a real browser: documentElement.scrollWidth stays at the
// viewport width and `.slot-body` scrollWidth == clientWidth at 390px.
describe("Slot — body cannot be widened by its content", () => {
  it("the open body's grid item can shrink below its content (min-w-0 + min-h-0)", () => {
    const { container } = render(
      <Slot index={1} title="Warmup" summary="warm up" isNow status="active">
        <div style={{ width: 900 }}>wide child</div>
      </Slot>,
    );
    const item = container.querySelector(".slot-body > div");
    expect(item).not.toBeNull();
    expect(item!.classList.contains("min-w-0")).toBe(true);
    expect(item!.classList.contains("min-h-0")).toBe(true);
  });
});
