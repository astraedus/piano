import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { LessonMedia } from "./LessonMedia";
import type { SkillNode } from "@/lib/types";

// Mock @/lib/explain/glossary so we can control lookupTerm in each test.
// The real glossary has audio deps (Tone.js) which are heavy; mocking keeps tests fast.
vi.mock("@/lib/explain/glossary", () => {
  return {
    lookupTerm: vi.fn(),
    GLOSSARY: [],
  };
});

// Mock the guitar visual components — they use SVG/canvas which jsdom can't render.
vi.mock("@/lib/guitar/components/ChordDiagram", () => ({
  ChordDiagram: ({ title }: { title?: string }) => (
    <div data-testid="chord-diagram">{title}</div>
  ),
}));

vi.mock("@/components/CapoTeacher", () => ({
  CapoTeacher: () => <div data-testid="capo-teacher" />,
}));

vi.mock("@/lib/guitar/components/Fretboard", () => ({
  Fretboard: ({ ariaLabel }: { ariaLabel?: string }) => (
    <div data-testid="fretboard" aria-label={ariaLabel} />
  ),
}));

vi.mock("@/lib/guitar/components/Tab", () => ({
  Tab: ({ ariaLabel }: { ariaLabel?: string }) => (
    <div data-testid="tab" aria-label={ariaLabel} />
  ),
}));

vi.mock("@/lib/piano/components/Keyboard", () => ({
  Keyboard: ({ notes }: { notes?: string[] }) => (
    <div data-testid="keyboard">{(notes ?? []).join(",")}</div>
  ),
}));

// Mock StaffMap — its real SVG is exercised in StaffMap.test.tsx; here we only
// assert LessonMedia routes the staff node to it.
vi.mock("@/lib/piano/components/StaffMap", () => ({
  StaffMap: () => <div data-testid="staff-map" />,
}));

// Mock TermVisual so we can control what the term visual renders without the
// real guitar/piano components. Uses the same data-testids so assertions work.
vi.mock("@/components/explain/TermVisual", () => {
  return {
    TermVisual: ({ entry }: { entry: { seeKind: string; title: string } }) => (
      <div data-testid="term-visual" data-seekind={entry.seeKind}>
        {entry.title}
      </div>
    ),
    termHasVisual: (entry: { seeKind: string; seeText?: string }) => {
      if (entry.seeKind === "text") return Boolean(entry.seeText);
      return ["fretboard", "keyboard", "chord-diagram"].includes(entry.seeKind);
    },
  };
});

import { lookupTerm } from "@/lib/explain/glossary";
const mockLookupTerm = lookupTerm as ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ── Fixtures ────────────────────────────────────────────────────────────────

const baseNode: SkillNode = {
  id: "g-t1-power",
  instrument: "guitar",
  title: "Power Chords",
  tier: 1,
  category: "chords",
  prereqs: [],
  masteryDrill: "Slide a power chord up the neck.",
  unlock: "Play the riff to almost any rock song.",
  viz: "chord_diagram",
  chordShape: [0, 2, -1, -1, -1, -1],
};

const noVizNode: SkillNode = {
  id: "g-t1-palmmute",
  instrument: "guitar",
  title: "Palm Muting",
  tier: 1,
  category: "technique",
  prereqs: [],
  masteryDrill: "Mute the strings with your palm.",
  unlock: "The chug sound.",
};

const emptyNode: SkillNode = {
  id: "g-unknown-xyz",
  instrument: "guitar",
  title: "No Term",
  tier: 0,
  category: "technique",
  prereqs: [],
  masteryDrill: "Practice.",
  unlock: "Something.",
};

// viz:"animation" with no chord shape — must fall back to a static visual.
const animationNode: SkillNode = {
  id: "g-t0-posture",
  instrument: "guitar",
  title: "Holding & Pick Grip",
  tier: 0,
  category: "technique",
  prereqs: [],
  masteryDrill: "Wrist relaxed, thumb behind neck.",
  unlock: "Foundation posture.",
  viz: "animation",
};

// viz:"animation" carrying a chord shape — must draw a chord diagram.
const animationChordNode: SkillNode = {
  id: "g-t1-bendshape",
  instrument: "guitar",
  title: "Shaped Animation",
  tier: 1,
  category: "technique",
  prereqs: [],
  masteryDrill: "Bend it.",
  unlock: "Expression.",
  viz: "animation",
  chordShape: [0, 2, 2, -1, -1, -1],
};

// A piano lesson with no viz and no term — default must be the keyboard.
const pianoBareNode: SkillNode = {
  id: "p-unknown-xyz",
  instrument: "piano",
  title: "Some Piano Thing",
  tier: 0,
  category: "technique",
  prereqs: [],
  masteryDrill: "Play.",
  unlock: "Something.",
};

