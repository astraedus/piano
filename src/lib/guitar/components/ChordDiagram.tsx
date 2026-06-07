"use client";
import { useEffect, useRef } from "react";

// Chord diagram via svguitar. svguitar (and its @svgdotjs/svg.js dependency) touch
// `document` at import time, so — exactly like the VexFlow Staff component — we
// dynamically import it INSIDE useEffect and never at module scope. This keeps the
// component SSR-safe under Next 16 (the server render emits an empty <div>; the
// diagram draws on the client after hydration). Cleanup empties the container so
// re-renders don't stack SVGs.
//
// chordShape convention (matches GUITAR_NODES): a 6-element array, index 0 = low E
// (6th string) ... index 5 = high e (1st string). Value: -1 = muted, 0 = open,
// n>0 = fret n. svguitar numbers strings 1..6 from high e (1) to low E (6), so the
// svguitar string number for array index i is (6 - i).

export interface ChordDiagramProps {
  /** [lowE, A, D, G, B, highE] — -1 muted, 0 open, n fret. */
  chordShape?: number[];
  /** CAGED root shape — used to render a representative diagram when no explicit shape. */
  cagedShape?: "E" | "A" | "G" | "C" | "D";
  title?: string;
  className?: string;
}

// Representative open-position voicing per CAGED shape, lowE..highE. Barre nodes
// often carry only a cagedShape; we draw the canonical open form of that shape so
// the learner sees the geometry they'll be barring up the neck.
const CAGED_SHAPES: Record<string, number[]> = {
  E: [0, 2, 2, 1, 0, 0], // E major (the E-shape)
  A: [-1, 0, 2, 2, 2, 0], // A major (the A-shape)
  G: [3, 2, 0, 0, 0, 3], // G major (the G-shape)
  C: [-1, 3, 2, 0, 1, 0], // C major (the C-shape)
  D: [-1, -1, 0, 2, 3, 2], // D major (the D-shape)
};

// Convert a lowE..highE shape array into svguitar fingers/barres + a position
// offset so frets up the neck render inside the 5-fret window.
function toSvguitarChord(shape: number[]): {
  fingers: [number, number | "x" | 0][];
  position: number;
} {
  const fretted = shape.filter((f) => f > 0);
  const minFret = fretted.length ? Math.min(...fretted) : 1;
  const maxFret = fretted.length ? Math.max(...fretted) : 1;
  // Keep open-position shapes anchored at the nut; otherwise slide the window so
  // the lowest fretted note sits near the top of the 5-fret diagram.
  const position = maxFret <= 4 ? 1 : minFret;

  const fingers = shape.map((f, i): [number, number | "x" | 0] => {
    const stringNum = 6 - i; // array index 0 (low E) → svguitar string 6
    if (f < 0) return [stringNum, "x"];
    if (f === 0) return [stringNum, 0];
    // svguitar frets are relative to `position` (1-based within the window).
    return [stringNum, f - position + 1];
  });
  return { fingers, position };
}

export function ChordDiagram({ chordShape, cagedShape, title, className }: ChordDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const shape =
      chordShape && chordShape.length === 6
        ? chordShape
        : cagedShape
          ? CAGED_SHAPES[cagedShape]
          : undefined;
    if (!shape) {
      el.innerHTML = `<div style="padding:8px;color:var(--ink-3);font-style:italic;font-size:12px">no chord shape</div>`;
      return;
    }

    (async () => {
      try {
        const { SVGuitarChord } = await import("svguitar");
        if (cancelled || !ref.current) return;
        const { fingers, position } = toSvguitarChord(shape);
        const chart = new SVGuitarChord(ref.current);
        chart
          .chord({ fingers, barres: [], title })
          .configure({
            strings: 6,
            frets: 4,
            position,
            tuning: ["E", "A", "D", "G", "B", "E"],
            // Warm Studio tokens so the diagram is born on-system.
            color: "var(--ink-2)",
            backgroundColor: "transparent",
            fontFamily: "var(--font-inter, inherit)",
            fingerColor: "var(--instrument-accent, #C94040)",
            fixedDiagramPosition: false,
          })
          .draw();

        const svg = ref.current.querySelector("svg");
        if (svg) {
          svg.setAttribute("role", "img");
          svg.setAttribute(
            "aria-label",
            title ? `${title} chord diagram` : "guitar chord diagram",
          );
          svg.style.maxWidth = "100%";
          svg.style.height = "auto";
        }
      } catch {
        if (ref.current) {
          ref.current.innerHTML = `<div style="padding:8px;color:var(--ink-3);font-style:italic;font-size:12px">chord diagram unavailable</div>`;
        }
      }
    })();

    return () => {
      cancelled = true;
      if (el) el.innerHTML = "";
    };
  }, [chordShape, cagedShape, title]);

  return <div ref={ref} className={className ?? "max-w-[160px]"} data-testid="chord-diagram" />;
}
