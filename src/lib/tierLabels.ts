// Tier display names — pure, shared. The skill tree groups nodes by tier; these
// are the warm, motivating section names the user sees (Your Path, What You Know,
// and the current-lesson card). Kept in lib so every surface names a tier the
// same way with no component-graph coupling.

export const TIER_LABELS: Record<number, { name: string; subtitle: string }> = {
  0: { name: "Start Here — Setup & Orientation", subtitle: "Before you can make music, you need to know your instrument." },
  1: { name: "Foundations", subtitle: "The core shapes and skills everything else is built on." },
  2: { name: "Getting Real", subtitle: "You are playing now. These open up actual songs." },
  3: { name: "Playing With Soul", subtitle: "Expression, feel, and the moments that make music yours." },
  4: { name: "Going Deep", subtitle: "Advanced technique and musical vocabulary." },
  5: { name: "Mastery", subtitle: "The long game — where the serious learning lives." },
  6: { name: "Beyond", subtitle: "Expert-level depth." },
};

export function tierLabel(tier: number): { name: string; subtitle: string } {
  return TIER_LABELS[tier] ?? { name: `Tier ${tier}`, subtitle: "" };
}
