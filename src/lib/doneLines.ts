// Session-end reward lines. Lean INTO the win: celebrate the XP earned, the
// streak, and any level or skill progress. Warm but clear, with real numbers
// when the session passes them in. A little variety, never cryptic.

export interface DoneContext {
  minutes: number;
  ghostKeyName: string;
  pieceTitle?: string;
  /** XP earned this session (the delta, not the lifetime total). */
  xpEarned?: number;
  /** Current streak length after this session. */
  streakDays?: number;
  /** Level reached this session, if the session crossed a level boundary. */
  leveledUpTo?: number;
  /** Title of the level just reached (paired with leveledUpTo). */
  newLevelTitle?: string;
  /** Number of skill-tree nodes newly learned this session. */
  nodesLearned?: number;
  /** XP remaining until the next title, with that title's name. */
  xpToNext?: number;
  nextTitle?: string;
}

// Fallback lines when no numeric context is available (still encouraging, never apologetic).
export const DONE_LINES: string[] = [
  "Nice session.",
  "Good work tonight.",
  "That counts. The hands remember.",
  "Logged. See you next time.",
  "Solid. Every session adds up.",
  "Done. The practice is stacking.",
];

export function doneLineFor(ctx: DoneContext): string {
  const { minutes, xpEarned, streakDays, leveledUpTo, newLevelTitle, nodesLearned, xpToNext, nextTitle, ghostKeyName, pieceTitle } = ctx;

  // Build a celebratory headline that always leads with what they earned.
  const parts: string[] = [];

  // 1) Level-up is the biggest moment when it happens.
  if (leveledUpTo != null) {
    parts.push(newLevelTitle ? `Level ${leveledUpTo} reached. You're a ${newLevelTitle} now.` : `Level ${leveledUpTo} reached.`);
  } else {
    // Pick a varied opener so it never reads like a template.
    const openers = ["Nice session.", "Good work tonight.", "Solid session.", "Logged."];
    const idx = (Math.floor(Date.now() / 1000) + minutes) % openers.length;
    parts.push(openers[Math.max(0, idx)]);
  }

  // 2) XP earned — the core reward number.
  if (typeof xpEarned === "number" && xpEarned > 0) {
    parts.push(`+${xpEarned} XP.`);
  }

  // 3) Streak.
  if (typeof streakDays === "number" && streakDays > 0) {
    parts.push(streakDays === 1 ? "Day 1 of a new streak." : `That's ${streakDays} days in a row.`);
  }

  // 4) Skill progress (only mention when it didn't already level up).
  if (leveledUpTo == null && typeof nodesLearned === "number" && nodesLearned > 0) {
    parts.push(nodesLearned === 1 ? "One new skill unlocked." : `${nodesLearned} new skills unlocked.`);
  }

  // 5) Progress toward next title, when we have room and didn't just level up.
  if (leveledUpTo == null && typeof xpToNext === "number" && xpToNext > 0 && nextTitle) {
    parts.push(`You're ${xpToNext} XP from ${nextTitle}.`);
  }

  // If we somehow have no numeric context at all, fall back to a warm line and
  // (lightly) reference what they worked on so it still feels personal.
  if (parts.length <= 1 && !xpEarned && !streakDays) {
    const options = [...DONE_LINES];
    if (ghostKeyName) options.push(`${ghostKeyName} got a little more familiar.`);
    if (pieceTitle) options.push(`${pieceTitle} is a little more yours than it was this morning.`);
    const idx = (Math.floor(Date.now() / 1000) + minutes) % options.length;
    return options[Math.max(0, idx)] ?? "Nice session.";
  }

  return parts.join(" ");
}
