import type { EarRound, KeyId } from "./types";
import type { InstrumentModule } from "./instrumentRegistry";
import { KEY_META, pitchMidi, midiToSpn, progressionChords, triad } from "./music";
import { intervalRound, INTERVAL_MIN_LEVEL } from "./intervalRound";

// V4: where an ear-round choice label is a glossary concept, tag it with a
// `termId` so P-C can render it as a tappable TermChip. Only choices that map
// cleanly to a real glossary entry are tagged (no dead chips).

// Deterministic-enough RNG
function rng() {
  return Math.random();
}

const id = (prefix: string) => prefix + "-" + Math.random().toString(36).slice(2, 8);

export function generateEarRound(
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  ghostKey: KeyId
): EarRound {
  // Interval training is an L3+ skill (by then the user labels chord quality).
  // Mix it in at ~1-in-3 so the level's primary round type still dominates but
  // the user actually meets the new interval rounds. Pure RNG matches the rest
  // of this module; the round generator itself is seedable + tested.
  if (level >= INTERVAL_MIN_LEVEL && rng() < 1 / 3) return intervalRound(ghostKey);

  // Pick a round type appropriate to level
  if (level <= 1) return majMinTriadRound(ghostKey);
  if (level === 2) return scaleDegreeRound(ghostKey, 5);
  if (level === 3) return chordQualityRound(ghostKey);
  if (level === 4) return cadenceRound(ghostKey);
  if (level === 5) return progressionRound(ghostKey);
  // Levels 6–7: fall back to progressions; deferred extended logic.
  return progressionRound(ghostKey);
}

/**
 * Generate one ear round for the active instrument at the given (already-clamped)
 * level. Guitar (and any module supplying its own ear content via `earRounds`)
 * gets its instrument-native round — a function generator per call, or a
 * level-matched entry from an authored array — so a guitarist is never quizzed on
 * piano-only vocabulary (scale degrees, cadences, Roman numerals). Piano leaves
 * `earRounds` undefined and falls back to the shared generator, unchanged.
 *
 * The caller MUST pass a level already clamped by effectiveEarLevel — this helper
 * only routes to the right generator; it does not re-gate.
 */
export function generateEarRoundForModule(
  module: InstrumentModule | undefined,
  level: EarRound["level"],
  ghostKey: KeyId,
): EarRound {
  const source = module?.earRounds;
  if (typeof source === "function") return source(level, ghostKey);
  if (Array.isArray(source) && source.length > 0) {
    return source.find((r) => r.level === level) ?? source[0];
  }
  return generateEarRound(level, ghostKey);
}

function randomIn<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function majMinTriadRound(ghostKey: KeyId): EarRound {
  const meta = KEY_META[ghostKey];
  const isMin = rng() < 0.5;
  const notes = triad(meta.tonic, isMin ? "min" : "maj");
  return {
    id: id("maj-min"),
    type: "maj-min",
    level: 1,
    prompt: "Major or minor?",
    correctId: isMin ? "minor" : "major",
    choices: [
      { label: "Major", id: "major", termId: "major-vs-minor" },
      { label: "Minor", id: "minor", termId: "major-vs-minor" },
    ],
    audio: { kind: "triad", key: ghostKey, chords: [notes] },
  };
}

function chordQualityRound(ghostKey: KeyId): EarRound {
  const meta = KEY_META[ghostKey];
  const q = randomIn(["maj", "min", "dim", "aug"] as const);
  const notes = triad(meta.tonic, q);
  return {
    id: id("quality"),
    type: "quality",
    level: 3,
    prompt: "Which triad is this?",
    correctId: q,
    choices: [
      { label: "Major", id: "maj", termId: "major-vs-minor" },
      { label: "Minor", id: "min", termId: "major-vs-minor" },
      { label: "Diminished", id: "dim" },
      { label: "Augmented", id: "aug" },
    ],
    audio: { kind: "triad", key: ghostKey, chords: [notes] },
  };
}

