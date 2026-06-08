import { describe, it, expect } from "vitest";
import type { SkillNode, SkillProgress } from "./types";
import {
  buildGraphModel,
  buildLaidOutGraph,
  layout,
  nodesForInstrument,
  tierColorVar,
} from "./skillGraphLayout";

// A tiny instrument-agnostic fixture DAG:
//   root (t0, no prereq) → mid (t1, needs root) → leaf (t2, needs mid)
//   sharedRoot (shared, t0, no prereq) — appears in both instrument graphs
const fixture: SkillNode[] = [
  { id: "root", instrument: "piano", title: "Root", tier: 0, category: "setup", prereqs: [], masteryDrill: "do root", unlock: "rooted" },
  { id: "mid", instrument: "piano", title: "Mid", tier: 1, category: "technique", prereqs: ["root"], masteryDrill: "do mid", unlock: "mid" },
  { id: "leaf", instrument: "piano", title: "Leaf", tier: 2, category: "scales", prereqs: ["mid"], masteryDrill: "do leaf", unlock: "leaf" },
  { id: "shared", instrument: "shared", title: "Shared", tier: 0, category: "ear", prereqs: [], masteryDrill: "do shared", unlock: "shared" },
  { id: "g1", instrument: "guitar", title: "G One", tier: 0, category: "setup", prereqs: [], masteryDrill: "g", unlock: "g" },
];

const learned = (status: SkillProgress["status"]): SkillProgress => ({ status, reps: status === "available" ? 0 : 1 });

describe("nodesForInstrument", () => {
  it("includes the instrument's own nodes plus shared nodes, never the other instrument", () => {
    const piano = nodesForInstrument(fixture, "piano").map((n) => n.id).sort();
    expect(piano).toEqual(["leaf", "mid", "root", "shared"]);
    const guitar = nodesForInstrument(fixture, "guitar").map((n) => n.id).sort();
    expect(guitar).toEqual(["g1", "shared"]);
  });
});

describe("tierColorVar", () => {
  it("maps a tier to its CSS var", () => {
    expect(tierColorVar(0)).toBe("var(--color-tier-0)");
    expect(tierColorVar(6)).toBe("var(--color-tier-6)");
  });
});

describe("buildGraphModel — status derivation", () => {
  it("derives locked vs available vs in-progress vs learned from a fixture progress map", () => {
    // root learned → mid available; leaf still locked (mid not learned).
    const progress: Record<string, SkillProgress> = { root: learned("learned") };
    const { nodes } = buildGraphModel(fixture, progress, "piano");
    const byId = new Map(nodes.map((n) => [n.id, n.data]));

    expect(byId.get("root")!.status).toBe("learned");
    expect(byId.get("mid")!.status).toBe("available");
    expect(byId.get("leaf")!.status).toBe("locked");
    expect(byId.get("shared")!.status).toBe("available"); // no prereqs, not started
  });

  it("an available node not yet started is on the frontier (gets the pulse)", () => {
    const progress: Record<string, SkillProgress> = { root: learned("learned") };
    const { nodes } = buildGraphModel(fixture, progress, "piano");
    const byId = new Map(nodes.map((n) => [n.id, n.data]));
    expect(byId.get("mid")!.isFrontier).toBe(true);
    expect(byId.get("leaf")!.isFrontier).toBe(false); // locked → not frontier
  });

  it("locked node when a prereq is not learned, regardless of stray reps", () => {
    // leaf has reps but mid is not learned → leaf must remain locked.
    const progress: Record<string, SkillProgress> = { leaf: learned("in-progress") };
    const { nodes } = buildGraphModel(fixture, progress, "piano");
    const byId = new Map(nodes.map((n) => [n.id, n.data]));
    expect(byId.get("leaf")!.status).toBe("locked");
  });

  it("tier color is carried on each node's data", () => {
    const { nodes } = buildGraphModel(fixture, {}, "piano");
    const leaf = nodes.find((n) => n.id === "leaf")!;
    expect(leaf.data.tierColor).toBe("var(--color-tier-2)");
  });

  it("carries the fluent flag from progress onto node data (R10)", () => {
    const progress: Record<string, SkillProgress> = {
      root: { status: "learned", reps: 5, fluent: true, fluentAt: "2026-06-08" },
      mid: { status: "learned", reps: 2 },
    };
    const { nodes } = buildGraphModel(fixture, progress, "piano");
    const byId = new Map(nodes.map((n) => [n.id, n.data]));
    expect(byId.get("root")!.fluent).toBe(true);
    expect(byId.get("mid")!.fluent).toBe(false); // learned but not fluent
    expect(byId.get("leaf")!.fluent).toBe(false); // no progress entry
  });
});

describe("buildGraphModel — edges", () => {
  it("creates one edge per visible prereq, classified by traversability", () => {
    const progress: Record<string, SkillProgress> = { root: learned("learned"), mid: learned("learned") };
    const { edges } = buildGraphModel(fixture, progress, "piano");
    const byId = new Map(edges.map((e) => [e.id, e]));
    // root→mid: both learned → "learned"
    expect(byId.get("root->mid")!.kind).toBe("learned");
    // mid→leaf: source learned, target available → "traversable"
    expect(byId.get("mid->leaf")!.kind).toBe("traversable");
  });

  it("a prereq edge from a not-yet-learned source is locked (dashed)", () => {
    const { edges } = buildGraphModel(fixture, {}, "piano");
    const e = edges.find((x) => x.id === "root->mid")!;
    expect(e.kind).toBe("locked");
  });

  it("does not draw edges to nodes filtered out of the graph", () => {
    // guitar graph: only g1 + shared, neither has prereqs → no edges.
    const { edges } = buildGraphModel(fixture, {}, "guitar");
    expect(edges).toHaveLength(0);
  });
});

