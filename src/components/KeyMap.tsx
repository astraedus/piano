"use client";
import { useState } from "react";
import { CIRCLE_MAJORS, CIRCLE_MINORS, KEY_META, scale, triad, progressionChords } from "@/lib/music";
import { DEPTH_MEANINGS, DEPTH_NAMES } from "@/lib/types";
import type { KeyId, KeyDepth } from "@/lib/types";
import { useAppState } from "@/hooks/useAppState";
import { ensureAudio, playChord, playSequence, playProgression } from "@/lib/audio";
import { Keyboard } from "./Keyboard";
import { Staff } from "./Staff";
import { songsForKey } from "@/lib/songs";

// Circle of fifths — majors on outer ring, minors on inner.
// 24 segments total, 30° each.
const R_OUTER = 180;
const R_MID = 130;
const R_INNER = 80;

export function KeyMap() {
  const { state } = useAppState();
  const [selected, setSelected] = useState<KeyId | null>("C");

  const majors = CIRCLE_MAJORS;
  const minors = CIRCLE_MINORS;

  const depths = state.keyDepths ?? {};

  const sel = selected ? KEY_META[selected] : null;

  return (
    <div className="grid md:grid-cols-[420px_1fr] gap-6">
      <div className="relative">
        <svg viewBox="-220 -220 440 440" className="w-full max-w-[420px] mx-auto block">
          {/* background ring */}
          <circle r={R_OUTER} fill="none" stroke="var(--rule)" strokeWidth={1} />
          <circle r={R_MID} fill="none" stroke="var(--rule)" strokeWidth={1} />
          <circle r={R_INNER} fill="none" stroke="var(--rule)" strokeWidth={1} />

          {majors.map((k, i) => (
            <KeyWedge
              key={k}
              keyId={k}
              idx={i}
              total={12}
              rOuter={R_OUTER}
              rInner={R_MID}
              depth={(depths[k] ?? 0) as KeyDepth}
              selected={selected === k}
              onClickAction={() => setSelected(k)}
            />
          ))}
          {minors.map((k, i) => (
            <KeyWedge
              key={k}
              keyId={k}
              idx={i}
              total={12}
              rOuter={R_MID}
              rInner={R_INNER}
              depth={(depths[k] ?? 0) as KeyDepth}
              selected={selected === k}
              onClickAction={() => setSelected(k)}
              isMinor
            />
          ))}
          {/* center label */}
          <text textAnchor="middle" y={6} className="fill-[color:var(--ink-2)]" style={{ fontSize: "13px", fontFamily: "var(--font-serif)" }}>the territory</text>
        </svg>
        <p className="text-xs text-[color:var(--ink-3)] italic mt-3 text-center">
          majors outside · minors inside · color = depth
        </p>
      </div>
      {sel && selected && <KeyDetailPanel keyId={selected} depth={(depths[selected] ?? 0) as KeyDepth} />}
    </div>
  );
}

function KeyWedge({
  keyId, idx, total, rOuter, rInner, depth, selected, onClickAction, isMinor,
}: {
  keyId: KeyId; idx: number; total: number; rOuter: number; rInner: number;
  depth: KeyDepth; selected: boolean; onClickAction: () => void; isMinor?: boolean;
}) {
  const sweep = (2 * Math.PI) / total;
  const startA = -Math.PI / 2 + idx * sweep - sweep / 2;
  const endA = startA + sweep;
  // Arc path
  const x1 = rOuter * Math.cos(startA); const y1 = rOuter * Math.sin(startA);
  const x2 = rOuter * Math.cos(endA);   const y2 = rOuter * Math.sin(endA);
  const x3 = rInner * Math.cos(endA);   const y3 = rInner * Math.sin(endA);
  const x4 = rInner * Math.cos(startA); const y4 = rInner * Math.sin(startA);
  const largeArc = 0;
  const d = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

  const fill = depthFill(depth);

  const midA = (startA + endA) / 2;
  const labelR = (rOuter + rInner) / 2;
  const lx = labelR * Math.cos(midA);
  const ly = labelR * Math.sin(midA) + 4;

  const meta = KEY_META[keyId];
  const label = isMinor ? meta.tonic.toLowerCase() + "m" : meta.tonic;

  return (
    <g onClick={onClickAction} className="cursor-pointer">
      <path
        d={d}
        fill={fill}
        stroke={selected ? "var(--accent)" : "var(--rule)"}
        strokeWidth={selected ? 2 : 0.5}
        className="transition-colors hover:opacity-90"
      />
      <text x={lx} y={ly} textAnchor="middle" style={{ fontSize: isMinor ? "11px" : "13px", fontFamily: "var(--font-serif)", fill: depth >= 3 ? "var(--ink)" : "var(--ink-2)" }}>
        {label}
      </text>
    </g>
  );
}

