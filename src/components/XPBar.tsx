"use client";
import { levelForXp } from "@/lib/progression";

/**
 * XP progress bar — level badge + title + a warm gradient fill toward the next
 * level, with a quiet "X XP to <next title>" line. Pure presentation: reads the
 * lifetime XP total and derives everything via the progression engine, so it
 * stays in sync with whatever endSession awarded.
 *
 * Two layouts:
 *   - default: full bar with badge, title, and the to-next line (PracticeStand strip).
 *   - compact: a slim badge + bar with no caption (header / dense contexts).
 */
export function XPBar({ xp, compact = false, className = "" }: { xp: number; compact?: boolean; className?: string }) {
  const info = levelForXp(xp);
  const pct = Math.round(info.progress * 100);
  // The title we're climbing toward. At the title ceiling (Virtuoso) the next
  // level shares the title, so phrase it as "more XP" rather than a redundant name.
  const nextTitle = levelForXp(xpAtNextLevel(info.level, info.totalXp, info.xpToNextLevel)).title;
  const atTitleCeiling = nextTitle === info.title;

  if (compact) {
    return (
      <div className={"flex items-center gap-2 " + className} aria-label={`Level ${info.level}, ${pct}% to next`}>
        <LevelBadge level={info.level} size="sm" />
        <div className="w-16 sm:w-20">
          <Track pct={pct} thin />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2.5 mb-1.5">
        <LevelBadge level={info.level} />
        <span className="font-serif text-[length:var(--text-base)] text-[color:var(--ink)] tracking-[-0.01em]" style={{ fontVariationSettings: "'opsz' 24, 'SOFT' 40" }}>
          {info.title}
        </span>
      </div>
      <Track pct={pct} />
      <p className="mt-1.5 text-[length:var(--text-xs)] text-[color:var(--ink-3)] tabular-nums">
        {info.xpToNextLevel} XP {atTitleCeiling ? "to level " + (info.level + 1) : "to " + nextTitle}
      </p>
    </div>
  );
}

/** The progress track + warm gradient fill. */
function Track({ pct, thin = false }: { pct: number; thin?: boolean }) {
  return (
    <div
      className={"xp-track w-full overflow-hidden " + (thin ? "h-1.5" : "h-2.5")}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="xp-fill h-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Round level badge — a small numbered medallion in the instrument accent. */
export function LevelBadge({ level, size = "md" }: { level: number; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-6 h-6 text-[length:var(--text-xs)]" : "w-8 h-8 text-[length:var(--text-sm)]";
  return (
    <span
      className={"xp-badge shrink-0 inline-flex items-center justify-center rounded-full font-semibold tabular-nums " + dim}
      aria-hidden
    >
      {level}
    </span>
  );
}

/** Total XP required to have reached the level AFTER the current one. */
function xpAtNextLevel(currentLevel: number, totalXp: number, xpToNext: number): number {
  // totalXp + xpToNext lands exactly on the next level's threshold; +1 keeps us
  // safely inside that level's band so levelForXp resolves to (currentLevel + 1).
  return xpToNext > 0 ? totalXp + xpToNext : totalXp;
}
