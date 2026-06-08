"use client";
// Side panel for the selected skill-graph node.
//
// Shows: title, status, tier/category, the mastery drill, the unlock sentence,
// prereqs (with their resolved status), an extension SLOT for guitar visuals
// (P4 fills this off `node.viz`), and the two affordances:
//   - "add to today"  → markNodeProgress (bumps a rep → in-progress)
//   - "mark learned"  → markNodeProgress({ learned: true })
// Both write through the AppState hook's `patch`, so the graph re-derives status.

import type { ReactNode } from "react";
import type { SkillNode, SkillNodeStatus } from "@/lib/types";
import type { DifficultyVerdict } from "@/lib/skillTree";
import { ChordDiagram } from "@/lib/guitar/components/ChordDiagram";
import { Fretboard } from "@/lib/guitar/components/Fretboard";
import { Tab } from "@/lib/guitar/components/Tab";
import { TermChip } from "@/components/explain";
import { nodeToTermId } from "@/lib/pathFilter";
import { GLOSSARY, lookupTerm } from "@/lib/explain/glossary";

const STATUS_LABEL: Record<SkillNodeStatus, string> = {
  locked: "Locked",
  available: "Ready to start",
  "in-progress": "In progress",
  learned: "Learned",
};

// R3 — self-assessment label + helper line per difficulty bucket. `unknown` is
// not rendered (not enough attempts to judge).
const DIFFICULTY_META: Record<Exclude<DifficultyVerdict, "unknown">, { label: string; hint: string }> = {
  "too-easy": { label: "Too Easy", hint: "You're clearing this almost every time. Push the tempo or move on." },
  "just-right": { label: "Just Right", hint: "This is sitting in the sweet spot. Keep at it." },
  "too-hard": { label: "Too Hard", hint: "You're missing a lot. Slow it down and shrink the chunk." },
};

export interface SkillGraphPanelProps {
  node: SkillNode | null;
  status: SkillNodeStatus | undefined;
  /** node id → its resolved status, for rendering prereq chips. */
  statusById: Map<string, SkillNodeStatus>;
  /** node id → title, for naming prereqs. */
  titleById: Map<string, string>;
  /** R10 — node has passed its fluency test. */
  fluent?: boolean;
  /** R3 — self-assessment verdict from the node's recorded success rate. */
  difficulty?: DifficultyVerdict;
  onCloseAction: () => void;
  onAddToTodayAction: (nodeId: string) => void;
  onMarkLearnedAction: (nodeId: string) => void;
  /** R10 — mark the node fluent (passed the autonomous test). */
  onMarkFluentAction: (nodeId: string) => void;
}

