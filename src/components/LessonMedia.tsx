"use client";
// LessonMedia — inline visual + audio strip for a lesson panel.
//
// Renders a compact media strip directly inside a lesson, so the chord diagram /
// fretboard / tab and the "Hear it" button are visible without a separate tap.
//
// A lesson ALWAYS gets a relevant visual — for a guitar app, "pure text with no
// diagram" is the #1 complaint. Exactly ONE visual renders, chosen by priority:
//   1. node.viz "chord_diagram" | "fretboard_map" | "tab" → the matching guitar
//      component (ChordDiagram / Fretboard / Tab).
//   2. node.viz "animation" → a sensible STATIC fallback: a chord diagram if the
//      node carries a chordShape/cagedShape, else the instrument's default neck
//      (guitar) / keyboard (piano). Static is fine — we replace "nothing" with a
//      real, on-system visual.
//   3. node maps to a glossary term WITH a visual → that term's TermVisual.
//   4. None of the above → an instrument-appropriate DEFAULT so the strip is
//      never empty: guitar → labeled Fretboard (its named strings double as the
//      "your guitar's names" / anatomy visual); piano → labeled Keyboard.
//
// Audio: the node's glossary term (via nodeToTermId) drives the "Hear it" button.
//   If no term maps, the button is omitted gracefully.

import { useState, useCallback } from "react";
import type { SkillNode } from "@/lib/types";
import { nodeToTermId } from "@/lib/pathFilter";
import { lookupTerm } from "@/lib/explain/glossary";
import { ChordDiagram } from "@/lib/guitar/components/ChordDiagram";
import { Fretboard } from "@/lib/guitar/components/Fretboard";
import { Tab } from "@/lib/guitar/components/Tab";
import { Keyboard } from "@/lib/piano/components/Keyboard";
import { TermVisual, termHasVisual } from "@/components/explain/TermVisual";

export interface LessonMediaProps {
  node: SkillNode;
}

export function LessonMedia({ node }: LessonMediaProps) {
  const [playing, setPlaying] = useState(false);

  // Resolve the glossary term for this node (used for both audio and a fallback visual).
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

  const hasAudio = Boolean(termEntry);
  const termHasVis = Boolean(termEntry && termHasVisual(termEntry));

  return (
    <div
      data-testid="lesson-media"
      className="rounded-lg border border-[color:var(--rule)] bg-[color:var(--surface-2)] p-3 space-y-2"
    >
      {/* Visual — exactly one renders, chosen by priority. */}
      <div className="flex items-center justify-center min-h-[72px]">
        <LessonVisual node={node} termHasVis={termHasVis} termEntry={termEntry} />
      </div>

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
 * Picks and renders exactly ONE visual for a lesson, guaranteeing the strip is
 * never empty (see priority order in the file header).
 */
function LessonVisual({
  node,
  termHasVis,
  termEntry,
}: {
  node: SkillNode;
  termHasVis: boolean;
  termEntry: ReturnType<typeof lookupTerm>;
}) {
  // 1. Concrete node.viz.
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
      // 2. "animation" has no renderer — fall back to a static visual. Prefer a
      // chord diagram when the node carries a shape, else the instrument default.
      if (node.chordShape || node.cagedShape) {
        return (
          <ChordDiagram
            chordShape={node.chordShape}
            cagedShape={node.cagedShape}
            title={node.title}
          />
        );
      }
      return <InstrumentDefault node={node} />;
  }

  // 3. A mapped glossary term with a visual.
  if (termEntry && termHasVis) {
    return <TermVisual entry={termEntry} />;
  }

  // 4. Instrument-appropriate default — the strip is never empty for a lesson.
  return <InstrumentDefault node={node} />;
}

/**
 * The instrument's default visual: a labeled guitar neck (its string names
 * double as the "anatomy / your guitar's names" visual) or a labeled keyboard.
 * Instrument comes from node.instrument; "shared" nodes default to guitar.
 */
function InstrumentDefault({ node }: { node: SkillNode }) {
  if (node.instrument === "piano") {
    return <Keyboard notes={[]} labelNotes height={96} />;
  }
  return <Fretboard ariaLabel={`${node.title} on the fretboard`} />;
}
