"use client";
// Skill-graph view — React-Flow DAG render of the active instrument's skill tree.
//
// xyflow is client-only (touches window/ResizeObserver) so this whole module is
// 'use client' and is mounted via next/dynamic({ ssr:false }) from
// SkillGraphView (per Next 16 lazy-loading guide: ssr:false must live inside a
// Client Component). It reads nodes from the instrument module, derives the
// view-model + dagre layout in the pure skillGraphLayout helper, and writes
// node-progress mutations through the AppState hook.
//
// Instrument filter: a LOCAL view filter (does NOT mutate state.instrument), so
// you can inspect the guitar tree without switching your active profile. It
// defaults to the active instrument. (plan §2.3 left this to implementer's call.)

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import type { Edge, Node, NodeMouseHandler } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useAppState } from "@/hooks/useAppState";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { isModuleRegistered } from "@/lib/instrumentRegistry";
import { difficultyVerdict, isFluent, markNodeProgress, resolveStatus } from "@/lib/skillTree";
import {
  buildLaidOutGraph,
  nodesForInstrument,
} from "@/lib/skillGraphLayout";
import type { GraphInstrumentFilter } from "@/lib/skillGraphLayout";
import type { Instrument } from "@/lib/types";
import { SkillGraphNode } from "@/components/SkillGraphNode";
import { SkillGraphPanel } from "@/components/SkillGraphPanel";

const NODE_TYPES = { skill: SkillGraphNode };

const EDGE_STYLE: Record<string, { stroke: string; dash?: string }> = {
  locked: { stroke: "var(--bg-rule)", dash: "5 5" },
  traversable: { stroke: "var(--instrument-accent)" },
  learned: { stroke: "var(--instrument-accent-deep)" },
};

// Which instruments to offer as filter pills. We list the canonical two; pills
// for unregistered modules (guitar before P4) are shown disabled.
const FILTER_OPTIONS: { id: GraphInstrumentFilter; label: string }[] = [
  { id: "piano", label: "Piano" },
  { id: "guitar", label: "Guitar" },
];

export function SkillGraph() {
  return (
    <ReactFlowProvider>
      <SkillGraphInner />
    </ReactFlowProvider>
  );
}