function scaleDegreeRound(ghostKey: KeyId, maxDegree: number): EarRound {
  const meta = KEY_META[ghostKey];
  const tonicMidi = pitchMidi(meta.tonic + "4");
  const majSteps = [0, 2, 4, 5, 7, 9, 11];
  const minSteps = [0, 2, 3, 5, 7, 8, 10];
  const steps = meta.mode === "major" ? majSteps : minSteps;
  const deg = 1 + Math.floor(rng() * Math.min(maxDegree, 5));
  const targetMidi = tonicMidi + steps[deg - 1];
  return {
    id: id("degree"),
    type: "scale-degree",
    level: 2,
    prompt: "After the tonic, which scale degree is this?",
    correctId: String(deg),
    choices: ["1","2","3","4","5"].slice(0, maxDegree).map((d) => ({ id: d, label: `The ${ord(+d)}` })),
    audio: {
      kind: "scale-degree",
      key: ghostKey,
      keyCenter: meta.tonic + "4",
      notes: [midiToSpn(targetMidi)],
    },
  };
}

function cadenceRound(ghostKey: KeyId): EarRound {
  const kind = randomIn(["V-I", "IV-I", "ii-V-I"] as const);
  const meta = KEY_META[ghostKey];
  let chords: string[][] = [];
  if (kind === "V-I") chords = progressionChords(ghostKey, [meta.mode === "major" ? "V" : "V", meta.mode === "major" ? "I" : "i"]);
  if (kind === "IV-I") chords = progressionChords(ghostKey, [meta.mode === "major" ? "IV" : "iv", meta.mode === "major" ? "I" : "i"]);
  if (kind === "ii-V-I") chords = progressionChords(ghostKey, [meta.mode === "major" ? "ii" : "iiø", "V", meta.mode === "major" ? "I" : "i"]);
  return {
    id: id("cadence"),
    type: "cadence",
    level: 4,
    prompt: "Which cadence is this?",
    correctId: kind,
    choices: [
      { label: "V → I", id: "V-I" },
      { label: "IV → I", id: "IV-I" },
      { label: "ii → V → I", id: "ii-V-I" },
    ],
    audio: { kind: "cadence", key: ghostKey, chords },
  };
}

function progressionRound(ghostKey: KeyId): EarRound {
  // Canonical pop progressions.
  const major = KEY_META[ghostKey].mode === "major";
  const id1 = "P1";
  const id2 = "P2";
  const id3 = "P3";
  const id4 = "P4";
  const correctId = randomIn([id1, id2, id3, id4]);
  let romansPicked: string[] = [];
  if (correctId === id1) romansPicked = major ? ["I","V","vi","IV"] : ["i","VII","VI","V"];
  if (correctId === id2) romansPicked = major ? ["vi","IV","I","V"] : ["i","VI","III","VII"];
  if (correctId === id3) romansPicked = major ? ["ii","V","I","I"] : ["iv","V","i","i"];
  if (correctId === id4) romansPicked = major ? ["I","IV","V","I"] : ["i","iv","V","i"];
  const chords = progressionChords(ghostKey, romansPicked);
  return {
    id: id("prog"),
    type: "progression",
    level: 5,
    prompt: `Which progression is this? (in ${KEY_META[ghostKey].name})`,
    correctId,
    choices: [
      // V4: the major "pop one" choice maps to the pop-formula glossary entry.
      { label: major ? "I–V–vi–IV (the pop one)" : "i–VII–VI–V (a descent)", id: id1, ...(major ? { termId: "pop-formula" } : {}) },
      { label: major ? "vi–IV–I–V" : "i–VI–III–VII", id: id2 },
      { label: major ? "ii–V–I" : "iv–V–i", id: id3 },
      { label: major ? "I–IV–V–I" : "i–iv–V–i", id: id4 },
    ],
    audio: { kind: "progression", key: ghostKey, chords },
  };
}

function ord(n: number) {
  switch (n) {
    case 1: return "tonic";
    case 2: return "2nd";
    case 3: return "3rd";
    case 4: return "4th";
    case 5: return "5th";
    default: return `${n}th`;
  }
}
