import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { CapoTeacher } from "./CapoTeacher";

// ChordDiagram dynamically imports svguitar (touches document) — stub it so the
// teacher's logic is tested without the async SVG draw. We assert the capoFret it
// receives, which is the load-bearing wiring between the calculator and the diagram.
vi.mock("@/lib/guitar/components/ChordDiagram", () => ({
  ChordDiagram: ({ capoFret, title }: { capoFret?: number; title?: string }) => (
    <div data-testid="chord-diagram" data-capofret={capoFret ?? 0}>
      {title}
    </div>
  ),
}));

afterEach(cleanup);

describe("CapoTeacher — calculator", () => {
  it("defaults to the most common move: G shape → A = capo 2", () => {
    render(<CapoTeacher />);
    const result = screen.getByTestId("capo-result");
    expect(result.textContent).toContain("fret 2");
    expect(result.textContent).toContain("G shape");
    expect(result.textContent).toContain("A");
    expect(screen.getByTestId("chord-diagram").getAttribute("data-capofret")).toBe("2");
  });

  it("recomputes the fret when the target key changes (G shape → Bb = capo 3)", () => {
    render(<CapoTeacher />);
    fireEvent.change(screen.getByTestId("capo-target-key"), { target: { value: "10" } }); // Bb
    const result = screen.getByTestId("capo-result");
    expect(result.textContent).toContain("fret 3");
    expect(result.textContent).toContain("Bb");
    expect(screen.getByTestId("chord-diagram").getAttribute("data-capofret")).toBe("3");
  });

  it("recomputes when the shape changes (C shape → A = capo 9)", () => {
    render(<CapoTeacher />);
    fireEvent.change(screen.getByTestId("capo-shape"), { target: { value: "C" } });
    // target is still A (pc 9); C shape open = C (pc 0) → fret 9
    expect(screen.getByTestId("capo-result").textContent).toContain("fret 9");
    expect(screen.getByTestId("chord-diagram").getAttribute("data-capofret")).toBe("9");
  });

  it("says 'no capo' when the shape already sounds the target key (E shape → E)", () => {
    render(<CapoTeacher />);
    fireEvent.change(screen.getByTestId("capo-shape"), { target: { value: "E" } });
    fireEvent.change(screen.getByTestId("capo-target-key"), { target: { value: "4" } }); // E
    const result = screen.getByTestId("capo-result");
    expect(result.textContent?.toLowerCase()).toContain("no capo");
    expect(screen.getByTestId("chord-diagram").getAttribute("data-capofret")).toBe("0");
  });
});

describe("CapoTeacher — static chart", () => {
  it("renders a row per CAGED shape with the correct sounding keys", () => {
    render(<CapoTeacher />);
    const gRow = screen.getByTestId("capo-chart-row-G");
    const cells = within(gRow).getAllByRole("cell").map((c) => c.textContent);
    // G shape across open..7: G Ab A Bb B C Db D — flat keys spelled flat per the
    // conventional fewest-accidentals table (Ab/Bb/Db, not G#/A#/C#).
    expect(cells).toEqual(["G", "Ab", "A", "Bb", "B", "C", "Db", "D"]);
  });

  it("shows all five shape rows", () => {
    render(<CapoTeacher />);
    for (const shape of ["C", "A", "G", "E", "D"]) {
      expect(screen.getByTestId(`capo-chart-row-${shape}`)).toBeTruthy();
    }
  });
});
