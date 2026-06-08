// Skill-graph layout + data derivation — PURE, fully testable without the canvas.
//
// This module turns the domain DAG (SkillNode[] + progress) into the
// React-Flow node/edge view-model: it resolves each node's status, marks the
// "next-to-learn" frontier, picks tier colors + edge styles, and runs dagre
// top-down auto-layout by tier. Keeping all of this here (not in SkillGraph.tsx)
// means the graph-data logic is unit-testable in jsdom with no xyflow canvas.
//
// plan §2.3 (graph rendering spec) + §4 (tier colors / node states / frontier pulse).

import dagre from "dagre";
import type { Instrument, SkillNode, SkillNodeStatus, SkillProgress } from "./types";
import { nextToLearn, resolveStatus } from "./skillTree";
import { nodePathTreatment } from "./pathFilter";
import type { LearningPath, PathTreatment } from "./pathFilter";

export type GraphInstrumentFilter = Instrument; // "piano" | "guitar"

/**
 * V4 Soul-First — the path/theory view filter applied on top of the instrument
 * filter. `path === undefined` shows every node (back-compat). `theoryEnabled`
 * controls whether `theory: true` nodes appear at all. Defaulting to SHOW_ALL
 * keeps callers that have not opted into a path (and the test fixtures) unchanged.
 */
export interface PathView {
  path: LearningPath | undefined;
  theoryEnabled: boolean;
}

const SHOW_ALL: PathView = { path: undefined, theoryEnabled: true };

/** Data payload carried on each React-Flow node (consumed by the custom node). */
export interface SkillGraphNodeData {
  node: SkillNode;
  status: SkillNodeStatus;
  /** On the learning frontier (returned by nextToLearn) → gets the pulse ring. */
  isFrontier: boolean;
  tierColor: string;
  /** R10 — node has passed its autonomous fluency test → gets the "Fluent" badge. */
  fluent: boolean;
  /**
   * V4 Soul-First — render treatment under the active path. Always "on-path" or
   * "off-path" here ("theory-hidden" nodes are dropped from the graph entirely,
   * so the dagre layout never sees them).
   */
  pathTreatment: Exclude<PathTreatment, "theory-hidden">;
  [key: string]: unknown; // React-Flow node data is an open record
}

/** Minimal React-Flow-shaped node (avoids importing xyflow types into a pure lib). */
export interface FlowNode {
  id: string;
  type: "skill";
  position: { x: number; y: number };
  data: SkillGraphNodeData;
}

export type EdgeKind = "locked" | "traversable" | "learned";

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
}

/** CSS var reference for a tier's sunrise-ramp color (defined in globals.css @theme). */
export function tierColorVar(tier: SkillNode["tier"]): string {
  return `var(--color-tier-${tier})`;
}

/**
 * Select the nodes that belong in a given instrument's graph: that instrument's
 * own nodes PLUS every `"shared"` node (theory/ear shows in both graphs).
 * plan handoff: `instrument:"shared"` nodes appear in BOTH instrument graphs.
 */
export function nodesForInstrument(
  allNodes: SkillNode[],
  instrument: GraphInstrumentFilter,
): SkillNode[] {
  return allNodes.filter(
    (n) => n.instrument === instrument || n.instrument === "shared",
  );
}

/**
 * Classify a prereq edge:
 *   learned     → both endpoints learned (tier-gradient, solid)
 *   traversable → the path can currently be walked (source learned, so the
 *                 target is at least available) → solid
 *   locked      → source not yet learned → dashed
 */
function edgeKindFor(
  sourceStatus: SkillNodeStatus | undefined,
  targetStatus: SkillNodeStatus | undefined,
): EdgeKind {
  if (sourceStatus === "learned" && targetStatus === "learned") return "learned";
  if (sourceStatus === "learned") return "traversable";
  return "locked";
}

/**
 * Build the view-model (nodes + edges with status/frontier/color/edge-kind) for
 * one instrument, WITHOUT positions. Positions are added by `layout()`. Split so
 * the derivation can be tested independently of dagre.
 */