export function SkillGraphPanel({
  node,
  status,
  statusById,
  titleById,
  fluent,
  difficulty,
  onCloseAction,
  onAddToTodayAction,
  onMarkLearnedAction,
  onMarkFluentAction,
}: SkillGraphPanelProps) {
  if (!node) return null;
  const learned = status === "learned";
  const locked = status === "locked";
  const difficultyMeta =
    difficulty && difficulty !== "unknown" ? DIFFICULTY_META[difficulty] : null;

  // V4 Soul-First — lead with the feeling/outcome label. The theory name becomes a
  // tappable subtitle when a soulTitle exists (theory-only nodes have none, so the
  // theory name IS the headline and no subtitle is shown). The subtitle links to
  // the glossary via nodeToTermId; when the node has no mapped term it renders as
  // plain text (no dead chip).
  const headline = node.soulTitle ?? node.keepTitle ?? node.title;
  const theoryName = node.keepTitle ?? node.title;
  const showTheorySubtitle = Boolean(node.soulTitle);
  const theoryTermId = nodeToTermId(node.id);

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
          <h3
            data-testid="sg-panel-title"
            className="font-serif text-lg leading-tight text-[color:var(--ink)]"
          >
            {headline}
          </h3>
          {showTheorySubtitle && (
            <p data-testid="sg-panel-theory" className="leading-tight">
              {theoryTermId ? (
                <TermChip term={theoryTermId} label={theoryName} variant="subtitle" />
              ) : (
                <span className="text-sm text-[color:var(--ink-3)]">{theoryName}</span>
              )}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <p
              data-testid="sg-panel-status"
              className="text-xs italic"
              style={{ color: locked ? "var(--ink-3)" : "var(--instrument-accent-deep)" }}
            >
              {STATUS_LABEL[status ?? "locked"]}
            </p>
            {fluent && (
              <span
                data-testid="sg-panel-fluent"
                className="inline-flex items-center gap-1 rounded-full bg-[color:var(--instrument-accent-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--instrument-accent-deep)]"
              >
                ✦ Fluent
              </span>
            )}
          </div>
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
        <p data-testid="sg-panel-drill" className="text-sm text-[color:var(--ink-2)]">
          {linkTerms(node.masteryDrill)}
        </p>
      </Section>

      <Section label="what it unlocks">
        <p data-testid="sg-panel-unlock" className="text-sm text-[color:var(--ink-2)] italic">
          {linkTerms(node.unlock)}
        </p>
      </Section>

      {/* R3 — difficulty self-assessment from the recorded success rate. Only shown
          once there are enough attempts to judge (verdict !== unknown). */}
      {difficultyMeta && (
        <Section label="how it's going">
          <div data-testid="sg-panel-difficulty" data-verdict={difficulty} className="space-y-1">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--instrument-accent-deep)" }}
            >
              {difficultyMeta.label}
            </p>
            <p className="text-xs text-[color:var(--ink-3)]">{difficultyMeta.hint}</p>
          </div>
        </Section>
      )}

      {/* R10 — fluency milestone. Knowing a skill is not the same as it being
          automatic. Offered once a node is learned, has a fluencyTest, and is not
          already marked fluent. */}
      {learned && node.fluencyTest && !fluent && (
        <Section label="fluency check">
          <div data-testid="sg-panel-fluency-check" className="space-y-2">
            <p className="text-xs text-[color:var(--ink-3)]">
              Knowing it is not the same as it being automatic. Prove it runs without your full attention:
            </p>
            <p className="text-sm text-[color:var(--ink-2)]">{node.fluencyTest.prompt}</p>
            <button
              type="button"
              data-testid="sg-mark-fluent"
              onClick={() => onMarkFluentAction(node.id)}
              className="rounded-lg px-3 py-1.5 text-sm text-[color:var(--bg-base)] transition-opacity hover:opacity-90"
              style={{ background: "var(--instrument-accent)" }}
            >
              I Did It
            </button>
          </div>
        </Section>
      )}

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

// ── Inline term scanner ─────────────────────────────────────────────────────
// Every glossary phrase (title + aliases) paired with its term id, longest-first
// so a multi-word phrase ("power chord") wins over a substring ("chord"). Built
// once at module load; the GLOSSARY is static.
const SCAN_PHRASES: { phrase: string; term: string }[] = GLOSSARY.flatMap((e) => [
  { phrase: e.title, term: e.id },
  ...e.aliases.map((a) => ({ phrase: a, term: e.id })),
])
  .filter((p) => p.phrase.trim().length >= 3) // skip 1-2 char noise
  .sort((a, b) => b.phrase.length - a.phrase.length);

const wordBoundary = (ch: string | undefined) => ch === undefined || !/[A-Za-z]/.test(ch);

/**
 * Wrap glossary terms found in a plain sentence with TermChips, leaving the rest
 * as text. Lean by design: each distinct term is linked at most once (the first,
 * whole-word, case-insensitive match) so the sentence stays readable rather than
 * a wall of underlines. Unknown text degrades to plain text (no chips). Returns
 * the original string when nothing matches, so callers never get a dead node.
 */
function linkTerms(text: string): ReactNode {
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
      // whole-word match only (avoid "art" inside "start").
      if (!wordBoundary(text[idx - 1]) || !wordBoundary(text[idx + phrase.length])) continue;
      // confirm the term actually resolves (guards aliases that drift).
      if (!lookupTerm(term)) continue;
      if (!best || idx < best.start) best = { start: idx, end: idx + phrase.length, term };
    }
    if (!best) {
      out.push(text.slice(cursor));
      break;
    }
    if (best.start > cursor) out.push(text.slice(cursor, best.start));
    const label = text.slice(best.start, best.end);
    out.push(<TermChip key={`t${key++}`} term={best.term} label={label} />);
    used.add(best.term);
    cursor = best.end;
  }

  return out.length ? out : text;
}
