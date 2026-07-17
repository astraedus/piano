// Tonal-gating tests: a drums (non-tonal) stand shows NO scale / progression /
// pentatonic / key-wheel UI — only the pad + the sticking RhythmGrid — while piano
// (tonal) keeps its scale block. Proven by rendering the real modules.

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { WarmupSlot } from "./WarmupSlot";
import { ChainDrillSlot } from "./ChainDrillSlot";
import { AppStateProvider } from "@/hooks/useAppState";
import { drumsModule } from "@/lib/drums/module";
import { pianoModule } from "@/lib/piano/module";
import { DRUMS_WARMUPS } from "@/lib/drums/warmups";
import { DRUMS_CHAIN_DRILLS } from "@/lib/drums/chainDrills";
import { WARMUPS as PIANO_WARMUPS } from "@/lib/piano/warmups";

vi.mock("@/lib/audio", () => ({
  ensureAudio: vi.fn().mockResolvedValue(undefined),
  playSequence: vi.fn().mockResolvedValue(undefined),
  playProgression: vi.fn().mockResolvedValue(undefined),
  playSticking: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../Metronome", () => ({ Metronome: () => <div data-testid="metronome" /> }));
vi.mock("motion/react", () => ({ useReducedMotion: () => false }));

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe("WarmupSlot — drums is non-tonal (no scale UI)", () => {
  function renderDrumsWarmup() {
    return render(
      <AppStateProvider>
        <WarmupSlot
          module={drumsModule}
          warmup={DRUMS_WARMUPS["eight-on-a-hand"]}
          ghostName="C major"
          ghostKey="C"
          isNow
          status="active"
        />
      </AppStateProvider>,
    );
  }

  it("labels the reference as a RUDIMENT, showing the rudiment name (not a key)", () => {
    renderDrumsWarmup();
    const label = screen.getByTestId("warmup-week-label").textContent ?? "";
    expect(label).toMatch(/rudiment/i);
    expect(label).toContain("Single Stroke Roll");
    expect(label).not.toMatch(/scale|C major/i);
  });

  it("shows the practice pad, not a scale/keyboard, and no fingering cue", () => {
    const { container } = renderDrumsWarmup();
    expect(container.querySelector('[aria-label*="practice pad"]')).toBeTruthy();
    expect(screen.queryByTestId("fingering-cue")).toBeNull();
  });

  it("replaces 'Hear the Scale' with a percussion 'Hear It'", () => {
    renderDrumsWarmup();
    expect(screen.queryByText("Hear the Scale")).toBeNull();
    expect(screen.getByText("Hear It")).toBeTruthy();
  });
});

describe("WarmupSlot — piano stays tonal (regression guard)", () => {
  it("still shows the scale reference + Hear the Scale", () => {
    render(
      <AppStateProvider>
        <WarmupSlot
          module={pianoModule}
          warmup={PIANO_WARMUPS["ghost-scale"]}
          ghostName="C major"
          ghostKey="C"
          isNow
          status="active"
        />
      </AppStateProvider>,
    );
    expect((screen.getByTestId("warmup-week-label").textContent ?? "")).toMatch(/scale/i);
    expect(screen.getByText("Hear the Scale")).toBeTruthy();
  });
});

describe("ChainDrillSlot — drums shows the RhythmGrid, no progression/pentatonic", () => {
  it("has no tonal 'Hear the Loop' / 'Hear Pentatonic', and shows the sticking pattern", () => {
    render(
      <AppStateProvider>
        <ChainDrillSlot module={drumsModule} drill={DRUMS_CHAIN_DRILLS[0]} forceOpen />
      </AppStateProvider>,
    );
    // No tonal previews anywhere.
    expect(screen.queryByText("Hear the Loop")).toBeNull();
    expect(screen.queryByText("Hear Pentatonic")).toBeNull();
    // The drums disclosure is "see the pattern", not "see the shape".
    const disclosure = screen.getByRole("button", { name: /Hear it.*see the pattern/i });
    fireEvent.click(disclosure);
    expect(screen.getByTestId("rhythm-grid")).toBeTruthy();
    expect(screen.getByText("Hear It")).toBeTruthy();
  });
});

describe("ChainDrillSlot — guitar stays tonal (regression guard)", () => {
  it("keeps the 'see the shape' progression disclosure", () => {
    render(
      <AppStateProvider>
        <ChainDrillSlot
          module={pianoModule}
          drill={{
            id: "test-piano-drill",
            instrument: "piano",
            phase: 1,
            name: "test drill",
            minutes: 4,
            ghostKey: "C",
            pillar: "technique",
            steps: [{ type: "scale", durationSec: 60, instruction: "Play the scale." }],
            closingNote: "Done.",
          }}
          forceOpen
        />
      </AppStateProvider>,
    );
    expect(screen.getByRole("button", { name: /Hear it.*see the shape/i })).toBeTruthy();
  });
});
