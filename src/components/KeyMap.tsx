"use client";
import { useState } from "react";
import { CIRCLE_MAJORS, CIRCLE_MINORS, KEY_META, keyPrefersFlats, scale, triad, progressionChords, circleNeighbors } from "@/lib/music";
import type { CircleNeighbors } from "@/lib/music";
import { DEPTH_MEANINGS, DEPTH_NAMES } from "@/lib/types";
import type { KeyId, KeyDepth } from "@/lib/types";
import { useAppState } from "@/hooks/useAppState";
import { ensureAudio, playChord, playSequence, playProgression } from "@/lib/audio";
import { Keyboard } from "@/lib/piano/components/Keyboard";
import { Staff } from "@/lib/piano/components/Staff";
import { fingeringsForKey, tuckNotesFor, tuckCue } from "@/lib/piano/fingerings";
import { songsForKey } from "@/lib/songs";
import { bestBpmForKey } from "@/lib/bestBpm";

// Circle of fifths — majors on outer ring, minors on inner.
// 24 segments total, 30° each.
const R_OUTER = 180;
const R_MID = 130;
const R_INNER = 80;

// The four chords the circle teaches for a major key, in display order.
const ROLE_ORDER = ["I", "IV", "V", "vi"] as const;

// The chord's root note name with the octave stripped (e.g. ["C#4","E#4","G#4"]
// → "C#"). Used to label a chord cell / wheel badge from the SOUNDED chord, so
// the displayed enharmonic always matches the audio.
function rootName(chordTones: string[]): string {
  return (chordTones[0] ?? "").replace(/-?\d+$/, "");
}

