"use client";
// "What You Know" — the single summary surface that answers the app's own
// question: which skills have I learned, in which keys, at what tempo, and where
// is my ear? Read-only assembly of existing state (buildWhatYouKnow). Dense and
// plain-language; every musical term stays tappable via linkTerms / TermChip.

import { useAppState } from "@/hooks/useAppState";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { buildWhatYouKnow } from "@/lib/whatYouKnow";
import { effectiveEarLevel } from "@/lib/earProgression";
import { tierLabel } from "@/components/PathView";
import { linkTerms, TermChip } from "@/components/explain";
import { ghostKeyToTermId } from "@/lib/pathFilter";
import { fmtTotalTime } from "@/lib/format";
import type { PieceStatus } from "@/lib/types";

const PIECE_STATUS_LABEL: Record<PieceStatus, string> = {
  learning: "learning",
  shelved: "shelved",
  yours: "yours",
  known: "known",
};

export function WhatYouKnow() {
  const { state } = useAppState();
  const module = getModuleSync(state.instrument);
  const nodes = module?.skillNodes ?? [];

  const summary = buildWhatYouKnow({
    nodes,
    progress: state.skillProgress ?? {},
    skillReps: state.skillReps,
    keyDepths: state.keyDepths ?? {},
    // Effective (gate-clamped) ear level — the same honest number the Three-Axis
    // card shows, never a stored level the learner can't yet access.
    earLevel: effectiveEarLevel(state, module?.earLevelGates),
    sessions: state.sessions ?? [],
    pieces: state.pieces ?? [],
  });

  const totalMin = (state.sessions ?? []).reduce((s, x) => s + x.minutes, 0);

  if (summary.empty) {
    return (
      <p
        data-testid="wyk-empty"
        className="text-sm text-[color:var(--ink-3)] italic font-serif"
      >
        Nothing charted yet. Play a session and this fills in with the skills you have
        learned, the keys you have played, at what tempo, and where your ear is.
      </p>
    );
  }

  return (
    <div data-testid="what-you-know" className="space-y-8">
      <p className="text-sm text-[color:var(--ink-2)]">
        <span className="living-number">{summary.skills.learned}</span>
        <span className="text-[color:var(--ink-3)]"> of {summary.skills.total} skills learned</span>
        {totalMin > 0 && (
          <span className="text-[color:var(--ink-3)]"> · {fmtTotalTime(totalMin)} of practice</span>
        )}
      </p>

      {/* ── Skills learned, grouped by tier ── */}
      {summary.learnedByTier.length > 0 && (
        <section data-testid="wyk-skills" className="space-y-4">
          <SectionHeading>What You've Learned</SectionHeading>
          {summary.learnedByTier.map(({ tier, skills }) => (
            <div key={tier} className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">
                {tierLabel(tier).name}
              </p>
              <ul className="space-y-1">
                {skills.map((s) => (
                  <li
                    key={s.id}
                    data-testid={`wyk-skill-${s.id}`}
                    className="text-sm text-[color:var(--ink-2)] flex flex-wrap items-baseline gap-x-1.5"
                  >
                    <span className="text-[color:var(--ink)]">{linkTerms(s.title, `wyk-${s.id}`)}</span>
                    <span className="text-[color:var(--ink-3)]">— learned</span>
                    {s.bestBpm ? (
                      <span className="text-[color:var(--instrument-accent-deep)]">
                        · best {s.bestBpm} BPM
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ── Keys charted (depth + best scale tempo) ── */}
      {summary.keys.length > 0 && (
        <section data-testid="wyk-keys" className="space-y-2">
          <SectionHeading>Keys You've Charted</SectionHeading>
          <ul className="space-y-1">
            {summary.keys.map((k) => (
              <li
                key={k.keyId}
                data-testid={`wyk-key-${k.keyId}`}
                className="text-sm text-[color:var(--ink-2)] flex flex-wrap items-baseline gap-x-1.5"
              >
                <TermChip term={ghostKeyToTermId(k.keyId)} label={k.name} />
                <span className="text-[color:var(--ink-3)]">— {k.depthName}</span>
                {k.bestBpm ? (
                  <span className="text-[color:var(--instrument-accent-deep)]">
                    · best scale {k.bestBpm} BPM
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Ear (Pattern-Recognition axis) ── */}
      <section data-testid="wyk-ear" className="space-y-2">
        <SectionHeading>Your Ear</SectionHeading>
        <p className="text-sm text-[color:var(--ink-2)]">
          Level <span className="font-medium text-[color:var(--ink)]">{summary.ear.earLevel}</span> of{" "}
          {summary.ear.maxLevel} · {summary.ear.label}
          {summary.ear.accuracy != null ? (
            <span className="text-[color:var(--ink-3)]">
              {" "}· {Math.round(summary.ear.accuracy * 100)}% lifetime accuracy
              {" "}({summary.ear.roundsAnswered} round{summary.ear.roundsAnswered === 1 ? "" : "s"})
            </span>
          ) : (
            <span className="text-[color:var(--ink-3)]"> · no ear rounds answered yet</span>
          )}
        </p>
      </section>

      {/* ── Pieces on the shelf ── */}
      {summary.pieces.length > 0 && (
        <section data-testid="wyk-pieces" className="space-y-2">
          <SectionHeading>Pieces on Your Shelf</SectionHeading>
          <ul className="space-y-1">
            {summary.pieces.map((p) => (
              <li
                key={p.id}
                data-testid={`wyk-piece-${p.id}`}
                className="text-sm text-[color:var(--ink-2)]"
              >
                <span className="text-[color:var(--ink)]">{p.title}</span>
                {p.composer ? <span className="text-[color:var(--ink-3)]"> — {p.composer}</span> : null}
                <span className="text-[color:var(--ink-3)]"> · {PIECE_STATUS_LABEL[p.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif text-xl text-[color:var(--ink)]"
      style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 50" }}
    >
      {children}
    </h2>
  );
}
