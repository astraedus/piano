"use client";
// Custom React-Flow node for the skill graph.
//
// Tier-colored (sunrise ramp from globals.css), status-styled per plan §4:
//   locked      → dim, lock glyph, low opacity
//   available   → solid fill, subtle accent glow
//   in-progress → status ring around the node
//   learned     → filled tier color + check glyph
// Frontier nodes (nextToLearn) get a pulse ring, which respects
// prefers-reduced-motion via the `.sg-pulse` CSS (defined in globals.css).

import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { SkillGraphNodeData } from "@/lib/skillGraphLayout";
import { NODE_WIDTH, NODE_HEIGHT } from "@/lib/skillGraphLayout";

function statusGlyph(status: SkillGraphNodeData["status"]): string {
  switch (status) {
    case "learned": return "✓";
    case "locked": return "✦"; // muted star — "not yet"; avoids emoji-as-icon
    default: return "";
  }
}

export function SkillGraphNode({ data, selected }: NodeProps) {
  const d = data as SkillGraphNodeData;
  const { node, status, isFrontier, tierColor } = d;
  const learned = status === "learned";
  const locked = status === "locked";
  const inProgress = status === "in-progress";

  // Fill: learned & available use the tier color (learned saturated, available
  // soft); locked & in-progress sit on surface with a colored border/ring.
  const bg = learned
    ? tierColor
    : locked
      ? "var(--bg-surface-2)"
      : "var(--bg-surface)";
  const borderColor = locked ? "var(--bg-rule)" : tierColor;
  const ink = learned ? "#FBF6EE" : locked ? "var(--ink-3)" : "var(--ink)";

  return (
    <div
      data-testid={`sg-node-${node.id}`}
      data-status={status}
      data-frontier={isFrontier ? "true" : "false"}
      className={
        "sg-node relative rounded-lg px-3 py-2 text-left transition-all duration-200 " +
        (isFrontier && !learned ? "sg-pulse " : "") +
        (locked ? "opacity-60 " : "") +
        (selected ? "ring-2 ring-offset-2 " : "")
      }
      style={{
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
        background: bg,
        border: `2px solid ${borderColor}`,
        // in-progress → status ring; available → subtle glow; selected handled above
        boxShadow: inProgress
          ? `0 0 0 3px var(--bg-base), 0 0 0 5px ${tierColor}`
          : status === "available"
            ? `0 0 0 1px ${tierColor}, 0 2px 10px -4px ${tierColor}`
            : "0 1px 2px rgba(35,26,14,0.10)",
        // frontier pulse + selected ring share the accent color
        ["--sg-pulse-color" as string]: tierColor,
        ["--tw-ring-color" as string]: tierColor,
      }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-[10px] uppercase tracking-[0.14em]"
          style={{ color: learned ? "rgba(251,246,238,0.85)" : "var(--ink-3)" }}
        >
          tier {node.tier} · {node.category}
        </span>
        {statusGlyph(status) && (
          <span aria-hidden className="text-xs leading-none" style={{ color: ink }}>
            {statusGlyph(status)}
          </span>
        )}
      </div>
      <p
        className="mt-1 text-sm font-medium leading-snug"
        style={{ color: ink }}
      >
        {node.title}
      </p>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}
