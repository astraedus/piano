// Pop-Formula song catalog — the payoff of the four-chord core.
//
// "Song-as-container, drill-as-tool" (curriculum-audit-2026-06-17, Q3): the
// strongest retention lever is showing the learner the real songs their chords
// now unlock. This module stores ONLY song titles + artist + progression tag
// (no lyrics, no tab — licensing-safe) and the wiring that fires a song-unlock
// card when a learner has learned the chords for a progression.
//
// Every song here was VERIFIED against its actual harmonic basis before filing
// (see the dropped/rebucketed notes in the PR summary). Rotations of a
// progression count as that progression (e.g. Toto "Africa" is vi-IV-I-V, a
// rotation of I-V-vi-IV). This is a teaching feature: a mislabeled song teaches
// the wrong thing, so the bucketing is the contract these tests pin.

import type { Instrument, UnlockCard } from "./types";

/** The three taught four-chord/three-chord cores from the Pop Formula. */
export type Progression = "I-V-vi-IV" | "I-IV-V" | "I-vi-IV-V";

export const PROGRESSIONS: Progression[] = ["I-V-vi-IV", "I-IV-V", "I-vi-IV-V"];

export interface ProgressionSong {
  title: string;
  artist: string;
  progression: Progression;
  /** A common key the song is played in (display-only, optional). */
  key?: string;
}

export interface ProgressionMeta {
  progression: Progression;
  /** Friendly display name shown above the song list. */
  name: string;
  /** One-line description of what the progression covers. */
  blurb: string;
}

export const PROGRESSION_META: Record<Progression, ProgressionMeta> = {
  "I-V-vi-IV": {
    progression: "I-V-vi-IV",
    name: "The Four Chords (I–V–vi–IV)",
    blurb: "The single most-used loop in pop. Hundreds of hits, all four rotations.",
  },
  "I-IV-V": {
    progression: "I-IV-V",
    name: "Three-Chord Rock (I–IV–V)",
    blurb: "The backbone of blues, rock and roll, and country.",
  },
  "I-vi-IV-V": {
    progression: "I-vi-IV-V",
    name: "The '50s Progression (I–vi–IV–V)",
    blurb: "Doo-wop and early rock — the 'Stand By Me' / 'Heart and Soul' changes.",
  },
};

// ── The verified catalog ──────────────────────────────────────────────────
// Filed by actual harmonic basis. Verified 2026-06-17. Dropped: "Knockin' on
// Heaven's Door" (G–D–Am–C is I–V–ii–IV, not a true I–IV–V) — replaced in the
// I-IV-V bucket by "Johnny B. Goode" (Bb–Eb–F, a textbook 12-bar I–IV–V).
export const PROGRESSION_SONGS: ProgressionSong[] = [
  // ── I–V–vi–IV (and its rotations) ──
  { title: "Let It Be", artist: "The Beatles", progression: "I-V-vi-IV", key: "C" },
  { title: "Don't Stop Believin'", artist: "Journey", progression: "I-V-vi-IV", key: "E" },
  { title: "With or Without You", artist: "U2", progression: "I-V-vi-IV", key: "D" },
  { title: "Someone Like You", artist: "Adele", progression: "I-V-vi-IV", key: "A" },
  { title: "I'm Yours", artist: "Jason Mraz", progression: "I-V-vi-IV", key: "B" },
  { title: "She Will Be Loved", artist: "Maroon 5", progression: "I-V-vi-IV", key: "D" },
  { title: "No Woman No Cry", artist: "Bob Marley", progression: "I-V-vi-IV", key: "C" },
  { title: "Africa", artist: "Toto", progression: "I-V-vi-IV", key: "A" },

  // ── I–IV–V ──
  { title: "Twist and Shout", artist: "The Beatles", progression: "I-IV-V", key: "D" },
  { title: "La Bamba", artist: "Ritchie Valens", progression: "I-IV-V", key: "C" },
  { title: "Wild Thing", artist: "The Troggs", progression: "I-IV-V", key: "A" },
  { title: "Three Little Birds", artist: "Bob Marley", progression: "I-IV-V", key: "A" },
  { title: "Brown Eyed Girl", artist: "Van Morrison", progression: "I-IV-V", key: "G" },
  { title: "Ring of Fire", artist: "Johnny Cash", progression: "I-IV-V", key: "G" },
  { title: "Johnny B. Goode", artist: "Chuck Berry", progression: "I-IV-V", key: "Bb" },
  { title: "Bad Moon Rising", artist: "Creedence Clearwater Revival", progression: "I-IV-V", key: "D" },

  // ── I–vi–IV–V (the '50s / doo-wop progression) ──
  { title: "Stand By Me", artist: "Ben E. King", progression: "I-vi-IV-V", key: "A" },
  { title: "Perfect", artist: "Ed Sheeran", progression: "I-vi-IV-V", key: "G" },
  { title: "Every Breath You Take", artist: "The Police", progression: "I-vi-IV-V", key: "A" },
  { title: "Blue Moon", artist: "Rodgers & Hart", progression: "I-vi-IV-V", key: "C" },
  { title: "Crocodile Rock", artist: "Elton John", progression: "I-vi-IV-V", key: "G" },
  { title: "Heart and Soul", artist: "Hoagy Carmichael", progression: "I-vi-IV-V", key: "C" },
  { title: "Earth Angel", artist: "The Penguins", progression: "I-vi-IV-V", key: "Ab" },
];

