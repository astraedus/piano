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
      />,
    );
    expect(screen.getByText("Map the Keyboard")).toBeTruthy();
    expect(screen.getByText("Touch any letter in under a second.")).toBeTruthy();
    expect(screen.getByText("Find any note instantly.")).toBeTruthy();
    expect(screen.getByTestId("sg-panel-status").textContent).toBe("ready to start");
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
      />,
    );
    expect(screen.queryByTestId("sg-add-today")).toBeNull();
    expect(screen.queryByTestId("sg-mark-learned")).toBeNull();
    expect(screen.getByText("✓ learned")).toBeTruthy();
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
      />,
    );
    expect(screen.queryByTestId("sg-viz-slot")).toBeNull();
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
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
