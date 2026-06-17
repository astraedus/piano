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
  /** Optional capo. When > 0, draws a labelled capo bar across all strings at
   *  that fret and shifts the shape up so it sits above the capo — the open
   *  shape played with a capo on. 0 / undefined = no capo (normal diagram). */
  capoFret?: number;
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

interface SvguitarBarre {
  fromString: number;
  toString: number;
  fret: number;
  text?: string;
}

// Convert a lowE..highE shape array into svguitar fingers/barres + a position
// offset so frets up the neck render inside the 5-fret window. With `capo > 0`,
// the capo acts as a movable nut: every fretted note shifts up by `capo`, open
// notes (0) sit ON the capo, and a labelled capo bar is drawn across all
// strings at the capo fret — i.e. the open shape *played with a capo on*.
function toSvguitarChord(shape: number[], capo = 0): {
  fingers: [number, number | "x" | 0][];
  barres: SvguitarBarre[];
  position: number;
  frets: number;
} {
  const hasCapo = capo > 0;
  // Effective fret for each string: muted stays muted; otherwise add the capo
  // offset (an open string now rings at the capo fret, a fretted note above it).
  const eff = shape.map((f) => (f < 0 ? -1 : f + capo));
  // The fret window must include the capo bar and every (post-capo) fretted note.
  const sounded = eff.filter((f) => f > 0);
  const lo = hasCapo ? capo : sounded.length ? Math.min(...sounded) : 1;
  const hi = sounded.length ? Math.max(...sounded) : 1;
  // Anchor at the nut when everything fits in the first 4 frets; otherwise slide
  // the window so the lowest sounded fret sits near the top of the diagram.
  const position = hi <= 4 ? 1 : lo;

  const fingers = eff.map((f, i): [number, number | "x" | 0] => {
    const stringNum = 6 - i; // array index 0 (low E) → svguitar string 6
    if (f < 0) return [stringNum, "x"];
    if (f === 0) return [stringNum, 0]; // only when no capo (open string)
    // With a capo, a note sitting exactly on the capo fret is held by the capo,
    // not a finger — drop it so only the shape's own fingers are dots.
    if (hasCapo && f === capo) return [stringNum, 0];
    // svguitar frets are relative to `position` (1-based within the window).
    return [stringNum, f - position + 1];
  });

  const barres: SvguitarBarre[] = hasCapo
    ? [{ fromString: 6, toString: 1, fret: capo - position + 1, text: "Capo" }]
    : [];

  // Window must span from the capo (or nut) up through the highest sounded note,
  // with a little headroom. Default 4; widen so capo + shape always fit.
  const span = Math.max(hi, capo) - position + 1;
  const frets = Math.max(4, span + 1);

  return { fingers, barres, position, frets };
}

export function ChordDiagram({ chordShape, cagedShape, capoFret, title, className }: ChordDiagramProps) {
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
        const { fingers, barres, position, frets } = toSvguitarChord(shape, capoFret ?? 0);
        const chart = new SVGuitarChord(ref.current);
        chart
          .chord({ fingers, barres, title })
          .configure({
            strings: 6,
            frets,
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
          const capoSuffix = capoFret && capoFret > 0 ? ` with capo at fret ${capoFret}` : "";
          svg.setAttribute(
            "aria-label",
            (title ? `${title} chord diagram` : "guitar chord diagram") + capoSuffix,
          );
          // svguitar emits an SVG with a viewBox but no intrinsic width. Inside a
          // flex/centering slot that collapses it to 0×0, so pin an explicit width
          // and let height follow the viewBox aspect ratio.
          svg.style.width = "100%";
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
  }, [chordShape, cagedShape, capoFret, title]);

  return <div ref={ref} className={className ?? "w-[150px] max-w-full"} data-testid="chord-diagram" />;
}
