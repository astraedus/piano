import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PieceSlot } from "./PieceSlot";
import { AppStateProvider } from "@/hooks/useAppState";
import type { Piece } from "@/lib/types";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const piece: Piece = {
  id: "pz1", title: "Tickery Tockery", section: "Bars 9-16",
  status: "learning", startedAt: "2026-01-01T00:00:00.000Z", minutes: 0,
};

function renderPiece(overrides?: Partial<Piece>) {
  return render(
    <AppStateProvider>
      <PieceSlot piece={{ ...piece, ...overrides }} printAlways />
    </AppStateProvider>,
  );
}

describe("PieceSlot, completion affordance + guidance", () => {
  it("shows a plain-language guidance line naming the section", () => {
    renderPiece();
    expect(screen.getByText(/Work the piece: play Bars 9-16 slowly/)).toBeTruthy();
  });

  it("degrades the guidance gracefully when no section is set", () => {
    renderPiece({ section: undefined });
    expect(screen.getByText(/Work the piece: play the rough spots slowly/)).toBeTruthy();
  });

  it("'I worked on it' records a pass on the piece", () => {
    renderPiece();
    expect(screen.queryByTestId("piece-reps")).toBeNull();
    fireEvent.click(screen.getByTestId("piece-worked-on"));
    expect(screen.getByTestId("piece-reps").textContent).toContain("1 pass");
  });
});
