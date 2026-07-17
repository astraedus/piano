"use client";
// RudimentLadder — the drums progress map (the /tree "Ladder" tab), the drums
// analog of piano's KeyMap and guitar's GuitarMap. Rudiment pedagogy IS a BPM
// ladder: every rudiment has a "you own it" tempo, so this shows each skill with
// its best tempo so far and whether it is learned. v1 = a card list (not a graph),
// grouped by tier, with the ONE next thing to learn clearly marked. All ordering /
// grouping / best-BPM / next-to-learn logic lives in lib/rudimentLadder.ts (pure).

import { useAppState } from "@/hooks/useAppState";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { buildRudimentLadder } from "@/lib/rudimentLadder";
import { tierLabel } from "@/lib/tierLabels";
import type { SkillNodeStatus } from "@/lib/types";

const STATUS_LABEL: Record<SkillNodeStatus, string> = {
  locked: "Locked",
  available: "Ready",
  "in-progress": "In progress",
  learned: "Learned",
};

const STATUS_COLOR: Record<SkillNodeStatus, string> = {
  locked: "var(--ink-3)",
  available: "var(--instrument-accent-deep)",
  "in-progress": "var(--instrument-accent)",
  learned: "var(--success)",
};

export function RudimentLadder() {
  const { state } = useAppState();
  const module = getModuleSync(state.instrument);
  const nodes = module?.skillNodes ?? [];
  const { groups, learnedCount, total } = buildRudimentLadder(
    nodes,
    state.skillProgress ?? {},
    state.skillReps,
  );

  return (
    <div data-testid="rudiment-ladder" className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm text-[color:var(--ink-3)] italic leading-relaxed">
          Your rudiments, rung by rung. Each one has a tempo you own it at — the best
          you have hit so far is your honest number.
        </p>
        {total > 0 && (
          <p
            data-testid="rudiment-ladder-summary"
            className="text-xs uppercase tracking-[0.12em] text-[color:var(--ink-3)]"
          >
            {learnedCount} of {total} learned
          </p>
        )}
      </div>

      {total === 0 && (
        <p className="text-sm text-[color:var(--ink-3)] italic">
          No rudiments loaded yet. Start a session to build your ladder.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.tier} className="space-y-2.5">
          <h3
            className="text-[11px] uppercase tracking-[0.14em] font-medium text-[color:var(--ink-2)]"
          >
            {tierLabel(group.tier).name}
          </h3>
          <ol className="space-y-2.5">
            {group.rungs.map(({ node, status: st, bpm, isNext }) => (
              <li
                key={node.id}
                data-testid={`rudiment-rung-${node.id}`}
                data-next={isNext ? "true" : undefined}
                className="rounded-xl border px-4 py-3 flex items-center gap-3"
                style={{
                  borderColor: isNext
                    ? "var(--instrument-accent-deep)"
                    : st === "learned"
                      ? "var(--instrument-accent)"
                      : "var(--rule)",
                  background: "var(--surface)",
                  boxShadow: isNext ? "var(--shadow-card-hover, var(--shadow-card))" : "var(--shadow-card)",
                  opacity: st === "locked" ? 0.6 : 1,
                }}
              >
                <span
                  aria-hidden
                  className="flex-shrink-0 w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor: STATUS_COLOR[st],
                    background: st === "learned" ? STATUS_COLOR[st] : "transparent",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="font-serif text-base text-[color:var(--ink)] leading-snug"
                    style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 50" }}
                  >
                    {node.title}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.12em] mt-0.5"
                    style={{ color: STATUS_COLOR[st] }}
                  >
                    {STATUS_LABEL[st]}
                    {isNext && " · Next up"}
                  </p>
                </div>
                {bpm != null ? (
                  <span
                    data-testid={`rudiment-bpm-${node.id}`}
                    className="flex-shrink-0 text-sm tabular-nums font-medium text-[color:var(--instrument-accent-deep)] whitespace-nowrap"
                  >
                    {bpm} BPM
                  </span>
                ) : (
                  <span className="flex-shrink-0 text-xs text-[color:var(--ink-3)] italic whitespace-nowrap">
                    {st === "locked" ? "—" : isNext ? "start here" : "not yet"}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
