import type { Instrument, KeyId, Phase } from "./types";

export interface SongHook {
  id: string;
  instrument: Instrument; // required from P1 — every song hook literal is instrument-tagged.
  title: string;
  composer?: string;
  keyIds: KeyId[];
  phase: Phase;
  era?: string; // "anime", "film", "game", "pop", "classical", "modern-classical", "indie", "singer-songwriter", "electronic"
  anchor?: boolean; // personal-weight markers
  hookDescription?: string;
  referenceUrl?: string; // generic search fallback
  youtubeId?: string;    // direct embed
  sheetUrl?: string;     // MuseScore / PDF / Flat
  priority?: "high" | "medium" | "reach";
  pageCap?: 1 | 2 | 3;
}

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " piano")}`;

// Anti's actual song pool, seeded from his repertoire file.
export const SONG_HOOKS: SongHook[] = [
  // ─── Anchors (personal weight) ───
  { id: "once-upon-a-time", instrument: "piano", title: "Once Upon A Time", composer: "(your first piece)", keyIds: ["C", "am"], phase: 1, era: "indie", anchor: true, referenceUrl: yt("Once Upon a Time piano musescore") , hookDescription: "your first complete piece, Nov 2019." },
  { id: "tickery-tockery", instrument: "piano", title: "Tickery Tockery", composer: "Charlton", keyIds: ["C"], phase: 1, era: "classical", priority: "high", referenceUrl: yt("Tickery Tockery Charlton Trinity"), hookDescription: "your current Trinity piece." },
  { id: "viva-la-vida", instrument: "piano", title: "Viva la Vida", composer: "Coldplay", keyIds: ["Bb", "C"], phase: 2, era: "pop", anchor: true, priority: "high", referenceUrl: yt("Viva la Vida Coldplay piano"), youtubeId: "dvgZkm1xWPE", hookDescription: "since 2020. the emotional target." },
  { id: "hallelujah", instrument: "piano", title: "Hallelujah", composer: "Leonard Cohen", keyIds: ["C", "am"], phase: 3, era: "singer-songwriter", anchor: true, priority: "high", referenceUrl: yt("Hallelujah Cohen piano"), youtubeId: "YrLk4vdY28Q" },

  // ─── Phase 1 — high priority (emotional weight) ───
  { id: "megalovania-easy", instrument: "piano", title: "Megalovania (easy)", composer: "Toby Fox — Undertale", keyIds: ["dm"], phase: 1, era: "game", priority: "high", referenceUrl: yt("Megalovania easy piano") },
  { id: "hopes-and-dreams", instrument: "piano", title: "Hopes and Dreams", composer: "Toby Fox — Undertale", keyIds: ["C", "D"], phase: 1, era: "game", priority: "high", referenceUrl: yt("Hopes and Dreams piano Undertale") },
  { id: "fallen-down-reprise", instrument: "piano", title: "Fallen Down (Reprise)", composer: "Toby Fox — Undertale", keyIds: ["F"], phase: 1, era: "game", priority: "high", referenceUrl: yt("Fallen Down Reprise Undertale piano") },
  { id: "his-theme", instrument: "piano", title: "His Theme", composer: "Toby Fox — Undertale", keyIds: ["C"], phase: 1, era: "game", priority: "high", referenceUrl: "https://musescore.com/pizzapija/scores/2291201", sheetUrl: "https://musescore.com/pizzapija/scores/2291201" },
  { id: "dearly-beloved", instrument: "piano", title: "Dearly Beloved", composer: "Yoko Shimomura — Kingdom Hearts", keyIds: ["am", "C"], phase: 1, era: "game", priority: "high", sheetUrl: "https://musescore.com/user/7799631/scores/2014001", referenceUrl: yt("Dearly Beloved piano Kingdom Hearts") },
  { id: "everything-stays", instrument: "piano", title: "Everything Stays", composer: "Adventure Time", keyIds: ["F"], phase: 1, era: "animation", priority: "high", sheetUrl: "https://musescore.com/user/4432376/scores/1307891", referenceUrl: yt("Everything Stays Adventure Time piano") },

  // ─── Phase 1 — medium ───
  { id: "minuet-in-g", instrument: "piano", title: "Minuet in G", composer: "Bach (attr.)", keyIds: ["G"], phase: 1, era: "classical", priority: "medium", referenceUrl: yt("Minuet in G Bach") },
  { id: "got-theme", instrument: "piano", title: "Game of Thrones (melody)", composer: "Ramin Djawadi", keyIds: ["cm"], phase: 1, era: "tv", priority: "medium", referenceUrl: yt("Game of Thrones piano theme easy") },
  { id: "up-theme", instrument: "piano", title: "Up (theme)", composer: "Michael Giacchino", keyIds: ["F"], phase: 1, era: "film", priority: "medium", referenceUrl: "https://www.youtube.com/watch?v=7eQBm-j8Ev0", youtubeId: "7eQBm-j8Ev0" },
  { id: "demon-slayer-ep19", instrument: "piano", title: "Demon Slayer Ep 19 theme", composer: "Go Shiina / Yuki Kajiura", keyIds: ["em"], phase: 1, era: "anime", priority: "medium", sheetUrl: "https://musescore.com/user/23584376/scores/5683005/piano-tutorial", referenceUrl: yt("Demon Slayer episode 19 piano") },
  { id: "sugurus-theme", instrument: "piano", title: "Suguru's theme", composer: "Yoshimasa Terui — JJK", keyIds: ["am"], phase: 1, era: "anime", priority: "medium", referenceUrl: "https://www.youtube.com/watch?v=VXXaIGR_ffE", youtubeId: "VXXaIGR_ffE" },

  // ─── Phase 2 ───
  { id: "shelter-easy", instrument: "piano", title: "Shelter (easy)", composer: "Porter Robinson, Madeon", keyIds: ["G"], phase: 2, era: "electronic", priority: "high", sheetUrl: "https://musescore.com/user/29070240/scores/5141483", referenceUrl: yt("Shelter easy piano Porter Robinson") },
  { id: "tiny-little-adamantium", instrument: "piano", title: "Tiny Little Adamantium", keyIds: ["am"], phase: 2, era: "game", priority: "medium", referenceUrl: yt("Tiny Little Adamantium piano") },
  { id: "nuvole-bianche", instrument: "piano", title: "Nuvole Bianche", composer: "Ludovico Einaudi", keyIds: ["F"], phase: 2, era: "modern-classical", priority: "high", referenceUrl: "https://www.youtube.com/watch?v=KG3h1UEGGWM", youtubeId: "KG3h1UEGGWM", hookDescription: "modern minimalist. feeling over fireworks." },
  { id: "river-flows", instrument: "piano", title: "River Flows in You", composer: "Yiruma", keyIds: ["am"], phase: 2, era: "modern-classical", priority: "high", referenceUrl: yt("River Flows in You Yiruma") },
  { id: "bunny-girl-senpai", instrument: "piano", title: "Bunny Girl Senpai theme", keyIds: ["C"], phase: 2, era: "anime", priority: "medium", referenceUrl: yt("Bunny Girl Senpai piano") },
  { id: "steins-gate", instrument: "piano", title: "Steins;Gate theme", keyIds: ["em"], phase: 2, era: "anime", priority: "medium", referenceUrl: yt("Steins Gate piano theme") },
  { id: "comptine-amelie", instrument: "piano", title: "Comptine d'un autre été", composer: "Yann Tiersen", keyIds: ["em"], phase: 2, era: "film", priority: "high", referenceUrl: yt("Comptine Amelie piano") },

  // ─── Phase 3+ — reach ───
  { id: "super-shelter-full", instrument: "piano", title: "Super Shelter (full)", composer: "Porter Robinson · arr. Neroth", keyIds: ["G"], phase: 3, era: "electronic", priority: "reach", sheetUrl: "https://musescore.com/neroth/shelter", referenceUrl: yt("Super Shelter piano Neroth"), hookDescription: "2-yr-from-scratch target." },
  { id: "rezes-arc-theme", instrument: "piano", title: "Rezes Arc theme", composer: "Kensuke Ushio — Chainsaw Man", keyIds: ["dm"], phase: 3, era: "film", priority: "reach", referenceUrl: yt("Rezes Arc Chainsaw Man piano"), hookDescription: "\"the past\" — emotional register." },
  { id: "code-geass", instrument: "piano", title: "Code Geass theme", keyIds: ["em"], phase: 3, era: "anime", priority: "medium", referenceUrl: yt("Code Geass piano theme") },
  { id: "in-the-pool", instrument: "piano", title: "In The Pool", composer: "Kensuke Ushio — Chainsaw Man Reze Arc", keyIds: ["em"], phase: 3, era: "film", priority: "medium", referenceUrl: yt("In The Pool Chainsaw Man Reze") },
  { id: "clair-de-lune", instrument: "piano", title: "Clair de Lune", composer: "Debussy", keyIds: ["Db"], phase: 4, era: "classical", priority: "reach", referenceUrl: yt("Clair de Lune Debussy") },
  { id: "gymnopedie-1", instrument: "piano", title: "Gymnopédie No. 1", composer: "Erik Satie", keyIds: ["D"], phase: 3, era: "classical", priority: "high", referenceUrl: yt("Gymnopedie 1 Satie") },

  // ─── Laufey / singer-songwriter bias — quarterly surprises ───
  { id: "lover-girl-laufey", instrument: "piano", title: "Lover Girl", composer: "Laufey", keyIds: ["C"], phase: 2, era: "singer-songwriter", priority: "medium", referenceUrl: yt("Lover Girl Laufey piano") },
  { id: "i-love-you-so", instrument: "piano", title: "I Love You So", composer: "The Walters", keyIds: ["F"], phase: 2, era: "indie", priority: "medium", referenceUrl: "https://www.youtube.com/watch?v=Q472DsHkTOU", youtubeId: "Q472DsHkTOU" },

  // ─── Chain-drill reference hooks (shorter recognisable snippets) ───
  { id: "let-it-be", instrument: "piano", title: "Let It Be", composer: "The Beatles", keyIds: ["C"], phase: 1, era: "pop", referenceUrl: yt("Let It Be Beatles piano"), youtubeId: "QDYfEBY9NM4" },
  { id: "imagine", instrument: "piano", title: "Imagine", composer: "John Lennon", keyIds: ["C", "F"], phase: 2, era: "pop", referenceUrl: yt("Imagine Lennon piano") },
  { id: "clocks", instrument: "piano", title: "Clocks (intro)", composer: "Coldplay", keyIds: ["Eb"], phase: 2, era: "pop", referenceUrl: yt("Clocks Coldplay piano") },
  { id: "canon-in-d", instrument: "piano", title: "Canon in D", composer: "Pachelbel", keyIds: ["D", "C"], phase: 1, era: "classical", referenceUrl: yt("Canon in D piano") },
  { id: "fur-elise", instrument: "piano", title: "Für Elise", composer: "Beethoven", keyIds: ["am"], phase: 1, era: "classical", referenceUrl: yt("Fur Elise piano") },
  { id: "house-of-rising-sun", instrument: "piano", title: "House of the Rising Sun", keyIds: ["am"], phase: 1, era: "folk", referenceUrl: yt("House of the Rising Sun piano") },
  { id: "moonlight", instrument: "piano", title: "Moonlight Sonata (opening)", composer: "Beethoven", keyIds: ["csm"], phase: 1, era: "classical", referenceUrl: yt("Moonlight Sonata piano") },
  { id: "autumn-leaves", instrument: "piano", title: "Autumn Leaves", composer: "Joseph Kosma", keyIds: ["gm", "em"], phase: 3, era: "jazz", referenceUrl: yt("Autumn Leaves jazz piano") },
  { id: "mia-sebastian", instrument: "piano", title: "Mia & Sebastian's Theme", composer: "Justin Hurwitz — La La Land", keyIds: ["em"], phase: 3, era: "film", referenceUrl: yt("Mia and Sebastians Theme piano") },
  { id: "hikaru-nara", instrument: "piano", title: "Hikaru Nara", composer: "Goose House — Your Lie in April", keyIds: ["D"], phase: 2, era: "anime", priority: "high", referenceUrl: yt("Hikaru Nara piano") },
  { id: "mad-world", instrument: "piano", title: "Mad World", composer: "Gary Jules", keyIds: ["em", "dm"], phase: 1, era: "pop", referenceUrl: yt("Mad World Gary Jules piano") },
  { id: "somewhere-rainbow", instrument: "piano", title: "Somewhere Over the Rainbow", composer: "Harold Arlen", keyIds: ["Eb"], phase: 3, era: "classic", referenceUrl: yt("Over the Rainbow piano") },
  { id: "interstellar", instrument: "piano", title: "Interstellar Main Theme", composer: "Hans Zimmer", keyIds: ["em"], phase: 2, era: "film", referenceUrl: yt("Interstellar theme Zimmer") },
];

export function songsForKey(keyId: KeyId): SongHook[] {
  return SONG_HOOKS.filter((s) => s.keyIds.includes(keyId));
}
export function songsForPhase(phase: Phase): SongHook[] {
  return SONG_HOOKS.filter((s) => s.phase <= phase);
}
export function findSong(id: string): SongHook | undefined {
  return SONG_HOOKS.find((s) => s.id === id);
}
