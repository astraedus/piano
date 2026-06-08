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
import { TermChip, linkTerms } from "@/components/explain";
import { nodeToTermId } from "@/lib/pathFilter";
import { getLesson } from "@/lib/lessons";
import { LessonMedia } from "@/components/LessonMedia";

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

  // V5 — teaching content. getLesson returns undefined for shared nodes or any
  // node whose lesson hasn't been authored yet. Degrade gracefully to the
  // existing drill/unlock one-liners when undefined.
  const lesson = node.instrument !== "shared"
    ? getLesson(node.instrument, node.id)
    : undefined;

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

      {/* V5 — full teaching lesson when authored; fallback to drill/unlock one-liners. */}
      {lesson ? (
        <div data-testid="sg-lesson" className="flex flex-col gap-4">
          <Section label="what this is">
            <p data-testid="sg-lesson-what" className="text-sm text-[color:var(--ink-2)]">
              {linkTerms(lesson.what, "lw-")}
            </p>
          </Section>

          {/* V5.1 — inline visual + audio. LessonMedia renders nothing if the node
              has neither a viz nor a glossary term with an audible/visual entry. */}
          <LessonMedia node={node} />

          <Section label="why it matters">
            <p className="text-sm text-[color:var(--ink-2)]">
              {linkTerms(lesson.why, "ly-")}
            </p>
          </Section>

          <Section label="how to do it">
            <ol data-testid="sg-lesson-steps" className="flex flex-col gap-2">
              {lesson.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span
                    className="mt-0.5 flex-shrink-0 font-semibold tabular-nums"
                    style={{ color: "var(--instrument-accent-deep)" }}
                  >
                    {i + 1}.
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[color:var(--ink-2)]">
                      {linkTerms(step.do, `ls${i}d-`)}
                    </span>
                    {step.feel && (
                      <span className="text-xs italic text-[color:var(--ink-3)]">
                        {linkTerms(step.feel, `ls${i}f-`)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          <Section label="you've got it when">
            <p data-testid="sg-lesson-good" className="text-sm text-[color:var(--ink-2)]">
              {linkTerms(lesson.goodWhen, "lg-")}
            </p>
          </Section>

          {lesson.watchOut && (
            <Section label="watch out">
              <p data-testid="sg-lesson-watch" className="text-sm text-[color:var(--ink-2)]">
                {linkTerms(lesson.watchOut, "lwo-")}
              </p>
            </Section>
          )}

          {lesson.song && (
            <Section label="try it on">
              <p data-testid="sg-lesson-song" className="text-sm text-[color:var(--ink-2)]">
                <em className="font-medium not-italic" style={{ color: "var(--instrument-accent-deep)" }}>
                  {lesson.song.name}
                </em>
                {" — "}
                {lesson.song.note}
              </p>
            </Section>
          )}

          <Section label="tonight's target">
            <p data-testid="sg-panel-drill" className="text-sm text-[color:var(--ink-2)]">
              {linkTerms(node.masteryDrill, "td-")}
            </p>
          </Section>

          <Section label="what it unlocks">
            <p data-testid="sg-panel-unlock" className="text-sm text-[color:var(--ink-2)] italic">
              {linkTerms(node.unlock, "tu-")}
            </p>
          </Section>
        </div>
      ) : (
        <>
          {/* V5.1 — inline visual + audio (fallback path, no authored lesson). */}
          <LessonMedia node={node} />

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
        </>
      )}

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

      {/* Note: the old P4 viz extension slot (sg-viz-slot) has been superseded by
          LessonMedia above, which renders the visual inline in the lesson. */}

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


function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">{label}</p>
      {children}
    </div>
  );
}
