"use client";

// GuitarMap — the guitar sibling of KeyMap (V2 Phase B1).
//
// Where the piano map charts the 24 keys on a circle of fifths, the guitar map
// charts the player's TERRITORY on the neck: which techniques, chords, and
// scale-boxes they've LEARNED, derived from skillProgress via resolveStatus over
// GUITAR_NODES. It is a "what you've covered, and it only grows" view — warm,
// motivating, never a list of what you're missing.
//
// Data flow: GUITAR_NODES + state.skillProgress → resolveStatus → learned set.
// Learned nodes are grouped by category into neck regions (a checklist over a neck
// backdrop). Chord/scale-box nodes that carry a shape light up dots on the neck;
// every learned node lights its category row. Styled with Warm Studio tokens.

import { useMemo } from "react";
import { useAppState } from "@/hooks/useAppState";
import { GUITAR_NODES } from "@/lib/guitar/skillNodes";
import { resolveStatus } from "@/lib/skillTree";
import type { SkillCategory, SkillNode } from "@/lib/types";
import { Fretboard, type FretPosition } from "@/lib/guitar/components/Fretboard";

// Category display order + label + the neck "region" each occupies. Order follows
// the curriculum arc: orientation → fretting hand → vocabulary → lead.
const CATEGORY_ORDER: { id: SkillCategory; label: string; hint: string }[] = [
  { id: "setup", label: "Setup & Orientation", hint: "Tuning, anatomy, reading tab." },
  { id: "technique", label: "Fretting & Picking", hint: "The hands: clean notes, attack, legato, bends." },
  { id: "chords", label: "Chords", hint: "Open shapes, power chords, barre chords." },
  { id: "rhythm", label: "Rhythm", hint: "Strumming, palm muting, syncopation." },
  { id: "scales", label: "Scales & Boxes", hint: "Pentatonic territory across the neck." },
  { id: "notation", label: "Reading", hint: "Tab and rhythm." },
  { id: "repertoire", label: "Repertoire", hint: "Songs and forms you can play." },
  { id: "expression", label: "Expression", hint: "Phrasing: making solos sing." },
];

