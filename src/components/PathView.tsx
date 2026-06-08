"use client";
// PathView — the "autonomous robot mode" curriculum spine.
//
// Shows an ordered, tier-grouped walk of the skill tree so the user always
// knows their one next step. Groups by tier with warm, motivating section
// names. Each step card is clickable to expand an inline lesson panel.
// The "you are here" marker lands on the nextToLearn node (the frontier).
//
// Design contract:
// - Uses only Warm Studio CSS tokens (var(--ink), var(--accent), etc.)
// - Reads state.instrument and skill nodes from the instrument registry
// - Decoupled from graph selection state — self-contained expand state
// - Falls back gracefully when a node has no authored lesson

import { useState, useMemo } from "react";
import { useAppState } from "@/hooks/useAppState";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { resolveStatus, nextToLearn } from "@/lib/skillTree";
import { getLesson } from "@/lib/lessons";
import { linkTerms } from "@/components/explain";
import { LessonMedia } from "@/components/LessonMedia";
import type { NodeLesson, SkillNode, SkillNodeStatus } from "@/lib/types";

// ── Tier section names ──────────────────────────────────────────────────────

const TIER_LABELS: Record<number, { name: string; subtitle: string }> = {
  0: { name: "Start Here — Setup & Orientation", subtitle: "Before you can make music, you need to know your instrument." },
  1: { name: "Foundations", subtitle: "The core shapes and skills everything else is built on." },
  2: { name: "Getting Real", subtitle: "You are playing now. These open up actual songs." },
  3: { name: "Playing With Soul", subtitle: "Expression, feel, and the moments that make music yours." },
  4: { name: "Going Deep", subtitle: "Advanced technique and musical vocabulary." },
  5: { name: "Mastery", subtitle: "The long game — where the serious learning lives." },
  6: { name: "Beyond", subtitle: "Expert-level depth." },
};

function tierLabel(tier: number) {
  return TIER_LABELS[tier] ?? { name: `Tier ${tier}`, subtitle: "" };
}

// ── Status helpers ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<SkillNodeStatus, string> = {
  locked: "Locked",
  available: "Ready",
  "in-progress": "In progress",
  learned: "Learned",
};

const STATUS_COLOR: Record<SkillNodeStatus, string> = {
  locked: "var(--ink-3)",
  available: "var(--instrument-accent-deep)",
  "in-progress": "var(--instrument-accent)",
  learned: "var(--color-success)",
};

// ── Topological sort within a tier ─────────────────────────────────────────
// Orders nodes within a tier so prereqs come before dependents. Stable
// relative to title for equal nodes. Cross-tier prereqs are handled by
// the tier grouping itself (so they don't need to appear before lower tiers).

export function topoSortTier(nodes: SkillNode[]): SkillNode[] {
  const ids = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>(); // id -> ids that depend on it

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  }
  for (const n of nodes) {
    for (const p of n.prereqs) {
      if (ids.has(p)) {
        adj.get(p)!.push(n.id);
        inDegree.set(n.id, (inDegree.get(n.id) ?? 0) + 1);
      }
    }
  }

  // Kahn's algorithm, stable by title for equal priority
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const queue = nodes
    .filter((n) => (inDegree.get(n.id) ?? 0) === 0)
    .sort((a, b) => a.title.localeCompare(b.title));
  const out: SkillNode[] = [];

  while (queue.length) {
    const n = queue.shift()!;
    out.push(n);
    const deps = (adj.get(n.id) ?? [])
      .map((id) => byId.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title));
    for (const dep of deps) {
      const deg = (inDegree.get(dep.id) ?? 1) - 1;
      inDegree.set(dep.id, deg);
      if (deg === 0) {
        const insertIdx = queue.findIndex((q) => q.title.localeCompare(dep.title) > 0);
        if (insertIdx === -1) queue.push(dep);
        else queue.splice(insertIdx, 0, dep);
      }
    }
  }

  // Any remaining (cycle leftovers in a theoretically-valid DAG) go last
  const emitted = new Set(out.map((n) => n.id));
  for (const n of nodes) {
    if (!emitted.has(n.id)) out.push(n);
  }

  return out;
}

// ── Step card ───────────────────────────────────────────────────────────────

interface StepCardProps {
  node: SkillNode;
  status: SkillNodeStatus;
  isYouAreHere: boolean;
  instrument: "piano" | "guitar";
  expanded: boolean;
  onToggle: () => void;
}