export function KeyMap() {
  const { state } = useAppState();
  const [selected, setSelected] = useState<KeyId | null>("C");

  const majors = CIRCLE_MAJORS;
  const minors = CIRCLE_MINORS;

  const depths = state.keyDepths ?? {};
  const touched = Object.values(depths).filter((d) => (d ?? 0) > 0).length;

  const sel = selected ? KEY_META[selected] : null;

  // The four chords the circle teaches for the selected MAJOR key: I (root),
  // V (clockwise neighbour), IV (counter-clockwise neighbour), vi (inner
  // relative minor). null when a minor key is selected — the adjacency is a
  // major-key teaching.
  const neighbors = selected ? circleNeighbors(selected) : null;
  // Map each highlighted KeyId → its roman numeral, for the wheel overlay.
  const rolesByKey: Partial<Record<KeyId, "I" | "IV" | "V" | "vi">> = neighbors
    ? { [neighbors.I]: "I", [neighbors.IV]: "IV", [neighbors.V]: "V", [neighbors.vi]: "vi" }
    : {};
  // The IN-KEY chord-root spelling for each highlighted wedge, so the badge
  // teaches the correct enharmonic (e.g. F#'s V badge reads "C#" even though that
  // chord physically lands on the wheel's "Db" wedge — the circle has one wedge
  // per pitch class, but the role spelling follows the selected key). Built from
  // the same progressionChords() that produces the audio, so badge == sound.
  const spellingByKey: Partial<Record<KeyId, string>> = {};
  if (neighbors && selected) {
    const tones = progressionChords(selected, [...ROLE_ORDER]);
    ROLE_ORDER.forEach((role, i) => {
      spellingByKey[neighbors[role]] = rootName(tones[i]) + (role === "vi" ? "m" : "");
    });
  }

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
                role={rolesByKey[k]}
                roleSpelling={spellingByKey[k]}
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
                role={rolesByKey[k]}
                roleSpelling={spellingByKey[k]}
                onClickAction={() => setSelected(k)}
                isMinor
              />
            ))}
            {/* center label */}
            <text textAnchor="middle" y={2} className="fill-[color:var(--ink-2)]" style={{ fontSize: "12px", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>Circle of</text>
            <text textAnchor="middle" y={18} className="fill-[color:var(--ink-2)]" style={{ fontSize: "12px", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>Fifths</text>
          </svg>
        </div>
        <p className="text-xs text-[color:var(--ink-muted)] italic mt-3 text-center">
          {touched === 0
            ? "Clockwise goes up a fifth. Majors outside, relative minors inside."
            : `${touched} key${touched === 1 ? "" : "s"} charted so far. It only grows.`}
        </p>
        {neighbors && selected && <CircleChords keyId={selected} neighbors={neighbors} />}
      </div>
      {sel && selected && <KeyDetailPanel keyId={selected} depth={(depths[selected] ?? 0) as KeyDepth} />}
    </div>
  );
}

// The four-chord payoff of the circle for a major key: I / IV / V / vi. The three
// adjacent majors (I, IV, V) plus the inner relative minor (vi) — the Pop Formula.
// Each chord is playable; reuses the same progressionChords + playChord wiring as
// the I-IV-V loop in KeyDetailPanel.
function CircleChords({ keyId, neighbors }: { keyId: KeyId; neighbors: CircleNeighbors }) {
  // Chord tones for each role, built in the SELECTED key (so vi reads as the
  // relative minor triad of this key, not its own tonic chord).
  const tones = progressionChords(keyId, [...ROLE_ORDER]); // [[I],[IV],[V],[vi]]
  const cells = ROLE_ORDER.map((role, i) => ({
    role,
    keyId: neighbors[role],
    // Label from the SOUNDED chord's root spelling (the in-key enharmonic), NOT
    // KEY_META[neighbor].tonic — the circle array's fixed enharmonic diverges
    // from the played chord at two keys (F# major's V is C# not Db; Db major's
    // IV is Gb not F#). A teaching feature must label what it plays.
    label: rootName(tones[i]) + (role === "vi" ? "m" : ""),
    tones: tones[i],
  }));

  return (
    <div className="warm-card p-4 mt-3">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)]">on the circle</p>
        <button
          type="button"
          onClick={async () => { await ensureAudio(); await playProgression(tones); }}
          className="chip text-xs px-2 py-0.5"
        >
          hear the loop
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((c) => (
          <button
            key={c.role}
            type="button"
            onClick={async () => { await ensureAudio(); await playChord(c.tones); }}
            className="flex flex-col items-center gap-0.5 rounded-[var(--radius-sm)] border border-[color:var(--rule)] bg-[color:var(--bg-surface-2)] px-2 py-2 transition-colors hover:border-[color:var(--instrument-accent)]"
          >
            <span className="font-serif italic text-xs text-[color:var(--instrument-accent-deep)] font-bold">{c.role}</span>
            <span className="font-serif text-[length:var(--text-xl)] text-[color:var(--ink)] leading-none">{c.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-[color:var(--ink-2)] italic mt-2.5 leading-snug">
        The three majors touching <span className="not-italic font-medium">{KEY_META[keyId].tonic}</span> on the
        wheel are its <span className="not-italic font-medium">I&nbsp;IV&nbsp;V</span>; the minor tucked inside is the{" "}
        <span className="not-italic font-medium">vi</span> — and these four chords are most pop songs.
      </p>
    </div>
  );
}

function KeyWedge({
  keyId, idx, revealIdx, total, rOuter, rInner, depth, selected, role, roleSpelling, onClickAction, isMinor,
}: {
  keyId: KeyId; idx: number; revealIdx: number; total: number; rOuter: number; rInner: number;
  depth: KeyDepth; selected: boolean; role?: "I" | "IV" | "V" | "vi"; roleSpelling?: string; onClickAction: () => void; isMinor?: boolean;
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

  // A wedge in the selected key's I/IV/V/vi set gets an accent outline so the
  // four relatives read as one group, plus a roman-numeral badge placed just
  // beyond the wedge (outside the outer arc for majors, inside for the vi minor).
  const highlighted = role != null;
  const badgeR = isMinor ? rInner - 13 : rOuter + 14;
  const bx = r(badgeR * Math.cos(midA));
  const by = r(badgeR * Math.sin(midA) + 4);
  // The wheel has one wedge per pitch class, so a chord can land on a wedge whose
  // canonical name is the OTHER enharmonic (F#'s V is the C# chord, but it sits on
  // the wheel's "Db" wedge). When the in-key spelling differs from the wedge's own
  // label, append it to the badge ("V · C#") so the wheel teaches the right
  // enharmonic and never contradicts the chord grid / audio.
  const showSpelling = highlighted && roleSpelling != null && roleSpelling !== label;
  const badgeText = showSpelling ? `${role} · ${roleSpelling}` : role;

  // Outline: the tapped I already shows via `selected`; the other three (and the
  // I if not the selected wedge) get an accent ring at role-stroke weight.
  const stroke = selected || highlighted
    ? "var(--instrument-accent)"
    : isHome ? "var(--instrument-accent-deep)" : "var(--bg-rule)";
  const strokeWidth = selected ? 2.5 : highlighted ? 2 : isHome ? 2 : 0.75;

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
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={isHome ? "home-ring" : undefined}
        style={isHome ? { stroke: "var(--instrument-accent)" } : undefined}
      />
      <text x={lx} y={ly} textAnchor="middle" style={{ fontSize: isMinor ? "11px" : "13px", fontFamily: "var(--font-serif)", fontWeight: 600, fill: depth >= 3 ? "#fff" : "var(--ink-2)" }}>
        {label}
      </text>
      {highlighted && (
        <text
          x={bx}
          y={by}
          textAnchor="middle"
          aria-hidden
          style={{ fontSize: "11px", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700, fill: "var(--instrument-accent-deep)" }}
        >
          {badgeText}
        </text>
      )}
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
  const flats = keyPrefersFlats(keyId);
  const scaleNotes = scale(meta.tonic, meta.mode, 1, 4, flats);
  const scaleNotes2 = scale(meta.tonic, meta.mode, 2, 4, flats);
  const triadNotes = triad(meta.tonic, meta.mode === "major" ? "maj" : "min", 4, flats);
  // #4 — finger numbers + thumb-tuck markers on the reference keyboard (RH).
  const scaleFingerings = fingeringsForKey(scaleNotes2, keyId, "right");
  const scaleTucks = tuckNotesFor(scaleNotes2, keyId, "right");
  const scaleTuckCue = tuckCue(keyId, "right");
  const romans = meta.mode === "major" ? ["I","IV","V","I"] : ["i","iv","V","i"];
  const prog = progressionChords(keyId, romans);
  const piecesInKey = (state.pieces ?? []).filter((p) => p.keyId === keyId);
  const songs = songsForKey(keyId).slice(0, 6);
  // The best tempo this key's scale has been played at (WarmupSlot's "I Played It"
  // records it via scaleRepId). Only shown when a tempo exists — never "0 BPM".
  const bestScaleBpm = bestBpmForKey(keyId, state.skillReps);

  const promoteToHome = () => {
    if (depth >= 5) return;
    patch({ keyDepths: { ...(state.keyDepths ?? {}), [keyId]: 5 } });
  };

  return (
    <div className="space-y-5 text-sm warm-card p-5">
      <header>
        <h3 className="font-serif text-[length:var(--text-2xl)] text-[color:var(--ink)] tracking-[-0.025em]" style={{ fontVariationSettings: "'opsz' 30, 'SOFT' 30" }}>{meta.name}</h3>
        <p className="text-[color:var(--ink-3)] mt-0.5 text-xs">
          <span className="font-medium text-[color:var(--instrument-accent-deep)]">{DEPTH_NAMES[depth]}</span> · {DEPTH_MEANINGS[depth]}
        </p>
        {bestScaleBpm && (
          <p data-testid="keymap-bpm" className="text-xs text-[color:var(--ink-2)] mt-1">
            Best scale tempo:{" "}
            <span className="font-medium text-[color:var(--instrument-accent-deep)]">{bestScaleBpm} BPM</span>
          </p>
        )}
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
        <Keyboard notes={scaleNotes2} rangeStart="C4" octaves={2} fingerings={scaleFingerings} tuckNotes={scaleTucks} />
        {scaleTuckCue && (
          <p className="text-xs text-[color:var(--ink-2)] mt-1.5">
            <span className="text-[color:var(--instrument-accent-deep)] font-medium">Right-hand fingering:</span>{" "}
            {scaleTuckCue}. <span className="text-[color:var(--ink-3)]">(ringed key)</span>
          </p>
        )}
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
