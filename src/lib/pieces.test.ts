import { describe, it, expect } from "vitest";
import { reconcileCurrentPieceForSwitch } from "./pieces";
import type { Piece } from "./types";

const piece = (id: string): Piece => ({
  id,
  title: id,
  status: "learning",
  startedAt: "2026-01-01T00:00:00.000Z",
  minutes: 0,
});

describe("reconcileCurrentPieceForSwitch", () => {
  it("clears the current piece when switching to an instrument with none", () => {
    const pieces = [piece("piano-1")];
    const r = reconcileCurrentPieceForSwitch("piano", "guitar", "piano-1", undefined, pieces);
    expect(r.currentPieceId).toBeUndefined();
    expect(r.currentPieceByInstrument).toEqual({ piano: "piano-1" });
  });

  it("restores the incoming instrument's last piece on switch", () => {
    const pieces = [piece("piano-1"), piece("guitar-1")];
    const r = reconcileCurrentPieceForSwitch(
      "piano",
      "guitar",
      "piano-1",
      { guitar: "guitar-1" },
      pieces,
    );
    expect(r.currentPieceId).toBe("guitar-1");
    expect(r.currentPieceByInstrument).toEqual({ piano: "piano-1", guitar: "guitar-1" });
  });

  it("round-trips: switching back to piano restores the piano piece", () => {
    const pieces = [piece("piano-1")];
    const toGuitar = reconcileCurrentPieceForSwitch("piano", "guitar", "piano-1", undefined, pieces);
    expect(toGuitar.currentPieceId).toBeUndefined();
    const backToPiano = reconcileCurrentPieceForSwitch(
      "guitar",
      "piano",
      toGuitar.currentPieceId,
      toGuitar.currentPieceByInstrument,
      pieces,
    );
    expect(backToPiano.currentPieceId).toBe("piano-1");
  });

  it("drops a since-deleted restored piece rather than dangling", () => {
    const pieces = [piece("piano-1")]; // guitar-1 no longer exists
    const r = reconcileCurrentPieceForSwitch("piano", "guitar", "piano-1", { guitar: "guitar-1" }, pieces);
    expect(r.currentPieceId).toBeUndefined();
  });

  it("removes the from-instrument key when there is no current piece", () => {
    const r = reconcileCurrentPieceForSwitch(
      "guitar",
      "piano",
      undefined,
      { guitar: "x", piano: "piano-1" },
      [piece("piano-1")],
    );
    expect(r.currentPieceByInstrument.guitar).toBeUndefined();
    expect(r.currentPieceId).toBe("piano-1");
  });
});
