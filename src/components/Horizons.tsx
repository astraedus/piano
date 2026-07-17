"use client";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import { KEY_META } from "@/lib/music";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { focusNoun, isNonTonal } from "@/lib/focusNoun";
import { nextToLearn } from "@/lib/skillTree";
import { abilityAxis, generationAxis, patternAxis } from "@/lib/threeAxis";
import { effectiveEarLevel } from "@/lib/earProgression";
import { weekHorizon } from "@/lib/todayPlan";
import { completionFraction } from "@/lib/skillSummary";
import { fmtTotalTime } from "@/lib/format";
import type { Warmup, KeyId, Phase } from "@/lib/types";

const PHASE_NAMES: Record<Phase, string> = {
  1: "Learn the Layout",
  2: "Coordinate Both Hands",
  3: "Train Your Ear",
  4: "Find Your Voice",
  5: "Play Freely",
};

export function Horizons({ ghostKey, warmup }: { ghostKey: KeyId; warmup?: Warmup }) {
  const { state } = useAppState();
  const module = getModuleSync(state.instrument);
  const unlockLibrary = module?.unlockLibrary ?? [];
  const nodes = module?.skillNodes ?? [];
  // Frontier-based "what to learn next" (replaces the phase-filter sort, which
  // showed phase-1 nudges to phase-4/5 users). nextToLearn returns the available
  // nodes nearest the learned core. We surface the first frontier node's unlock
  // sentence, falling back to its linked UnlockCard's tryLine for the warm copy.
  const frontier = nextToLearn(nodes, state.skillProgress ?? {}, 1)[0];
  const cardById = new Map(unlockLibrary.map((c) => [c.id, c]));
  const frontierCard = frontier?.unlockCardId ? cardById.get(frontier.unlockCardId) : undefined;
  const nextUnlock = frontier
    ? { title: frontier.unlock, tryLine: frontierCard?.tryLine ?? frontier.masteryDrill }
    : undefined;
  // All-done: with no frontier and every node learned, the "Next to learn" row
  // would silently vanish — instead show an honest celebration + the "reviews
  // keep it alive" reassurance (spaced review is the ongoing loop).
  const allLearned = nodes.length > 0
    && nodes.every((n) => (state.skillProgress ?? {})[n.id]?.status === "learned");
  const phaseUnlockCount = unlockLibrary.filter((u) => u.phase === state.phase).length;
  const phaseUnlockEarned = (state.unlocks ?? []).filter((u) => u.phase === state.phase).length;
  const remaining = Math.max(0, phaseUnlockCount - phaseUnlockEarned);

  const totalMin = (state.sessions ?? []).reduce((s, x) => s + x.minutes, 0);
  const timeStr = fmtTotalTime(totalMin);
  const piecesYours = (state.pieces ?? []).filter((p) => p.status === "yours").length;
  const pieces = (state.pieces ?? []).length;
  const keysTouched = Object.values(state.keyDepths ?? {}).filter((d) => (d ?? 0) > 0).length;

  // #5 — forward horizon: this week's rotation position + next week's key/warmup,
  // both derived deterministically from the ghost-key rotation over a future Date.
  const now = new Date();
  const thisWeek = weekHorizon(state, now, 0);
  const next = weekHorizon(state, now, 1);

  // The three product pillars, each derived from already-persisted state.
  const progress = state.skillProgress ?? {};
  const generation = generationAxis(nodes, progress, state.pieces ?? [], state.arc ?? []);
  const ability = abilityAxis(nodes, progress, state.level ?? 1);
  // Show the EFFECTIVE (gate-clamped) ear level, not a stored ratchet the learner
  // can't actually access yet — the card must never claim a level the curriculum
  // hasn't earned.
  const pattern = patternAxis(effectiveEarLevel(state, module?.earLevelGates), (state.sessions ?? []).map((s) => s.earResults));

  return (
    <section className="border-t border-[color:var(--rule)] pt-8 mt-10 space-y-8">
      <h2 className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-3)]">Where You Are</h2>

      <ThreeAxisCard generation={generation} ability={ability} pattern={pattern} />

      <Row label="This week">
        <div className="space-y-1">
          <p>
            <span className="text-[color:var(--ink)]">{focusNoun(module?.focusKind)} · {module ? module.focusLabel(ghostKey) : KEY_META[ghostKey].name}</span>
            <span className="text-[color:var(--ink-3)]">   ·   </span>
            <span className="text-[color:var(--ink-2)]">Warmup · {warmup?.label ?? "—"}</span>
          </p>
          <p className="text-xs text-[color:var(--ink-3)] italic">
            One key, seven days. The week picks it, so you don't have to.
            {thisWeek.weekInRotation && thisWeek.rotationLength
              ? ` This is week ${thisWeek.weekInRotation} of ${thisWeek.rotationLength} in the rotation.`
              : ""}
          </p>
        </div>
      </Row>

      {/* #5 — the future is now visible: next week's key + warmup, derived by
          calling the deterministic ghostKeyFor / warmupForWeek with a +1-week
          date. Previously only "today" was ever shown. */}
      <Row label="Next week">
        <div className="space-y-1">
          <p>
            <span className="text-[color:var(--ink)]">{focusNoun(module?.focusKind)} · {module ? module.focusLabel(next.key) : KEY_META[next.key].name}</span>
            <span className="text-[color:var(--ink-3)]">   ·   </span>
            <span className="text-[color:var(--ink-2)]">Warmup · {next.warmup?.label ?? "—"}</span>
          </p>
          <p className="text-xs text-[color:var(--ink-3)] italic">
            {next.key === ghostKey
              ? "Same key carries over — one more week to settle in."
              : "Coming up. A glimpse of where the week turns next."}
          </p>
        </div>
      </Row>

      <Row label="This phase">
        <div className="space-y-1">
          <p className="font-serif text-lg text-[color:var(--ink)]">Phase {state.phase} · {PHASE_NAMES[state.phase]}</p>
          <p className="text-sm text-[color:var(--ink-3)]">
            {phaseUnlockEarned} of {phaseUnlockCount} skills unlocked{remaining > 0 ? `. ${remaining} to go.` : "."}
          </p>
        </div>
      </Row>

      {nextUnlock ? (
        <Row label="Next to learn">
          <div
            className="rounded-md border-l-[3px] pl-4 pr-4 py-3"
            style={{
              borderLeftColor: "var(--instrument-accent)",
              background: "color-mix(in oklab, var(--instrument-accent) 7%, transparent)",
            }}
          >
            <p className="font-serif text-[color:var(--ink)] tracking-[-0.01em]">{nextUnlock.title}</p>
            <p className="text-sm text-[color:var(--ink-2)] italic mt-0.5">{nextUnlock.tryLine}</p>
          </div>
        </Row>
      ) : allLearned ? (
        <Row label="All learned">
          <div
            data-testid="horizons-all-done"
            className="rounded-md border-l-[3px] pl-4 pr-4 py-3"
            style={{
              borderLeftColor: "var(--success)",
              background: "color-mix(in oklab, var(--success) 8%, transparent)",
            }}
          >
            <p className="font-serif text-[color:var(--ink)] tracking-[-0.01em]">Every skill here is learned.</p>
            <p className="text-sm text-[color:var(--ink-2)] italic mt-0.5">
              Reviews keep it alive — spaced practice brings each one back before it fades.
            </p>
          </div>
        </Row>
      ) : null}

      {state.northStar && (
        <Row label="Your goal">
          <p className="font-serif italic text-[color:var(--ink)]">{state.northStar}</p>
        </Row>
      )}

      <Row label="Totals">
        <div className="flex gap-5 flex-wrap text-sm text-[color:var(--ink-2)]">
          <Stat k="Time" v={timeStr} />
          <Stat k="Sessions" v={String(state.sessions?.length ?? 0)} />
          <Stat k="Pieces" v={pieces === 0 ? "—" : `${pieces}${piecesYours ? ` · ${piecesYours} yours` : ""}`} />
          {/* The 24-key territory count is tonal — hidden on non-tonal instruments
              (a pad never charts keys). */}
          {!isNonTonal(module?.focusKind) && (
            <Stat k={keysTouched === 1 ? "Key" : "Keys"} v={`${keysTouched} / 24`} />
          )}
          <Stat k="Unlocks" v={String(state.unlocks?.length ?? 0)} />
        </div>
        <p className="text-xs text-[color:var(--ink-3)] italic mt-2">
          <Link href="/tree" className="hover:text-[color:var(--ink-2)]">Visit the Tree →</Link>
        </p>
      </Row>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 items-baseline">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--ink-3)] pt-0.5">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="living-number text-base">{v}</span>
      <span className="text-[color:var(--ink-3)] text-xs ml-1.5">{k}</span>
    </div>
  );
}