describe("layout (dagre)", () => {
  it("assigns positions and ranks deeper tiers below shallower ones", () => {
    const { nodes, edges } = buildGraphModel(fixture, {}, "piano");
    const laid = layout(nodes, edges);
    const byId = new Map(laid.map((n) => [n.id, n.position]));
    expect(byId.get("root")).toBeDefined();
    // top-down: root (t0) should sit above mid (t1) above leaf (t2).
    expect(byId.get("root")!.y).toBeLessThan(byId.get("mid")!.y);
    expect(byId.get("mid")!.y).toBeLessThan(byId.get("leaf")!.y);
  });
});

describe("buildLaidOutGraph (integration)", () => {
  it("returns laid-out nodes + edges in one call", () => {
    const { nodes, edges } = buildLaidOutGraph(fixture, {}, "piano");
    expect(nodes).toHaveLength(4); // root, mid, leaf, shared
    expect(nodes.every((n) => n.position && typeof n.position.x === "number")).toBe(true);
    expect(edges).toHaveLength(2); // root->mid, mid->leaf
  });
});

// ── V4 Soul-First — path/theory view filtering (pure layer) ─────────────────
// chug (all paths) → cry (lead-only) → staff (theory). The default `view` arg is
// SHOW_ALL, so every existing test above is unaffected.
const pathFixture: SkillNode[] = [
  { id: "chug", instrument: "guitar", title: "Power Chords", soulTitle: "The Rock Chug", keepTitle: "Power Chords", tier: 1, category: "chords", prereqs: [], masteryDrill: "d", unlock: "u", pathTags: ["just-play", "play-with-soul", "go-deep"] },
  { id: "cry", instrument: "guitar", title: "String Bending", soulTitle: "Make a Note Cry", keepTitle: "String Bending", tier: 2, category: "expression", prereqs: ["chug"], masteryDrill: "d", unlock: "u", pathTags: ["play-with-soul", "go-deep"] },
  { id: "staff", instrument: "guitar", title: "Reading the Staff", keepTitle: "Reading the Staff", tier: 3, category: "notation", prereqs: ["cry"], masteryDrill: "d", unlock: "u", pathTags: ["go-deep"], theory: true },
];

describe("buildGraphModel — path/theory view (V4)", () => {
  it("default (SHOW_ALL) keeps every node and marks them all on-path", () => {
    const { nodes } = buildGraphModel(pathFixture, {}, "guitar");
    const byId = new Map(nodes.map((n) => [n.id, n.data]));
    // SHOW_ALL has theoryEnabled true → staff is visible.
    expect(nodes.map((n) => n.id).sort()).toEqual(["chug", "cry", "staff"]);
    expect(byId.get("chug")!.pathTreatment).toBe("on-path");
    expect(byId.get("staff")!.pathTreatment).toBe("on-path");
  });

  it("theory OFF drops theory nodes AND their edges from the model", () => {
    const { nodes, edges } = buildGraphModel(pathFixture, {}, "guitar", 3, {
      path: undefined,
      theoryEnabled: false,
    });
    expect(nodes.map((n) => n.id).sort()).toEqual(["chug", "cry"]);
    // the cry→staff edge must be gone (no dangling edge to a dropped node).
    expect(edges.find((e) => e.id === "cry->staff")).toBeUndefined();
    expect(edges.find((e) => e.id === "chug->cry")).toBeDefined();
  });

  it("Just Play dims the lead node (off-path) and still hides theory", () => {
    const { nodes } = buildGraphModel(pathFixture, {}, "guitar", 3, {
      path: "just-play",
      theoryEnabled: false,
    });
    const byId = new Map(nodes.map((n) => [n.id, n.data]));
    expect(byId.get("chug")!.pathTreatment).toBe("on-path");
    expect(byId.get("cry")!.pathTreatment).toBe("off-path");
    expect(byId.has("staff")).toBe(false);
  });

  it("Go Deep with theory on shows every node on-path", () => {
    const { nodes } = buildGraphModel(pathFixture, {}, "guitar", 3, {
      path: "go-deep",
      theoryEnabled: true,
    });
    const byId = new Map(nodes.map((n) => [n.id, n.data]));
    expect(byId.get("chug")!.pathTreatment).toBe("on-path");
    expect(byId.get("cry")!.pathTreatment).toBe("on-path");
    expect(byId.get("staff")!.pathTreatment).toBe("on-path");
  });

  it("off-path frontier still resolves status from the visible set", () => {
    // With chug learned, cry becomes available/frontier; under Just Play it is
    // off-path but still derives a real status (dimmed, not broken).
    const progress: Record<string, SkillProgress> = { chug: learned("learned") };
    const { nodes } = buildGraphModel(pathFixture, progress, "guitar", 3, {
      path: "just-play",
      theoryEnabled: false,
    });
    const cry = nodes.find((n) => n.id === "cry")!;
    expect(cry.data.status).toBe("available");
    expect(cry.data.pathTreatment).toBe("off-path");
  });
});
