"use client";
// LessonMedia — inline visual + audio strip for a lesson panel.
//
// Renders a compact media strip directly inside a lesson, so the chord diagram /
// fretboard / tab and the "Hear it" button are visible without a separate tap.
//
// Visual priority:
//   1. node.viz is set → render the matching guitar component (ChordDiagram /
//      Fretboard / Tab / animation placeholder) — same logic as the old NodeViz
//      inside SkillGraphPanel, centralised here.
//   2. node.viz absent → look up the node's glossary term via nodeToTermId and
//      render its TermVisual (fretboard / keyboard / chord-diagram) if it has one.
//   3. Neither present → render nothing (no empty box).
//
// Audio: the node's glossary term (via nodeToTermId) drives the "Hear it" button.
//   If no term maps, the button is omitted gracefully.
//
// Returns null when there is nothing to render (no visual AND no audio term).

import { useState, useCallback } from "react";
import type { SkillNode } from "@/lib/types";
import { nodeToTermId } from "@/lib/pathFilter";
import { lookupTerm } from "@/lib/explain/glossary";
import { ChordDiagram } from "@/lib/guitar/components/ChordDiagram";
import { Fretboard } from "@/lib/guitar/components/Fretboard";
import { Tab } from "@/lib/guitar/components/Tab";
import { TermVisual, termHasVisual } from "@/components/explain/TermVisual";

export interface LessonMediaProps {
  node: SkillNode;
}

export function LessonMedia({ node }: LessonMediaProps) {
  const [playing, setPlaying] = useState(false);

  // Resolve the glossary term for this node (used for both audio and fallback visual).
  const termId = nodeToTermId(node.id);
  const termEntry = termId ? lookupTerm(termId) : undefined;

  const onHear = useCallback(async () => {
    if (!termEntry || playing) return;
    setPlaying(true);
    try {
      await termEntry.hear();
    } catch {
      /* audio is best-effort; never throw out of a tap handler */
    } finally {
      setPlaying(false);
    }
  }, [termEntry, playing]);

  // Determine what visual to show.
  const hasNodeViz = Boolean(node.viz && node.viz !== "animation");
  const hasTermVisual = Boolean(termEntry && termHasVisual(termEntry));
  const hasAnyVisual = hasNodeViz || hasTermVisual;
  const hasAudio = Boolean(termEntry);

  // Nothing to render.
  if (!hasAnyVisual && !hasAudio) return null;

  return (
    <div
      data-testid="lesson-media"
      className="rounded-lg border border-[color:var(--rule)] bg-[color:var(--surface-2)] p-3 space-y-2"
    >
      {/* Visual */}
      {hasAnyVisual && (
        <div className="flex items-center justify-center min-h-[72px]">
          <NodeVizInline node={node} />
          {!hasNodeViz && termEntry && hasTermVisual && (
            <TermVisual entry={termEntry} />
          )}
        </div>
      )}

      {/* "Hear it" button */}
      {hasAudio && (
        <button
          type="button"
          data-testid="lesson-media-hear"
          onClick={onHear}
          disabled={playing}
          className="chip chip-accent inline-flex items-center gap-2 min-h-[44px] px-4 disabled:opacity-60"
        >
          <span aria-hidden>▶</span>
          {playing ? "Playing…" : "Hear it"}
        </button>
      )}
    </div>
  );
}

/**
 * Renders the node's own visual (node.viz).
 * Returns null when node.viz is absent or is the "animation" placeholder.
 * The animation case falls through to the term visual path in the parent.
 */
function NodeVizInline({ node }: { node: SkillNode }) {
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
    default:
      return null;
  }
}
