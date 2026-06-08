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

function renderNode(
  status: SkillNodeStatus,
  isFrontier = false,
  fluent = false,
  opts: {
    treatment?: SkillGraphNodeData["pathTreatment"];
    node?: SkillNode;
  } = {},
) {
  const node = opts.node ?? baseNode;
  const data: SkillGraphNodeData = {
    node,
    status,
    isFrontier,
    tierColor: "var(--color-tier-2)",
    fluent,
    pathTreatment: opts.treatment ?? "on-path",
  };
  // NodeProps has many required fields the component never reads; build a minimal
  // shape and cast through NodeProps so tsc stays happy without spreading.
  const props = { id: node.id, data, selected: false } as unknown as NodeProps;
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

  // ── V4 Soul-First ──────────────────────────────────────────────────────────

  it("leads with the soul label and shows the theory name as a subtitle", () => {
    const soulNode: SkillNode = { ...baseNode, soulTitle: "The Rock Chug", keepTitle: "Power Chords" };
    renderNode("available", false, false, { node: soulNode });
    expect(screen.getByText("The Rock Chug")).toBeTruthy();
    expect(screen.getByTestId(`sg-node-subtitle-${baseNode.id}`).textContent).toBe("Power Chords");
  });

  it("falls back to keepTitle then title when there is no soulTitle (theory node)", () => {
    const theoryNode: SkillNode = { ...baseNode, soulTitle: undefined, keepTitle: "Reading the Staff" };
    renderNode("available", false, false, { node: theoryNode });
    expect(screen.getByText("Reading the Staff")).toBeTruthy();
    // no soulTitle → no separate theory subtitle (the title IS the theory name).
    expect(screen.queryByTestId(`sg-node-subtitle-${baseNode.id}`)).toBeNull();
  });

  it("does not show the theory subtitle on a locked node", () => {
    const soulNode: SkillNode = { ...baseNode, soulTitle: "The Rock Chug", keepTitle: "Power Chords" };
    renderNode("locked", false, false, { node: soulNode });
    expect(screen.getByText("The Rock Chug")).toBeTruthy();
    expect(screen.queryByTestId(`sg-node-subtitle-${baseNode.id}`)).toBeNull();
  });

  it("off-path node is dimmed (opacity-30 + grayscale), not pulsing, even on the frontier", () => {
    const { container } = renderNode("available", true, false, { treatment: "off-path" });
    expect(container.querySelector(".opacity-30")).toBeTruthy();
    expect(container.querySelector(".grayscale")).toBeTruthy();
    expect(container.querySelector(".sg-pulse")).toBeNull();
    expect(screen.getByTestId("sg-node-n1").getAttribute("data-treatment")).toBe("off-path");
  });

  it("on-path frontier node still pulses", () => {
    const { container } = renderNode("available", true, false, { treatment: "on-path" });
    expect(container.querySelector(".sg-pulse")).toBeTruthy();
    expect(container.querySelector(".opacity-30")).toBeNull();
  });
});
