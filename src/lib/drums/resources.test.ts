import { describe, it, expect } from "vitest";
import { DRUMS_LESSONS } from "./lessons";
import { DRUMS_NODES } from "./skillNodes";

// Curriculum audit v1.1 — the "Go deeper" external-resource layer. The owner asked
// for links to high-quality outside resources; every URL here was verified live
// 2026-07-22. These tests lock the data contract as a CLASS: the exact nodes that
// carry resources, and the shape/quality of every resource (real node, https URL,
// non-empty label + note) — so a future edit can't quietly orphan a link or ship
// an empty/insecure one.
const NODES_WITH_RESOURCES = [
  "d-t0-strokes",
  "d-t1-singles",
  "d-t1-doubles",
  "d-t2-paradiddle",
  "d-t3-moeller",
  "d-t2-play-along",
] as const;

describe("drums lesson resources ('Go deeper' links)", () => {
  it("exactly the intended nodes carry resources — no more, no fewer", () => {
    const withResources = Object.entries(DRUMS_LESSONS)
      .filter(([, l]) => (l.resources?.length ?? 0) > 0)
      .map(([id]) => id)
      .sort();
    expect(withResources).toEqual([...NODES_WITH_RESOURCES].sort());
  });

  it("every resource-bearing lesson maps to a real drums node", () => {
    const nodeIds = new Set(DRUMS_NODES.map((n) => n.id));
    for (const id of NODES_WITH_RESOURCES) {
      expect(nodeIds.has(id), `resource node ${id} exists`).toBe(true);
      expect(DRUMS_LESSONS[id]?.resources?.length, `${id} has ≥1 resource`).toBeGreaterThan(0);
    }
  });

  it("every resource is well-formed: non-empty name + note, a valid https URL", () => {
    for (const [id, lesson] of Object.entries(DRUMS_LESSONS)) {
      for (const r of lesson.resources ?? []) {
        expect(r.name.trim().length, `${id} resource name`).toBeGreaterThan(0);
        expect(r.note.trim().length, `${id} resource note`).toBeGreaterThan(0);
        expect(r.url.startsWith("https://"), `${id} resource url "${r.url}" is https`).toBe(true);
        // A parseable URL (throws on a malformed one).
        expect(() => new URL(r.url), `${id} resource url "${r.url}" parses`).not.toThrow();
      }
    }
  });
});
