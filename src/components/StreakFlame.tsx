"use client";
import type { StreakState } from "@/lib/types";

/**
 * Streak flame — a small warm ember with the current day count beside it.
 * GENTLE by design: the underlying streak is forgiving (a single missed day is
 * grace, not a reset), so the copy reassures rather than threatens. The longest
 * streak surfaces as a secondary line (default) or a title tooltip (compact).
 *
 * Pure presentation — reads StreakState only.
 */
export function StreakFlame({ streak, compact = false, className = "" }: { streak: StreakState; compact?: boolean; className?: string }) {
  const { current, longest } = streak;
  const lit = current > 0;

  // Compact: header indicator. Ember glyph + count, longest on hover.
  if (compact) {
    if (!lit) {
      return (
        <span
          className={"inline-flex items-center gap-1 text-[color:var(--ink-3)] " + className}
          title="Practice tonight to start a streak"
          aria-label="No streak yet"
        >
          <Ember lit={false} />
        </span>
      );
    }
    return (
      <span
        className={"inline-flex items-center gap-1 " + className}
        title={longest > current ? `Longest: ${longest} days` : "Your streak"}
        aria-label={`${current}-day streak`}
      >
        <Ember lit />
        <span className="text-[length:var(--text-sm)] font-semibold tabular-nums text-[color:var(--instrument-accent-deep)]">
          {current}
        </span>
      </span>
    );
  }

  // Default: a small labelled block (PracticeStand strip).
  if (!lit) {
    return (
      <div className={"flex items-center gap-2 " + className}>
        <Ember lit={false} />
        <div>
          <div className="text-[length:var(--text-sm)] text-[color:var(--ink-2)]">no streak yet</div>
          <div className="text-[length:var(--text-xs)] text-[color:var(--ink-3)]">tonight starts one</div>
        </div>
      </div>
    );
  }

  return (
    <div className={"flex items-center gap-2 " + className}>
      <Ember lit />
      <div>
        <div className="text-[length:var(--text-sm)] text-[color:var(--ink)]">
          <span className="font-semibold tabular-nums">{current}</span>
          <span className="text-[color:var(--ink-2)]"> {current === 1 ? "day" : "days"} in a row</span>
        </div>
        <div className="text-[length:var(--text-xs)] text-[color:var(--ink-3)]">
          {longest > current ? `longest ${longest} · a missed day is forgiven` : "a missed day is forgiven"}
        </div>
      </div>
    </div>
  );
}

/** The ember glyph — a small SVG flame that gently breathes when lit. No emoji. */
function Ember({ lit }: { lit: boolean }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 20 20" aria-hidden
      className={"shrink-0 " + (lit ? "streak-ember" : "")}
    >
      <path
        d="M10 2.2c1.4 2.6.4 4.1-.8 5.6C7.7 9.8 6.6 11.2 6.6 13a3.4 3.4 0 0 0 6.8 0c0-1.1-.4-2-1-2.9.2 1-.3 1.9-1 2.2.5-1.6-.4-3-1.2-4 .9.2 1.6.7 1.6.7C11.7 6.6 12.3 4.3 10 2.2Z"
        fill={lit ? "var(--instrument-accent)" : "var(--bg-rule)"}
      />
      {lit && (
        <path
          d="M10 9.6c.8.8 1.2 1.7 1.2 2.7a1.2 1.2 0 0 1-2.4 0c0-.7.4-1.4.9-1.9.1.5 0 .9-.2 1.2.5-.5.6-1.3.5-2Z"
          fill="var(--instrument-accent-bg)"
        />
      )}
    </svg>
  );
}
