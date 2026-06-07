import { describe, it, expect } from "vitest";
import { pianoModule } from "./module";
import { PIANO_NODES } from "./skillNodes";
import { CHAIN_DRILLS } from "./chainDrills";
import { WARMUPS } from "./warmups";
import { UNLOCK_LIBRARY } from "./unlocks";
import { getModuleSync, isModuleRegistered } from "../instrumentRegistry";
import { isAcyclic, resolveStatus, nextToLearn } from "../skillTree";

describe("piano module", () => {
  it("self-registers into the sync cache on import", () => {
    // Importing ./module ran registerInstrumentModule(pianoModule).
    expect(isModuleRegistered("piano")).toBe(true);
    expect(getModuleSync("piano")).toBe(pianoModule);
  });

  it("exposes the correct identity + wired content", () => {
    expect(pianoModule.id).toBe("piano");
    expect(pianoModule.displayName).toBe("Piano");
    expect(pianoModule.chainDrills).toBe(CHAIN_DRILLS);
    expect(pianoModule.warmups).toBe(WARMUPS);
    expect(pianoModule.unlockLibrary).toBe(UNLOCK_LIBRARY);
    expect(pianoModule.skillNodes).toBe(PIANO_NODES);
    expect(pianoModule.InstrumentVisual).toBeTypeOf("function");
    expect(pianoModule.NotationVisual).toBeTypeOf("function");
  });

  it("ghostRotation covers every phase with non-empty key sets", () => {
    for (const phase of [1, 2, 3, 4, 5] as const) {
      expect(pianoModule.ghostRotation[phase].length).toBeGreaterThan(0);
    }
  });

  it("warmupRotation ids all resolve to real warmups", () => {
    const ids = [
      ...pianoModule.warmupRotation.phase1,
      ...pianoModule.warmupRotation.phase2Plus,
    ];
    for (const id of ids) {
      expect(pianoModule.warmups[id]).toBeDefined();
    }
  });
});

describe("every piano chain drill + warmup is instrument-tagged", () => {
  it("chain drills", () => {
    expect(CHAIN_DRILLS.length).toBeGreaterThan(0);
    for (const d of CHAIN_DRILLS) expect(d.instrument).toBe("piano");
  });
  it("warmups", () => {
    for (const w of Object.values(WARMUPS)) expect(w.instrument).toBe("piano");
  });
});

describe("PIANO_NODES form a coherent DAG", () => {
  it("is acyclic", () => {
    expect(isAcyclic(PIANO_NODES)).toBe(true);
  });

  it("every prereq id resolves to a real node", () => {
    const ids = new Set(PIANO_NODES.map((n) => n.id));
    for (const node of PIANO_NODES) {
      for (const pid of node.prereqs) {
        expect(ids.has(pid)).toBe(true);
      }
    }
  });

  it("all node ids are unique", () => {
    const ids = PIANO_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every node is tagged instrument:piano", () => {
    for (const n of PIANO_NODES) expect(n.instrument).toBe("piano");
  });

  it("tier-0 roots are available from empty progress; deeper tiers are locked", () => {
    const status = resolveStatus(PIANO_NODES, {});
    const root = PIANO_NODES.find((n) => n.prereqs.length === 0);
    expect(root).toBeDefined();
    expect(status.get(root!.id)).toBe("available");
    // A node with prereqs is locked until they're learned.
    const withPrereq = PIANO_NODES.find((n) => n.prereqs.length > 0)!;
    expect(status.get(withPrereq.id)).toBe("locked");
  });

  it("nextToLearn surfaces only available frontier nodes", () => {
    const frontier = nextToLearn(PIANO_NODES, {}, 5);
    expect(frontier.length).toBeGreaterThan(0);
    for (const n of frontier) expect(n.prereqs.length).toBe(0);
  });

  it("chainDrillId links point at real piano drills", () => {
    const drillIds = new Set(CHAIN_DRILLS.map((d) => d.id));
    for (const n of PIANO_NODES) {
      if (n.chainDrillId) expect(drillIds.has(n.chainDrillId)).toBe(true);
    }
  });
});