export function GuitarMap() {
  const { state } = useAppState();

  const { learnedNodes, byCategory, total, learnedCount, neckDots } = useMemo(() => {
    const progress = state.skillProgress ?? {};
    const status = resolveStatus(GUITAR_NODES, progress);
    const learned = GUITAR_NODES.filter((n) => status.get(n.id) === "learned");
    const learnedSet = new Set(learned.map((n) => n.id));

    const grouped = new Map<SkillCategory, SkillNode[]>();
    for (const node of GUITAR_NODES) {
      const arr = grouped.get(node.category) ?? [];
      arr.push(node);
      grouped.set(node.category, arr);
    }

    // Dots on the backdrop neck = the chord/scale SHAPES the player has learned,
    // so the territory literally fills in as nodes are mastered.
    const dots: FretPosition[] = [];
    for (const node of learned) {
      if (node.chordShape) dots.push(...shapeToFretPositions(node.chordShape));
    }

    return {
      learnedNodes: learned,
      byCategory: grouped,
      total: GUITAR_NODES.length,
      learnedCount: learnedSet.size,
      neckDots: dedupePositions(dots),
    };
  }, [state.skillProgress]);

  const learnedById = useMemo(
    () => new Set(learnedNodes.map((n) => n.id)),
    [learnedNodes],
  );

  return (
    <div className="grid md:grid-cols-[360px_1fr] gap-6">
      {/* Left: the neck backdrop — territory filling in. */}
      <div>
        <div className="warm-card p-5">
          <NeckBackdrop dots={neckDots} />
        </div>
        <p className="text-xs text-[color:var(--ink-muted)] italic mt-3 text-center">
          {learnedCount === 0
            ? "Nothing charted yet. Learn a node and the neck warms up."
            : `${learnedCount} of ${total} charted so far. It only grows.`}
        </p>
      </div>

      {/* Right: territory by category — a warm checklist of what you've covered. */}
      <div className="space-y-4">
        {CATEGORY_ORDER.map(({ id, label, hint }) => {
          const nodes = byCategory.get(id);
          if (!nodes || nodes.length === 0) return null;
          const learnedHere = nodes.filter((n) => learnedById.has(n.id));
          return (
            <CategoryRegion
              key={id}
              label={label}
              hint={hint}
              nodes={nodes}
              learnedIds={learnedById}
              learnedCount={learnedHere.length}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryRegion({
  label,
  hint,
  nodes,
  learnedIds,
  learnedCount,
}: {
  label: string;
  hint: string;
  nodes: SkillNode[];
  learnedIds: Set<string>;
  learnedCount: number;
}) {
  const allDone = learnedCount === nodes.length && nodes.length > 0;
  return (
    <div className="warm-card p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3
          className="font-serif text-[length:var(--text-lg)] text-[color:var(--ink)] tracking-[-0.02em]"
          style={{ fontVariationSettings: "'opsz' 24, 'SOFT' 30" }}
        >
          {label}
        </h3>
        <span
          className="text-xs font-medium"
          style={{ color: allDone ? "var(--instrument-accent-deep)" : "var(--ink-3)" }}
        >
          {learnedCount}/{nodes.length}{allDone ? " · covered" : ""}
        </span>
      </div>
      <p className="text-xs text-[color:var(--ink-muted)] italic mb-3">{hint}</p>
      <ul className="flex flex-wrap gap-1.5">
        {nodes
          .slice()
          .sort((a, b) => a.tier - b.tier || a.title.localeCompare(b.title))
          .map((node) => {
            const learned = learnedIds.has(node.id);
            return (
              <li
                key={node.id}
                title={learned ? `${node.title}: covered` : `${node.title}: not yet`}
                className="text-xs px-2 py-1 rounded-full border transition-colors"
                style={
                  learned
                    ? {
                        background: `color-mix(in oklab, var(--color-tier-${node.tier}) 22%, var(--bg-surface))`,
                        borderColor: `var(--color-tier-${node.tier})`,
                        color: "var(--ink)",
                      }
                    : {
                        background: "var(--bg-surface-2)",
                        borderColor: "var(--bg-rule)",
                        color: "var(--ink-muted)",
                      }
                }
              >
                {learned ? "✓ " : ""}
                {node.title}
              </li>
            );
          })}
      </ul>
    </div>
  );
}

// The backdrop neck. Reuses the Fretboard SVG with the learned chord-shape dots so
// the territory literally accumulates on the neck. When nothing is learned yet, an
// empty neck still reads as "the board you're charting".
function NeckBackdrop({ dots }: { dots: FretPosition[] }) {
  return (
    <div className="space-y-3">
      <p
        className="font-serif italic text-center text-[color:var(--ink-2)]"
        style={{ fontSize: "13px" }}
      >
        The neck you&apos;re charting
      </p>
      <Fretboard
        positions={dots.length > 0 ? dots : []}
        frets={5}
        ariaLabel="guitar neck showing the chord shapes you have learned"
      />
    </div>
  );
}

// A chordShape (lowE..highE, -1 muted / 0 open / n fret) → FretPositions for the
// neck. Mirrors Fretboard's internal shapeToPositions but lives here so the map
// can merge shapes from many learned chords without reaching into the component.
function shapeToFretPositions(shape: number[]): FretPosition[] {
  const out: FretPosition[] = [];
  shape.forEach((f, i) => {
    if (f < 0) return; // muted string — no dot
    out.push({ string: i + 1, fret: f }); // index 0 = low E = string 1
  });
  return out;
}

// Many chords share the same string/fret cell; collapse duplicates so the neck
// doesn't stack identical dots (and roots win when any shape marks the cell root).
function dedupePositions(positions: FretPosition[]): FretPosition[] {
  const byCell = new Map<string, FretPosition>();
  for (const p of positions) {
    const key = `${p.string}:${p.fret}`;
    const existing = byCell.get(key);
    if (!existing) byCell.set(key, p);
    else if (p.root && !existing.root) byCell.set(key, p);
  }
  return Array.from(byCell.values());
}