export function buildGraphModel(
  allNodes: SkillNode[],
  progress: Record<string, SkillProgress>,
  instrument: GraphInstrumentFilter,
  frontierLimit = 3,
  view: PathView = SHOW_ALL,
): { nodes: Omit<FlowNode, "position">[]; edges: FlowEdge[] } {
  // Instrument filter first, then the V4 path/theory view filter. "theory-hidden"
  // nodes are DROPPED here so dagre never lays them out and they grow no edges;
  // "off-path" nodes stay (rendered dimmed) so the shape of the tree is preserved.
  const forInstrument = nodesForInstrument(allNodes, instrument);
  const treatmentById = new Map<string, Exclude<PathTreatment, "theory-hidden">>();
  const visible: SkillNode[] = [];
  for (const node of forInstrument) {
    const treatment = nodePathTreatment(node, view.path, view.theoryEnabled);
    if (treatment === "theory-hidden") continue;
    treatmentById.set(node.id, treatment);
    visible.push(node);
  }

  // Status/frontier resolve on the post-filter set so a dropped theory prereq does
  // not wrongly lock its dependents in this view, and frontier never lands on a
  // node the user cannot see.
  const status = resolveStatus(visible, progress);
  const frontierIds = new Set(
    nextToLearn(visible, progress, frontierLimit).map((n) => n.id),
  );
  const visibleIds = new Set(visible.map((n) => n.id));

  const nodes: Omit<FlowNode, "position">[] = visible.map((node) => ({
    id: node.id,
    type: "skill",
    data: {
      node,
      status: status.get(node.id) ?? "locked",
      isFrontier: frontierIds.has(node.id),
      tierColor: tierColorVar(node.tier),
      fluent: progress[node.id]?.fluent === true,
      pathTreatment: treatmentById.get(node.id) ?? "on-path",
    },
  }));

  const edges: FlowEdge[] = [];
  for (const node of visible) {
    for (const pid of node.prereqs) {
      // Only draw edges whose source is also visible in this graph (a guitar
      // node could in theory list a prereq filtered out; skip dangling edges).
      if (!visibleIds.has(pid)) continue;
      edges.push({
        id: `${pid}->${node.id}`,
        source: pid,
        target: node.id,
        kind: edgeKindFor(status.get(pid), status.get(node.id)),
      });
    }
  }

  return { nodes, edges };
}

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 84;

/**
 * Dagre top-down auto-layout. Ranks flow top→bottom; nodes within a tier spread
 * left→right. Returns the same nodes with `position` filled in (center-anchored
 * to React-Flow's top-left coordinate convention).
 */
export function layout(
  nodes: Omit<FlowNode, "position">[],
  edges: FlowEdge[],
  opts: { nodeWidth?: number; nodeHeight?: number } = {},
): FlowNode[] {
  const nodeWidth = opts.nodeWidth ?? NODE_WIDTH;
  const nodeHeight = opts.nodeHeight ?? NODE_HEIGHT;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", ranksep: 70, nodesep: 36, marginx: 24, marginy: 24 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of nodes) g.setNode(n.id, { width: nodeWidth, height: nodeHeight });
  for (const e of edges) {
    // Guard against edges referencing nodes not in this graph.
    if (g.hasNode(e.source) && g.hasNode(e.target)) g.setEdge(e.source, e.target);
  }

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: pos
        ? { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 }
        : { x: 0, y: 0 },
    };
  });
}

/** One-shot: build + layout for an instrument. The component calls this. */
export function buildLaidOutGraph(
  allNodes: SkillNode[],
  progress: Record<string, SkillProgress>,
  instrument: GraphInstrumentFilter,
  frontierLimit = 3,
  view: PathView = SHOW_ALL,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const model = buildGraphModel(allNodes, progress, instrument, frontierLimit, view);
  return { nodes: layout(model.nodes, model.edges), edges: model.edges };
}