/** All songs filed under a progression, in catalog order. */
export function songsForProgression(p: Progression): ProgressionSong[] {
  return PROGRESSION_SONGS.filter((s) => s.progression === p);
}

/** Songs grouped by progression, in PROGRESSIONS display order. */
export function songsByProgression(): { meta: ProgressionMeta; songs: ProgressionSong[] }[] {
  return PROGRESSIONS.map((p) => ({ meta: PROGRESSION_META[p], songs: songsForProgression(p) }));
}

// ── Skill-node wiring ───────────────────────────────────────────────────────
// Which skill node, when newly learned, means "this learner now has the chords
// for these progressions". We fire ONE representative song-unlock card per
// progression at that moment (deduped — never re-fired). The container node is
// the one whose chord vocabulary covers the progression:
//   - piano:  p-t2-pop-formula  → Am–F–C–G is in hand → the four-chord family.
//   - guitar: g-t1-openDGC      → the full open-chord set (E A D G C + Em Am)
//                                  covers I–V–vi–IV, I–IV–V and I–vi–IV–V.
// Each entry pairs a node id with the progressions it unlocks. Adding an
// instrument = one more row; no endSession changes.
export interface SongUnlockTrigger {
  instrument: Instrument;
  /** Node id whose becoming-learned fires the cards below. */
  nodeId: string;
  /** Progressions whose representative song-unlock cards fire. */
  unlocks: Progression[];
}

export const SONG_UNLOCK_TRIGGERS: SongUnlockTrigger[] = [
  { instrument: "piano", nodeId: "p-t2-pop-formula", unlocks: PROGRESSIONS },
  { instrument: "guitar", nodeId: "g-t1-openDGC", unlocks: PROGRESSIONS },
];

/** True iff this node is a progression-container (so the "Songs You Can Now
 *  Play" panel should surface on its lesson). Single source of truth = the
 *  trigger table, so the panel and the unlock-firing can never drift apart. */
export function isProgressionContainerNode(nodeId: string): boolean {
  return SONG_UNLOCK_TRIGGERS.some((t) => t.nodeId === nodeId);
}

const songUnlockId = (p: Progression) => `u-song-${p}`;

/** The representative song featured on each progression's unlock card. */
function representativeSong(p: Progression): ProgressionSong {
  // The first catalog entry per progression is its most-recognizable anchor.
  return songsForProgression(p)[0];
}

/**
 * The song-unlock card for a progression — a UnlockCard variant ("You can now
 * play [song]"). Phase 2 so it sits with the pop-formula tier. Stable id so the
 * existing endSession dedupe (state.unlocks) prevents re-firing.
 */
export function songUnlockCard(p: Progression): UnlockCard {
  const song = representativeSong(p);
  const meta = PROGRESSION_META[p];
  const count = songsForProgression(p).length;
  return {
    id: songUnlockId(p),
    phase: 2,
    title: `You can now play ${song.title}.`,
    tryLine: `${song.artist} — and ${count - 1} more. They all run on ${meta.name}.`,
  };
}

/**
 * Given the ids of nodes that just became learned, return the song-unlock cards
 * to fire for the active instrument. Pure — endSession owns the dedupe against
 * already-earned ids, exactly like the per-node unlock path.
 */
export function songUnlocksForNewlyLearned(
  instrument: Instrument,
  newlyLearnedIds: Iterable<string>,
): UnlockCard[] {
  const learned = new Set(newlyLearnedIds);
  const out: UnlockCard[] = [];
  const seen = new Set<Progression>();
  for (const trigger of SONG_UNLOCK_TRIGGERS) {
    if (trigger.instrument !== instrument) continue;
    if (!learned.has(trigger.nodeId)) continue;
    for (const p of trigger.unlocks) {
      if (seen.has(p)) continue;
      seen.add(p);
      out.push(songUnlockCard(p));
    }
  }
  return out;
}
