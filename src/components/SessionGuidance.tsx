"use client";
import Link from "next/link";
import type { SkillNode } from "@/lib/types";
import type { SlotKey } from "./slots/repResume";

// Session-guidance presentational surfaces, extracted from PracticeStand so
// they unit-test without the stand's heavy audio/slot deps: the progress cue
// (desktop rail + mobile NOW line), the due-review banner, and the end-of-
// session closure recap. All are pure props in / callbacks out.

const GOAL_LABELS: Record<SlotKey, string> = {
  warmup: "Warm up",
  piece: "Work your piece",
  chain: "Run the chain drill",
  ear: "Train your ear",
  free: "Free play",
};

/** The "where am I in tonight's plan" cue. On desktop it lives in the info rail
 *  (Your goal + Block N of M + minutes in). The rail is hidden on mobile, so a
 *  compact one-liner also renders there, keeping an explicit NOW marker + progress
 *  visible, the mobile stand had none before. */
export function GoalRail({ nowSlot, blockIndex, blockTotal, elapsedMin }: {
  nowSlot: SlotKey;
  blockIndex: number;
  blockTotal: number;
  elapsedMin: number;
}) {
  const label = GOAL_LABELS[nowSlot];
  const blockLine = `Block ${blockIndex} of ${blockTotal}`;
  const minLine = elapsedMin > 0 ? ` · ${elapsedMin} min in` : "";
  return (
    <>
      <div className="hidden lg:block rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-1">Your goal</p>
        <p className="font-serif text-base text-[color:var(--ink)]">{label}</p>
        <p data-testid="session-progress-rail" className="text-xs text-[color:var(--ink-3)] mt-1">
          {blockLine}{minLine}
        </p>
        <p className="text-xs text-[color:var(--ink-3)] mt-1">The stand flows top to bottom — one block at a time.</p>
      </div>
      <div
        data-testid="mobile-now-line"
        className="lg:hidden flex items-center gap-2 rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-3 py-2 text-sm"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--accent-deep)]">Now</span>
        <span className="font-medium text-[color:var(--ink)]">{label}</span>
        <span data-testid="mobile-block" className="ml-auto text-xs text-[color:var(--ink-3)] tabular-nums">{blockLine}{minLine}</span>
      </div>
    </>
  );
}

/** A quiet "reviews are waiting" surface near the top of the stand, so a user who
 *  ends before reaching Free Play still SEES which spaced-review skills are due.
 *  Plain count + the most-overdue item; taps down to the Free Play slot where the
 *  review cards live. Renders nothing when nothing is due (no nag). */
export function ReviewDueBanner({ reviewSkills }: { reviewSkills: SkillNode[] }) {
  if (!reviewSkills || reviewSkills.length === 0) return null;
  const top = reviewSkills[0];
  const n = reviewSkills.length;
  return (
    <a
      href="#free-play"
      data-testid="review-due-banner"
      className="block rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-3 py-2 hover:border-[color:var(--accent-soft)] transition-colors"
    >
      <p className="text-xs text-[color:var(--ink-2)]">
        <span className="font-medium text-[color:var(--ink)]">
          {n === 1 ? "1 skill" : `${n} skills`} due for a refresh
        </span>
        {top ? <>, {top.title} first.</> : "."}
      </p>
      <p className="text-[11px] text-[color:var(--ink-3)] mt-0.5">Waiting in Free Play.</p>
    </a>
  );
}

export interface ClosureData {
  headline: string;
  blocksCompleted: number;
  blocksTotal: number;
  minutes: number;
  reps: number;
  bestBpm?: number;
  earRight: number;
  earTotal: number;
  xpEarned: number;
  nextTitle?: string;
}

/** The end-of-session closure state. Draws a clear line under tonight: a recap of
 *  what happened (blocks, reps, best tempo, ear answers, XP), a warm permission-
 *  giving close, and one forward pointer to the next thing on Your Path. Shown as
 *  an overlay OVER the freshly-regenerated stand; dismiss returns to it. Waits for
 *  any unlock / level-up reward moments to finish first (`blocked`). */
export function SessionClosureOverlay({ data, blocked, onClose }: {
  data: ClosureData | null;
  blocked: boolean;
  onClose: () => void;
}) {
  if (!data || blocked) return null;
  const stats: string[] = [];
  stats.push(`${data.blocksCompleted} of ${data.blocksTotal} blocks`);
  if (data.minutes > 0) stats.push(`${data.minutes} min`);
  if (data.reps > 0) stats.push(`${data.reps} ${data.reps === 1 ? "rep" : "reps"}`);
  if (data.bestBpm) stats.push(`${data.bestBpm} BPM best`);
  if (data.earTotal > 0) stats.push(`${data.earRight}/${data.earTotal} by ear`);
  if (data.xpEarned > 0) stats.push(`+${data.xpEarned} XP`);
  return (
    <div
      data-testid="session-closure"
      className="fixed inset-0 z-30 bg-[rgba(35,26,14,0.45)] backdrop-blur-sm flex items-center justify-center p-6 no-print"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-[color:var(--bg-surface)] rounded-[20px] p-8 overflow-hidden"
        style={{ boxShadow: "var(--shadow-stage), var(--lit-edge)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, var(--color-piano-400, #e8a820), var(--color-piano-200, #fae0a0))" }}
          aria-hidden
        />
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)] mb-3">That&apos;s tonight</p>
        <h2
          className="font-serif text-[length:var(--text-2xl)] text-[color:var(--ink)] leading-[1.15] tracking-[-0.025em] mb-4"
          style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 40" }}
        >
          {data.headline}
        </h2>
        <ul data-testid="closure-stats" className="text-sm text-[color:var(--ink-2)] space-y-1 mb-5">
          {stats.map((s, i) => (
            <li key={i} className="flex items-baseline gap-2">
              <span className="text-[color:var(--accent-deep)]" aria-hidden>·</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <p className="font-serif italic text-[length:var(--text-base)] text-[color:var(--instrument-accent-deep)] leading-relaxed mb-5">
          That counts. Rest up, come back tomorrow.
        </p>
        {data.nextTitle && (
          <Link
            href="/tree"
            data-testid="closure-next"
            onClick={onClose}
            className="block rounded-lg border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-4 py-3 mb-6 hover:border-[color:var(--accent-soft)] transition-colors"
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-0.5">Next up</p>
            <p className="text-sm font-medium text-[color:var(--ink)]">{data.nextTitle}</p>
            <p className="text-xs text-[color:var(--ink-3)] mt-0.5">on Your Path</p>
          </Link>
        )}
        <button
          type="button"
          data-testid="closure-dismiss"
          onClick={onClose}
          className="cta-pill w-full text-sm font-semibold tracking-[0.04em] py-2.5"
        >
          Back to the stand
        </button>
      </div>
    </div>
  );
}
