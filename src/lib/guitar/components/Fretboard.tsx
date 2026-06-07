"use client";

// Custom SVG fretboard (plan §3: roll our own, ~120 LOC). Renders a horizontal
// neck — 6 strings tall, N frets wide, nut at the left for open-position — and
// plots note positions (e.g. a minor-pentatonic box) as colored dots, roots
// highlighted in the instrument accent. Pure SVG: no client-only library, so it
// is inherently SSR-safe (no useEffect/document access needed) and renders the
// same on server and client.
//
// It satisfies InstrumentModule.InstrumentVisual (InstrumentVisualProps) so the
// PracticeStand can mount it as the guitar's instrument visual, AND accepts a
// richer `positions`/`box` API for the skill-graph viz slot.

export interface FretPosition {
  /** 1 (low E) .. 6 (high e) — guitar string, low to high. */
  string: number;
  /** 0 = open (on the nut), n = fret n. */
  fret: number;
  /** true → root note (accent-colored). */
  root?: boolean;
  label?: string;
}

export interface FretboardProps {
  /** Explicit dot positions (preferred for scale/box maps). */
  positions?: FretPosition[];
  /** Fret window start (1-based). Defaults to 0 (nut shown). */
  startFret?: number;
  /** Number of frets to draw. */
  frets?: number;
  className?: string;
  ariaLabel?: string;
  // --- InstrumentVisualProps compatibility (module slot) ---
  notes?: string[];
  shape?: number[];
}

// Am minor-pentatonic Box 1 (5th fret) — the canonical "fretboard_map" default
// when a node has viz:"fretboard_map" but no explicit positions. string 1 = low E.
const AM_PENTATONIC_BOX1: FretPosition[] = [
  { string: 1, fret: 5, root: true }, { string: 1, fret: 8 },
  { string: 2, fret: 5 }, { string: 2, fret: 7 },
  { string: 3, fret: 5 }, { string: 3, fret: 7 },
  { string: 4, fret: 5 }, { string: 4, fret: 7, root: true },
  { string: 5, fret: 5 }, { string: 5, fret: 8 },
  { string: 6, fret: 5, root: true }, { string: 6, fret: 8 },
];

// shape[] (lowE..highE, -1 muted / 0 open / n fret) → fret positions, so a chord
// shape can also be drawn on the neck via the module slot.
function shapeToPositions(shape: number[]): FretPosition[] {
  const out: FretPosition[] = [];
  shape.forEach((f, i) => {
    if (f < 0) return; // muted
    out.push({ string: i + 1, fret: f }); // array index 0 = low E = string 1
  });
  return out;
}

const STRING_NAMES = ["E", "A", "D", "G", "B", "e"]; // low → high

export function Fretboard({
  positions,
  startFret = 0,
  frets = 5,
  className,
  ariaLabel,
  shape,
}: FretboardProps) {
  const dots =
    positions ?? (shape ? shapeToPositions(shape) : AM_PENTATONIC_BOX1);

  // Derive the fret window. If startFret is 0 we draw the nut; otherwise show the
  // position label.
  const maxDotFret = dots.reduce((m, d) => Math.max(m, d.fret), startFret + frets);
  const firstFret = startFret > 0 ? startFret : 0;
  const lastFret = Math.max(firstFret + frets, maxDotFret);
  const fretCount = lastFret - firstFret;

  const W = 360;
  const H = 132;
  const padL = 28;
  const padR = 14;
  const padT = 14;
  const padB = 18;
  const boardW = W - padL - padR;
  const boardH = H - padT - padB;
  const stringGap = boardH / 5; // 6 strings → 5 gaps
  const fretGap = boardW / fretCount;

  // y for a string number (1 = low E at the BOTTOM, 6 = high e at the TOP).
  const stringY = (s: number) => padT + (6 - s) * stringGap;
  // x for a fret position; open (0) sits on the nut, fret n sits between wires.
  const fretX = (f: number) => {
    if (f <= firstFret) return padL - 14; // open marker, left of the nut
    return padL + (f - firstFret - 0.5) * fretGap;
  };

  const showNut = firstFret === 0;
  const dotMarkerFrets = [3, 5, 7, 9].filter((f) => f > firstFret && f <= lastFret);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className ?? "w-full max-w-[360px]"}
      role="img"
      aria-label={ariaLabel ?? "guitar fretboard scale map"}
      data-testid="fretboard"
    >
      {/* fingerboard */}
      <rect
        x={padL}
        y={padT}
        width={boardW}
        height={boardH}
        rx={2}
        fill="var(--surface-2, #EDE2C8)"
        stroke="var(--bg-rule, #D4C5A0)"
      />
      {/* inlay markers */}
      {dotMarkerFrets.map((f) => (
        <circle
          key={`inlay-${f}`}
          cx={padL + (f - firstFret - 0.5) * fretGap}
          cy={padT + boardH / 2}
          r={3}
          fill="var(--bg-rule, #D4C5A0)"
        />
      ))}
      {/* nut or position label */}
      {showNut ? (
        <rect x={padL - 3} y={padT} width={3} height={boardH} fill="var(--ink-2, #4A3A22)" />
      ) : (
        <text x={padL - 6} y={padT - 3} fontSize={9} textAnchor="end" fill="var(--ink-3, #7A6448)">
          {firstFret}fr
        </text>
      )}
      {/* fret wires */}
      {Array.from({ length: fretCount + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={padL + i * fretGap}
          y1={padT}
          x2={padL + i * fretGap}
          y2={padT + boardH}
          stroke="var(--bg-rule, #D4C5A0)"
          strokeWidth={i === 0 && showNut ? 0 : 1}
        />
      ))}
      {/* strings + names */}
      {STRING_NAMES.map((name, idx) => {
        const s = idx + 1; // string 1 (low E) .. 6 (high e)
        const y = stringY(s);
        return (
          <g key={`string-${s}`}>
            <line
              x1={padL}
              y1={y}
              x2={padL + boardW}
              y2={y}
              stroke="var(--ink-3, #7A6448)"
              strokeWidth={0.5 + (6 - s) * 0.18} /* thicker low strings */
            />
            <text x={padL - 16} y={y + 3} fontSize={9} textAnchor="middle" fill="var(--ink-3, #7A6448)">
              {name}
            </text>
          </g>
        );
      })}
      {/* note dots */}
      {dots.map((d, i) => {
        const cx = fretX(d.fret);
        const cy = stringY(d.string);
        const isOpen = d.fret <= firstFret;
        return (
          <g key={`dot-${i}`}>
            <circle
              cx={cx}
              cy={cy}
              r={7}
              fill={d.root ? "var(--instrument-accent, #C94040)" : "var(--surface, #F5EDD9)"}
              stroke={d.root ? "var(--instrument-accent-deep, #9A2A2A)" : "var(--instrument-accent, #C94040)"}
              strokeWidth={1.5}
              fillOpacity={isOpen ? 0.6 : 1}
            />
            {d.label && (
              <text
                x={cx}
                y={cy + 3}
                fontSize={8}
                textAnchor="middle"
                fill={d.root ? "var(--bg-base, #FBF6EE)" : "var(--ink-2, #4A3A22)"}
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
