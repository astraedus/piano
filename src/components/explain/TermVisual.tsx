"use client";
// TermVisual — the SEE section renderer extracted from Explain.tsx.
//
// Renders the instrument visual for a GlossaryEntry based on its seeKind.
// Shared between Explain (the floating explainer card) and LessonMedia
// (the inline visual in lesson panels) so neither duplicates the dispatch.
//
// Instrument-aware: a shared concept (improvisation, the 12-bar blues) can carry
// a per-instrument SEE override so a PIANO lesson shows a keyboard while GUITAR
// keeps the fretboard box. Callers pass the active instrument; absent it, the
// entry's primary (default) SEE renders.

import type { GlossaryEntry, GlossarySee } from "@/lib/explain/glossary";
import type { Instrument } from "@/lib/types";
import { Fretboard } from "@/lib/guitar/components/Fretboard";
import { ChordDiagram } from "@/lib/guitar/components/ChordDiagram";
import { Keyboard } from "@/lib/piano/components/Keyboard";

export interface TermVisualProps {
  entry: GlossaryEntry;
  /** Active instrument — selects a per-instrument SEE override when present. */
  instrument?: Instrument;
}

/** Resolve the SEE payload for an entry under the active instrument: a matching
 *  per-instrument override wins, else the entry's primary SEE fields. */
export function resolveSee(entry: GlossaryEntry, instrument?: Instrument): GlossarySee {
  const override = instrument ? entry.seeByInstrument?.[instrument] : undefined;
  return override ?? entry;
}

/**
 * Renders the SEE section for a glossary entry.
 * Returns null when the entry has no visual content (seeKind "text" with no
 * seeText, or falls through to default). Callers can guard on this.
 */
export function TermVisual({ entry, instrument }: TermVisualProps) {
  const see = resolveSee(entry, instrument);
  switch (see.seeKind) {
    case "keyboard":
      return <Keyboard notes={see.seeNotes ?? []} labelNotes height={96} />;
    case "fretboard":
      return (
        <Fretboard
          positions={see.seePositions ?? []}
          ariaLabel={`${entry.title} on the fretboard`}
        />
      );
    case "chord-diagram":
      return <ChordDiagram chordShape={see.seeChordShape} title={entry.title} />;
    case "text":
    default:
      return see.seeText ? (
        <p className="whitespace-pre-wrap font-mono text-xs text-[color:var(--ink-2)] bg-[color:var(--bg-surface-2)] rounded-md p-2">
          {see.seeText}
        </p>
      ) : null;
  }
}

/**
 * Returns true if the entry has any renderable visual under the active
 * instrument (non-text, OR text with seeText). Used by callers to decide whether
 * to render the visual wrapper.
 */
export function termHasVisual(entry: GlossaryEntry, instrument?: Instrument): boolean {
  const see = resolveSee(entry, instrument);
  if (see.seeKind === "text") return Boolean(see.seeText);
  return (
    see.seeKind === "fretboard" ||
    see.seeKind === "keyboard" ||
    see.seeKind === "chord-diagram"
  );
}
