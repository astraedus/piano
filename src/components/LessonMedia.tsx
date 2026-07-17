"use client";
// LessonMedia — inline visual + audio strip for a lesson panel.
//
// Renders a compact media strip directly inside a lesson, so the chord diagram /
// fretboard / tab and the "Hear it" button are visible without a separate tap.
//
// A lesson ALWAYS gets a relevant visual — for a guitar app, "pure text with no
// diagram" is the #1 complaint. Exactly ONE visual renders, chosen by priority:
//   1. node.viz "chord_diagram" | "fretboard_map" | "tab" → the matching guitar
//      component (ChordDiagram / Fretboard-with-its-authored-map / Tab).
//   2. node.viz "animation" (no real renderer) → the BEST available static
//      visual, in order: the mapped term's TermVisual (a real, on-subject
//      diagram) → a chord diagram if the node carries a chordShape/cagedShape →
//      the instrument's default neck (guitar) / keyboard (piano).
//   3. node maps to a glossary term WITH a visual → that term's TermVisual.
//   4. None of the above → an instrument-appropriate DEFAULT so the strip is
//      never empty: guitar → labeled Fretboard (its named strings double as the
//      "your guitar's names" / anatomy visual); piano → labeled Keyboard.
//
// The term visual and default are instrument-aware (node.instrument), so a piano
// lesson never renders a guitar fretboard for a shared concept.
//
// Audio: the node's glossary term (via nodeToTermId) drives the "Hear it" button.
//   If no term maps, the button is omitted gracefully.

import { useState, useCallback } from "react";
import type { Instrument, SkillNode } from "@/lib/types";
import { nodeToTermId } from "@/lib/pathFilter";
import { lookupTerm } from "@/lib/explain/glossary";
import { ChordDiagram } from "@/lib/guitar/components/ChordDiagram";
import { CapoTeacher } from "@/components/CapoTeacher";
import { Fretboard } from "@/lib/guitar/components/Fretboard";
import { fretboardMapFor } from "@/lib/guitar/scaleShapes";
import { Tab } from "@/lib/guitar/components/Tab";
import { Keyboard } from "@/lib/piano/components/Keyboard";
import { StaffMap } from "@/lib/piano/components/StaffMap";
import { PadVisual } from "@/lib/drums/components/PadVisual";
import { TermVisual, termHasVisual } from "@/components/explain/TermVisual";

/** The concrete instrument for a node's visuals: "shared" nodes have no single
 *  instrument, so their term/default visual uses the entry's primary SEE. */
function nodeInstrument(node: SkillNode): Instrument | undefined {
  return node.instrument === "shared" ? undefined : node.instrument;
}

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

  const instrument = nodeInstrument(node);
  const hasAudio = Boolean(termEntry);
  const termHasVis = Boolean(termEntry && termHasVisual(termEntry, instrument));

  return (
    <div
      data-testid="lesson-media"
      className="rounded-lg border border-[color:var(--rule)] bg-[color:var(--surface-2)] p-3 space-y-2"
    >
      {/* Visual — exactly one renders, chosen by priority. */}
      <div className="flex items-center justify-center min-h-[72px]">
        <LessonVisual node={node} termHasVis={termHasVis} termEntry={termEntry} instrument={instrument} />
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
  instrument,
}: {
  node: SkillNode;
  termHasVis: boolean;
  termEntry: ReturnType<typeof lookupTerm>;
  instrument: Instrument | undefined;
}) {
  // 0. Node-id special cases — a purpose-built teaching surface beats any generic
  //    default for these lessons, so they win before node.viz / term / default.
  //    The capo IS a calculator (chart + calculator); "Reading the Staff" IS the
  //    grand staff itself, so a keyboard would teach the wrong thing entirely.
  if (node.id === "g-t1-capo") {
    return <CapoTeacher />;
  }
  if (node.id === "p-t0-staff") {
    return <StaffMap />;
  }

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
      // Each fretboard_map node plots its OWN authored map (Box 1, Box 2, the
      // natural-note map, …); without one it degrades to the default box.
      return (
        <Fretboard
          positions={fretboardMapFor(node.id)}
          ariaLabel={`${node.title} fretboard map`}
        />
      );
    case "tab":
      return <Tab ariaLabel={`${node.title} tab`} />;
    case "animation":
      // "animation" has no renderer. Prefer the mapped term's real visual (an
      // on-subject diagram, e.g. palm-muting / string-bending / vibrato), then a
      // chord diagram if the node carries a shape, then the instrument default.
      if (termEntry && termHasVis) {
        return <TermVisual entry={termEntry} instrument={instrument} />;
      }
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
    return <TermVisual entry={termEntry} instrument={instrument} />;
  }

  // 4. Instrument-appropriate default — the strip is never empty for a lesson.
  return <InstrumentDefault node={node} />;
}

/**
 * The instrument's default visual, chosen by node.instrument:
 *   piano → labeled keyboard, drums → practice pad, guitar/shared → labeled neck
 *   (its string names double as the "anatomy / your guitar's names" visual).
 * An explicit switch (not a piano/else branch) so a new instrument gets its own
 * default rather than silently falling through to the guitar fretboard.
 */
function InstrumentDefault({ node }: { node: SkillNode }) {
  switch (node.instrument) {
    case "piano":
      return <Keyboard notes={[]} labelNotes height={96} />;
    case "drums":
      return <PadVisual ariaLabel={`${node.title} on the practice pad`} />;
    case "guitar":
    default:
      return <Fretboard ariaLabel={`${node.title} on the fretboard`} />;
  }
}