// ── Three-Axis Progress card ─────────────────────────────────────────────────
// The owner's thesis made visible: Generation · Ability · Pattern Recognition.
// First surface in the app to name all three pillars, each read from persisted
// state. Stacks to one column on mobile.
//
// Ability + Pattern have honest denominators (learned/total skills; the L1..L5
// ear ladder), so they show a continuous bar. Generation has NO honest single
// denominator — its signals are loose milestones — so it is shown as a discrete
// milestone tracker (pips + "N of M first steps"), never a fake percentage.

type GenerationAxis = ReturnType<typeof generationAxis>;
type AbilityAxis = ReturnType<typeof abilityAxis>;
type PatternAxis = ReturnType<typeof patternAxis>;

function ThreeAxisCard({
  generation, ability, pattern,
}: { generation: GenerationAxis; ability: AbilityAxis; pattern: PatternAxis }) {
  const abilityFrac = completionFraction(ability.skills);
  // Pattern progress = how far along the L1..L5 content ladder.
  const patternFrac = Math.min(1, (pattern.earLevel - 1) / (pattern.maxLevel - 1));

  return (
    <div
      className="rounded-xl border p-5 sm:p-6"
      style={{
        borderColor: "var(--rule)",
        background: "var(--bg-surface)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-3)]">
          Where you are
        </p>
        <p
          className="font-serif text-[length:var(--text-xl)] text-[color:var(--ink)] tracking-[-0.015em] mt-0.5"
          style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 40" }}
        >
          Your three axes
        </p>
        <p className="text-sm text-[color:var(--ink-2)] italic mt-0.5">
          Generation, ability, and the ear — how far each has come.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        <GenerationColumn generation={generation} />
        <AxisColumn
          name="Ability"
          frac={abilityFrac}
          headline={`${ability.skills.learned} / ${ability.skills.total} skills`}
          caption={`Level ${ability.level} · play & technique.`}
        />
        <AxisColumn
          name="Pattern Recognition"
          frac={patternFrac}
          headline={`Ear L${pattern.earLevel} of ${pattern.maxLevel}`}
          caption={
            pattern.accuracy != null
              ? `${pattern.label} · ${Math.round(pattern.accuracy * 100)}% by ear.`
              : `${pattern.label} · listen to begin.`
          }
        />
      </div>
    </div>
  );
}

// Generation = discrete milestone tracker. Honest: pips show which first steps
// are reached; no continuous bar implying a precision the data lacks.
function GenerationColumn({ generation }: { generation: GenerationAxis }) {
  const { milestones, milestonesDone, gettingStarted } = generation;
  const total = milestones.length;
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-3)]">Generation</p>
      <p
        className={
          "font-serif text-lg tracking-[-0.01em] " +
          (gettingStarted ? "text-[color:var(--ink-2)] italic" : "text-[color:var(--ink)]")
        }
      >
        {gettingStarted ? "Just getting started" : `${milestonesDone} of ${total} first steps`}
      </p>
      {/* Discrete milestone dots — small fixed-width lozenges with clear gaps so
          a glance reads "milestones," not a percentage bar. A done step is a
          filled dot with a tiny check; a pending step is a hollow ring. */}
      <div
        className="flex items-center gap-2 py-0.5"
        role="img"
        aria-label={`Generation: ${milestonesDone} of ${total} first steps reached`}
      >
        {milestones.map((m) => (
          <span
            key={m.label}
            title={m.label}
            aria-hidden
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none transition-colors"
            style={
              m.done
                ? { background: "var(--instrument-accent)", color: "var(--bg-base)" }
                : {
                    background: "transparent",
                    border: "1.5px solid var(--bg-rule)",
                    color: "transparent",
                  }
            }
          >
            ✓
          </span>
        ))}
      </div>
      <p className="text-xs text-[color:var(--ink-2)]">
        {gettingStarted ? "Improvise in a free slot to begin." : "Improv, and pieces you've made yours."}
      </p>
    </div>
  );
}

function AxisColumn({
  name, frac, headline, caption, muted,
}: { name: string; frac: number; headline: string; caption: string; muted?: boolean }) {
  const pct = Math.round(Math.max(0, Math.min(1, frac)) * 100);
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-3)]">{name}</p>
      <p
        className={
          "font-serif text-lg tracking-[-0.01em] " +
          (muted ? "text-[color:var(--ink-2)] italic" : "text-[color:var(--ink)]")
        }
      >
        {headline}
      </p>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: "var(--bg-surface-3)" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name} progress`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: "var(--instrument-accent)" }}
        />
      </div>
      <p className="text-xs text-[color:var(--ink-2)]">{caption}</p>
    </div>
  );
}
