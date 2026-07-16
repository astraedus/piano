// WhatYouKnow tests — the summary tab assembles learned skills + tempo, charted
// keys, ear, and pieces from existing state; renders an honest empty state when
// there is nothing to show; and never prints "0 BPM".

import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { WhatYouKnow } from "./WhatYouKnow";
import { registerInstrumentModule } from "@/lib/instrumentRegistry";
import type { InstrumentModule } from "@/lib/instrumentRegistry";
import { scaleRepId } from "@/lib/types";
import type { AppState, SkillNode } from "@/lib/types";

afterEach(cleanup);

vi.mock("@/hooks/useAppState", () => ({ useAppState: vi.fn() }));
import { useAppState } from "@/hooks/useAppState";

const cMajor: SkillNode = {
  id: "p-key-C",
  instrument: "piano",
  title: "C major is yours",
  keepTitle: "C major",
  tier: 1,
  category: "scales",
  prereqs: [],
  masteryDrill: "x",
  unlock: "x",
  keyId: "C",
  chainDrillId: "p1-c-major-chain",
};
const firstImprov: SkillNode = {
  id: "p-t1-first-improv",
  instrument: "piano",
  title: "First Improvisation",
  keepTitle: "First Improvisation",
  tier: 1,
  category: "expression",
  prereqs: ["p-key-C"],
  masteryDrill: "x",
  unlock: "x",
  chainDrillId: "p1-first-improv",
};

const pianoModule: InstrumentModule = {
  id: "piano",
  displayName: "Piano",
  accentVar: "piano",
  chainDrills: [],
  warmups: {},
  warmupRotation: { phase1: [], phase2Plus: [] },
  unlockLibrary: [],
  skillNodes: [cMajor, firstImprov],
  ghostRotation: { 1: [], 2: [], 3: [], 4: [], 5: [] },
  focusKind: "key",
  focusLabel: (id) => id,
  progressMapKind: "keymap",
  InstrumentVisual: () => null,
  NotationVisual: () => null,
};

beforeAll(() => registerInstrumentModule(pianoModule));

function mockState(partial: Partial<AppState>): void {
  (useAppState as ReturnType<typeof vi.fn>).mockReturnValue({
    state: {
      instrument: "piano",
      earLevel: 1,
      skillProgress: {},
      skillReps: {},
      keyDepths: {},
      sessions: [],
      pieces: [],
      ...partial,
    } as Partial<AppState>,
    ready: true,
    setState: vi.fn(),
    patch: vi.fn(),
    dismissUnlock: vi.fn(),
    dismissLevelUp: vi.fn(),
    bumpRep: vi.fn(),
    reviewSkill: vi.fn(),
    markFluent: vi.fn(),
  });
}

describe("WhatYouKnow", () => {
  it("shows the honest empty state when nothing is built", () => {
    mockState({});
    render(<WhatYouKnow />);
    expect(screen.getByTestId("wyk-empty")).toBeTruthy();
    expect(screen.queryByTestId("what-you-know")).toBeNull();
  });

  it("assembles learned skills with best tempo, keys, and ear", () => {
    mockState({
      skillProgress: {
        "p-key-C": { status: "learned", reps: 6 },
        "p-t1-first-improv": { status: "learned", reps: 3, bpmReached: 70 },
      },
      skillReps: { [scaleRepId("C")]: { count: 5, maxBpm: 84 } },
      keyDepths: { C: 5 },
      earLevel: 3,
      sessions: [{ earResults: { correctIds: ["a", "b", "c"], wrongIds: ["d"] } } as never],
    });
    render(<WhatYouKnow />);

    expect(screen.getByTestId("what-you-know")).toBeTruthy();

    // Learned C major skill line shows the best scale tempo (84 from the warmup).
    const cSkill = screen.getByTestId("wyk-skill-p-key-C");
    expect(cSkill.textContent).toContain("C major");
    expect(cSkill.textContent).toContain("learned");
    expect(cSkill.textContent).toContain("84 BPM");

    // Charted key with depth + best scale tempo.
    const cKey = screen.getByTestId("wyk-key-C");
    expect(cKey.textContent).toContain("Home");
    expect(cKey.textContent).toContain("84 BPM");

    // Ear line reflects level + lifetime accuracy.
    const ear = screen.getByTestId("wyk-ear");
    expect(ear.textContent).toContain("Level");
    expect(ear.textContent).toContain("75%");
  });

  it("omits the tempo suffix for a learned skill with no recorded BPM", () => {
    mockState({
      skillProgress: { "p-t1-first-improv": { status: "learned", reps: 3 } },
      skillReps: {},
    });
    render(<WhatYouKnow />);
    const skill = screen.getByTestId("wyk-skill-p-t1-first-improv");
    expect(skill.textContent).toContain("First Improvisation");
    expect(skill.textContent).not.toContain("BPM");
  });

  it("lists shelf pieces", () => {
    mockState({
      pieces: [
        { id: "p1", title: "Clair de Lune", composer: "Debussy", status: "learning", startedAt: "2026-01-01", minutes: 30 },
      ],
    });
    render(<WhatYouKnow />);
    const piece = screen.getByTestId("wyk-piece-p1");
    expect(within(piece).getByText("Clair de Lune")).toBeTruthy();
    expect(piece.textContent).toContain("learning");
  });
});
