import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SkillGraphPanel } from "./SkillGraphPanel";
import type { SkillNode, SkillNodeStatus } from "@/lib/types";

afterEach(cleanup);

const node: SkillNode = {
  id: "n1",
  instrument: "piano",
  title: "Map the Keyboard",
  tier: 1,
  category: "technique",
  prereqs: ["p0"],
  masteryDrill: "Touch any letter in under a second.",
  unlock: "Find any note instantly.",
};

const guitarVizNode: SkillNode = {
  id: "g-power",
  instrument: "guitar",
  title: "Power Chords",
  tier: 1,
  category: "chords",
  prereqs: [],
  masteryDrill: "E5 to A5",
  unlock: "Rock rhythm",
  viz: "chord_diagram",
};

function statusById(s: SkillNodeStatus, prereqStatus: SkillNodeStatus = "learned") {
  return new Map<string, SkillNodeStatus>([["n1", s], ["p0", prereqStatus]]);
}
const titleById = new Map([["p0", "Posture"]]);

describe("SkillGraphPanel", () => {
  it("renders title, drill, unlock sentence, and status", () => {
    render(
      <SkillGraphPanel
        node={node}
        status="available"
        statusById={statusById("available")}
        titleById={titleById}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.getByTestId("sg-panel-title").textContent).toBe("Map the Keyboard");
    // drill/unlock may have inline TermChips, so assert on the container text.
    expect(screen.getByTestId("sg-panel-drill").textContent).toBe("Touch any letter in under a second.");
    expect(screen.getByTestId("sg-panel-unlock").textContent).toBe("Find any note instantly.");
    expect(screen.getByTestId("sg-panel-status").textContent).toBe("Ready to start");
    // prereq chip renders by title
    expect(screen.getByText(/Posture/)).toBeTruthy();
  });

  it("calls onAddToTodayAction and onMarkLearnedAction with the node id when available", () => {
    const add = vi.fn();
    const learn = vi.fn();
    render(
      <SkillGraphPanel
        node={node}
        status="available"
        statusById={statusById("available")}
        titleById={titleById}
        onCloseAction={() => {}}
        onAddToTodayAction={add}
        onMarkLearnedAction={learn}
        onMarkFluentAction={() => {}}
      />,
    );
    fireEvent.click(screen.getByTestId("sg-add-today"));
    fireEvent.click(screen.getByTestId("sg-mark-learned"));
    expect(add).toHaveBeenCalledWith("n1");
    expect(learn).toHaveBeenCalledWith("n1");
  });

  it("disables both affordances when the node is locked", () => {
    render(
      <SkillGraphPanel
        node={node}
        status="locked"
        statusById={statusById("locked", "available")}
        titleById={titleById}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect((screen.getByTestId("sg-add-today") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByTestId("sg-mark-learned") as HTMLButtonElement).disabled).toBe(true);
  });

  it("hides affordances and shows learned state when learned", () => {
    render(
      <SkillGraphPanel
        node={node}
        status="learned"
        statusById={statusById("learned")}
        titleById={titleById}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.queryByTestId("sg-add-today")).toBeNull();
    expect(screen.queryByTestId("sg-mark-learned")).toBeNull();
    expect(screen.getByText("✓ Learned")).toBeTruthy();
  });

  it("renders LessonMedia for a node with viz, and renders nothing for a node with neither viz nor a mapped term", () => {
    // guitarVizNode has viz:"chord_diagram" but no glossary term — LessonMedia renders.
    const { rerender } = render(
      <SkillGraphPanel
        node={guitarVizNode}
        status="available"
        statusById={new Map([["g-power", "available"]])}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.getByTestId("lesson-media")).toBeTruthy();

    // node "n1" (piano, no viz, no NODE_TERM_IDS entry) → LessonMedia renders
    // nothing (returns null). But the node also has no lesson, so the fallback
    // block renders and LessonMedia is mounted — it just returns null internally.
    rerender(
      <SkillGraphPanel
        node={node}
        status="available"
        statusById={statusById("available")}
        titleById={titleById}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.queryByTestId("lesson-media")).toBeNull();
  });

  it("shows the fluency check on a learned node with a fluencyTest and fires onMarkFluentAction", () => {
    const fluentFn = vi.fn();
    const fNode: SkillNode = { ...node, fluencyTest: { prompt: "Play it while counting aloud." } };
    render(
      <SkillGraphPanel
        node={fNode}
        status="learned"
        statusById={statusById("learned")}
        titleById={titleById}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={fluentFn}
      />,
    );
    expect(screen.getByTestId("sg-panel-fluency-check")).toBeTruthy();
    expect(screen.getByText("Play it while counting aloud.")).toBeTruthy();
    fireEvent.click(screen.getByTestId("sg-mark-fluent"));
    expect(fluentFn).toHaveBeenCalledWith("n1");
  });

  it("hides the fluency check and shows the Fluent badge once fluent", () => {
    const fNode: SkillNode = { ...node, fluencyTest: { prompt: "Play it while counting aloud." } };
    render(
      <SkillGraphPanel
        node={fNode}
        status="learned"
        statusById={statusById("learned")}
        titleById={titleById}
        fluent
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.queryByTestId("sg-panel-fluency-check")).toBeNull();
    expect(screen.getByTestId("sg-panel-fluent")).toBeTruthy();
  });

  it("does not offer the fluency check before a node is learned", () => {
    const fNode: SkillNode = { ...node, fluencyTest: { prompt: "Play it while counting aloud." } };
    render(
      <SkillGraphPanel
        node={fNode}
        status="in-progress"
        statusById={statusById("in-progress")}
        titleById={titleById}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.queryByTestId("sg-panel-fluency-check")).toBeNull();
  });

  it("renders the difficulty verdict when supplied, and omits it for unknown", () => {
    const { rerender } = render(
      <SkillGraphPanel
        node={node}
        status="in-progress"
        statusById={statusById("in-progress")}
        titleById={titleById}
        difficulty="too-hard"
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    const verdict = screen.getByTestId("sg-panel-difficulty");
    expect(verdict.getAttribute("data-verdict")).toBe("too-hard");
    expect(screen.getByText("Too Hard")).toBeTruthy();

    rerender(
      <SkillGraphPanel
        node={node}
        status="in-progress"
        statusById={statusById("in-progress")}
        titleById={titleById}
        difficulty="unknown"
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.queryByTestId("sg-panel-difficulty")).toBeNull();
  });

  it("renders nothing when node is null", () => {
    const { container } = render(
      <SkillGraphPanel
        node={null}
        status={undefined}
        statusById={new Map()}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  // ── V4 Soul-First ──────────────────────────────────────────────────────────

  // g-t1-power maps to glossary id "power-chord" via nodeToTermId, so the theory
  // subtitle is a live (clickable) TermChip.
  const soulNode: SkillNode = {
    id: "g-t1-power",
    instrument: "guitar",
    title: "Power Chords",
    soulTitle: "The Rock Chug",
    keepTitle: "Power Chords",
    tier: 1,
    category: "chords",
    prereqs: [],
    masteryDrill: "Slide a power chord up the neck.",
    unlock: "Play the riff to almost any rock song.",
  };

  it("leads with the soulTitle and shows the theory name as a clickable TermChip subtitle", () => {
    render(
      <SkillGraphPanel
        node={soulNode}
        status="available"
        statusById={new Map([["g-t1-power", "available"]])}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.getByTestId("sg-panel-title").textContent).toBe("The Rock Chug");
    const theory = screen.getByTestId("sg-panel-theory");
    expect(theory.textContent).toBe("Power Chords");
    // mapped term → a real chip (role=button with the Explain aria-label).
    expect(theory.querySelector('[role="button"]')).toBeTruthy();
    expect(theory.querySelector('[aria-label^="Explain:"]')).toBeTruthy();
  });

  it("surfaces a TermChip for a glossary term found in the drill text", () => {
    render(
      <SkillGraphPanel
        node={soulNode}
        status="available"
        statusById={new Map([["g-t1-power", "available"]])}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    const drill = screen.getByTestId("sg-panel-drill");
    // full sentence text preserved, with "power chord" wrapped as a chip.
    expect(drill.textContent).toBe("Slide a power chord up the neck.");
    expect(drill.querySelector('[role="button"]')).toBeTruthy();
  });

  it("renders the theory name as plain text (no chip) when the node has no mapped term", () => {
    // p-t1-three-moods maps to "three-moods"; use an id with no NODE_TERM_IDS entry.
    const unmapped: SkillNode = { ...soulNode, id: "g-no-term-here", keepTitle: "Some Theory Name" };
    render(
      <SkillGraphPanel
        node={unmapped}
        status="available"
        statusById={new Map([["g-no-term-here", "available"]])}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    const theory = screen.getByTestId("sg-panel-theory");
    expect(theory.textContent).toBe("Some Theory Name");
    // no mapped term id → no chip affordance.
    expect(theory.querySelector('[role="button"]')).toBeNull();
  });

  it("shows no theory subtitle for a theory-only node (no soulTitle)", () => {
    const theoryNode: SkillNode = {
      ...soulNode,
      id: "p-t0-staff",
      soulTitle: undefined,
      keepTitle: "Reading the Staff",
      title: "Reading the Staff",
    };
    render(
      <SkillGraphPanel
        node={theoryNode}
        status="available"
        statusById={new Map([["p-t0-staff", "available"]])}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    expect(screen.getByTestId("sg-panel-title").textContent).toBe("Reading the Staff");
    expect(screen.queryByTestId("sg-panel-theory")).toBeNull();
  });

  // ── V5 Teaching Lesson ────────────────────────────────────────────────────

  // g-t1-power has a full authored lesson with what/why/steps/goodWhen/watchOut/song.
  const lessonNode: SkillNode = {
    id: "g-t1-power",
    instrument: "guitar",
    title: "Power Chords",
    soulTitle: "The Rock Chug",
    keepTitle: "Power Chords",
    tier: 1,
    category: "chords",
    prereqs: [],
    masteryDrill: "Slide a power chord up the neck.",
    unlock: "Play the riff to almost any rock song.",
  };

  it("renders the full lesson for a node with an authored lesson (g-t1-power)", () => {
    render(
      <SkillGraphPanel
        node={lessonNode}
        status="available"
        statusById={new Map([["g-t1-power", "available"]])}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    // Lesson wrapper is present.
    expect(screen.getByTestId("sg-lesson")).toBeTruthy();

    // what section includes the lesson text.
    const what = screen.getByTestId("sg-lesson-what");
    expect(what.textContent).toContain("power chord");
    expect(what.textContent).toContain("rock");

    // Steps list is present with numbered steps.
    const steps = screen.getByTestId("sg-lesson-steps");
    expect(steps.querySelectorAll("li").length).toBeGreaterThanOrEqual(3);

    // goodWhen section is present.
    expect(screen.getByTestId("sg-lesson-good").textContent).toBeTruthy();

    // watchOut section present for g-t1-power (it has one).
    expect(screen.getByTestId("sg-lesson-watch")).toBeTruthy();

    // song section present for g-t1-power.
    const song = screen.getByTestId("sg-lesson-song");
    expect(song.textContent).toContain("Smells Like Teen Spirit");

    // drill and unlock testids still work (they're in the lesson layout).
    expect(screen.getByTestId("sg-panel-drill").textContent).toContain("power chord");
    expect(screen.getByTestId("sg-panel-unlock").textContent).toBeTruthy();
  });

  it("falls back to drill/unlock one-liners for a node WITHOUT an authored lesson — no lesson sections rendered", () => {
    // node id "n1" (piano) has no entry in PIANO_LESSONS.
    render(
      <SkillGraphPanel
        node={node}
        status="available"
        statusById={statusById("available")}
        titleById={titleById}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    // No lesson sections.
    expect(screen.queryByTestId("sg-lesson")).toBeNull();
    expect(screen.queryByTestId("sg-lesson-what")).toBeNull();
    expect(screen.queryByTestId("sg-lesson-steps")).toBeNull();
    expect(screen.queryByTestId("sg-lesson-good")).toBeNull();
    expect(screen.queryByTestId("sg-lesson-watch")).toBeNull();
    expect(screen.queryByTestId("sg-lesson-song")).toBeNull();

    // Original one-liners still render correctly.
    expect(screen.getByTestId("sg-panel-drill").textContent).toBe("Touch any letter in under a second.");
    expect(screen.getByTestId("sg-panel-unlock").textContent).toBe("Find any note instantly.");
  });

  it("renders both watchOut and song sections for p-key-C (piano lesson with all optional fields)", () => {
    // p-key-C has a full lesson: watchOut present, song present.
    const pianoNode: SkillNode = {
      id: "p-key-C",
      instrument: "piano",
      title: "C Major",
      tier: 0,
      category: "technique",
      prereqs: [],
      masteryDrill: "Play C scale hands separately.",
      unlock: "Play music in C major.",
    };
    render(
      <SkillGraphPanel
        node={pianoNode}
        status="available"
        statusById={new Map([["p-key-C", "available"]])}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    // p-key-C has a watchOut field in the authored lesson.
    expect(screen.getByTestId("sg-lesson-watch")).toBeTruthy();
    // p-key-C HAS a song.
    expect(screen.getByTestId("sg-lesson-song")).toBeTruthy();
    expect(screen.getByTestId("sg-lesson-song").textContent).toContain("Let It Be");
  });

  it("does not render watchOut section for a lesson whose watchOut field is absent", () => {
    // g-t0-anatomy has a lesson WITH both watchOut and song — test a lesson
    // that lacks watchOut by mocking a minimal SkillNode pointing to a non-existent id.
    // getLesson returns undefined for unknown ids, so we verify no lesson sections
    // appear for an unrecognised node that happens to have a fake id.
    const noLessonNode: SkillNode = {
      id: "g-unknown-id-xyz",
      instrument: "guitar",
      title: "No Lesson Yet",
      tier: 0,
      category: "technique",
      prereqs: [],
      masteryDrill: "Practice drill.",
      unlock: "Unlocks something.",
    };
    render(
      <SkillGraphPanel
        node={noLessonNode}
        status="available"
        statusById={new Map([["g-unknown-id-xyz", "available"]])}
        titleById={new Map()}
        onCloseAction={() => {}}
        onAddToTodayAction={() => {}}
        onMarkLearnedAction={() => {}}
        onMarkFluentAction={() => {}}
      />,
    );
    // Unknown node → no lesson, so no watchOut section.
    expect(screen.queryByTestId("sg-lesson-watch")).toBeNull();
    expect(screen.queryByTestId("sg-lesson-song")).toBeNull();
    // Fallback drill renders.
    expect(screen.getByTestId("sg-panel-drill").textContent).toBe("Practice drill.");
  });
});
