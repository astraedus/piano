import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { RepEngine } from "./RepEngine";
import type { RepEngineConfig } from "@/lib/repEngine";
import type { BpmLadderConfig, RepBlockConfig } from "@/lib/types";

// Metronome touches AudioContext / Tone — stub it to a plain marker so the
// rep-engine UI can be tested without real audio.
vi.mock("./Metronome", () => ({
  Metronome: () => <div data-testid="metronome">metronome</div>,
}));
// useReducedMotion reads matchMedia which jsdom lacks — default to "not reduced".
vi.mock("motion/react", () => ({ useReducedMotion: () => false }));

afterEach(cleanup);

const REST: RepBlockConfig = { repsPerBlock: 3, restSec: 5 };
const LADDER: BpmLadderConfig = { startBpm: 60, targetBpm: 70, step: 5, advanceAfterSuccesses: 3 };

function cfg(partial: Partial<RepEngineConfig> = {}): RepEngineConfig {
  return {
    reps: Array.from({ length: 6 }, () => ({ drillId: "d1", label: "Drill 1" })),
    repBlocks: null,
    bpmLadder: null,
    interleaved: false,
    ...partial,
  };
}

describe("RepEngine UI", () => {
  it("renders rep progress and marks a clean rep with instant feedback", () => {
    render(<RepEngine config={cfg()} />);
    expect(screen.getByText(/Rep 1 of 6/)).toBeTruthy();
    fireEvent.click(screen.getByText("Clean rep"));
    expect(screen.getByText("Locked in.")).toBeTruthy();
    expect(screen.getByText(/Rep 2 of 6/)).toBeTruthy();
  });

  it("shows a missed-rep message without advancing feedback as success", () => {
    render(<RepEngine config={cfg()} />);
    fireEvent.click(screen.getByText("Missed it"));
    expect(screen.getByText("No problem. Next rep.")).toBeTruthy();
  });

  it("enters a rest countdown after a full block (R2) and auto-continues", () => {
    vi.useFakeTimers();
    try {
      render(<RepEngine config={cfg({ reps: arr(6), repBlocks: REST })} />);
      // three clean reps fill the block
      fireEvent.click(screen.getByText("Clean rep"));
      fireEvent.click(screen.getByText("Clean rep"));
      fireEvent.click(screen.getByText("Clean rep"));
      expect(screen.getByText(/Rest\. This is when it sticks\./)).toBeTruthy();
      expect(screen.getByText(/5s/)).toBeTruthy();
      // run the countdown to zero
      act(() => { vi.advanceTimersByTime(5000); });
      expect(screen.getByText("Clean rep")).toBeTruthy(); // back to marking
    } finally {
      vi.useRealTimers();
    }
  });

  it("offers a BPM bump after a run of successes and advances on confirm (R5)", () => {
    render(<RepEngine config={cfg({ reps: arr(10), bpmLadder: LADDER })} />);
    expect(screen.getByText(/60 \/ 70 BPM|60/)).toBeTruthy();
    fireEvent.click(screen.getByText("Clean rep"));
    fireEvent.click(screen.getByText("Clean rep"));
    fireEvent.click(screen.getByText("Clean rep"));
    expect(screen.getByText(/Bump to 65 BPM\?/)).toBeTruthy();
    fireEvent.click(screen.getByText("Bump it up"));
    // bpm display should now read 65
    expect(screen.getByText("65")).toBeTruthy();
  });

  it("highlights the active skill under interleaving (R4)", () => {
    const inter = cfg({
      reps: [
        { drillId: "a", label: "Skill A" },
        { drillId: "b", label: "Skill B" },
      ],
      interleaved: true,
    });
    render(<RepEngine config={inter} noteText="feels harder, that's the point" />);
    expect(screen.getByText(/Now: Skill A/)).toBeTruthy();
    expect(screen.getByText(/feels harder/)).toBeTruthy();
    fireEvent.click(screen.getByText("Clean rep"));
    expect(screen.getByText(/Now: Skill B/)).toBeTruthy();
  });

  it("reports accumulated quality up via onQualityChangeAction (R8)", () => {
    const onQuality = vi.fn();
    render(<RepEngine config={cfg({ reps: arr(2) })} onQualityChangeAction={onQuality} />);
    fireEvent.click(screen.getByText("Clean rep"));
    fireEvent.click(screen.getByText("Missed it"));
    const last = onQuality.mock.calls.at(-1)?.[0];
    expect(last.attempts).toBe(2);
    expect(last.successes).toBe(1);
  });

  it("renders a done summary once all reps are marked", () => {
    render(<RepEngine config={cfg({ reps: arr(2) })} />);
    fireEvent.click(screen.getByText("Clean rep"));
    fireEvent.click(screen.getByText("Clean rep"));
    expect(screen.getByText("Drill done.")).toBeTruthy();
    expect(screen.getByText(/2 of 2 clean/)).toBeTruthy();
  });
});

function arr(n: number) {
  return Array.from({ length: n }, () => ({ drillId: "d1", label: "Drill 1" }));
}
