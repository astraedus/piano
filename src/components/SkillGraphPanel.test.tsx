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

  it("renders the P4 viz extension slot keyed off node.viz, and omits it otherwise", () => {
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
    const slot = screen.getByTestId("sg-viz-slot");
    expect(slot.getAttribute("data-viz")).toBe("chord_diagram");

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
    expect(screen.queryByTestId("sg-viz-slot")).toBeNull();
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
});
