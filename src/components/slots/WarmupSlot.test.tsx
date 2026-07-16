// #4 / #3 render verification: the warmup slot ACTUALLY surfaces, in the running
// app, (a) a finger-numbered keyboard for the current week's key, (b) the
// "thumb tucks under after the Nth note" cue, and (c) key-derived warmup content
// (no hardcoded C five-finger pattern). Proven by rendering, not just unit tests.

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { WarmupSlot, warmupReferenceLabel } from "./WarmupSlot";
import { AppStateProvider } from "@/hooks/useAppState";
import { pianoModule } from "@/lib/piano/module";
import { WARMUPS } from "@/lib/piano/warmups";
import "@/lib/piano/module"; // self-register

vi.mock("@/lib/audio", () => ({
  ensureAudio: vi.fn().mockResolvedValue(undefined),
  playSequence: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../Metronome", () => ({ Metronome: () => <div data-testid="metronome" /> }));

afterEach(cleanup);
beforeEach(() => localStorage.clear());

function renderWarmup(warmupId: keyof typeof WARMUPS, ghostKey: Parameters<typeof pianoModule.focusLabel>[0]) {
  // Slots default to collapsed; render with the slot forced open via isNow so the
  // body is in the DOM. (Slot renders body when active/now.)
  return render(
    <AppStateProvider>
      <WarmupSlot
        module={pianoModule}
        warmup={WARMUPS[warmupId]}
        ghostName="A major"
        ghostKey={ghostKey as never}
        isNow
        status="active"
      />
    </AppStateProvider>,
  );
}

function fingerDigits(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("svg text"))
    .map((t) => t.textContent ?? "")
    .filter((s) => /^[1-5]$/.test(s));
}

describe("WarmupSlot surfaces fingering for the current key — ANY warmup type", () => {
  it("renders a finger-numbered keyboard even when the warmup is NOT ghost-scale", () => {
    // weight-transfer used to render no keyboard at all; now the scale view is
    // always present.
    const { container } = renderWarmup("weight-transfer", "A");
    expect(fingerDigits(container).length).toBeGreaterThan(0);
  });

  it("shows the thumb-tuck cue for the current key (A major → after the 3rd note)", () => {
    renderWarmup("free", "A");
    const cue = screen.getByTestId("fingering-cue");
    expect(cue.textContent).toMatch(/thumb tucks under after the 3rd note/i);
  });

  it("toggles to the left-hand cue when LH is selected", () => {
    renderWarmup("free", "A");
    fireEvent.click(screen.getByRole("button", { name: "LH" }));
    expect(screen.getByTestId("fingering-cue").textContent).toMatch(/crosses over the thumb/i);
  });
});

describe("#3 — warmup five-finger content derives from the ghost key, not hardcoded C", () => {
  it("A-major week shows the A five-finger pattern, NOT 'C D E F G'", () => {
    renderWarmup("weight-transfer", "A");
    // A major first five degrees = A B C# D E; up-down = A B C# D E D C# B A.
    const body = document.body.textContent ?? "";
    expect(body).toContain("A B C# D E D C# B A");
    expect(body).not.toContain("C D E F G F E D C"); // the old hardcoded C line
  });
});

describe("warmupReferenceLabel — instrument-aware week reference", () => {
  it("piano (key focus) reads as the week's scale", () => {
    expect(warmupReferenceLabel("key", "C major")).toBe("This week's scale · C major · 2 octaves");
  });
  it("guitar (chord focus) reads as the week's SHAPE, never a literal scale", () => {
    expect(warmupReferenceLabel("chord", "A minor")).toBe("This week's shape · A minor");
  });
  it("defaults to the scale wording when focus kind is unknown", () => {
    expect(warmupReferenceLabel(undefined, "G major")).toBe("This week's scale · G major · 2 octaves");
  });
});

describe("WarmupSlot renders the instrument-aware week-reference label", () => {
  it("piano warmup shows the scale label for the current key", () => {
    renderWarmup("free", "A");
    const label = screen.getByTestId("warmup-week-label").textContent ?? "";
    expect(label).toContain("This week's scale");
    expect(label).toContain("A major");
  });
});
