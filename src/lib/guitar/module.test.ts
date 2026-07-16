import { describe, it, expect } from "vitest";
import { guitarModule } from "./module";
import { GUITAR_NODES } from "./skillNodes";
import { GUITAR_CHAIN_DRILLS } from "./chainDrills";
import { GUITAR_WARMUPS } from "./warmups";
import { GUITAR_UNLOCK_LIBRARY } from "./unlocks";
import { GUITAR_SONGS } from "./songs";
import { getModuleSync, isModuleRegistered } from "../instrumentRegistry";
import { isAcyclic, resolveStatus, nextToLearn } from "../skillTree";

describe("guitar module", () => {
  it("self-registers into the sync cache on import", () => {
    expect(isModuleRegistered("guitar")).toBe(true);
    expect(getModuleSync("guitar")).toBe(guitarModule);
  });

  it("exposes the correct identity + wired content", () => {
    expect(guitarModule.id).toBe("guitar");
    expect(guitarModule.displayName).toBe("Electric Guitar");
    expect(guitarModule.accentVar).toBe("guitar");
    expect(guitarModule.chainDrills).toBe(GUITAR_CHAIN_DRILLS);
    expect(guitarModule.warmups).toBe(GUITAR_WARMUPS);
    expect(guitarModule.unlockLibrary).toBe(GUITAR_UNLOCK_LIBRARY);
    expect(guitarModule.skillNodes).toBe(GUITAR_NODES);
    expect(guitarModule.InstrumentVisual).toBeTypeOf("function");
    expect(guitarModule.NotationVisual).toBeTypeOf("function");
  });

  it("ghostRotation covers every phase with non-empty key sets", () => {
    for (const phase of [1, 2, 3, 4, 5] as const) {
      expect(guitarModule.ghostRotation[phase].length).toBeGreaterThan(0);
    }
  });

  it("warmupRotation ids all resolve to real warmups", () => {
    const ids = [
      ...guitarModule.warmupRotation.phase1,
      ...guitarModule.warmupRotation.phase2Plus,
    ];
    for (const id of ids) {
      expect(guitarModule.warmups[id]).toBeDefined();
    }
  });
});

describe("every guitar chain drill + warmup + song is instrument-tagged", () => {
  it("chain drills", () => {
    expect(GUITAR_CHAIN_DRILLS.length).toBeGreaterThan(0);
    for (const d of GUITAR_CHAIN_DRILLS) expect(d.instrument).toBe("guitar");
  });
  it("warmups", () => {
    for (const w of Object.values(GUITAR_WARMUPS)) expect(w.instrument).toBe("guitar");
  });
  it("songs", () => {
    expect(GUITAR_SONGS.length).toBe(8);
    for (const s of GUITAR_SONGS) expect(s.instrument).toBe("guitar");
  });
});

