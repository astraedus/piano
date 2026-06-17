"use client";
// "Songs You Can Now Play" — the payoff panel for the Pop Formula.
//
// Surfaces the progression-tagged song catalog (lib/progressionSongs.ts) grouped
// by progression, so a learner who has the four chords sees exactly which real
// songs that unlocks. Titles + artist only (licensing-safe). Rendered inside the
// lesson panel for the progression-container node (p-t2-pop-formula / g-t1-openDGC).

import { songsByProgression } from "@/lib/progressionSongs";

export function ProgressionSongsPanel() {
  const groups = songsByProgression();
  return (
    <div data-testid="songs-you-can-play" className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">
        Songs You Can Now Play
      </p>
      {groups.map(({ meta, songs }) => (
        <div key={meta.progression} className="space-y-1">
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--instrument-accent-deep)" }}
          >
            {meta.name}
          </p>
          <p className="text-[11px] italic text-[color:var(--ink-3)]">{meta.blurb}</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {songs.map((s) => (
              <li
                key={`${meta.progression}-${s.title}`}
                className="rounded-full border px-2 py-0.5 text-[11px] text-[color:var(--ink-2)]"
                style={{ borderColor: "var(--rule)" }}
                title={`${s.title} — ${s.artist}${s.key ? ` (key of ${s.key})` : ""}`}
              >
                <span className="font-medium text-[color:var(--ink)]">{s.title}</span>
                <span className="text-[color:var(--ink-3)]"> · {s.artist}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
