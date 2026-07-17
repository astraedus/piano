import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { vi } from "vitest";
import { TermVisual, termHasVisual, resolveSee } from "./TermVisual";
import type { GlossaryEntry } from "@/lib/explain/glossary";

// Mock the SVG child components so we can inspect the props TermVisual hands them.
vi.mock("@/lib/guitar/components/Fretboard", () => ({
  Fretboard: ({ positions, ariaLabel }: { positions?: unknown[]; ariaLabel?: string }) => (
    <div data-testid="fretboard" data-count={String(positions?.length ?? 0)} aria-label={ariaLabel} />
  ),
}));
vi.mock("@/lib/piano/components/Keyboard", () => ({
  Keyboard: ({ notes }: { notes?: string[] }) => (
    <div data-testid="keyboard">{(notes ?? []).join(",")}</div>
  ),
}));
vi.mock("@/lib/guitar/components/ChordDiagram", () => ({
  ChordDiagram: ({ title }: { title?: string }) => <div data-testid="chord-diagram">{title}</div>,
}));

afterEach(cleanup);

const base = { aliases: [], what: "w", why: "y", hear: async () => {} };

const fretEntry: GlossaryEntry = {
  ...base,
  id: "vibrato",
  title: "Vibrato",
  seeKind: "fretboard",
  seePositions: [{ string: 6, fret: 5 }],
  instrument: "guitar",
};

// A shared concept: fretboard by default, keyboard on piano.
const sharedEntry: GlossaryEntry = {
  ...base,
  id: "improvisation",
  title: "Improvisation",
  seeKind: "fretboard",
  seePositions: [{ string: 6, fret: 5 }, { string: 5, fret: 5 }],
  seeByInstrument: { piano: { seeKind: "keyboard", seeNotes: ["A4", "C5"] } },
};

const textEntry: GlossaryEntry = { ...base, id: "phrasing", title: "Phrasing", seeKind: "text", seeText: "a phrase" };
const textEmpty: GlossaryEntry = { ...base, id: "bpm", title: "BPM", seeKind: "text" };

describe("resolveSee", () => {
  it("returns the primary SEE with no instrument", () => {
    expect(resolveSee(sharedEntry).seeKind).toBe("fretboard");
  });
  it("returns the per-instrument override when present", () => {
    expect(resolveSee(sharedEntry, "piano").seeKind).toBe("keyboard");
  });
  it("falls back to the primary when the instrument has no override", () => {
    expect(resolveSee(sharedEntry, "guitar").seeKind).toBe("fretboard");
    expect(resolveSee(fretEntry, "piano").seeKind).toBe("fretboard"); // guitar-only, no override
  });
});

describe("termHasVisual", () => {
  it("true for a fretboard entry, false for empty text", () => {
    expect(termHasVisual(fretEntry)).toBe(true);
    expect(termHasVisual(textEntry)).toBe(true);
    expect(termHasVisual(textEmpty)).toBe(false);
  });
  it("resolves per instrument (piano override is a keyboard → still has a visual)", () => {
    expect(termHasVisual(sharedEntry, "piano")).toBe(true);
    expect(termHasVisual(sharedEntry, "guitar")).toBe(true);
  });
});

describe("TermVisual rendering", () => {
  it("renders a fretboard with the entry's authored positions", () => {
    render(<TermVisual entry={fretEntry} />);
    expect(screen.getByTestId("fretboard").getAttribute("data-count")).toBe("1");
  });

  it("renders a piano keyboard for a shared term on piano (never the guitar neck)", () => {
    render(<TermVisual entry={sharedEntry} instrument="piano" />);
    expect(screen.getByTestId("keyboard").textContent).toBe("A4,C5");
    expect(screen.queryByTestId("fretboard")).toBeNull();
  });

  it("keeps the fretboard for the same shared term on guitar", () => {
    render(<TermVisual entry={sharedEntry} instrument="guitar" />);
    expect(screen.getByTestId("fretboard").getAttribute("data-count")).toBe("2");
    expect(screen.queryByTestId("keyboard")).toBeNull();
  });

  it("renders text when present and nothing when empty", () => {
    const { container, rerender } = render(<TermVisual entry={textEntry} />);
    expect(container.textContent).toContain("a phrase");
    rerender(<TermVisual entry={textEmpty} />);
    expect(container.querySelector("[data-testid]")).toBeNull();
  });
});
