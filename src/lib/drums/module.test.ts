import { describe, it, expect } from "vitest";
import { drumsModule } from "./module";
import { DRUMS_NODES } from "./skillNodes";
import { DRUMS_CHAIN_DRILLS } from "./chainDrills";
import { DRUMS_WARMUPS } from "./warmups";
import { DRUMS_UNLOCK_LIBRARY } from "./unlocks";
import { getModuleSync, isModuleRegistered } from "../instrumentRegistry";
import { isAcyclic, resolveStatus, nextToLearn } from "../skillTree";

describe("drums module", () => {
  it("self-registers into the sync cache on import", () => {
    expect(isModuleRegistered("drums")).toBe(true);
    expect(getModuleSync("drums")).toBe(drumsModule);
  });

  it("exposes the correct identity + wired content", () => {
    expect(drumsModule.id).toBe("drums");
    expect(drumsModule.displayName).toBe("Drums");
    expect(drumsModule.accentVar).toBe("drums");
    expect(drumsModule.chainDrills).toBe(DRUMS_CHAIN_DRILLS);
    expect(drumsModule.warmups).toBe(DRUMS_WARMUPS);
    expect(drumsModule.unlockLibrary).toBe(DRUMS_UNLOCK_LIBRARY);
    expect(drumsModule.skillNodes).toBe(DRUMS_NODES);
    expect(drumsModule.InstrumentVisual).toBeTypeOf("function");
    expect(drumsModule.NotationVisual).toBeTypeOf("function");
  });

  it("is a NON-TONAL module (focusKind rudiment, rudiments progress map)", () => {
    expect(drumsModule.focusKind).toBe("rudiment");
    expect(drumsModule.progressMapKind).toBe("rudiments");
    // focusLabel maps opaque rotation tokens to rudiment names, never a raw key.
    expect(drumsModule.focusLabel("C")).toBe("Single Stroke Roll");
    expect(drumsModule.focusLabel("C")).not.toMatch(/major|minor/i);
  });

  it("ghostRotation covers every phase with non-empty token sets", () => {
    for (const phase of [1, 2, 3, 4, 5] as const) {
      expect(drumsModule.ghostRotation[phase].length).toBeGreaterThan(0);
    }
  });

  it("warmupRotation ids all resolve to real warmups", () => {
    const ids = [
      ...drumsModule.warmupRotation.phase1,
      ...drumsModule.warmupRotation.phase2Plus,
    ];
    for (const id of ids) {
      expect(drumsModule.warmups[id]).toBeDefined();
    }
  });

  // A non-tonal module MUST ship its own ear content (the shared generator is
  // pitched piano content). Also guards the dead-link class: a typo'd gate node id
  // silently caps that ear level forever.
  it("ships its own earRounds + earLevelGates, and every gate node id resolves", () => {
    expect(drumsModule.earRounds).toBeDefined();
    const ids = new Set(DRUMS_NODES.map((n) => n.id));
    const gates = drumsModule.earLevelGates ?? {};
    const gated = Object.values(gates).flat();
    expect(gated.length).toBeGreaterThan(0); // drums ear content IS gated
    for (const id of gated) {
      expect(ids.has(id), `earLevelGates references missing node "${id}"`).toBe(true);
    }
  });
});

describe("every drums chain drill + warmup is instrument-tagged", () => {
  it("chain drills", () => {
    expect(DRUMS_CHAIN_DRILLS.length).toBeGreaterThan(0);
    for (const d of DRUMS_CHAIN_DRILLS) expect(d.instrument).toBe("drums");
  });
  it("warmups", () => {
    for (const w of Object.values(DRUMS_WARMUPS)) expect(w.instrument).toBe("drums");
  });
});

