"use client";
import { useMemo } from "react";
import { pitchMidi } from "@/lib/music";

// Visible range: two octaves by default. White keys take integer positions.
// Highlights: `notes` (SPN like "C4") shown as dots; `fingerings` optional.

export interface KeyboardProps {
  notes?: string[];           // filled notes to highlight
  rangeStart?: string;        // SPN, default C4
  octaves?: number;           // default 2
  labelNotes?: boolean;       // show letter labels under highlighted notes
  fingerings?: Record<string, number>; // SPN -> finger number (1..5)
  height?: number;
  accent?: string;            // highlight color override
}

const WHITE_SEQ = ["C", "D", "E", "F", "G", "A", "B"];
// Black key slot after white key (C#, D#, F#, G#, A#) — no black key after E or B
const BLACK_AFTER: Record<string, string> = { C: "C#", D: "D#", F: "F#", G: "G#", A: "A#" };

export function Keyboard({
  notes = [],
  rangeStart = "C4",
  octaves = 2,
  labelNotes = false,
  fingerings,
  height = 120,
  accent,
}: KeyboardProps) {
  const highlighted = useMemo(() => {
    const set = new Set<number>();
    for (const n of notes) set.add(pitchMidi(n));
    return set;
  }, [notes]);

  // Build visible white keys
  const startMidi = pitchMidi(rangeStart);
  const startPc = startMidi % 12;
  // find which white letter startPc corresponds to — prefer walking up from nearest white
  const whiteLetters: string[] = [];
  // generate 7*octaves white keys starting from rangeStart letter
  const startLetter = pitchClassToWhiteLetter(startPc);
  let curOct = Math.floor(startMidi / 12) - 1;
  let idx = WHITE_SEQ.indexOf(startLetter);
  const totalWhites = 7 * octaves + 1; // include octave-up C
  for (let i = 0; i < totalWhites; i++) {
    const letter = WHITE_SEQ[idx % 7];
    if (idx > 0 && idx % 7 === 0) curOct++;
    whiteLetters.push(letter + curOct);
    idx++;
  }

  const whiteW = 28;
  const whiteH = height;
  const blackW = 18;
  const blackH = Math.round(height * 0.62);
  const width = whiteLetters.length * whiteW;

  const highlightFill = accent ?? "var(--accent)";

  return (
    <svg viewBox={`0 0 ${width} ${whiteH + 12}`} className="w-full max-w-[560px] block select-none" role="img" aria-label={`piano keyboard highlighting ${notes.join(", ")}`}>
      {/* White keys */}
      {whiteLetters.map((n, i) => {
        const midi = pitchMidi(n);
        const active = highlighted.has(midi);
        return (
          <g key={"w" + n}>
            <rect x={i * whiteW} y={0} width={whiteW} height={whiteH} rx={2} fill={active ? highlightFill : "var(--surface-2)"} stroke="var(--rule)" strokeWidth={1} />
            {active && (
              <circle cx={i * whiteW + whiteW / 2} cy={whiteH - 14} r={5} fill="var(--background)" />
            )}
            {active && labelNotes && (
              <text x={i * whiteW + whiteW / 2} y={whiteH + 10} textAnchor="middle" fontSize="10" fill="var(--ink-2)" fontFamily="var(--font-mono)">{n.replace(/\d+$/, "")}</text>
            )}
            {active && fingerings?.[n] && (
              <text x={i * whiteW + whiteW / 2} y={whiteH - 10} textAnchor="middle" fontSize="10" fill="var(--background)" fontFamily="var(--font-mono)">{fingerings[n]}</text>
            )}
          </g>
        );
      })}
      {/* Black keys */}
      {whiteLetters.map((n, i) => {
        const letter = n.replace(/\d+$/, "");
        const black = BLACK_AFTER[letter];
        if (!black) return null;
        const octave = parseInt(n.slice(-1));
        const bn = `${black}${octave}`;
        const bMidi = pitchMidi(bn);
        const active = highlighted.has(bMidi);
        const x = i * whiteW + whiteW - blackW / 2;
        return (
          <g key={"b" + bn}>
            <rect x={x} y={0} width={blackW} height={blackH} rx={1.5} fill={active ? highlightFill : "var(--ink)"} opacity={active ? 1 : 0.88} stroke="var(--rule)" strokeWidth={0.5} />
            {active && (
              <circle cx={x + blackW / 2} cy={blackH - 10} r={4} fill="var(--background)" />
            )}
            {active && fingerings?.[bn] && (
              <text x={x + blackW / 2} y={blackH - 6} textAnchor="middle" fontSize="9" fill="var(--background)" fontFamily="var(--font-mono)">{fingerings[bn]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function pitchClassToWhiteLetter(pc: number): string {
  // Map pitch class to the nearest white letter
  const map: Record<number, string> = { 0:"C", 2:"D", 4:"E", 5:"F", 7:"G", 9:"A", 11:"B" };
  if (map[pc]) return map[pc];
  // For non-white pitch classes, return the white key below (or same).
  if (pc === 1) return "C"; if (pc === 3) return "D"; if (pc === 6) return "F"; if (pc === 8) return "G"; if (pc === 10) return "A";
  return "C";
}
