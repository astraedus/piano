import { describe, it, expect } from "vitest";
import { reconcileCurrentPieceForSwitch, instrumentSwitchPatch } from "./pieces";
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

// The call-site invariant that locks issue #8: EVERY instrument switch (header
// dropdown + Settings toggle) builds its patch from this one helper, so no path
// can regress to a bare `patch({ instrument })` that leaks the other
// instrument's current piece onto the stand.
describe("instrumentSwitchPatch", () => {
  it("always emits instrument + BOTH reconciled piece fields together", () => {
    const patch = instrumentSwitchPatch("guitar", {
      instrument: "piano",
      currentPieceId: "piano-1",
      currentPieceByInstrument: { guitar: "guitar-1" },
      pieces: [piece("piano-1"), piece("guitar-1")],
    });
    // The whole point of the shared helper: the reconciled fields can never be
    // omitted. A bare `{ instrument: "guitar" }` was the bug.
    expect(Object.keys(patch).sort()).toEqual(
      ["currentPieceByInstrument", "currentPieceId", "instrument"],
    );
    expect(patch).toEqual({
      instrument: "guitar",
      currentPieceId: "guitar-1", // guitar's stashed piece is restored
      currentPieceByInstrument: { piano: "piano-1", guitar: "guitar-1" },
    });
  });

  it("clears the stand when the target instrument has no stashed piece", () => {
    const patch = instrumentSwitchPatch("guitar", {
      instrument: "piano",
      currentPieceId: "piano-1",
      currentPieceByInstrument: undefined,
      pieces: [piece("piano-1")],
    });
    expect(patch.instrument).toBe("guitar");
    expect(patch.currentPieceId).toBeUndefined(); // no guitar piece → empty stand
    expect(patch.currentPieceByInstrument).toEqual({ piano: "piano-1" });
  });

  it("drops a since-deleted target piece instead of dangling", () => {
    const patch = instrumentSwitchPatch("guitar", {
      instrument: "piano",
      currentPieceId: "piano-1",
      currentPieceByInstrument: { guitar: "guitar-gone" }, // no longer in pieces
      pieces: [piece("piano-1")],
    });
    expect(patch.currentPieceId).toBeUndefined();
  });

  it("tolerates an empty pieces list without throwing", () => {
    const patch = instrumentSwitchPatch("guitar", {
      instrument: "piano",
      currentPieceId: "piano-1",
      currentPieceByInstrument: undefined,
      pieces: [],
    });
    expect(patch.instrument).toBe("guitar");
    expect(patch.currentPieceId).toBeUndefined();
  });
});