function SkillGraphInner() {
  const { state, patch, markFluent } = useAppState();
  const [filter, setFilter] = useState<GraphInstrumentFilter>(state.instrument);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Source nodes for the *filtered* instrument. We read the filtered module's
  // skillNodes (which already include shared nodes for that module's instrument).
  const allNodes = useMemo(
    () => getModuleSync(filter)?.skillNodes ?? [],
    [filter],
  );
  // Stable reference for the dep array — `?? {}` would mint a new object each
  // render and defeat the useMemo below.
  const progress = state.skillProgress;

  // Derive the React-Flow view-model + dagre layout. Memoized on the inputs that
  // actually affect it (filter, node set, progress) so we don't re-layout on
  // every render.
  const { flowNodes, flowEdges, statusById, titleById } = useMemo(() => {
    const prog = progress ?? {};
    const visible = nodesForInstrument(allNodes, filter);
    const { nodes, edges } = buildLaidOutGraph(allNodes, prog, filter);
    const statusMap = resolveStatus(visible, prog);
    const titleMap = new Map(visible.map((n) => [n.id, n.title]));

    const rfNodes: Node[] = nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
      selected: n.id === selectedId,
    }));

    const rfEdges: Edge[] = edges.map((e) => {
      const s = EDGE_STYLE[e.kind] ?? EDGE_STYLE.locked;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.kind === "traversable",
        style: {
          stroke: s.stroke,
          strokeWidth: e.kind === "learned" ? 2 : 1.5,
          strokeDasharray: s.dash,
        },
      };
    });

    return {
      flowNodes: rfNodes,
      flowEdges: rfEdges,
      statusById: statusMap,
      titleById: titleMap,
    };
  }, [allNodes, filter, progress, selectedId]);

  const selectedNode = useMemo(
    () => allNodes.find((n) => n.id === selectedId) ?? null,
    [allNodes, selectedId],
  );

  const onNodeClick = useCallback<NodeMouseHandler>((_, n) => {
    setSelectedId((cur) => (cur === n.id ? null : n.id));
  }, []);

  const addToToday = useCallback(
    (nodeId: string) => {
      patch({ skillProgress: markNodeProgress(state.skillProgress ?? {}, nodeId) });
    },
    [patch, state.skillProgress],
  );

  const markLearned = useCallback(
    (nodeId: string) => {
      patch({
        skillProgress: markNodeProgress(state.skillProgress ?? {}, nodeId, {
          learned: true,
        }),
      });
    },
    [patch, state.skillProgress],
  );

  // R3/R10 — per-node quality signals for the panel, derived from the selected
  // node's progress snapshot.
  const selectedProgress = selectedNode ? progress?.[selectedNode.id] : undefined;
  const selectedFluent = isFluent(selectedProgress);
  const selectedDifficulty = difficultyVerdict(selectedProgress);

  const empty = allNodes.length === 0;

  return (
    <div className="space-y-4">
      <FilterPills active={filter} onSelectAction={setFilter} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div
          data-testid="sg-canvas"
          key={filter} // remount on filter change → crossfade + clean fit
          className="sg-canvas h-[clamp(420px,60vh,640px)] overflow-hidden rounded-xl border border-[color:var(--rule)] bg-[color:var(--surface)]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)" }}
        >
          {empty ? (
            <EmptyState filter={filter} />
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={NODE_TYPES}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedId(null)}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3}
              maxZoom={1.6}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false}
              nodesConnectable={false}
            >
              <Background color="var(--bg-rule)" gap={20} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          )}
        </div>

        {selectedNode ? (
          <SkillGraphPanel
            node={selectedNode}
            status={statusById.get(selectedNode.id)}
            statusById={statusById}
            titleById={titleById}
            fluent={selectedFluent}
            difficulty={selectedDifficulty}
            onCloseAction={() => setSelectedId(null)}
            onAddToTodayAction={addToToday}
            onMarkLearnedAction={markLearned}
            onMarkFluentAction={markFluent}
          />
        ) : (
          <PanelHint empty={empty} />
        )}
      </div>
    </div>
  );
}

function FilterPills({
  active,
  onSelectAction,
}: {
  active: GraphInstrumentFilter;
  onSelectAction: (id: GraphInstrumentFilter) => void;
}) {
  return (
    <div className="flex gap-2" role="tablist" aria-label="instrument filter">
      {FILTER_OPTIONS.map((opt) => {
        const registered = isModuleRegistered(opt.id as Instrument);
        const isActive = active === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-testid={`sg-filter-${opt.id}`}
            disabled={!registered}
            onClick={() => onSelectAction(opt.id)}
            className={
              "rounded-full border px-4 py-1.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed " +
              (isActive
                ? "border-[color:var(--instrument-accent)] bg-[color:var(--instrument-accent-bg)] text-[color:var(--instrument-accent-deep)]"
                : "border-[color:var(--rule)] text-[color:var(--ink-3)] hover:text-[color:var(--ink-2)]")
            }
          >
            {opt.label}
            {!registered && <span className="ml-1 text-[10px]">Soon</span>}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ filter }: { filter: GraphInstrumentFilter }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="font-serif text-lg text-[color:var(--ink)]">No skills here yet</p>
      <p className="text-sm text-[color:var(--ink-3)]">
        The {filter} tree hasn&apos;t been planted yet. It&apos;s coming.
      </p>
    </div>
  );
}

function PanelHint({ empty }: { empty: boolean }) {
  if (empty) return null;
  return (
    <div className="hidden rounded-xl border border-dashed border-[color:var(--rule)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--ink-3)] lg:block">
      <p>Tap a node to see its drill, what it unlocks, and add it to today.</p>
    </div>
  );
}