function StepCard({ node, status, isYouAreHere, instrument, expanded, onToggle }: StepCardProps) {
  const lesson = getLesson(instrument, node.id);
  const headline = node.soulTitle ?? node.keepTitle ?? node.title;
  const theoryName = node.keepTitle ?? node.title;
  const hasSubtitle = Boolean(node.soulTitle);
  const isLearned = status === "learned";
  const isLocked = status === "locked";

  // First sentence of what, for the card preview line
  const whatPreview = lesson?.what ? lesson.what.split(/[.!?]/)[0] + "." : null;

  return (
    <div
      data-testid={`path-step-${node.id}`}
      className="rounded-xl border transition-shadow"
      style={{
        borderColor: isYouAreHere ? "var(--instrument-accent)" : "var(--rule)",
        background: isYouAreHere ? "var(--instrument-accent-bg)" : "var(--surface)",
        boxShadow: isYouAreHere
          ? "0 0 0 2px var(--instrument-accent), var(--shadow-card)"
          : "var(--shadow-card)",
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      {/* Card header — always visible */}
      <button
        type="button"
        data-testid={`path-step-toggle-${node.id}`}
        onClick={onToggle}
        disabled={isLocked}
        className="w-full text-left p-4 flex items-start gap-3 disabled:cursor-not-allowed"
        aria-expanded={expanded}
      >
        {/* Status dot */}
        <span
          aria-hidden="true"
          className="mt-1 flex-shrink-0 w-3 h-3 rounded-full border-2"
          style={{
            borderColor: STATUS_COLOR[status],
            background: isLearned ? STATUS_COLOR[status] : "transparent",
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-serif text-base leading-snug text-[color:var(--ink)]"
              style={{ fontVariationSettings: "'opsz' 32, 'SOFT' 50" }}
            >
              {headline}
            </h3>
            {isYouAreHere && (
              <span
                data-testid="you-are-here-badge"
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{
                  background: "var(--instrument-accent)",
                  color: "var(--bg-base)",
                }}
              >
                You are here
              </span>
            )}
          </div>
          {hasSubtitle && (
            <p className="text-xs text-[color:var(--ink-3)] mt-0.5">{theoryName}</p>
          )}
          {whatPreview && !expanded && (
            <p className="text-xs text-[color:var(--ink-3)] mt-1 line-clamp-1">{whatPreview}</p>
          )}
          <p
            className="text-[10px] mt-1 uppercase tracking-[0.12em]"
            style={{ color: STATUS_COLOR[status] }}
          >
            {STATUS_LABEL[status]}
          </p>
        </div>

        {/* Expand chevron */}
        {!isLocked && (
          <span
            aria-hidden="true"
            className="flex-shrink-0 text-[color:var(--ink-3)] text-sm mt-1 transition-transform duration-150"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ▾
          </span>
        )}
      </button>

      {/* Expanded lesson panel */}
      {expanded && !isLocked && (
        <div
          data-testid={`path-lesson-${node.id}`}
          className="border-t px-4 pb-5 pt-4 space-y-4"
          style={{ borderColor: "var(--rule)" }}
        >
          {lesson ? (
            <LessonContent node={node} lesson={lesson} />
          ) : (
            <FallbackContent node={node} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Full NodeLesson content ──────────────────────────────────────────────────

function LessonContent({ node, lesson }: { node: SkillNode; lesson: NodeLesson }) {
  return (
    <>
      <Section label="what this is">
        <p
          data-testid="lesson-what"
          className="text-sm text-[color:var(--ink-2)] leading-relaxed"
        >
          {linkTerms(lesson.what, `what-${node.id}`)}
        </p>
      </Section>

      {/* V5.1 — inline visual + audio strip */}
      <LessonMedia node={node} />

      <Section label="why it matters">
        <p className="text-sm text-[color:var(--ink-2)] leading-relaxed italic">
          {linkTerms(lesson.why, `why-${node.id}`)}
        </p>
      </Section>

      {lesson.steps.length > 0 && (
        <Section label="how to do it">
          <ol data-testid="lesson-steps" className="space-y-3">
            {lesson.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{
                    background: "var(--instrument-accent-bg)",
                    color: "var(--instrument-accent-deep)",
                  }}
                >
                  {i + 1}
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm text-[color:var(--ink)]">
                    {linkTerms(step.do, `do-${node.id}-${i}`)}
                  </p>
                  {step.feel && (
                    <p className="text-xs text-[color:var(--ink-3)] italic">{step.feel}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section label="you have it when">
        <p
          data-testid="lesson-good-when"
          className="text-sm text-[color:var(--ink-2)]"
        >
          {linkTerms(lesson.goodWhen, `goodwhen-${node.id}`)}
        </p>
      </Section>

      {lesson.watchOut && (
        <Section label="watch out for">
          <p className="text-sm text-[color:var(--ink-2)]">
            {linkTerms(lesson.watchOut, `watchout-${node.id}`)}
          </p>
        </Section>
      )}

      {lesson.song && (
        <div className="rounded-lg p-3" style={{ background: "var(--surface-2)" }}>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-3)]">in the wild</p>
          <p className="text-sm font-medium text-[color:var(--ink)] mt-0.5">{lesson.song.name}</p>
          <p className="text-xs text-[color:var(--ink-3)] mt-0.5">{lesson.song.note}</p>
        </div>
      )}
    </>
  );
}

// ── Fallback (no lesson authored yet) ───────────────────────────────────────

function FallbackContent({ node }: { node: SkillNode }) {
  return (
    <>
      {/* V5.1 — inline visual + audio strip */}
      <LessonMedia node={node} />

      <Section label="the drill">
        <p
          data-testid="fallback-mastery-drill"
          className="text-sm text-[color:var(--ink-2)] leading-relaxed"
        >
          {linkTerms(node.masteryDrill, `drill-${node.id}`)}
        </p>
      </Section>

      <Section label="what it unlocks">
        <p
          data-testid="fallback-unlock"
          className="text-sm text-[color:var(--ink-2)] italic"
        >
          {linkTerms(node.unlock, `unlock-${node.id}`)}
        </p>
      </Section>
    </>
  );
}

// ── Section label wrapper ────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">{label}</p>
      {children}
    </div>
  );
}

// ── Main PathView ────────────────────────────────────────────────────────────

export function PathView() {
  const { state } = useAppState();
  const [expanded, setExpanded] = useState<string | null>(null);

  const module = getModuleSync(state.instrument);
  const nodes = module?.skillNodes ?? [];
  const progress = state.skillProgress ?? {};

  // Resolve statuses and find the "you are here" frontier node (first available)
  const statusMap = useMemo(() => resolveStatus(nodes, progress), [nodes, progress]);
  const frontier = useMemo(() => nextToLearn(nodes, progress, 1), [nodes, progress]);
  const youAreHereId = frontier[0]?.id ?? null;

  // Group nodes by tier, topologically sorted within each tier
  const tiers = useMemo(() => {
    const byTier = new Map<number, SkillNode[]>();
    for (const node of nodes) {
      const bucket = byTier.get(node.tier) ?? [];
      bucket.push(node);
      byTier.set(node.tier, bucket);
    }
    return Array.from(byTier.entries())
      .sort(([a], [b]) => a - b)
      .map(([tier, tierNodes]) => ({ tier, nodes: topoSortTier(tierNodes) }));
  }, [nodes]);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div data-testid="path-view" className="space-y-8">
      {/* Motivating header */}
      <p className="text-sm text-[color:var(--ink-3)] italic leading-relaxed">
        Every step here is a step toward playing the songs you want.
        Follow the path, one box at a time.
      </p>

      {tiers.map(({ tier, nodes: tierNodes }) => {
        const label = tierLabel(tier);
        return (
          <section key={tier} data-testid={`path-tier-${tier}`}>
            <div className="mb-4">
              <h2
                data-testid={`path-tier-name-${tier}`}
                className="font-serif text-xl text-[color:var(--ink)]"
                style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 50" }}
              >
                {label.name}
              </h2>
              {label.subtitle && (
                <p className="text-xs text-[color:var(--ink-3)] mt-0.5">{label.subtitle}</p>
              )}
              <div className="mt-2 h-px" style={{ background: "var(--rule)" }} />
            </div>

            <div className="space-y-3">
              {tierNodes.map((node) => {
                const status = statusMap.get(node.id) ?? "locked";
                const isYouAreHere = node.id === youAreHereId;
                return (
                  <StepCard
                    key={node.id}
                    node={node}
                    status={status}
                    isYouAreHere={isYouAreHere}
                    instrument={state.instrument}
                    expanded={expanded === node.id}
                    onToggle={() => toggle(node.id)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {nodes.length === 0 && (
        <p className="text-sm text-[color:var(--ink-3)] italic">
          No skill data loaded yet. Start a session to see your path.
        </p>
      )}
    </div>
  );
}
