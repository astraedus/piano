"use client";
import { useEffect, useRef } from "react";
import { pitchMidi } from "@/lib/music";

// Lightweight wrapper around VexFlow — renders a single-measure staff with the notes.
// We avoid tight coupling to VexFlow's API by dynamically importing + cleanup-safe.

export interface StaffProps {
  notes: string[]; // SPN. Rendered as sequential whole/half notes scaled to fit.
  clef?: "treble" | "bass";
  keySignature?: string; // "C", "F", "G", "Am" — VexFlow format
  height?: number;
  width?: number;
  ariaLabel?: string;
}

export function Staff({ notes, clef = "treble", keySignature, height = 110, width = 540, ariaLabel }: StaffProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!ref.current) return;
    const el = ref.current;
    el.innerHTML = "";
    (async () => {
      try {
        const Vex = await import("vexflow");
        if (cancelled) return;
        const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = Vex;
        const renderer = new Renderer(el, Renderer.Backends.SVG);
        renderer.resize(width, height);
        const ctx = renderer.getContext();
        // subtle styles
        ctx.setFillStyle("var(--ink-2)" as unknown as string);
        ctx.setStrokeStyle("var(--ink-2)" as unknown as string);
        const stave = new Stave(10, 10, width - 20);
        stave.addClef(clef);
        if (keySignature) stave.addKeySignature(keySignature);
        stave.setContext(ctx).draw();

        const duration = notes.length > 8 ? "8" : notes.length > 4 ? "q" : "h";
        const staveNotes = notes.map((n) => {
          // split into letter + accidental + octave
          const m = n.match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
          if (!m) return null;
          const letter = m[1].toLowerCase();
          const acc = m[2];
          const oct = m[3];
          // VexFlow expects "c/4" or "c#/4"
          const properKey = `${letter}${acc ? acc : ""}/${oct}`;
          const sn = new StaveNote({ clef, keys: [properKey], duration });
          if (acc) sn.addModifier(new Accidental(acc));
          return sn;
        }).filter(Boolean) as import("vexflow").StaveNote[];

        if (staveNotes.length > 0) {
          const voice = new Voice({ numBeats: staveNotes.length, beatValue: 4 }).setStrict(false);
          voice.addTickables(staveNotes);
          new Formatter().joinVoices([voice]).format([voice], width - 60);
          voice.draw(ctx, stave);
        }

        // Style via post-processing: set stroke/fill on SVG paths.
        const svg = el.querySelector("svg");
        if (svg) {
          svg.setAttribute("role", "img");
          if (ariaLabel) svg.setAttribute("aria-label", ariaLabel);
          svg.style.color = "var(--ink-2)";
          // Recolor fills/strokes
          svg.querySelectorAll("path, text, rect").forEach((node) => {
            const el = node as SVGElement;
            const cur = el.getAttribute("fill");
            if (cur && cur !== "none") el.setAttribute("fill", "var(--ink-2)");
            const st = el.getAttribute("stroke");
            if (st && st !== "none") el.setAttribute("stroke", "var(--ink-2)");
          });
        }
      } catch (e) {
        if (el) el.innerHTML = `<div style="padding:8px; color: var(--ink-3); font-style: italic; font-size: 12px">notation unavailable</div>`;
      }
    })();

    return () => { cancelled = true; if (el) el.innerHTML = ""; };
  }, [notes, clef, keySignature, height, width, ariaLabel]);

  return <div ref={ref} className="overflow-x-auto max-w-full" />;
}

// Helper: midi sort then dedupe (useful for chord cluster display)
export function sortedUniqueMidi(notes: string[]): string[] {
  return Array.from(new Set(notes.map(pitchMidi))).sort((a, b) => a - b).map((m) => {
    const oct = Math.floor(m / 12) - 1;
    const pcs = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    return `${pcs[m % 12]}${oct}`;
  });
}
