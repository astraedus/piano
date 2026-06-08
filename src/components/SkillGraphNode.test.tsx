import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// xyflow Handle/Position are the only xyflow surface the node touches.
vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom" },
}));

import type { NodeProps } from "@xyflow/react";
import { SkillGraphNode } from "./SkillGraphNode";
import type { SkillGraphNodeData } from "@/lib/skillGraphLayout";
import type { SkillNode, SkillNodeStatus } from "@/lib/types";

afterEach(cleanup);

const baseNode: SkillNode = {
  id: "n1",
  instrument: "piano",
  title: "Power Chords",
  tier: 2,
  category: "chords",
  prereqs: [],
  masteryDrill: "d",
  unlock: "u",
};

function renderNode(status: SkillNodeStatus, isFrontier = false, fluent = false) {
  const data: SkillGraphNodeData = {
    node: baseNode,
    status,
    isFrontier,
    tierColor: "var(--color-tier-2)",
    fluent,
  };
  // NodeProps has many required fields the component never reads; build a minimal
  // shape and cast through NodeProps so tsc stays happy without spreading.
  const props = { id: "n1", data, selected: false } as unknown as NodeProps;
  return render(<SkillGraphNode {...props} />);
}

describe("SkillGraphNode", () => {
  it("renders title + tier/category and exposes status/frontier as data attrs", () => {
    renderNode("available", true);
    const el = screen.getByTestId("sg-node-n1");
    expect(el.getAttribute("data-status")).toBe("available");
    expect(el.getAttribute("data-frontier")).toBe("true");
    expect(screen.getByText("Power Chords")).toBeTruthy();
    expect(screen.getByText(/tier 2 · chords/)).toBeTruthy();
  });

  it("learned node shows a check glyph", () => {
    renderNode("learned");
    expect(screen.getByText("✓")).toBeTruthy();
  });

  it("frontier node (non-learned) gets the pulse class; learned does not", () => {
    const { container: c1 } = renderNode("available", true);
    expect(c1.querySelector(".sg-pulse")).toBeTruthy();
    cleanup();
    const { container: c2 } = renderNode("learned", true);
    expect(c2.querySelector(".sg-pulse")).toBeNull();
  });

  it("locked node is dimmed (opacity utility) and not pulsing", () => {
    const { container } = renderNode("locked", false);
    expect(container.querySelector(".opacity-60")).toBeTruthy();
    expect(container.querySelector(".sg-pulse")).toBeNull();
  });

  it("shows the Fluent badge only when the node is fluent (R10)", () => {
    renderNode("learned", false, true);
    expect(screen.getByTestId("sg-node-fluent-n1")).toBeTruthy();
    cleanup();
    renderNode("learned", false, false);
    expect(screen.queryByTestId("sg-node-fluent-n1")).toBeNull();
  });
});
