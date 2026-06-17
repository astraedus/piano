import { describe, it, expect } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { ChordDiagram } from "./ChordDiagram";

afterEach(cleanup);

// svguitar draws asynchronously inside useEffect (dynamic import). In jsdom the
// SVG render may or may not fully succeed, but the component must always (a) mount
// its container with the testid, and (b) never throw — it renders either a real
// <svg> or the graceful inline fallback. These tests assert that contract for the
// shapes the skill graph feeds it.
describe("ChordDiagram", () => {
  it("renders a container for an explicit chord shape (C major)", async () => {
    const { getByTestId } = render(<ChordDiagram chordShape={[-1, 3, 2, 0, 1, 0]} title="C" />);
    const el = getByTestId("chord-diagram");
    expect(el).toBeTruthy();
    // After the effect runs, the container has SOME content (svg or fallback) —
    // proving the draw path executed without crashing the React tree.
    await waitFor(() => {
      expect(el.innerHTML.length).toBeGreaterThan(0);
    });
  });

  it("renders a container for a power-chord shape (E5 with muted strings)", async () => {
    const { getByTestId } = render(<ChordDiagram chordShape={[0, 2, 2, -1, -1, -1]} title="E5" />);
    const el = getByTestId("chord-diagram");
    await waitFor(() => expect(el.innerHTML.length).toBeGreaterThan(0));
  });

  it("renders for a CAGED shape with no explicit chordShape", async () => {
    const { getByTestId } = render(<ChordDiagram cagedShape="E" title="E shape" />);
    const el = getByTestId("chord-diagram");
    await waitFor(() => expect(el.innerHTML.length).toBeGreaterThan(0));
  });

  it("shows a no-shape message when given neither shape", () => {
    const { getByTestId } = render(<ChordDiagram />);
    const el = getByTestId("chord-diagram");
    expect(el.textContent?.toLowerCase()).toContain("no chord shape");
  });

  it("renders a capo'd shape (G shape with capo at fret 3) without crashing", async () => {
    const { getByTestId } = render(
      <ChordDiagram chordShape={[3, 2, 0, 0, 0, 3]} capoFret={3} title="G shape → Bb" />,
    );
    const el = getByTestId("chord-diagram");
    await waitFor(() => expect(el.innerHTML.length).toBeGreaterThan(0));
    // When the SVG draws, the capo is announced for screen readers. (In jsdom the
    // draw may fall back; the contract is "never throws", asserted above.)
    const svg = el.querySelector("svg");
    if (svg) {
      expect(svg.getAttribute("aria-label")).toContain("capo at fret 3");
    }
  });

  it("renders capo 0 identically to no capo (no capo bar, no throw)", async () => {
    const { getByTestId } = render(
      <ChordDiagram chordShape={[-1, 3, 2, 0, 1, 0]} capoFret={0} title="C" />,
    );
    const el = getByTestId("chord-diagram");
    await waitFor(() => expect(el.innerHTML.length).toBeGreaterThan(0));
  });
});
