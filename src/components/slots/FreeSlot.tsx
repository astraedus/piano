"use client";
import { useState } from "react";
import { Slot } from "../Slot";
import { useAppState } from "@/hooks/useAppState";
import type { SkillNode } from "@/lib/types";

// onJournalChange / onUrlChange are plain function callbacks. FreeSlot is a
// 'use client' component rendered only by PracticeStand (also 'use client'), so
// these props never cross a server->client boundary. Next 16's serializable-prop
// warning is a false positive here; the *Action naming convention is for props a
// Server Component passes down, which never happens for this component.
export function FreeSlot({
  urlInitial, journalInitial, onJournalChange, onUrlChange, printAlways, expanded,
  reviewSkills,
}: {
  urlInitial?: string;
  journalInitial?: string;
  onJournalChange?: (v: string) => void;
  onUrlChange?: (v: string) => void;
  printAlways?: boolean;
  expanded?: boolean;
  // R7 — learned skill nodes due for spaced review today. Absent/empty → nothing
  // shown (no regression). Marking one done advances its review interval.
  reviewSkills?: SkillNode[];
}) {
  const { patch, reviewSkill } = useAppState();
  const [url, setUrl] = useState(urlInitial ?? "");
  const [journal, setJournal] = useState(journalInitial ?? "");
  // Track which reviews have been handled this session so the card disappears the
  // moment it's marked done (state advances the interval; the plan won't re-surface
  // it until next session anyway, but this gives instant feedback).
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  const dueReviews = (reviewSkills ?? []).filter((n) => !reviewedIds.includes(n.id));

  const handleReviewDone = (nodeId: string) => {
    reviewSkill(nodeId);
    setReviewedIds((ids) => [...ids, nodeId]);
  };

  return (
    <Slot
      index={5}
      title="Free Play"
      pillar="expression"
      summary={<>Free play. Anything you want.</>}
      defaultOpen={expanded}
      printAlways={printAlways}
    >
      <div className="space-y-3 text-sm">
        {dueReviews.length > 0 && (
          <div data-testid="free-reviews" className="space-y-2 no-print">
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--ink-3)]">
              Bring these back
            </p>
            <p className="text-xs text-[color:var(--ink-3)] italic">
              Skills you learned earlier, due for a quick refresh. Play one, then mark it done.
            </p>
            <ul className="space-y-2">
              {dueReviews.map((node) => (
                <li
                  key={node.id}
                  data-testid={`free-review-${node.id}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[color:var(--ink)]">
                      Bring back: {node.title}
                    </p>
                    <p className="text-xs text-[color:var(--ink-3)] mt-0.5">{node.masteryDrill}</p>
                  </div>
                  <button
                    type="button"
                    data-testid={`free-review-done-${node.id}`}
                    onClick={() => handleReviewDone(node.id)}
                    className="shrink-0 rounded-lg border px-2.5 py-1 text-xs transition-colors hover:opacity-80"
                    style={{ borderColor: "var(--instrument-accent)", color: "var(--instrument-accent-deep)" }}
                  >
                    Did It
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="text-[color:var(--ink-2)] leading-relaxed space-y-1 font-serif text-base">
          <li>→ Play anything.</li>
          <li>→ Jump back into your piece.</li>
          <li>→ Pick up something you heard today.</li>
        </ul>
        <div className="pt-2 space-y-2 no-print">
          <label className="block">
            <span className="block text-xs text-[color:var(--ink-3)] mb-1 tracking-wide">A link you keep coming back to</span>
            <input
              className="w-full bg-[color:var(--bg-surface-2)] border border-[color:var(--rule)] rounded-sm px-3 py-1.5 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]"
              value={url}
              onChange={(e) => { setUrl(e.target.value); onUrlChange?.(e.target.value); patch({ freeSlotUrl: e.target.value }); }}
              placeholder="MuseScore, YouTube, anything"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-[color:var(--ink-3)] mb-1 tracking-wide">What happened tonight?</span>
            <input
              className="w-full bg-[color:var(--bg-surface-2)] border border-[color:var(--rule)] rounded-sm px-3 py-1.5 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]"
              value={journal}
              onChange={(e) => { setJournal(e.target.value); onJournalChange?.(e.target.value); }}
              placeholder="Optional. A line in your own words."
            />
          </label>
        </div>
      </div>
    </Slot>
  );
}