describe("GUITAR_NODES form a coherent DAG", () => {
  it("has the full plan §2.4 node set plus the curriculum transition + capo + batch-3a nodes (33)", () => {
    // plan §2.4's verbatim list = 27 (g-t0-anatomy … g-t3-syncopation); curriculum
    // batch #1 adds the G→C transition-fluency node (g-trans-G-C) that gates the
    // 12-Bar Blues song unlock (→28); batch #2 #8 adds the capo key-multiplier node
    // (g-t1-capo) after open chords (→29); batch 3a adds g-t1-amp, g-t2-fretboard-notes,
    // g-t2-noise-control, and g-t2-mini-barre (→33).
    expect(GUITAR_NODES.length).toBe(33);
  });

  it("is acyclic", () => {
    expect(isAcyclic(GUITAR_NODES)).toBe(true);
  });

  it("every prereq id resolves to a real node (no dangling prereqs)", () => {
    const ids = new Set(GUITAR_NODES.map((n) => n.id));
    for (const node of GUITAR_NODES) {
      for (const pid of node.prereqs) {
        expect(ids.has(pid)).toBe(true);
      }
    }
  });

  it("all node ids are unique", () => {
    const ids = GUITAR_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every node is tagged instrument:guitar", () => {
    for (const n of GUITAR_NODES) expect(n.instrument).toBe("guitar");
  });

  it("every node is reachable from a tier-0 root (no orphaned subgraphs)", () => {
    // A node is reachable iff, walking its prereqs transitively, you bottom out at
    // nodes with no prereqs. Since the graph is acyclic + has no dangling prereqs,
    // every node either is a root or depends (transitively) on one.
    const byId = new Map(GUITAR_NODES.map((n) => [n.id, n]));
    const roots = new Set(GUITAR_NODES.filter((n) => n.prereqs.length === 0).map((n) => n.id));
    expect(roots.size).toBeGreaterThan(0);
    const reachesRoot = (id: string, seen = new Set<string>()): boolean => {
      if (roots.has(id)) return true;
      const node = byId.get(id);
      if (!node || seen.has(id)) return false;
      seen.add(id);
      return node.prereqs.some((p) => reachesRoot(p, seen));
    };
    for (const n of GUITAR_NODES) {
      expect(reachesRoot(n.id)).toBe(true);
    }
  });

  it("tier-0 roots are available from empty progress; deeper tiers locked", () => {
    const status = resolveStatus(GUITAR_NODES, {});
    const root = GUITAR_NODES.find((n) => n.prereqs.length === 0);
    expect(root).toBeDefined();
    expect(status.get(root!.id)).toBe("available");
    const withPrereq = GUITAR_NODES.find((n) => n.prereqs.length > 0)!;
    expect(status.get(withPrereq.id)).toBe("locked");
  });

  it("nextToLearn surfaces only available frontier nodes", () => {
    const frontier = nextToLearn(GUITAR_NODES, {}, 5);
    expect(frontier.length).toBeGreaterThan(0);
    for (const n of frontier) expect(n.prereqs.length).toBe(0);
  });

  it("chainDrillId links point at real guitar drills", () => {
    const drillIds = new Set(GUITAR_CHAIN_DRILLS.map((d) => d.id));
    for (const n of GUITAR_NODES) {
      if (n.chainDrillId) expect(drillIds.has(n.chainDrillId)).toBe(true);
    }
  });
});

describe("unlockCardId integrity (replicates piano's pattern)", () => {
  it("every unlockCardId resolves to a real UnlockCard", () => {
    const cardIds = new Set(GUITAR_UNLOCK_LIBRARY.map((c) => c.id));
    for (const n of GUITAR_NODES) {
      if (n.unlockCardId) expect(cardIds.has(n.unlockCardId)).toBe(true);
    }
  });

  it("no two nodes share the same unlockCardId", () => {
    const used = GUITAR_NODES.map((n) => n.unlockCardId).filter((x): x is string => !!x);
    expect(new Set(used).size).toBe(used.length);
  });

  it("every UnlockCard id is unique", () => {
    const ids = GUITAR_UNLOCK_LIBRARY.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("nodes with an unlockCardId also carry a chainDrillId so endSession can satisfy them", () => {
    // endSession satisfies a node via its linked chainDrillId (or keyId depth>=2).
    // Guitar nodes have no keyId, so any node meant to fire an unlock must have a
    // drill that can mark it learned — otherwise the celebration could never fire.
    for (const n of GUITAR_NODES) {
      if (n.unlockCardId) {
        expect(n.chainDrillId, `node ${n.id} has unlockCardId but no chainDrillId`).toBeTruthy();
      }
    }
  });
});

describe("guitar drill ghost keys + steps are well-formed", () => {
  it("every drill ghostKey is one used in the ghost rotation", () => {
    const rotationKeys = new Set(Object.values(guitarModule.ghostRotation).flat());
    for (const d of GUITAR_CHAIN_DRILLS) {
      expect(rotationKeys.has(d.ghostKey), `${d.id} ghostKey ${d.ghostKey} not in rotation`).toBe(true);
    }
  });

  it("every drill has at least one step and a closing note", () => {
    for (const d of GUITAR_CHAIN_DRILLS) {
      expect(d.steps.length).toBeGreaterThan(0);
      expect(d.closingNote.length).toBeGreaterThan(0);
    }
  });

  it("guitar song requiredNodes all resolve to real nodes", () => {
    const ids = new Set(GUITAR_NODES.map((n) => n.id));
    for (const s of GUITAR_SONGS) {
      for (const nodeId of s.requiredNodes) {
        expect(ids.has(nodeId), `song ${s.id} requires unknown node ${nodeId}`).toBe(true);
      }
    }
  });
});
