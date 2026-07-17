import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StaffMap } from "./StaffMap";

afterEach(cleanup);

describe("StaffMap", () => {
  it("renders the diagram container with an accessible role + label", () => {
    render(<StaffMap />);
    expect(screen.getByTestId("staff-map")).toBeTruthy();
    const img = screen.getByRole("img");
    expect(img.getAttribute("aria-label")).toMatch(/grand staff/i);
    // The aria-label spells out both clefs' lines so screen readers get the lesson.
    expect(img.getAttribute("aria-label")).toMatch(/E G B D F/);
    expect(img.getAttribute("aria-label")).toMatch(/G B D F A/);
  });

  it("labels every notehead — exact per-letter counts across both staves + middle C", () => {
    render(<StaffMap />);
    // Treble noteheads E F G A B C D E F, Middle C, bass G A B C D E F G A.
    // getByText reads only direct text nodes, so <g> wrappers don't double-count.
    const expected: Record<string, number> = { A: 3, B: 2, C: 3, D: 2, E: 3, F: 3, G: 3 };
    for (const [letter, count] of Object.entries(expected)) {
      expect(screen.getAllByText(letter).length, `count of "${letter}" noteheads`).toBe(count);
    }
    // 19 noteheads total (9 treble + 1 middle C + 9 bass).
    const total = Object.values(expected).reduce((a, b) => a + b, 0);
    expect(total).toBe(19);
  });

  it("names the treble + bass line and space letter sets in captions", () => {
    render(<StaffMap />);
    expect(screen.getByText(/E G B D F/)).toBeTruthy(); // treble lines
    expect(screen.getByText(/F A C E/)).toBeTruthy(); // treble spaces
    expect(screen.getByText(/G B D F A/)).toBeTruthy(); // bass lines
    expect(screen.getByText(/A C E G/)).toBeTruthy(); // bass spaces
  });

  it("shows the four mnemonics", () => {
    render(<StaffMap />);
    expect(screen.getByText("Every Good Boy Deserves Fudge")).toBeTruthy();
    expect(screen.getByText(/spell the word FACE/i)).toBeTruthy();
    expect(screen.getByText("Good Boys Deserve Fudge Always")).toBeTruthy();
    expect(screen.getByText("All Cows Eat Grass")).toBeTruthy();
  });

  it("labels Middle C on its own row", () => {
    render(<StaffMap />);
    expect(screen.getByText("Middle C")).toBeTruthy();
  });
});
