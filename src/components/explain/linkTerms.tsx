// Inline glossary term scanner. Wraps any glossary term found in a plain sentence
// with a TermChip, leaving the rest as text — so lesson/stand/panel prose can be
// authored as plain strings and the tappable explainers appear automatically.
//
// Extracted from SkillGraphPanel (V4) into a shared util (V5) so the panel, the
// practice stand, and the path view all link terms the same way. Lean by design:
// each distinct term is linked at most once per string (first whole-word match) so
// prose stays readable rather than a wall of underlines. Unknown text degrades to
// plain text (never a dead chip); returns the original string when nothing matches.

import type { ReactNode } from "react";
import { TermChip } from "./TermChip";
import { GLOSSARY, lookupTerm } from "@/lib/explain/glossary";

// Every glossary phrase (title + aliases) paired with its term id, longest-first so
// a multi-word phrase ("power chord") wins over a substring ("chord"). Built once.
const SCAN_PHRASES: { phrase: string; term: string }[] = GLOSSARY.flatMap((e) => [
  { phrase: e.title, term: e.id },
  ...e.aliases.map((a) => ({ phrase: a, term: e.id })),
])
  .filter((p) => p.phrase.trim().length >= 3)
  .sort((a, b) => b.phrase.length - a.phrase.length);

const wordBoundary = (ch: string | undefined) => ch === undefined || !/[A-Za-z]/.test(ch);

/**
 * Wrap glossary terms found in `text` with TermChips. Each distinct term links at
 * most once (first whole-word, case-insensitive match). Returns plain text when
 * nothing matches. `keyPrefix` keeps React keys unique when called many times.
 */
export function linkTerms(text: string, keyPrefix = "t"): ReactNode {
  const out: ReactNode[] = [];
  const used = new Set<string>();
  let cursor = 0;
  let key = 0;
  const lower = text.toLowerCase();

  while (cursor < text.length) {
    let best: { start: number; end: number; term: string } | null = null;
    for (const { phrase, term } of SCAN_PHRASES) {
      if (used.has(term)) continue;
      const idx = lower.indexOf(phrase.toLowerCase(), cursor);
      if (idx === -1) continue;
      if (!wordBoundary(text[idx - 1]) || !wordBoundary(text[idx + phrase.length])) continue;
      if (!lookupTerm(term)) continue;
      if (!best || idx < best.start) best = { start: idx, end: idx + phrase.length, term };
    }
    if (!best) {
      out.push(text.slice(cursor));
      break;
    }
    if (best.start > cursor) out.push(text.slice(cursor, best.start));
    const label = text.slice(best.start, best.end);
    out.push(<TermChip key={`${keyPrefix}${key++}`} term={best.term} label={label} />);
    used.add(best.term);
    cursor = best.end;
  }

  return out.length ? out : text;
}