function depthFill(depth: KeyDepth) {
  switch (depth) {
    case 0: return "color-mix(in oklab, var(--surface) 92%, var(--ink-3) 6%)";
    case 1: return "color-mix(in oklab, var(--accent-deep) 15%, var(--surface) 85%)";
    case 2: return "color-mix(in oklab, var(--accent-deep) 35%, var(--surface) 65%)";
    case 3: return "color-mix(in oklab, var(--accent-soft) 50%, var(--surface) 50%)";
    case 4: return "color-mix(in oklab, var(--accent) 65%, var(--surface) 35%)";
    case 5: return "color-mix(in oklab, var(--accent) 88%, #fff 12%)";
  }
}

function KeyDetailPanel({ keyId, depth }: { keyId: KeyId; depth: KeyDepth }) {
  const meta = KEY_META[keyId];
  const scaleNotes = scale(meta.tonic, meta.mode, 1);
  const scaleNotes2 = scale(meta.tonic, meta.mode, 2);
  const triadNotes = triad(meta.tonic, meta.mode === "major" ? "maj" : "min");
  const romans = meta.mode === "major" ? ["I","IV","V","I"] : ["i","iv","V","i"];
  const prog = progressionChords(keyId, romans);
  const { state } = useAppState();
  const piecesInKey = (state.pieces ?? []).filter((p) => p.keyId === keyId);
  const songs = songsForKey(keyId).slice(0, 6);

  return (
    <div className="space-y-5 text-sm">
      <header>
        <h3 className="font-serif text-2xl text-[color:var(--ink)]" style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 30" }}>{meta.name}</h3>
        <p className="text-[color:var(--ink-3)] mt-0.5 text-xs">
          <span className="text-[color:var(--accent)]">{DEPTH_NAMES[depth]}</span> — {DEPTH_MEANINGS[depth]}
        </p>
      </header>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)]">scale</p>
          <button
            type="button"
            onClick={async () => { await ensureAudio(); await playSequence(scaleNotes2); }}
            className="text-xs px-2 py-0.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--accent-soft)] text-[color:var(--ink-3)] hover:text-[color:var(--accent)]"
          >
            hear it
          </button>
        </div>
        <Keyboard notes={scaleNotes2} rangeStart="C4" octaves={2} />
        <div className="mt-2">
          <Staff notes={scaleNotes} ariaLabel={`${meta.name} scale on treble staff`} />
        </div>
        <p className="text-xs font-mono text-[color:var(--ink-3)] mt-1">
          {scaleNotes.map((n) => n.replace(/\d+$/, "")).join(" · ")}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)]">triad</p>
          <button
            type="button"
            onClick={async () => { await ensureAudio(); await playChord(triadNotes); }}
            className="text-xs px-2 py-0.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--accent-soft)] text-[color:var(--ink-3)] hover:text-[color:var(--accent)]"
          >
            hear it
          </button>
        </div>
        <Keyboard notes={triadNotes} rangeStart="C4" octaves={1} />
        <p className="text-xs font-mono text-[color:var(--ink-3)] mt-1">
          {triadNotes.map((n) => n.replace(/\d+$/, "")).join(" · ")}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)]">{meta.mode === "major" ? "I – IV – V – I" : "i – iv – V – i"}</p>
          <button
            type="button"
            onClick={async () => { await ensureAudio(); await playProgression(prog); }}
            className="text-xs px-2 py-0.5 rounded-full border border-[color:var(--rule)] hover:border-[color:var(--accent-soft)] text-[color:var(--ink-3)] hover:text-[color:var(--accent)]"
          >
            hear the loop
          </button>
        </div>
        <div className="text-xs text-[color:var(--ink-3)] italic">
          {romans.map((r, i) => {
            const name = r.toLowerCase() === r ? r : r; // keep as-is
            return <span key={i}>{name}{i < romans.length - 1 ? " — " : ""}</span>;
          })}
        </div>
      </div>

      {piecesInKey.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-2">pieces here</p>
          <ul className="space-y-1">
            {piecesInKey.map((p) => (
              <li key={p.id} className="text-[color:var(--ink-2)]">{p.title} — <span className="text-[color:var(--ink-3)]">{p.status}</span></li>
            ))}
          </ul>
        </div>
      )}

      {songs.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)] mb-2">songs in this key</p>
          <ul className="space-y-1">
            {songs.map((s) => (
              <li key={s.id} className="text-[color:var(--ink-2)] text-sm">
                {s.referenceUrl ? (
                  <a href={s.referenceUrl} target="_blank" rel="noreferrer" className="hover:text-[color:var(--accent)]">
                    {s.title}
                  </a>
                ) : s.title}
                {s.composer ? <span className="text-[color:var(--ink-3)]"> — {s.composer}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs text-[color:var(--ink-3)] italic">
        {depth < 5 && `to reach ${DEPTH_NAMES[(depth + 1) as KeyDepth]}: ` + nextDepthHint(depth as KeyDepth)}
      </div>
    </div>
  );
}

function nextDepthHint(depth: KeyDepth): string {
  switch (depth) {
    case 0: return "play the scale here, any way you like. hands separate counts.";
    case 1: return "play the triad and the i-iv-V-i (or I-IV-V-I) progression.";
    case 2: return "improvise over the progression. use pentatonic tones.";
    case 3: return "learn at least one piece in this key.";
    case 4: return "play fluently without thinking. accompany and improvise freely.";
    default: return "";
  }
}