describe("DRUMS_NODES form a coherent DAG (Stage A: four Tier-0 nodes)", () => {
  it("has the four Tier-0 foundation nodes", () => {
    expect(DRUMS_NODES.length).toBe(4);
    for (const n of DRUMS_NODES) expect(n.tier).toBe(0);
  });

  it("is acyclic", () => {
    expect(isAcyclic(DRUMS_NODES)).toBe(true);
  });

  it("every prereq id resolves to a real node (no dangling prereqs)", () => {
    const ids = new Set(DRUMS_NODES.map((n) => n.id));
    for (const node of DRUMS_NODES) {
      for (const pid of node.prereqs) {
        expect(ids.has(pid)).toBe(true);
      }
    }
  });

  it("all node ids are unique", () => {
    const ids = DRUMS_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every node is tagged instrument:drums", () => {
    for (const n of DRUMS_NODES) expect(n.instrument).toBe("drums");
  });

  it("every node is reachable from a tier-0 root", () => {
    const byId = new Map(DRUMS_NODES.map((n) => [n.id, n]));
    const roots = new Set(DRUMS_NODES.filter((n) => n.prereqs.length === 0).map((n) => n.id));
    expect(roots.size).toBeGreaterThan(0);
    const reachesRoot = (id: string, seen = new Set<string>()): boolean => {
      if (roots.has(id)) return true;
      const node = byId.get(id);
      if (!node || seen.has(id)) return false;
      seen.add(id);
      return node.prereqs.some((p) => reachesRoot(p, seen));
    };
    for (const n of DRUMS_NODES) expect(reachesRoot(n.id)).toBe(true);
  });

  it("tier-0 roots are available from empty progress; prereq'd nodes locked", () => {
    const status = resolveStatus(DRUMS_NODES, {});
    const root = DRUMS_NODES.find((n) => n.prereqs.length === 0);
    expect(root).toBeDefined();
    expect(status.get(root!.id)).toBe("available");
    const withPrereq = DRUMS_NODES.find((n) => n.prereqs.length > 0)!;
    expect(status.get(withPrereq.id)).toBe("locked");
  });

  it("nextToLearn surfaces only available frontier nodes", () => {
    const frontier = nextToLearn(DRUMS_NODES, {}, 5);
    expect(frontier.length).toBeGreaterThan(0);
    for (const n of frontier) expect(n.prereqs.length).toBe(0);
  });

  it("chainDrillId links point at real drums drills", () => {
    const drillIds = new Set(DRUMS_CHAIN_DRILLS.map((d) => d.id));
    for (const n of DRUMS_NODES) {
      if (n.chainDrillId) expect(drillIds.has(n.chainDrillId)).toBe(true);
    }
  });
});

describe("drums unlockCardId integrity (mirrors guitar)", () => {
  it("every unlockCardId resolves to a real UnlockCard", () => {
    const cardIds = new Set(DRUMS_UNLOCK_LIBRARY.map((c) => c.id));
    for (const n of DRUMS_NODES) {
      if (n.unlockCardId) expect(cardIds.has(n.unlockCardId)).toBe(true);
    }
  });

  it("no two nodes share the same unlockCardId", () => {
    const used = DRUMS_NODES.map((n) => n.unlockCardId).filter((x): x is string => !!x);
    expect(new Set(used).size).toBe(used.length);
  });

  it("every UnlockCard id is unique", () => {
    const ids = DRUMS_UNLOCK_LIBRARY.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("nodes with an unlockCardId also carry a chainDrillId so endSession can satisfy them", () => {
    for (const n of DRUMS_NODES) {
      if (n.unlockCardId) {
        expect(n.chainDrillId, `node ${n.id} has unlockCardId but no chainDrillId`).toBeTruthy();
      }
    }
  });
});

describe("drums drill ghost tokens + steps are well-formed", () => {
  it("every drill ghostKey is a token used in the ghost rotation", () => {
    const rotationTokens = new Set(Object.values(drumsModule.ghostRotation).flat());
    for (const d of DRUMS_CHAIN_DRILLS) {
      expect(rotationTokens.has(d.ghostKey), `${d.id} ghostKey ${d.ghostKey} not in rotation`).toBe(true);
    }
  });

  it("every drill has at least one step, a closing note, and a sticking pattern", () => {
    for (const d of DRUMS_CHAIN_DRILLS) {
      expect(d.steps.length).toBeGreaterThan(0);
      expect(d.closingNote.length).toBeGreaterThan(0);
      expect((d.pattern ?? []).length).toBeGreaterThan(0);
    }
  });
});
