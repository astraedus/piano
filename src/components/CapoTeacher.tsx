"use client";
// CapoTeacher — the interactive teaching surface for the g-t1-capo skill node.
//
// Two parts, both driven by the pure capo math in src/lib/guitar/capo.ts:
//   1. CHART — the static 5 CAGED shapes × frets 0-7 grid → the sounding key.
//      Reads it as a key MULTIPLIER: one row of shapes, every key across.
//   2. CALCULATOR — pick a target KEY + a SHAPE you know → the FRET to clamp the
//      capo, with a live chord diagram showing the open shape played with the
//      capo on. The whole point: reach any key from a small shape vocabulary.
//
// Pure presentation + local state. The math is tested in capo.test.ts; this
// component just renders it. Warm Studio tokens throughout.

import { useState } from "react";
import {
  CAPO_CHART,
  CAPO_FRETS,
  CAPO_SHAPES,
  TARGET_KEYS,
  capoFret,
  type CagedShape,
} from "@/lib/guitar/capo";
import { ChordDiagram } from "@/lib/guitar/components/ChordDiagram";

// Representative open-position voicing per CAGED shape (lowE..highE), so the
// calculator's diagram shows the actual shape the learner already knows.
const SHAPE_VOICING: Record<CagedShape, number[]> = {
  C: [-1, 3, 2, 0, 1, 0],
  A: [-1, 0, 2, 2, 2, 0],
  G: [3, 2, 0, 0, 0, 3],
  E: [0, 2, 2, 1, 0, 0],
  D: [-1, -1, 0, 2, 3, 2],
};

export function CapoTeacher() {
  // Calculator state: a sensible, immediately-useful default — G shape to reach A
  // (capo 2), the most common beginner capo move.
  const [targetPc, setTargetPc] = useState<number>(9); // A
  const [shape, setShape] = useState<CagedShape>("G");

  const fret = capoFret(shape, targetPc);
  const targetName = TARGET_KEYS[targetPc].name;

  return (
    <div data-testid="capo-teacher" className="space-y-5">
      {/* ── Calculator ── */}
      <div
        data-testid="capo-calculator"
        className="rounded-lg border border-[color:var(--rule)] bg-[color:var(--surface-2)] p-4 space-y-3"
      >
        <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">
          capo calculator
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-[color:var(--ink-2)]">
            I want to play in
            <select
              data-testid="capo-target-key"
              aria-label="target key"
              value={targetPc}
              onChange={(e) => setTargetPc(Number(e.target.value))}
              className="min-h-[40px] rounded-md border border-[color:var(--rule)] bg-[color:var(--surface)] px-2 py-1 text-sm text-[color:var(--ink)]"
            >
              {TARGET_KEYS.map((k) => (
                <option key={k.pitchClass} value={k.pitchClass}>
                  {k.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-[color:var(--ink-2)]">
            using my
            <select
              data-testid="capo-shape"
              aria-label="chord shape"
              value={shape}
              onChange={(e) => setShape(e.target.value as CagedShape)}
              className="min-h-[40px] rounded-md border border-[color:var(--rule)] bg-[color:var(--surface)] px-2 py-1 text-sm text-[color:var(--ink)]"
            >
              {CAPO_SHAPES.map((s) => (
                <option key={s.shape} value={s.shape}>
                  {s.shape} shape
                </option>
              ))}
            </select>
          </label>
        </div>

        <p data-testid="capo-result" className="text-sm text-[color:var(--ink-2)]">
          {fret === 0 ? (
            <>
              Play the <strong>{shape} shape</strong> with{" "}
              <strong className="text-[color:var(--instrument-accent-deep)]">no capo</strong> — it
              already sounds in <strong>{targetName}</strong>.
            </>
          ) : (
            <>
              Put the capo on{" "}
              <strong
                data-testid="capo-result-fret"
                className="text-[color:var(--instrument-accent-deep)]"
              >
                fret {fret}
              </strong>{" "}
              and play your <strong>{shape} shape</strong> — it sounds in{" "}
              <strong>{targetName}</strong>.
            </>
          )}
        </p>

        <div className="flex justify-center pt-1">
          <ChordDiagram
            chordShape={SHAPE_VOICING[shape]}
            capoFret={fret}
            title={`${shape} shape → ${targetName}`}
            className="w-[160px] max-w-full"
          />
        </div>
      </div>

      {/* ── Static chart ── */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">
          shape × capo fret → sounding key
        </p>
        <div className="overflow-x-auto">
          <table
            data-testid="capo-chart"
            className="w-full border-collapse text-center text-sm tabular-nums"
          >
            <thead>
              <tr className="text-[color:var(--ink-3)]">
                <th className="px-2 py-1 text-left text-xs font-medium">Shape</th>
                {CAPO_FRETS.map((f) => (
                  <th key={f} className="px-2 py-1 text-xs font-medium">
                    {f === 0 ? "open" : f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPO_CHART.map((row) => (
                <tr
                  key={row.shape}
                  data-testid={`capo-chart-row-${row.shape}`}
                  className="border-t border-[color:var(--rule)]"
                >
                  <th className="px-2 py-1.5 text-left font-medium text-[color:var(--ink-2)]">
                    {row.shape} shape
                  </th>
                  {row.sounding.map((key, i) => {
                    const f = CAPO_FRETS[i];
                    const isSelected = row.shape === shape && f === fret;
                    return (
                      <td
                        key={f}
                        className="px-2 py-1.5"
                        style={
                          isSelected
                            ? {
                                background: "var(--instrument-accent-bg)",
                                color: "var(--instrument-accent-deep)",
                                fontWeight: 600,
                                borderRadius: 6,
                              }
                            : { color: "var(--ink-2)" }
                        }
                      >
                        {key}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs italic text-[color:var(--ink-3)]">
          One row of shapes you already know, every key across the top. That&rsquo;s the whole
          trick — the capo multiplies a small vocabulary across the spectrum.
        </p>
      </div>
    </div>
  );
}
