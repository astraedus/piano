import type { Instrument, KeyId, Phase } from "../types";

// Guitar starter repertoire — plan §2.4 / guitar.md Part 4's 8 riffs, ordered by
// difficulty. The shared SongHook type has no `requiredNodes` field, so guitar
// songs are a self-contained type that carries the node-id dependencies (which
// skill-tree nodes a song needs). `requiredNodes` ids reference GUITAR_NODES.
export interface GuitarSong {
  id: string;
  instrument: Instrument; // always "guitar"
  title: string;
  artist: string;
  keyIds: KeyId[];
  phase: Phase;
  requiredNodes: string[]; // GUITAR_NODES ids this riff depends on
  hookDescription: string;
  referenceUrl?: string;
}

const yt = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " guitar tab")}`;

export const GUITAR_SONGS: GuitarSong[] = [
  {
    id: "g-song-seven-nation-army",
    instrument: "guitar",
    title: "Seven Nation Army",
    artist: "The White Stripes",
    keyIds: ["em"],
    phase: 1,
    requiredNodes: ["g-t0-tab", "g-t1-downpick"],
    hookDescription: "Seven notes, one string, all downstrokes. Recognizable in ten minutes — your first 'I'm playing guitar' moment.",
    referenceUrl: yt("Seven Nation Army"),
  },
  {
    id: "g-song-smoke-on-the-water",
    instrument: "guitar",
    title: "Smoke on the Water",
    artist: "Deep Purple",
    keyIds: ["gm"],
    phase: 1,
    requiredNodes: ["g-t0-tab", "g-t1-downpick", "g-t1-power"],
    hookDescription: "Four notes, two adjacent strings, iconic beyond words. Teaches two-string coordination.",
    referenceUrl: yt("Smoke on the Water"),
  },
  {
    id: "g-song-iron-man",
    instrument: "guitar",
    title: "Iron Man",
    artist: "Black Sabbath",
    keyIds: ["em"],
    phase: 1,
    requiredNodes: ["g-t1-power", "g-t1-palmmute"],
    hookDescription: "Slow, heavy power-chord movement with palm muting. Menacing immediately.",
    referenceUrl: yt("Iron Man Black Sabbath"),
  },
  {
    id: "g-song-sunshine-of-your-love",
    instrument: "guitar",
    title: "Sunshine of Your Love",
    artist: "Cream",
    keyIds: ["D"],
    phase: 2,
    requiredNodes: ["g-t0-tab", "g-t2-pent-box1", "g-t2-hammer"],
    hookDescription: "The first real blues-rock riff. Box 1 pentatonic with a hammer-on and an open-E drone.",
    referenceUrl: yt("Sunshine of Your Love Cream"),
  },
  {
    id: "g-song-come-as-you-are",
    instrument: "guitar",
    title: "Come As You Are",
    artist: "Nirvana",
    keyIds: ["em"],
    phase: 1,
    requiredNodes: ["g-t1-power", "g-t1-palmmute", "g-t1-altpick"],
    hookDescription: "Mixed open-string/fretted riff with palm muting throughout. Medium speed, clear rhythm.",
    referenceUrl: yt("Come As You Are Nirvana"),
  },
  {
    id: "g-song-back-in-black",
    instrument: "guitar",
    title: "Back in Black",
    artist: "AC/DC",
    keyIds: ["E"],
    phase: 3,
    requiredNodes: ["g-t1-power", "g-t1-palmmute", "g-t3-syncopation"],
    hookDescription: "The quintessential rock rhythm riff — alternating muted and open power chords with strong accents.",
    referenceUrl: yt("Back in Black AC/DC"),
  },
  {
    id: "g-song-whole-lotta-love",
    instrument: "guitar",
    title: "Whole Lotta Love",
    artist: "Led Zeppelin",
    keyIds: ["E"],
    phase: 2,
    requiredNodes: ["g-t2-pent-box1", "g-t2-bend", "g-t3-phrasing"],
    hookDescription: "Page's riff is Box 1 phrasing with blues bends and question-answer structure. The riff IS the theory lesson.",
    referenceUrl: yt("Whole Lotta Love Led Zeppelin"),
  },
  {
    id: "g-song-pride-and-joy",
    instrument: "guitar",
    title: "Pride and Joy",
    artist: "Stevie Ray Vaughan",
    keyIds: ["E"],
    phase: 3,
    requiredNodes: [
      "g-t2-pent-box1",
      "g-t2-pent-box2",
      "g-t2-bend",
      "g-t2-vibrato",
      "g-t3-blues12",
    ],
    hookDescription: "The first 'real solo' milestone — two pentatonic boxes, bends and vibrato over a 12-bar blues. 'I can improvise over blues.'",
    referenceUrl: yt("Pride and Joy Stevie Ray Vaughan"),
  },
];

export function guitarSongsForNode(nodeId: string): GuitarSong[] {
  return GUITAR_SONGS.filter((s) => s.requiredNodes.includes(nodeId));
}

export function findGuitarSong(id: string): GuitarSong | undefined {
  return GUITAR_SONGS.find((s) => s.id === id);
}
