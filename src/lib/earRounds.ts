import type { EarRound, KeyId } from "./types";
import { KEY_META, pitchMidi, midiToSpn, progressionChords, triad } from "./music";

// Deterministic-enough RNG
function rng() {
  return Math.random();
}

const id = (prefix: string) => prefix + "-" + Math.random().toString(36).slice(2, 8);

export function generateEarRound(
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  ghostKey: KeyId
): EarRound {
  // Pick a round type appropriate to level
  if (level <= 1) return majMinTriadRound(ghostKey);
  if (level === 2) return scaleDegreeRound(ghostKey, 5);
  if (level === 3) return chordQualityRound(ghostKey);
  if (level === 4) return cadenceRound(ghostKey);
  if (level === 5) return progressionRound(ghostKey);
  // Levels 6–7: fall back to progressions; deferred extended logic.
  return progressionRound(ghostKey);
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
    prompt: "major or minor?",
    correctId: isMin ? "minor" : "major",
    choices: [
      { label: "major", id: "major" },
      { label: "minor", id: "minor" },
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
    prompt: "which triad is this?",
    correctId: q,
    choices: [
      { label: "major", id: "maj" },
      { label: "minor", id: "min" },
      { label: "diminished", id: "dim" },
      { label: "augmented", id: "aug" },
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
    prompt: "after the tonic, which scale degree is this?",
    correctId: String(deg),
    choices: ["1","2","3","4","5"].slice(0, maxDegree).map((d) => ({ id: d, label: `the ${ord(+d)}` })),
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
    prompt: "which cadence is this?",
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
    prompt: `which progression is this? (in ${KEY_META[ghostKey].name})`,
    correctId,
    choices: [
      { label: major ? "I–V–vi–IV (the pop one)" : "i–VII–VI–V (a descent)", id: id1 },
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
