// V5 — focused tests for the chain-drill "Tonight: what + why" lesson block and
// the Start-Here card in PracticeStand.
//
// Chain lesson block: when a drill maps to a node with an authored lesson, a
// compact "Tonight" card appears near the top of the expanded slot body showing
// the node's `what` and `why`. When no lesson maps, the slot renders as before.
//
// Start-Here card: a separate test suite covers PracticeStand directly.

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ChainDrillSlot } from "./ChainDrillSlot";
import { AppStateProvider } from "@/hooks/useAppState";
import type { ChainDrill, SkillNode } from "@/lib/types";
import type { InstrumentModule } from "@/lib/instrumentRegistry";

// Stub audio and motion (browser-only, not needed for render tests)
vi.mock("@/lib/audio", () => ({
  ensureAudio: vi.fn().mockResolvedValue(undefined),
  playSequence: vi.fn().mockResolvedValue(undefined),
  playProgression: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../Metronome", () => ({
  Metronome: () => <div data-testid="metronome">metronome</div>,
}));
vi.mock("motion/react", () => ({ useReducedMotion: () => false }));

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
});

// --- Shared fixtures ---

// A guitar drill whose id matches g-t0-anatomy's chainDrillId ("g-t0-tuning-chain").
// g-t0-anatomy has a gold-standard lesson authored in lib/guitar/lessons.ts.
const TUNING_DRILL: ChainDrill = {
  id: "g-t0-tuning-chain",
  instrument: "guitar",
  phase: 1,
  name: "tune & orient",
  soulName: "Get In Tune",
  minutes: 3,
  ghostKey: "em",
  pillar: "technique",
  steps: [
    { type: "tone", durationSec: 60, instruction: "Tune all six strings." },
  ],
  closingNote: "Always tune first.",
};

// A drill with no matching node chainDrillId (no lesson should show).
const ORPHAN_DRILL: ChainDrill = {
  id: "orphan-drill-xyz",
  instrument: "guitar",
  phase: 1,
  name: "mystery drill",
  minutes: 5,
  ghostKey: "em",
  pillar: "technique",
  steps: [
    { type: "tone", durationSec: 60, instruction: "Do the thing." },
  ],
  closingNote: "Good session.",
};

// A minimal guitar node that maps to the tuning drill (mirrors the real g-t0-anatomy).
const ANATOMY_NODE: SkillNode = {
  id: "g-t0-anatomy",
  instrument: "guitar",
  title: "Guitar Anatomy & Tuning",
  tier: 0,
  category: "setup",
  prereqs: [],
  masteryDrill: "Name all 6 open strings, tune from scratch <90s",
  unlock: "Tune & orient independently",
  chainDrillId: "g-t0-tuning-chain",
};

// Minimal InstrumentModule with just the nodes we need for lookup.
function makeModule(nodes: SkillNode[]): InstrumentModule {
  return {
    instrument: "guitar",
    displayName: "Guitar",
    skillNodes: nodes,
    warmups: {} as InstrumentModule["warmups"],
    warmupRotation: { phase1: [], phase2Plus: [] },
    drills: [],
    unlocks: [],
    focusKind: "chord",
    focusLabel: () => "Em",
    InstrumentVisual: () => null,
  } as unknown as InstrumentModule;
}

function renderSlot(props: Partial<Parameters<typeof ChainDrillSlot>[0]> = {}) {
  return render(
    <AppStateProvider>
      <ChainDrillSlot
        drill={TUNING_DRILL}
        module={makeModule([ANATOMY_NODE])}
        forceOpen={true}
        {...props}
      />
    </AppStateProvider>,
  );
}

describe("ChainDrillSlot — V5 lesson block", () => {
  it("shows the 'Tonight' lesson block when the drill maps to a node with an authored lesson", () => {
    renderSlot();
    // The testid is set in the lesson block
    expect(screen.getByTestId("chain-lesson-block")).toBeTruthy();
  });

  it("displays the lesson's 'what' text (guitar anatomy lesson)", () => {
    renderSlot();
    // The g-t0-anatomy lesson what starts with "Your guitar has six strings"
    const block = screen.getByTestId("chain-lesson-block");
    expect(block.textContent).toContain("six strings");
  });

  it("displays the lesson's 'why' text", () => {
    renderSlot();
    // The g-t0-anatomy why mentions "out-of-tune" / teaches ears the wrong thing
    const block = screen.getByTestId("chain-lesson-block");
    expect(block.textContent).toMatch(/tune|out|ears/i);
  });

  it("shows the first step's 'do' text", () => {
    renderSlot();
    const block = screen.getByTestId("chain-lesson-block");
    // First step of the anatomy lesson: "Say the string names out loud..."
    expect(block.textContent).toMatch(/string names|E, A, D, G, B, E/i);
  });

  it("does NOT show the lesson block when no node maps to the drill id", () => {
    renderSlot({ drill: ORPHAN_DRILL, module: makeModule([ANATOMY_NODE]) });
    expect(screen.queryByTestId("chain-lesson-block")).toBeNull();
  });

  it("does NOT show the lesson block when module has no skill nodes", () => {
    renderSlot({ module: makeModule([]) });
    expect(screen.queryByTestId("chain-lesson-block")).toBeNull();
  });

  it("does NOT show the lesson block when module is undefined", () => {
    renderSlot({ module: undefined });
    expect(screen.queryByTestId("chain-lesson-block")).toBeNull();
  });

  it("renders the existing rep engine regardless of lesson presence", () => {
    renderSlot();
    // Rep engine always shows the rep counter
    expect(screen.getByText(/Rep 1/)).toBeTruthy();
  });
});

describe("ChainDrillSlot — best BPM on the rep line", () => {
  // The provider hydrates from localStorage on mount; seed a recorded rep so the
  // "N times so far" line renders (it only shows once a drill has been done).
  function seedReps(reps: Record<string, { count: number; maxBpm?: number }>) {
    localStorage.setItem("practice.state", JSON.stringify({ version: 5, skillReps: reps }));
  }

  it("shows 'N times so far · best X BPM' when a tempo was recorded", () => {
    seedReps({ "drill:g-t0-tuning-chain": { count: 3, maxBpm: 90 } });
    renderSlot();
    const line = screen.getByTestId("chain-rep-count");
    expect(line.textContent).toContain("3 times so far");
    expect(line.textContent).toContain("best 90 BPM");
  });

  it("omits the BPM suffix when no tempo was recorded", () => {
    seedReps({ "drill:g-t0-tuning-chain": { count: 1 } });
    renderSlot();
    const line = screen.getByTestId("chain-rep-count");
    expect(line.textContent).toContain("First time");
    expect(line.textContent).not.toContain("BPM");
  });
});
