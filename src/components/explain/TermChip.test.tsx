import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { TermChip } from "./TermChip";
import { ExplainProvider } from "./useExplain";

// The audio module loads Tone.js (browser-only) at call time; the glossary's
// `hear` callbacks import it. We never trigger playback in these render tests,
// but mocking keeps the import graph jsdom-safe and lets us assert the wiring.
vi.mock("@/lib/audio", () => ({
  ensureAudio: vi.fn().mockResolvedValue(undefined),
  playSequence: vi.fn().mockResolvedValue(undefined),
  playChord: vi.fn().mockResolvedValue(undefined),
  playProgression: vi.fn().mockResolvedValue(undefined),
  playCadence: vi.fn().mockResolvedValue(undefined),
  playBend: vi.fn().mockResolvedValue(undefined),
  playVibrato: vi.fn().mockResolvedValue(undefined),
  playMutedChug: vi.fn().mockResolvedValue(undefined),
}));

afterEach(cleanup);

function renderChip(props: { term: string; label?: string }) {
  return render(
    <ExplainProvider>
      <TermChip {...props} />
    </ExplainProvider>,
  );
}

describe("TermChip", () => {
  it("renders a known term as an accessible button with the glossary title", () => {
    renderChip({ term: "power-chord" });
    const chip = screen.getByRole("button", { name: /explain: power chord/i });
    expect(chip).toBeTruthy();
    expect(chip.textContent).toBe("Power Chord");
  });

  it("honors a label override", () => {
    renderChip({ term: "power-chord", label: "The Rock Chug" });
    expect(screen.getByText("The Rock Chug")).toBeTruthy();
  });

  it("degrades an unknown term to plain text (no button, no dead chip)", () => {
    renderChip({ term: "totally-unknown", label: "Mystery" });
    expect(screen.getByText("Mystery")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("opens the Explain card on click with all four sections", async () => {
    renderChip({ term: "power-chord" });
    fireEvent.click(screen.getByRole("button", { name: /explain: power chord/i }));

    const dialog = await screen.findByRole("dialog", { name: /explain: power chord/i });
    expect(dialog).toBeTruthy();
    // WHAT
    expect(dialog.textContent).toContain("two-note chord");
    // HEAR
    expect(screen.getByRole("button", { name: /hear it/i })).toBeTruthy();
    // WHY
    expect(dialog.textContent).toContain("fundamental sound of rock");
  });

  it("opens on Enter and on Space", async () => {
    renderChip({ term: "g-major" });
    const chip = screen.getByRole("button", { name: /explain: g major/i });
    fireEvent.keyDown(chip, { key: "Enter" });
    expect(await screen.findByRole("dialog", { name: /explain: g major/i })).toBeTruthy();

    // Close, then re-open with Space.
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.keyDown(chip, { key: " " });
    expect(await screen.findByRole("dialog", { name: /explain: g major/i })).toBeTruthy();
  });

  it("closes on Escape", async () => {
    renderChip({ term: "vibrato" });
    fireEvent.click(screen.getByRole("button", { name: /explain: vibrato/i }));
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes on outside click but not on clicks inside the card", async () => {
    renderChip({ term: "vibrato" });
    fireEvent.click(screen.getByRole("button", { name: /explain: vibrato/i }));
    const dialog = await screen.findByRole("dialog");

    // Click inside the card -> stays open.
    fireEvent.mouseDown(dialog);
    expect(screen.queryByRole("dialog")).toBeTruthy();

    // Click on the body (outside) -> closes.
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes via the × button", async () => {
    renderChip({ term: "vibrato" });
    fireEvent.click(screen.getByRole("button", { name: /explain: vibrato/i }));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: /^close$/i }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("HEAR button calls ensureAudio then the entry's hear spec", async () => {
    const audio = await import("@/lib/audio");
    renderChip({ term: "power-chord" });
    fireEvent.click(screen.getByRole("button", { name: /explain: power chord/i }));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: /hear it/i }));
    await waitFor(() => expect(audio.ensureAudio).toHaveBeenCalled());
    // power-chord's hear spec uses playMutedChug
    await waitFor(() => expect(audio.playMutedChug).toHaveBeenCalled());
  });
});
