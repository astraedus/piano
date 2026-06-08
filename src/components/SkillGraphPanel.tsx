"use client";
// Side panel for the selected skill-graph node.
//
// Shows: title, status, tier/category, the mastery drill, the unlock sentence,
// prereqs (with their resolved status), an extension SLOT for guitar visuals
// (P4 fills this off `node.viz`), and the two affordances:
//   - "add to today"  → markNodeProgress (bumps a rep → in-progress)
//   - "mark learned"  → markNodeProgress({ learned: true })
// Both write through the AppState hook's `patch`, so the graph re-derives status.

import type { SkillNode, SkillNodeStatus } from "@/lib/types";
import { ChordDiagram } from "@/lib/guitar/components/ChordDiagram";
import { Fretboard } from "@/lib/guitar/components/Fretboard";
import { Tab } from "@/lib/guitar/components/Tab";

const STATUS_LABEL: Record<SkillNodeStatus, string> = {
  locked: "Locked",
  available: "Ready to start",
  "in-progress": "In progress",
  learned: "Learned",
};

export interface SkillGraphPanelProps {
  node: SkillNode | null;
  status: SkillNodeStatus | undefined;
  /** node id → its resolved status, for rendering prereq chips. */
  statusById: Map<string, SkillNodeStatus>;
  /** node id → title, for naming prereqs. */
  titleById: Map<string, string>;
  onCloseAction: () => void;
  onAddToTodayAction: (nodeId: string) => void;
  onMarkLearnedAction: (nodeId: string) => void;
}

export function SkillGraphPanel({
  node,
  status,
  statusById,
  titleById,
  onCloseAction,
  onAddToTodayAction,
  onMarkLearnedAction,
}: SkillGraphPanelProps) {
  if (!node) return null;
  const learned = status === "learned";
  const locked = status === "locked";

  return (
    <aside
      data-testid="sg-panel"
      className="flex flex-col gap-4 rounded-xl border border-[color:var(--rule)] bg-[color:var(--surface)] p-5 shadow-sm"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65), 0 2px 12px -6px rgba(35,26,14,0.18)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">
            tier {node.tier} · {node.category}
          </p>
          <h3 className="font-serif text-lg leading-tight text-[color:var(--ink)]">{node.title}</h3>
          <p
            data-testid="sg-panel-status"
            className="text-xs italic"
            style={{ color: locked ? "var(--ink-3)" : "var(--instrument-accent-deep)" }}
          >
            {STATUS_LABEL[status ?? "locked"]}
          </p>
        </div>
        <button
          type="button"
          onClick={onCloseAction}
          aria-label="close panel"
          className="text-[color:var(--ink-3)] hover:text-[color:var(--ink)] text-lg leading-none -mt-1"
        >
          ×
        </button>
      </div>

      <Section label="the drill">
        <p className="text-sm text-[color:var(--ink-2)]">{node.masteryDrill}</p>
      </Section>

      <Section label="what it unlocks">
        <p className="text-sm text-[color:var(--ink-2)] italic">{node.unlock}</p>
      </Section>

      {node.prereqs.length > 0 && (
        <Section label="needs first">
          <ul className="flex flex-wrap gap-1.5">
            {node.prereqs.map((pid) => {
              const ps = statusById.get(pid) ?? "locked";
              const done = ps === "learned";
              return (
                <li
                  key={pid}
                  className="rounded-full border px-2 py-0.5 text-[11px]"
                  style={{
                    borderColor: done ? "var(--instrument-accent)" : "var(--bg-rule)",
                    color: done ? "var(--instrument-accent-deep)" : "var(--ink-3)",
                  }}
                >
                  {done ? "✓ " : ""}{titleById.get(pid) ?? pid}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* P4 EXTENSION POINT — guitar visuals, keyed off node.viz. Renders the real
          ChordDiagram / Fretboard / Tab; keeps the sg-viz-slot testid + data-viz. */}
      {node.viz && (
        <Section label="visual">
          <div
            data-testid="sg-viz-slot"
            data-viz={node.viz}
            className="flex min-h-[88px] items-center justify-center rounded-lg border border-[color:var(--rule)] bg-[color:var(--surface-2)] p-2"
          >
            <NodeViz node={node} />
          </div>
        </Section>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {!learned && (
          <button
            type="button"
            data-testid="sg-add-today"
            disabled={locked}
            onClick={() => onAddToTodayAction(node.id)}
            className="rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: "var(--instrument-accent)", color: "var(--instrument-accent-deep)" }}
          >
            Add to Today
          </button>
        )}
        {!learned && (
          <button
            type="button"
            data-testid="sg-mark-learned"
            disabled={locked}
            onClick={() => onMarkLearnedAction(node.id)}
            className="rounded-lg px-3 py-1.5 text-sm text-[color:var(--bg-base)] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--instrument-accent)" }}
          >
            Mark Learned
          </button>
        )}
        {learned && (
          <p className="text-sm text-[color:var(--instrument-accent-deep)]">✓ Learned</p>
        )}
      </div>
    </aside>
  );
}

// Renders the guitar visual for a node, keyed on node.viz:
//   chord_diagram → ChordDiagram (node.chordShape / node.cagedShape)
//   fretboard_map → Fretboard (scale/box map; default pentatonic box)
//   tab           → Tab (default riff)
//   animation     → graceful text placeholder (motion treatment is a later pass)
function NodeViz({ node }: { node: SkillNode }) {
  switch (node.viz) {
    case "chord_diagram":
      return (
        <ChordDiagram
          chordShape={node.chordShape}
          cagedShape={node.cagedShape}
          title={node.title}
        />
      );
    case "fretboard_map":
      return <Fretboard ariaLabel={`${node.title} fretboard map`} />;
    case "tab":
      return <Tab ariaLabel={`${node.title} tab`} />;
    case "animation":
    default:
      return (
        <span className="text-xs italic text-[color:var(--ink-3)]">
          watch the motion: {node.title.toLowerCase()}
        </span>
      );
  }
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">{label}</p>
      {children}
    </div>
  );
}