// The capo node gets its dedicated interactive teacher instead of a single
// static visual.
const capoNode: SkillNode = {
  id: "g-t1-capo",
  instrument: "guitar",
  title: "The Capo — One Shape, Every Key",
  tier: 1,
  category: "chords",
  prereqs: ["g-t1-openEM", "g-t1-openDGC"],
  masteryDrill: "Capo on 2, play G/C/D shapes.",
  unlock: "Play in any key with the shapes you know.",
  viz: "chord_diagram",
  chordShape: [-1, 3, 2, 0, 1, 0],
};

// The "Reading the Staff" node gets its dedicated grand-staff diagram, never the
// generic labeled keyboard (which would teach the wrong thing).
const staffNode: SkillNode = {
  id: "p-t0-staff",
  instrument: "piano",
  title: "Reading the Staff",
  tier: 0,
  category: "notation",
  prereqs: ["p-t0-keyboard-map"],
  masteryDrill: "Name treble + bass clef notes on sight.",
  unlock: "Decode a basic score.",
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("LessonMedia", () => {
  describe("(h) the capo node renders the CapoTeacher, not a plain diagram", () => {
    it("renders capo-teacher and not a chord-diagram for g-t1-capo", () => {
      mockLookupTerm.mockReturnValue(undefined);
      render(<LessonMedia node={capoNode} />);
      expect(screen.getByTestId("capo-teacher")).toBeTruthy();
      expect(screen.queryByTestId("chord-diagram")).toBeNull();
    });
  });

  describe("(i) the staff node renders the StaffMap, not the default keyboard", () => {
    it("renders staff-map and not a keyboard for p-t0-staff", () => {
      mockLookupTerm.mockReturnValue(undefined);
      render(<LessonMedia node={staffNode} />);
      expect(screen.getByTestId("staff-map")).toBeTruthy();
      expect(screen.queryByTestId("keyboard")).toBeNull();
    });

    it("the staff map wins even when the node maps to a term with a visual", () => {
      // p-t0-staff maps to the "staff" glossary term; the node-id special case
      // must beat any term/default fallback so the lesson always shows the staff.
      mockLookupTerm.mockReturnValue({
        id: "staff",
        title: "Staff",
        aliases: [],
        what: "...",
        why: "...",
        hear: vi.fn().mockResolvedValue(undefined),
        seeKind: "keyboard",
        seeNotes: ["C4"],
      });
      render(<LessonMedia node={staffNode} />);
      expect(screen.getByTestId("staff-map")).toBeTruthy();
      expect(screen.queryByTestId("keyboard")).toBeNull();
      expect(screen.queryByTestId("term-visual")).toBeNull();
    });
  });

  describe("(a) chord_diagram viz node renders a chord diagram", () => {
    beforeEach(() => {
      // g-t1-power has a glossary term — supply it for audio.
      mockLookupTerm.mockReturnValue(undefined); // audio not needed for this test
    });

    it("renders lesson-media and a chord diagram for a node with viz:chord_diagram", () => {
      render(<LessonMedia node={baseNode} />);
      expect(screen.getByTestId("lesson-media")).toBeTruthy();
      expect(screen.getByTestId("chord-diagram")).toBeTruthy();
    });

    it("does NOT render lesson-media-hear when no term maps", () => {
      mockLookupTerm.mockReturnValue(undefined);
      render(<LessonMedia node={baseNode} />);
      expect(screen.queryByTestId("lesson-media-hear")).toBeNull();
    });
  });

  describe("(b) node with audio term renders Hear it button and calls hear() on click", () => {
    it("renders a Hear it button when the node maps to a glossary term", async () => {
      const hearSpy = vi.fn().mockResolvedValue(undefined);
      mockLookupTerm.mockReturnValue({
        id: "palm-muting",
        title: "Palm Muting",
        aliases: [],
        what: "...",
        why: "...",
        hear: hearSpy,
        seeKind: "text",
        seeText: undefined,
      });

      render(<LessonMedia node={noVizNode} />);
      const btn = screen.getByTestId("lesson-media-hear");
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain("Hear it");
    });

    it("clicking Hear it calls the term's hear() function", async () => {
      const hearSpy = vi.fn().mockResolvedValue(undefined);
      mockLookupTerm.mockReturnValue({
        id: "palm-muting",
        title: "Palm Muting",
        aliases: [],
        what: "...",
        why: "...",
        hear: hearSpy,
        seeKind: "text",
        seeText: undefined,
      });

      render(<LessonMedia node={noVizNode} />);
      const btn = screen.getByTestId("lesson-media-hear");
      await act(async () => {
        fireEvent.click(btn);
      });
      expect(hearSpy).toHaveBeenCalledTimes(1);
    });

    it("does not throw if hear() rejects", async () => {
      const hearSpy = vi.fn().mockRejectedValue(new Error("audio error"));
      mockLookupTerm.mockReturnValue({
        id: "palm-muting",
        title: "Palm Muting",
        aliases: [],
        what: "...",
        why: "...",
        hear: hearSpy,
        seeKind: "text",
        seeText: undefined,
      });

      render(<LessonMedia node={noVizNode} />);
      const btn = screen.getByTestId("lesson-media-hear");
      // Should not throw
      await act(async () => {
        fireEvent.click(btn);
      });
      // Button is re-enabled after the error is swallowed
      expect((btn as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe("(c) bare setup node with no viz and no term still renders a default visual", () => {
    it("renders the guitar default (Fretboard) for a bare guitar node — never empty", () => {
      mockLookupTerm.mockReturnValue(undefined);
      render(<LessonMedia node={emptyNode} />);
      expect(screen.getByTestId("lesson-media")).toBeTruthy();
      expect(screen.getByTestId("fretboard")).toBeTruthy();
      // No term → no audio button.
      expect(screen.queryByTestId("lesson-media-hear")).toBeNull();
    });

    it("renders the piano default (Keyboard) for a bare piano node", () => {
      mockLookupTerm.mockReturnValue(undefined);
      render(<LessonMedia node={pianoBareNode} />);
      expect(screen.getByTestId("lesson-media")).toBeTruthy();
      expect(screen.getByTestId("keyboard")).toBeTruthy();
    });
  });

  describe("(d) node with a term with visual but no node.viz falls back to TermVisual", () => {
    it("renders TermVisual when no node.viz but term has a visual", () => {
      const entry = {
        id: "palm-muting",
        title: "Palm Muting",
        aliases: [],
        what: "...",
        why: "...",
        hear: vi.fn().mockResolvedValue(undefined),
        seeKind: "fretboard",
        seeNotes: ["A2"],
      };
      mockLookupTerm.mockReturnValue(entry);

      render(<LessonMedia node={noVizNode} />);
      expect(screen.getByTestId("lesson-media")).toBeTruthy();
      expect(screen.getByTestId("term-visual")).toBeTruthy();
    });
  });

  describe("(e) node with viz:chord_diagram AND a term renders both visual and audio", () => {
    it("shows chord diagram AND Hear it when node has viz and a term with audio", () => {
      const hearSpy = vi.fn().mockResolvedValue(undefined);
      mockLookupTerm.mockReturnValue({
        id: "power-chord",
        title: "Power Chord",
        aliases: [],
        what: "...",
        why: "...",
        hear: hearSpy,
        seeKind: "chord-diagram",
        seeChordShape: [0, 2, -1, -1, -1, -1],
      });

      render(<LessonMedia node={baseNode} />);
      expect(screen.getByTestId("chord-diagram")).toBeTruthy();
      expect(screen.getByTestId("lesson-media-hear")).toBeTruthy();
    });
  });

  describe("(f) viz:animation falls back to a static visual instead of nothing", () => {
    it("renders the instrument default (Fretboard) for an animation node with no shape", () => {
      mockLookupTerm.mockReturnValue(undefined);
      render(<LessonMedia node={animationNode} />);
      expect(screen.getByTestId("lesson-media")).toBeTruthy();
      expect(screen.getByTestId("fretboard")).toBeTruthy();
    });

    it("renders a chord diagram for an animation node that carries a chord shape", () => {
      mockLookupTerm.mockReturnValue(undefined);
      render(<LessonMedia node={animationChordNode} />);
      expect(screen.getByTestId("chord-diagram")).toBeTruthy();
      // Falls back to the chord shape, not the bare neck.
      expect(screen.queryByTestId("fretboard")).toBeNull();
    });
  });

  describe("(g) exactly one visual renders (no double-render)", () => {
    it("renders ONLY the node viz, not also the term visual, when both exist", () => {
      mockLookupTerm.mockReturnValue({
        id: "power-chord",
        title: "Power Chord",
        aliases: [],
        what: "...",
        why: "...",
        hear: vi.fn().mockResolvedValue(undefined),
        seeKind: "chord-diagram",
        seeChordShape: [0, 2, -1, -1, -1, -1],
      });
      render(<LessonMedia node={baseNode} />);
      // node.viz wins; TermVisual must not also render.
      expect(screen.getByTestId("chord-diagram")).toBeTruthy();
      expect(screen.queryByTestId("term-visual")).toBeNull();
    });
  });
});
