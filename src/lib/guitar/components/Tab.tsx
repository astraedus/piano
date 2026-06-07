"use client";
import { useEffect, useRef } from "react";
import type { TabData } from "../../instrumentRegistry";

// Guitar tab via VexFlow 5 TabStave. Mirrors the SSR-safe pattern of the piano
// Staff component exactly: VexFlow is dynamically imported INSIDE useEffect (it
// touches `document`), the container is cleared on every run, and cleanup empties
// it so re-renders don't stack SVGs. The server emits an empty <div>; the tab
// draws on the client post-hydration. This is the proven Next-16-safe approach
// already in use for VexFlow notation in this repo.
//
// Conforms to NotationVisualProps: reads `tab` (a TabData). A TabData here may
// carry either a flat `positions` array (a single chord/stack) or `notes` — a
// sequence of fret stacks rendered left-to-right as one measure.

export interface TabNoteData {
  /** Each entry is one tab "column": which strings/frets sound together. */
  positions: { str: number; fret: number | string }[];
  /** VexFlow duration code: "w" "h" "q" "8" "16". Defaults to "q". */
  duration?: string;
}

// A richer tab payload (assignable to the registry's loose TabData shape).
export interface GuitarTabData extends TabData {
  notes?: TabNoteData[];
}

export interface TabProps {
  tab?: GuitarTabData;
  className?: string;
  ariaLabel?: string;
  width?: number;
  height?: number;
}

// Sensible default so a node with viz:"tab" but no data still shows something
// readable: the Seven Nation Army opening (one string, the first riff).
const DEFAULT_TAB: TabNoteData[] = [
  { positions: [{ str: 5, fret: 7 }], duration: "q" },
  { positions: [{ str: 5, fret: 7 }], duration: "8" },
  { positions: [{ str: 5, fret: 10 }], duration: "q" },
  { positions: [{ str: 5, fret: 7 }], duration: "8" },
  { positions: [{ str: 5, fret: 6 }], duration: "q" },
  { positions: [{ str: 5, fret: 5 }], duration: "q" },
];

export function Tab({ tab, className, ariaLabel, width = 420, height = 120 }: TabProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const notes: TabNoteData[] =
      tab?.notes && tab.notes.length > 0
        ? tab.notes
        : tab?.positions && tab.positions.length > 0
          ? [{ positions: tab.positions, duration: "q" }]
          : DEFAULT_TAB;

    (async () => {
      try {
        const Vex = await import("vexflow");
        if (cancelled || !ref.current) return;
        const { Renderer, TabStave, TabNote, Voice, Formatter } = Vex;
        const renderer = new Renderer(ref.current, Renderer.Backends.SVG);
        renderer.resize(width, height);
        const ctx = renderer.getContext();
        ctx.setFillStyle("var(--ink-2)" as unknown as string);
        ctx.setStrokeStyle("var(--ink-2)" as unknown as string);

        const stave = new TabStave(10, 10, width - 20);
        stave.addTabGlyph();
        stave.setContext(ctx).draw();

        const tabNotes = notes.map(
          (n) =>
            new TabNote({
              positions: n.positions,
              duration: n.duration ?? "q",
            }),
        );

        const totalBeats = tabNotes.reduce((sum, _, i) => {
          const d = notes[i].duration ?? "q";
          const beats = d === "w" ? 4 : d === "h" ? 2 : d === "q" ? 1 : d === "8" ? 0.5 : 0.25;
          return sum + beats;
        }, 0);

        const voice = new Voice({ numBeats: Math.max(1, Math.ceil(totalBeats)), beatValue: 4 }).setStrict(false);
        voice.addTickables(tabNotes);
        new Formatter().joinVoices([voice]).format([voice], width - 40);
        voice.draw(ctx, stave);

        const svg = ref.current.querySelector("svg");
        if (svg) {
          svg.setAttribute("role", "img");
          svg.setAttribute("aria-label", ariaLabel ?? "guitar tab");
          svg.style.color = "var(--ink-2)";
          svg.querySelectorAll("path, text, rect, line").forEach((node) => {
            const e = node as SVGElement;
            const fill = e.getAttribute("fill");
            if (fill && fill !== "none") e.setAttribute("fill", "var(--ink-2)");
            const stroke = e.getAttribute("stroke");
            if (stroke && stroke !== "none") e.setAttribute("stroke", "var(--ink-2)");
          });
        }
      } catch {
        if (ref.current) {
          ref.current.innerHTML = `<div style="padding:8px;color:var(--ink-3);font-style:italic;font-size:12px">tab unavailable</div>`;
        }
      }
    })();

    return () => {
      cancelled = true;
      if (el) el.innerHTML = "";
    };
  }, [tab, width, height, ariaLabel]);

  return <div ref={ref} className={className ?? "overflow-x-auto max-w-full"} data-testid="guitar-tab" />;
}
