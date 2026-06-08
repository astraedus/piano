import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import type { ReactNode } from "react";

// --- Mock next/navigation (per plan §5 P4: component tests mock it) ---
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/tree",
  useSearchParams: () => new URLSearchParams(),
}));

// --- Mock @xyflow/react (no real canvas/ResizeObserver in jsdom) ---
// We render each node's title + a click hook so we can test node-set derivation
// and selection without the canvas. The custom node component itself is unit-safe
// but we shallow-render the canvas here per the plan's guidance.
vi.mock("@xyflow/react", () => {
  type RFNode = { id: string; data: { node: { title: string }; status: string; isFrontier: boolean } };
  return {
    ReactFlow: ({
      nodes,
      onNodeClick,
    }: {
      nodes: RFNode[];
      onNodeClick?: (e: unknown, n: RFNode) => void;
    }) => (
      <div data-testid="rf-mock">
        {nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            data-testid={`rf-node-${n.id}`}
            data-status={n.data.status}
            data-frontier={n.data.isFrontier ? "true" : "false"}
            onClick={() => onNodeClick?.({}, n)}
          >
            {n.data.node.title}
          </button>
        ))}
      </div>
    ),
    ReactFlowProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    Background: () => null,
    Controls: () => null,
    MiniMap: () => null,
    Handle: () => null,
    Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
    MarkerType: { ArrowClosed: "arrowclosed" },
    useNodesState: () => [[], vi.fn(), vi.fn()],
    useEdgesState: () => [[], vi.fn(), vi.fn()],
  };
});

import { SkillGraph } from "./SkillGraph";
import { AppStateProvider, useAppState } from "@/hooks/useAppState";
import type { SkillNode } from "@/lib/types";
import * as registry from "@/lib/instrumentRegistry";

// Test fixtures for two instruments.
const PIANO_FIXTURE: SkillNode[] = [
  { id: "p-root", instrument: "piano", title: "Piano Root", tier: 0, category: "setup", prereqs: [], masteryDrill: "d", unlock: "u" },
  { id: "p-mid", instrument: "piano", title: "Piano Mid", tier: 1, category: "technique", prereqs: ["p-root"], masteryDrill: "d", unlock: "u" },
];
const GUITAR_FIXTURE: SkillNode[] = [
  { id: "g-root", instrument: "guitar", title: "Guitar Root", tier: 0, category: "setup", prereqs: [], masteryDrill: "d", unlock: "u" },
];

beforeEach(() => {
  localStorage.clear();
  // Stub the registry so the graph reads our fixtures, and both pills are enabled.
  vi.spyOn(registry, "getModuleSync").mockImplementation((id) =>
    ({ skillNodes: id === "guitar" ? GUITAR_FIXTURE : PIANO_FIXTURE } as never),
  );
  vi.spyOn(registry, "isModuleRegistered").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderGraph() {
  return render(
    <AppStateProvider>
      <SkillGraph />
    </AppStateProvider>,
  );
}

describe("SkillGraph", () => {
  it("renders the active instrument's node set with derived statuses", () => {
    renderGraph();
    // default instrument is piano → piano nodes render.
    expect(screen.getByTestId("rf-node-p-root").getAttribute("data-status")).toBe("available");
    // p-mid is locked (p-root not learned).
    expect(screen.getByTestId("rf-node-p-mid").getAttribute("data-status")).toBe("locked");
    // p-root is on the frontier (available, not started).
    expect(screen.getByTestId("rf-node-p-root").getAttribute("data-frontier")).toBe("true");
    // no guitar nodes in the piano graph.
    expect(screen.queryByTestId("rf-node-g-root")).toBeNull();
  });

  it("instrument filter pill toggles the rendered node set", () => {
    renderGraph();
    expect(screen.queryByTestId("rf-node-g-root")).toBeNull();
    fireEvent.click(screen.getByTestId("sg-filter-guitar"));
    // now guitar node renders, piano nodes gone.
    expect(screen.getByTestId("rf-node-g-root")).toBeTruthy();
    expect(screen.queryByTestId("rf-node-p-root")).toBeNull();
  });

  it("tapping a node opens the side panel; 'mark learned' mutates skillProgress", () => {
    renderGraph();
    fireEvent.click(screen.getByTestId("rf-node-p-root"));
    const panel = screen.getByTestId("sg-panel");
    expect(within(panel).getByText("Piano Root")).toBeTruthy();

    fireEvent.click(screen.getByTestId("sg-mark-learned"));
    // After learning p-root, its node status becomes "learned" and p-mid unlocks.
    expect(screen.getByTestId("rf-node-p-root").getAttribute("data-status")).toBe("learned");
    expect(screen.getByTestId("rf-node-p-mid").getAttribute("data-status")).toBe("available");
  });

  it("'add to today' marks the node in-progress without learning it", () => {
    renderGraph();
    fireEvent.click(screen.getByTestId("rf-node-p-root"));
    fireEvent.click(screen.getByTestId("sg-add-today"));
    expect(screen.getByTestId("rf-node-p-root").getAttribute("data-status")).toBe("in-progress");
  });

  it("persists the mutation through the AppState hook (read back via a probe)", () => {
    let captured: Record<string, unknown> | undefined;
    function Probe() {
      const { state } = useAppState();
      captured = state.skillProgress;
      return null;
    }
    render(
      <AppStateProvider>
        <SkillGraph />
        <Probe />
      </AppStateProvider>,
    );
    fireEvent.click(screen.getByTestId("rf-node-p-root"));
    fireEvent.click(screen.getByTestId("sg-mark-learned"));
    expect(captured?.["p-root"]).toMatchObject({ status: "learned" });
  });

  it("shows an empty state when the instrument has no nodes", () => {
    (registry.getModuleSync as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ skillNodes: [] });
    renderGraph();
    expect(screen.getByText("No skills here yet")).toBeTruthy();
  });
});
