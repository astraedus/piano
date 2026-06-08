"use client";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import { KEY_META } from "@/lib/music";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { nextToLearn } from "@/lib/skillTree";
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
  const phaseUnlockCount = unlockLibrary.filter((u) => u.phase === state.phase).length;
  const phaseUnlockEarned = (state.unlocks ?? []).filter((u) => u.phase === state.phase).length;
  const remaining = Math.max(0, phaseUnlockCount - phaseUnlockEarned);

  const totalMin = (state.sessions ?? []).reduce((s, x) => s + x.minutes, 0);
  const timeStr = fmtTotalTime(totalMin);
  const piecesYours = (state.pieces ?? []).filter((p) => p.status === "yours").length;
  const pieces = (state.pieces ?? []).length;
  const keysTouched = Object.values(state.keyDepths ?? {}).filter((d) => (d ?? 0) > 0).length;

  return (
    <section className="border-t border-[color:var(--rule)] pt-8 mt-10 space-y-8">
      <h2 className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-3)]">Where You Are</h2>

      <Row label="This week">
        <div className="space-y-1">
          <p>
            <span className="text-[color:var(--ink)]">Key · {KEY_META[ghostKey].name}</span>
            <span className="text-[color:var(--ink-3)]">   ·   </span>
            <span className="text-[color:var(--ink-2)]">Warmup · {warmup?.label ?? "—"}</span>
          </p>
          <p className="text-xs text-[color:var(--ink-3)] italic">
            One key, seven days. The week picks it, so you don't have to.
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

      {nextUnlock && (
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
      )}

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
          <Stat k={keysTouched === 1 ? "Key" : "Keys"} v={`${keysTouched} / 24`} />
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

function fmtTotalTime(totalMin: number): string {
  if (totalMin <= 0) return "—";
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
