"use client";
import { useState } from "react";
import { CIRCLE_MAJORS, CIRCLE_MINORS, KEY_META, scale, triad, progressionChords } from "@/lib/music";
import { DEPTH_MEANINGS, DEPTH_NAMES } from "@/lib/types";
import type { KeyId, KeyDepth } from "@/lib/types";
import { useAppState } from "@/hooks/useAppState";
import { ensureAudio, playChord, playSequence, playProgression } from "@/lib/audio";
import { Keyboard } from "@/lib/piano/components/Keyboard";
import { Staff } from "@/lib/piano/components/Staff";
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
  const touched = Object.values(depths).filter((d) => (d ?? 0) > 0).length;

  const sel = selected ? KEY_META[selected] : null;

  return (
    <div className="grid md:grid-cols-[420px_1fr] gap-6">
      <div className="relative">
        {/* The map sits on a warm plate, like a record on a table. */}
        <div className="warm-card p-5">
          <svg viewBox="-220 -220 440 440" className="w-full max-w-[380px] mx-auto block">
            {/* background rings */}
            <circle r={R_OUTER} fill="none" stroke="var(--bg-rule)" strokeWidth={1} />
            <circle r={R_MID} fill="none" stroke="var(--bg-rule)" strokeWidth={1} />
            <circle r={R_INNER} fill="none" stroke="var(--bg-rule)" strokeWidth={1} />

            {majors.map((k, i) => (
              <KeyWedge
                key={k}
                keyId={k}
                idx={i}
                revealIdx={i}
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
                revealIdx={i + 12}
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
            <text textAnchor="middle" y={6} className="fill-[color:var(--ink-2)]" style={{ fontSize: "13px", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>the territory</text>
          </svg>
        </div>
        <p className="text-xs text-[color:var(--ink-muted)] italic mt-3 text-center">
          {touched === 0
            ? "majors outside, minors inside. play a key and it warms."
            : `${touched} key${touched === 1 ? "" : "s"} charted so far. it only grows.`}
        </p>
      </div>
      {sel && selected && <KeyDetailPanel keyId={selected} depth={(depths[selected] ?? 0) as KeyDepth} />}
    </div>
  );
}

function KeyWedge({
  keyId, idx, revealIdx, total, rOuter, rInner, depth, selected, onClickAction, isMinor,
}: {
  keyId: KeyId; idx: number; revealIdx: number; total: number; rOuter: number; rInner: number;
  depth: KeyDepth; selected: boolean; onClickAction: () => void; isMinor?: boolean;
}) {
  const sweep = (2 * Math.PI) / total;
  // 2px-equivalent gap between segments (territory, not a pie chart).
  const gap = 0.012;
  const startA = -Math.PI / 2 + idx * sweep - sweep / 2 + gap;
  const endA = startA + sweep - gap * 2;
  // Round all coordinates to 2dp so server and client render byte-identical
  // strings (avoids float-precision SSR hydration mismatches).
  const r = (n: number) => Math.round(n * 100) / 100;
  // Arc path
  const x1 = r(rOuter * Math.cos(startA)); const y1 = r(rOuter * Math.sin(startA));
  const x2 = r(rOuter * Math.cos(endA));   const y2 = r(rOuter * Math.sin(endA));
  const x3 = r(rInner * Math.cos(endA));   const y3 = r(rInner * Math.sin(endA));
  const x4 = r(rInner * Math.cos(startA)); const y4 = r(rInner * Math.sin(startA));
  const largeArc = 0;
  const d = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

  const fill = depthFill(depth);

  const midA = (startA + endA) / 2;
  const labelR = (rOuter + rInner) / 2;
  const lx = r(labelR * Math.cos(midA));
  const ly = r(labelR * Math.sin(midA) + 4);

  const meta = KEY_META[keyId];
  const label = isMinor ? meta.tonic.toLowerCase() + "m" : meta.tonic;
  const isHome = depth >= 5;

  return (
    <g
      onClick={onClickAction}
      className="cursor-pointer key-wedge"
      style={{
        transformOrigin: `${lx}px ${ly - 4}px`,
        // Stagger the territory reveal on mount; only depths that exist swell in.
        animationDelay: `${revealIdx * 28}ms`,
      }}
    >
      <path
        d={d}
        fill={fill}
        stroke={selected ? "var(--instrument-accent)" : isHome ? "var(--instrument-accent-deep)" : "var(--bg-rule)"}
        strokeWidth={selected ? 2.5 : isHome ? 2 : 0.75}
        className={isHome ? "home-ring" : undefined}
        style={isHome ? { stroke: "var(--instrument-accent)" } : undefined}
      />
      <text x={lx} y={ly} textAnchor="middle" style={{ fontSize: isMinor ? "11px" : "13px", fontFamily: "var(--font-serif)", fontWeight: 600, fill: depth >= 3 ? "#fff" : "var(--ink-2)" }}>
        {label}
      </text>
    </g>
  );
}

/* Warm territory ramp. Untouched reads as warm clay, not white; filled keys
   deepen through the active instrument's accent (honey for piano, terracotta
   for guitar) so the chart stays instrument-coherent while keeping the
   reference's warm-deepening intent. */
function depthFill(depth: KeyDepth) {
  switch (depth) {
    case 0: return "var(--bg-surface-2)";                                          // untouched — warm clay
    case 1: return "color-mix(in oklab, var(--instrument-accent) 18%, var(--bg-surface-2))"; // heard
    case 2: return "color-mix(in oklab, var(--instrument-accent) 40%, var(--bg-surface-2))"; // walked
    case 3: return "color-mix(in oklab, var(--instrument-accent) 70%, var(--bg-surface-2))"; // played
    case 4: return "color-mix(in oklab, var(--instrument-accent-deep) 80%, var(--instrument-accent))"; // lived
    case 5: return "var(--instrument-accent-deep)";                                // home — deepest
  }
}

function KeyDetailPanel({ keyId, depth }: { keyId: KeyId; depth: KeyDepth }) {
  const { patch, state } = useAppState();
  const meta = KEY_META[keyId];
  const scaleNotes = scale(meta.tonic, meta.mode, 1);
  const scaleNotes2 = scale(meta.tonic, meta.mode, 2);
  const triadNotes = triad(meta.tonic, meta.mode === "major" ? "maj" : "min");
  const romans = meta.mode === "major" ? ["I","IV","V","I"] : ["i","iv","V","i"];
  const prog = progressionChords(keyId, romans);
  const piecesInKey = (state.pieces ?? []).filter((p) => p.keyId === keyId);
  const songs = songsForKey(keyId).slice(0, 6);

  const promoteToHome = () => {
    if (depth >= 5) return;
    patch({ keyDepths: { ...(state.keyDepths ?? {}), [keyId]: 5 } });
  };

  return (
    <div className="space-y-5 text-sm warm-card p-5">
      <header>
        <h3 className="font-serif text-[length:var(--text-2xl)] text-[color:var(--ink)] tracking-[-0.025em]" style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 30" }}>{meta.name}</h3>
        <p className="text-[color:var(--ink-3)] mt-0.5 text-xs">
          <span className="font-medium text-[color:var(--instrument-accent-deep)]">{DEPTH_NAMES[depth]}</span> — {DEPTH_MEANINGS[depth]}
        </p>
      </header>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)]">scale</p>
          <button
            type="button"
            onClick={async () => { await ensureAudio(); await playSequence(scaleNotes2); }}
            className="chip text-xs px-2 py-0.5"
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
            className="chip text-xs px-2 py-0.5"
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
            className="chip text-xs px-2 py-0.5"
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

      <div className="text-xs text-[color:var(--ink-3)] italic space-y-2">
        {depth < 5 && <p>to reach {DEPTH_NAMES[(depth + 1) as KeyDepth]}: {nextDepthHint(depth as KeyDepth)}</p>}
        {depth >= 4 && depth < 5 && (
          <button
            type="button"
            onClick={promoteToHome}
            className="chip chip-accent text-xs px-3 py-1 not-italic no-print font-medium"
          >
            mark as home
          </button>
        )}
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
