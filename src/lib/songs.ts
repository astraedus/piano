import type { KeyId, Phase } from "./types";

export interface SongHook {
  title: string;
  composer?: string;
  keyIds: KeyId[];
  phase: Phase;
  hookDescription?: string;
  referenceUrl?: string;
}

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " piano")}`;

export const SONG_HOOKS: SongHook[] = [
  // Phase 1
  { title: "Let It Be", composer: "The Beatles", keyIds: ["C"], phase: 1, referenceUrl: yt("Let It Be The Beatles") },
  { title: "Happy Birthday", keyIds: ["C", "F", "G"], phase: 1, referenceUrl: yt("Happy Birthday") },
  { title: "Ode to Joy", composer: "Beethoven", keyIds: ["C"], phase: 1, referenceUrl: yt("Ode to Joy") },
  { title: "Twinkle Twinkle Little Star", keyIds: ["C", "F", "G"], phase: 1, referenceUrl: yt("Twinkle Twinkle") },
  { title: "Mary Had a Little Lamb", keyIds: ["C"], phase: 1 },
  { title: "Yesterday", composer: "The Beatles", keyIds: ["F"], phase: 1, referenceUrl: yt("Yesterday Beatles") },
  { title: "Brahms Lullaby", composer: "Brahms", keyIds: ["F"], phase: 1, referenceUrl: yt("Brahms Lullaby") },
  { title: "House of the Rising Sun", keyIds: ["am"], phase: 1, referenceUrl: yt("House of the Rising Sun") },
  { title: "Für Elise", composer: "Beethoven", keyIds: ["am"], phase: 1, referenceUrl: yt("Fur Elise") },
  { title: "Mad World", composer: "Gary Jules", keyIds: ["dm"], phase: 1, referenceUrl: yt("Mad World Gary Jules") },
  { title: "River Flows in You", composer: "Yiruma", keyIds: ["am"], phase: 1, referenceUrl: yt("River Flows in You Yiruma") },
  { title: "Moonlight Sonata (opening)", composer: "Beethoven", keyIds: ["csm"], phase: 1, referenceUrl: yt("Moonlight Sonata") },
  { title: "Canon in D (simplified)", composer: "Pachelbel", keyIds: ["D", "C"], phase: 1, referenceUrl: yt("Canon in D") },

  // Phase 2
  { title: "Someone Like You", composer: "Adele", keyIds: ["am", "C"], phase: 2, referenceUrl: yt("Someone Like You Adele") },
  { title: "Let Her Go", composer: "Passenger", keyIds: ["am", "C"], phase: 2, referenceUrl: yt("Let Her Go Passenger") },
  { title: "Hallelujah (verse)", composer: "Leonard Cohen", keyIds: ["am", "C"], phase: 2, referenceUrl: yt("Hallelujah Cohen") },
  { title: "Viva la Vida", composer: "Coldplay", keyIds: ["C", "F"], phase: 2, referenceUrl: yt("Viva la Vida") },
  { title: "Clocks (intro)", composer: "Coldplay", keyIds: ["Eb"], phase: 2, referenceUrl: yt("Clocks Coldplay") },
  { title: "Imagine", composer: "John Lennon", keyIds: ["C", "F"], phase: 2, referenceUrl: yt("Imagine Lennon") },
  { title: "Comptine d'un autre été", composer: "Yann Tiersen", keyIds: ["em"], phase: 2, referenceUrl: yt("Comptine Yann Tiersen") },
  { title: "Hikaru Nara", composer: "Goose House", keyIds: ["D"], phase: 2, referenceUrl: yt("Hikaru Nara piano") },
  { title: "Take Me Home, Country Roads", composer: "John Denver", keyIds: ["G"], phase: 2, referenceUrl: yt("Country Roads") },
  { title: "Hey Jude", composer: "The Beatles", keyIds: ["F"], phase: 2, referenceUrl: yt("Hey Jude Beatles") },
  { title: "Interstellar Main Theme", composer: "Hans Zimmer", keyIds: ["em"], phase: 2, referenceUrl: yt("Interstellar theme Zimmer") },

  // Phase 3
  { title: "Autumn Leaves", composer: "Joseph Kosma", keyIds: ["gm", "em"], phase: 3, referenceUrl: yt("Autumn Leaves jazz") },
  { title: "Fly Me to the Moon", composer: "Bart Howard", keyIds: ["am", "C"], phase: 3, referenceUrl: yt("Fly Me to the Moon") },
  { title: "Somewhere Over the Rainbow", composer: "Harold Arlen", keyIds: ["Eb"], phase: 3, referenceUrl: yt("Over the Rainbow") },
  { title: "La La Land — Mia and Sebastian's Theme", composer: "Justin Hurwitz", keyIds: ["em"], phase: 3, referenceUrl: yt("Mia and Sebastian's Theme") },
  { title: "Summertime", composer: "Gershwin", keyIds: ["am"], phase: 3, referenceUrl: yt("Summertime Gershwin") },
  { title: "My Funny Valentine", composer: "Rodgers & Hart", keyIds: ["cm"], phase: 3, referenceUrl: yt("My Funny Valentine") },
  { title: "Blue in Green", composer: "Bill Evans / Miles Davis", keyIds: ["dm"], phase: 3, referenceUrl: yt("Blue in Green") },
  { title: "Gymnopédie No. 1", composer: "Erik Satie", keyIds: ["D"], phase: 3, referenceUrl: yt("Gymnopedie 1 Satie") },
  { title: "Love Theme from Cinema Paradiso", composer: "Ennio Morricone", keyIds: ["C"], phase: 3, referenceUrl: yt("Cinema Paradiso theme") },
  { title: "Arrival of the Birds", composer: "The Cinematic Orchestra", keyIds: ["D"], phase: 3, referenceUrl: yt("Arrival of the Birds") },

  // Phase 4
  { title: "Nocturne Op. 9 No. 2", composer: "Chopin", keyIds: ["Eb"], phase: 4, referenceUrl: yt("Chopin Nocturne Op 9 No 2") },
  { title: "Clair de Lune", composer: "Debussy", keyIds: ["Db"], phase: 4, referenceUrl: yt("Clair de Lune Debussy") },
  { title: "Prelude in C", composer: "Bach (WTC I)", keyIds: ["C"], phase: 4, referenceUrl: yt("Bach Prelude C major") },
  { title: "Giant Steps (ladder study)", composer: "John Coltrane", keyIds: ["B", "G", "Eb"], phase: 4, referenceUrl: yt("Giant Steps Coltrane") },
];

export function songsForKey(keyId: KeyId): SongHook[] {
  return SONG_HOOKS.filter((s) => s.keyIds.includes(keyId));
}
export function songsForPhase(phase: Phase): SongHook[] {
  return SONG_HOOKS.filter((s) => s.phase <= phase);
}
