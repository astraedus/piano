"use client";
// CurrentLessonCard — the bridge between the stand and the tree.
//
// The stand answers "what do I do now"; the tree answers "where am I on the
// path". This quiet card, sitting under the actionable slots, answers the third
// question the session never did: "which lesson on the path am I actually on
// right now?" It names tonight's node, gives one line of plain context, shows the
// learned-count, and deep-links into Your Path (?node=<id>) so the map is one tap
// away. Map-level context only — it must not compete with the slots' "do this now".

import Link from "next/link";
import type { ChainDrill, Instrument, SkillNode, SkillProgress } from "@/lib/types";
import { currentLessonNode } from "@/lib/currentLesson";
import { skillLearnedCount } from "@/lib/skillSummary";
import { getLesson } from "@/lib/lessons";
import { tierLabel } from "@/lib/tierLabels";
import { linkTerms } from "@/components/explain";

/** First sentence of a prose string, punctuation intact. Empty in → empty out. */
function firstSentence(text: string | undefined): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : trimmed).trim();
}

export function CurrentLessonCard({
  nodes,
  progress,
  chainDrill,
  instrument,
}: {
  nodes: SkillNode[];
  progress: Record<string, SkillProgress>;
  chainDrill: ChainDrill | null | undefined;
  instrument: Instrument;
}) {
  const node = currentLessonNode(nodes, progress, chainDrill);
  // Hidden entirely when there's nothing to point at (all learned / no module).
  if (!node) return null;

  const { learned, total } = skillLearnedCount(nodes, progress);
  const lesson = getLesson(instrument, node.id);
  // One plain line: the lesson's "why" (the real playing it unlocks), else the
  // node's capability sentence. Term-linked so any musical word stays tappable.
  const context = firstSentence(lesson?.why ?? node.unlock);
  const title = node.soulTitle ?? node.keepTitle ?? node.title;
  const tierName = tierLabel(node.tier).name;

  return (
    <div
      data-testid="current-lesson-card"
      className="no-print mt-6 rounded-xl border px-5 py-4"
      style={{
        borderColor: "var(--rule)",
        background: "var(--surface)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-3)]">
            Your path
          </p>
          <p
            data-testid="current-lesson-title"
            className="font-serif text-base text-[color:var(--ink)] tracking-[-0.01em] mt-0.5 truncate"
            style={{ fontVariationSettings: "'opsz' 28, 'SOFT' 40" }}
          >
            {title}
          </p>
          <p className="text-xs text-[color:var(--ink-3)] mt-0.5 truncate">{tierName}</p>
        </div>
        {total > 0 && (
          <p
            data-testid="current-lesson-count"
            className="shrink-0 pt-0.5 text-xs text-[color:var(--ink-3)] whitespace-nowrap tabular-nums"
          >
            <span className="living-number text-[color:var(--ink-2)]">{learned}</span> of {total} learned
          </p>
        )}
      </div>

      {context && (
        <p
          data-testid="current-lesson-context"
          className="mt-2 text-sm text-[color:var(--ink-2)] leading-relaxed line-clamp-1"
        >
          {linkTerms(context, `cl-${node.id}`)}
        </p>
      )}

      <Link
        href={`/tree?node=${encodeURIComponent(node.id)}`}
        data-testid="current-lesson-cta"
        className="mt-3 inline-block text-sm font-medium text-[color:var(--instrument-accent-deep)] underline decoration-1 underline-offset-2 transition-opacity hover:opacity-80"
      >
        Open lesson →
      </Link>
    </div>
  );
}
