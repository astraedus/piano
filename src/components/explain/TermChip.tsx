"use client";
// Soul-First Learning (V4) — the TermChip.
//
// A small dotted-underline span that, on tap/click/Enter/Space, opens the
// singleton <Explain> card for a glossary term. It is the "nothing unexplained"
// affordance: any musical term in the UI can be wrapped in a chip so a beginner
// can tap it and learn WHAT/HEAR/SEE/WHY without leaving the screen.
//
// Graceful degrade: if the term is unknown to the glossary, the chip renders its
// label as plain text (no affordance, no dead click) so wiring a chip can never
// produce a broken-looking dud.
//
// P-C wiring (the only thing P-C does with this):
//   <TermChip term="power-chord" />                       // inline, mid-sentence
//   <TermChip term={nodeToTermId(id)} label={node.title} variant="subtitle" />
// where `term` is a glossary id/title/alias and `label` overrides the display.

import { useRef } from "react";
import { lookupTerm } from "@/lib/explain/glossary";
import { useExplain } from "./useExplain";

export interface TermChipProps {
  term: string; // glossary lookup key, e.g. "power-chord", "g-major"
  label?: string; // display override; defaults to the glossary entry title
  variant?: "inline" | "subtitle"; // inline = mid-sentence; subtitle = below a node title
  className?: string;
}

export function TermChip({ term, label, variant = "inline", className }: TermChipProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { open } = useExplain();
  const entry = lookupTerm(term);

  // Unknown term: render plain text, no affordance. Never a dead chip.
  if (!entry) {
    return <span className={className}>{label ?? term}</span>;
  }

  const display = label ?? entry.title;

  const fire = () => {
    if (ref.current) open(entry, ref.current);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fire();
    }
  };

  const base =
    "cursor-help underline decoration-dotted decoration-[color:var(--ink-3)] underline-offset-2 hover:decoration-[color:var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-soft)] rounded-sm";
  const variantCls =
    variant === "subtitle"
      ? "text-sm text-[color:var(--ink-3)]"
      : "text-[color:var(--ink)]";

  return (
    <span
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Explain: ${entry.title}`}
      onClick={fire}
      onKeyDown={onKeyDown}
      className={[base, variantCls, className].filter(Boolean).join(" ")}
    >
      {display}
    </span>
  );
}
