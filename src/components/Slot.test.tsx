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
