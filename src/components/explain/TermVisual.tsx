"use client";
// TermVisual — the SEE section renderer extracted from Explain.tsx.
//
// Renders the instrument visual for a GlossaryEntry based on its seeKind.
// Shared between Explain (the floating explainer card) and LessonMedia
// (the inline visual in lesson panels) so neither duplicates the dispatch.

import type { GlossaryEntry } from "@/lib/explain/glossary";
import { Fretboard } from "@/lib/guitar/components/Fretboard";
import { ChordDiagram } from "@/lib/guitar/components/ChordDiagram";
import { Keyboard } from "@/lib/piano/components/Keyboard";

export interface TermVisualProps {
  entry: GlossaryEntry;
}

/**
 * Renders the SEE section for a glossary entry.
 * Returns null when the entry has no visual content (seeKind "text" with no
 * seeText, or falls through to default). Callers can guard on this.
 */
export function TermVisual({ entry }: TermVisualProps) {
  switch (entry.seeKind) {
    case "keyboard":
      return <Keyboard notes={entry.seeNotes ?? []} labelNotes height={96} />;
    case "fretboard":
      return <Fretboard notes={entry.seeNotes ?? []} ariaLabel={`${entry.title} on the fretboard`} />;
    case "chord-diagram":
      return <ChordDiagram chordShape={entry.seeChordShape} title={entry.title} />;
    case "text":
    default:
      return entry.seeText ? (
        <p className="whitespace-pre-wrap font-mono text-xs text-[color:var(--ink-2)] bg-[color:var(--bg-surface-2)] rounded-md p-2">
          {entry.seeText}
        </p>
      ) : null;
  }
}

/**
 * Returns true if the entry has any renderable visual (non-text, OR text with
 * seeText). Used by callers to decide whether to render the visual wrapper.
 */
export function termHasVisual(entry: GlossaryEntry): boolean {
  if (entry.seeKind === "text") return Boolean(entry.seeText);
  return (
    entry.seeKind === "fretboard" ||
    entry.seeKind === "keyboard" ||
    entry.seeKind === "chord-diagram"
  );
}
