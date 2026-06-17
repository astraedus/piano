import { describe, it, expect } from "vitest";
import {
  PROGRESSIONS,
  PROGRESSION_SONGS,
  PROGRESSION_META,
  songsForProgression,
  songsByProgression,
  songUnlockCard,
  songUnlocksForNewlyLearned,
  isProgressionContainerNode,
  SONG_UNLOCK_TRIGGERS,
  type Progression,
} from "./progressionSongs";

const VALID = new Set<Progression>(PROGRESSIONS);

describe("progression song catalog — data integrity", () => {
  it("every song carries a valid progression tag", () => {
    for (const s of PROGRESSION_SONGS) {
      expect(VALID.has(s.progression), `${s.title} has invalid progression ${s.progression}`).toBe(true);
    }
  });

  it("no song is filed under more than one progression (title+artist unique)", () => {
    const seen = new Map<string, Progression>();
    for (const s of PROGRESSION_SONGS) {
      const key = `${s.title}::${s.artist}`;
      expect(seen.has(key), `${key} appears twice`).toBe(false);
      seen.set(key, s.progression);
    }
  });

  it("every song has a non-empty title and artist", () => {
    for (const s of PROGRESSION_SONGS) {
      expect(s.title.trim().length).toBeGreaterThan(0);
      expect(s.artist.trim().length).toBeGreaterThan(0);
    }
  });

  it("every progression has meta and at least one song", () => {
    for (const p of PROGRESSIONS) {
      expect(PROGRESSION_META[p]).toBeDefined();
      expect(songsForProgression(p).length).toBeGreaterThan(0);
    }
  });

  it("the dropped/rebucketed corrections held: no I-IV-V song is a four-chord-with-ii", () => {
    // "Knockin' on Heaven's Door" (I–V–ii–IV) was dropped from I-IV-V; assert it
    // never silently re-enters the catalog under that (wrong) bucket.
    const iivv = songsForProgression("I-IV-V").map((s) => s.title);
    expect(iivv).not.toContain("Knockin' on Heaven's Door");
    // Its verified replacement is present.
    expect(iivv).toContain("Johnny B. Goode");
  });

  it("groups every song exactly once across songsByProgression()", () => {
    const grouped = songsByProgression().flatMap((g) => g.songs);
    expect(grouped.length).toBe(PROGRESSION_SONGS.length);
  });
});

describe("song-unlock cards", () => {
  it("builds one card per progression with a unique stable id and a real song title", () => {
    const ids = new Set<string>();
    for (const p of PROGRESSIONS) {
      const card = songUnlockCard(p);
      expect(card.id.startsWith("u-song-")).toBe(true);
      expect(ids.has(card.id)).toBe(false);
      ids.add(card.id);
      const anchor = songsForProgression(p)[0];
      expect(card.title).toContain(anchor.title);
    }
  });

  it("fires every progression's card when the piano container node is newly learned", () => {
    const cards = songUnlocksForNewlyLearned("piano", new Set(["p-t2-pop-formula"]));
    expect(cards.length).toBe(PROGRESSIONS.length);
  });

  it("fires for the guitar container node too", () => {
    const cards = songUnlocksForNewlyLearned("guitar", new Set(["g-t1-openDGC"]));
    expect(cards.length).toBe(PROGRESSIONS.length);
  });

  it("does NOT fire for an unrelated node, or a wrong-instrument node", () => {
    expect(songUnlocksForNewlyLearned("piano", new Set(["p-key-C"]))).toEqual([]);
    // guitar's node id passed under the piano instrument → no fire.
    expect(songUnlocksForNewlyLearned("piano", new Set(["g-t1-openDGC"]))).toEqual([]);
  });

  it("isProgressionContainerNode matches exactly the trigger node ids", () => {
    for (const t of SONG_UNLOCK_TRIGGERS) {
      expect(isProgressionContainerNode(t.nodeId)).toBe(true);
    }
    expect(isProgressionContainerNode("p-key-C")).toBe(false);
  });
});
