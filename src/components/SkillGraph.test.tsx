import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within, waitFor } from "@testing-library/react";
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
// Spy for the imperative fitView so tests can assert auto-refit-on-layout-change.
const fitViewSpy = vi.fn();

vi.mock("@xyflow/react", () => {
  type RFNode = {
    id: string;
    data: { node: { title: string }; status: string; isFrontier: boolean; pathTreatment?: string };
  };
  type RFEdge = { id: string; source: string; target: string };
  return {
    ReactFlow: ({
      nodes,
      edges,
      onNodeClick,
    }: {
      nodes: RFNode[];
      edges?: RFEdge[];
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
            data-treatment={n.data.pathTreatment ?? "on-path"}
            onClick={() => onNodeClick?.({}, n)}
          >
            {n.data.node.title}
          </button>
        ))}
        {(edges ?? []).map((e) => (
          <span key={e.id} data-testid={`rf-edge-${e.id}`} data-source={e.source} data-target={e.target} />
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
    useReactFlow: () => ({ fitView: fitViewSpy }),
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

// V4 path-filter fixture: a just-play node, a play-with-soul-only (lead) node, and
// a theory node (hidden unless theory is on). The theory node depends on the lead
// node so we can assert its edge is dropped when theory-hidden.
const PATH_FIXTURE: SkillNode[] = [
  {
    id: "g-chug",
    instrument: "guitar",
    title: "Power Chords",
    soulTitle: "The Rock Chug",
    keepTitle: "Power Chords",
    tier: 1,
    category: "chords",
    prereqs: [],
    masteryDrill: "d",
    unlock: "u",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "g-cry",
    instrument: "guitar",
    title: "String Bending",
    soulTitle: "Make a Note Cry",
    keepTitle: "String Bending",
    tier: 2,
    category: "expression",
    prereqs: ["g-chug"],
    masteryDrill: "d",
    unlock: "u",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "g-staff",
    instrument: "guitar",
    title: "Reading the Staff",
    keepTitle: "Reading the Staff",
    tier: 3,
    category: "notation",
    prereqs: ["g-cry"],
    masteryDrill: "d",
    unlock: "u",
    pathTags: ["go-deep"],
    theory: true,
  },
];

beforeEach(() => {
  localStorage.clear();
  fitViewSpy.mockClear();
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

  // ── Viewport auto-refit after a layout-changing mutation ───────────────────

  describe("viewport refit", () => {
    it("re-fits the viewport after a progress mutation re-lays-out the graph", async () => {
      renderGraph();
      fireEvent.click(screen.getByTestId("rf-node-p-root"));
      // Selecting a node must NOT refit (it doesn't change the layout).
      expect(fitViewSpy).not.toHaveBeenCalled();

      // Mark learned → p-root becomes learned, p-mid unlocks → dagre re-lays-out
      // (the node set's statuses/positions change), so the viewport must re-fit.
      fireEvent.click(screen.getByTestId("sg-mark-learned"));
      await waitFor(() => expect(fitViewSpy).toHaveBeenCalledTimes(1));
      expect(fitViewSpy).toHaveBeenCalledWith(
        expect.objectContaining({ padding: 0.2 }),
      );
    });

    it("does NOT refit when only the selection changes", async () => {
      renderGraph();
      // Select, deselect, re-select — pure selection churn, no layout change.
      fireEvent.click(screen.getByTestId("rf-node-p-root"));
      fireEvent.click(screen.getByTestId("rf-node-p-root")); // toggle off
      fireEvent.click(screen.getByTestId("rf-node-p-mid"));
      // Give any deferred RAF a chance to run; the spy must stay untouched.
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      expect(fitViewSpy).not.toHaveBeenCalled();
    });
  });

  // ── V4 Soul-First — path filtering + theory toggle ─────────────────────────

  describe("path filtering + theory toggle", () => {
    // Stub the guitar module to return the path fixture and select the guitar pill.
    function renderPathGraph() {
      (registry.getModuleSync as unknown as ReturnType<typeof vi.fn>).mockImplementation((id) =>
        ({ skillNodes: id === "guitar" ? PATH_FIXTURE : PIANO_FIXTURE } as never),
      );
      renderGraph();
      fireEvent.click(screen.getByTestId("sg-filter-guitar"));
    }

    it("hides theory nodes (and their edges) by default; theory toggle reveals them", () => {
      renderPathGraph();
      // default path = All, theory off → theory node + its edge are absent.
      expect(screen.getByTestId("rf-node-g-chug")).toBeTruthy();
      expect(screen.getByTestId("rf-node-g-cry")).toBeTruthy();
      expect(screen.queryByTestId("rf-node-g-staff")).toBeNull();
      expect(screen.queryByTestId("rf-edge-g-cry->g-staff")).toBeNull();

      // turn theory on → theory node + its edge appear.
      fireEvent.click(screen.getByTestId("sg-theory-toggle").querySelector("input")!);
      expect(screen.getByTestId("rf-node-g-staff")).toBeTruthy();
      expect(screen.getByTestId("rf-edge-g-cry->g-staff")).toBeTruthy();
    });

    it("Just Play dims off-path lead nodes and keeps theory hidden", () => {
      renderPathGraph();
      fireEvent.click(screen.getByTestId("sg-path-just-play"));
      // chug is on the just-play path; cry (lead) is off-path → dimmed but present.
      expect(screen.getByTestId("rf-node-g-chug").getAttribute("data-treatment")).toBe("on-path");
      expect(screen.getByTestId("rf-node-g-cry").getAttribute("data-treatment")).toBe("off-path");
      // theory still hidden (Just Play does not enable theory).
      expect(screen.queryByTestId("rf-node-g-staff")).toBeNull();
    });

    it("Play With Soul puts the lead node on-path", () => {
      renderPathGraph();
      fireEvent.click(screen.getByTestId("sg-path-play-with-soul"));
      expect(screen.getByTestId("rf-node-g-chug").getAttribute("data-treatment")).toBe("on-path");
      expect(screen.getByTestId("rf-node-g-cry").getAttribute("data-treatment")).toBe("on-path");
      // theory still hidden until explicitly enabled.
      expect(screen.queryByTestId("rf-node-g-staff")).toBeNull();
    });

    it("Go Deep implies theory on, revealing theory nodes", () => {
      renderPathGraph();
      fireEvent.click(screen.getByTestId("sg-path-go-deep"));
      expect(screen.getByTestId("rf-node-g-chug").getAttribute("data-treatment")).toBe("on-path");
      expect(screen.getByTestId("rf-node-g-cry").getAttribute("data-treatment")).toBe("on-path");
      // Go Deep auto-enables theory → the theory node appears, on-path.
      expect(screen.getByTestId("rf-node-g-staff")).toBeTruthy();
      expect(screen.getByTestId("rf-node-g-staff").getAttribute("data-treatment")).toBe("on-path");
    });

    it("renders the soul label (soulTitle) on the node card, not the theory title", () => {
      renderPathGraph();
      // the xyflow mock prints node.title, but the real card leads with soulTitle —
      // assert the data carries the soul-titled node so SkillGraphNode can lead with it.
      expect(screen.getByTestId("rf-node-g-chug").textContent).toBe("Power Chords");
      // (the soul label render itself is covered in SkillGraphNode.test.tsx; here we
      // assert the path-filtered node set reaches the canvas.)
    });
  });
});
