"use client";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import { KEY_META } from "@/lib/music";
import { UNLOCK_LIBRARY } from "@/lib/unlocks";
import type { Warmup, KeyId, Phase } from "@/lib/types";

const PHASE_NAMES: Record<Phase, string> = {
  1: "the keyboard becomes a map",
  2: "the hands cooperate",
  3: "the ear leads",
  4: "the voice emerges",
  5: "free",
};

export function Horizons({ ghostKey, warmup }: { ghostKey: KeyId; warmup: Warmup }) {
  const { state } = useAppState();
  const earned = new Set((state.unlocks ?? []).map((u) => u.id));
  const nextUnlock = UNLOCK_LIBRARY
    .filter((u) => u.phase <= state.phase && !earned.has(u.id))
    .sort((a, b) => a.phase - b.phase)[0];
  const phaseUnlockCount = UNLOCK_LIBRARY.filter((u) => u.phase === state.phase).length;
  const phaseUnlockEarned = (state.unlocks ?? []).filter((u) => u.phase === state.phase).length;
  const remaining = Math.max(0, phaseUnlockCount - phaseUnlockEarned);

  const totalMin = (state.sessions ?? []).reduce((s, x) => s + x.minutes, 0);
  const timeStr = fmtTotalTime(totalMin);
  const piecesYours = (state.pieces ?? []).filter((p) => p.status === "yours").length;
  const pieces = (state.pieces ?? []).length;
  const keysTouched = Object.values(state.keyDepths ?? {}).filter((d) => (d ?? 0) > 0).length;

  return (
    <section className="border-t border-[color:var(--rule)] pt-8 mt-10 space-y-8">
      <h2 className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-3)]">where you are</h2>

      <Row label="this week">
        <div className="space-y-1">
          <p>
            <span className="text-[color:var(--ink)]">ghost · {KEY_META[ghostKey].name}</span>
            <span className="text-[color:var(--ink-3)]">   ·   </span>
            <span className="text-[color:var(--ink-2)]">warmup · {warmup.label}</span>
          </p>
          <p className="text-xs text-[color:var(--ink-3)] italic">
            one key, seven days. the week picks it. you don't have to.
          </p>
        </div>
      </Row>

      <Row label="this phase">
        <div className="space-y-1">
          <p className="font-serif text-lg text-[color:var(--ink)]">phase {state.phase} — {PHASE_NAMES[state.phase]}</p>
          <p className="text-sm text-[color:var(--ink-3)]">
            {phaseUnlockEarned} of {phaseUnlockCount} capabilities shown{remaining > 0 ? `. ${remaining} to go.` : "."}
          </p>
        </div>
      </Row>

      {nextUnlock && (
        <Row label="next capability">
          <div className="space-y-1">
            <p className="font-serif text-[color:var(--ink)]">{nextUnlock.title}</p>
            <p className="text-sm text-[color:var(--ink-3)] italic">{nextUnlock.tryLine}</p>
          </div>
        </Row>
      )}

      {state.northStar && (
        <Row label="the star">
          <p className="font-serif italic text-[color:var(--ink)]">{state.northStar}</p>
        </Row>
      )}

      <Row label="only-grows">
        <div className="flex gap-5 flex-wrap text-sm text-[color:var(--ink-2)]">
          <Stat k="time" v={timeStr} />
          <Stat k="sessions" v={String(state.sessions?.length ?? 0)} />
          <Stat k="pieces" v={pieces === 0 ? "—" : `${pieces}${piecesYours ? ` · ${piecesYours} yours` : ""}`} />
          <Stat k={keysTouched === 1 ? "key" : "keys"} v={`${keysTouched} / 24`} />
          <Stat k="unlocks" v={String(state.unlocks?.length ?? 0)} />
        </div>
        <p className="text-xs text-[color:var(--ink-3)] italic mt-2">
          <Link href="/tree" className="hover:text-[color:var(--ink-2)]">visit the tree →</Link>
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
      <span className="font-serif text-[color:var(--ink)]">{v}</span>
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
