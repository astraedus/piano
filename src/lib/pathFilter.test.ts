import { describe, it, expect } from "vitest";
import {
  nodeIsVisible,
  nodePathTreatment,
  visibleNodes,
  ghostKeyToTermId,
  nodeToTermId,
} from "./pathFilter";
import type { SkillNode } from "./types";

// Minimal node factory — only the fields pathFilter reads matter here.
function mk(partial: Partial<SkillNode> & { id: string }): SkillNode {
  return {
    instrument: "guitar",
    title: partial.id,
    tier: 1,
    category: "technique",
    prereqs: [],
    masteryDrill: "drill",
    unlock: "unlock",
    ...partial,
  };
}

const untagged = mk({ id: "untagged" }); // no pathTags, not theory
const justPlayOnly = mk({ id: "jp", pathTags: ["just-play"] });
const leadNode = mk({ id: "lead", pathTags: ["play-with-soul", "go-deep"] });
const theoryNode = mk({ id: "theory", pathTags: ["go-deep"], theory: true });

describe("nodeIsVisible", () => {
  it("shows everything when no path is chosen (back-compat for existing users)", () => {
    expect(nodeIsVisible(untagged, undefined, false)).toBe(true);
    expect(nodeIsVisible(justPlayOnly, undefined, false)).toBe(true);
    expect(nodeIsVisible(leadNode, undefined, false)).toBe(true);
  });

  it("hides theory nodes until theory is enabled, even with no path", () => {
    expect(nodeIsVisible(theoryNode, undefined, false)).toBe(false);
    expect(nodeIsVisible(theoryNode, undefined, true)).toBe(true);
  });

  it("untagged nodes show on every path", () => {
    expect(nodeIsVisible(untagged, "just-play", false)).toBe(true);
    expect(nodeIsVisible(untagged, "play-with-soul", false)).toBe(true);
    expect(nodeIsVisible(untagged, "go-deep", true)).toBe(true);
  });

  it("tagged nodes show only on their tagged paths", () => {
    expect(nodeIsVisible(justPlayOnly, "just-play", false)).toBe(true);
    expect(nodeIsVisible(justPlayOnly, "play-with-soul", false)).toBe(false);
    expect(nodeIsVisible(leadNode, "just-play", false)).toBe(false);
    expect(nodeIsVisible(leadNode, "play-with-soul", false)).toBe(true);
    expect(nodeIsVisible(leadNode, "go-deep", true)).toBe(true);
  });

  it("a theory node tagged go-deep still hides when theory is off", () => {
    // theory gate wins over path membership
    expect(nodeIsVisible(theoryNode, "go-deep", false)).toBe(false);
    expect(nodeIsVisible(theoryNode, "go-deep", true)).toBe(true);
  });
});

describe("nodePathTreatment", () => {
  it("returns theory-hidden for a theory node with theory off", () => {
    expect(nodePathTreatment(theoryNode, "go-deep", false)).toBe("theory-hidden");
    expect(nodePathTreatment(theoryNode, undefined, false)).toBe("theory-hidden");
  });

  it("returns on-path for everything when no path is chosen", () => {
    expect(nodePathTreatment(untagged, undefined, false)).toBe("on-path");
    expect(nodePathTreatment(justPlayOnly, undefined, false)).toBe("on-path");
    expect(nodePathTreatment(leadNode, undefined, false)).toBe("on-path");
  });

  it("dims (off-path) tagged nodes outside the chosen path", () => {
    expect(nodePathTreatment(justPlayOnly, "just-play", false)).toBe("on-path");
    expect(nodePathTreatment(justPlayOnly, "play-with-soul", false)).toBe("off-path");
    expect(nodePathTreatment(leadNode, "just-play", false)).toBe("off-path");
    expect(nodePathTreatment(untagged, "just-play", false)).toBe("on-path");
  });

  it("shows a theory node on-path once theory is enabled", () => {
    expect(nodePathTreatment(theoryNode, "go-deep", true)).toBe("on-path");
  });
});

describe("visibleNodes", () => {
  const all = [untagged, justPlayOnly, leadNode, theoryNode];

  it("drops theory-hidden nodes and tags the rest", () => {
    const out = visibleNodes(all, "just-play", false);
    const ids = out.map((o) => o.node.id);
    expect(ids).toContain("untagged");
    expect(ids).toContain("jp");
    expect(ids).not.toContain("theory"); // theory-hidden dropped
    // lead is off-path but still present (dimmed), not dropped
    expect(ids).toContain("lead");
    expect(out.find((o) => o.node.id === "jp")?.treatment).toBe("on-path");
    expect(out.find((o) => o.node.id === "lead")?.treatment).toBe("off-path");
  });

  it("with no path and theory off, returns all non-theory nodes as on-path", () => {
    const out = visibleNodes(all, undefined, false);
    expect(out.map((o) => o.node.id).sort()).toEqual(["jp", "lead", "untagged"]);
    expect(out.every((o) => o.treatment === "on-path")).toBe(true);
  });

  it("with theory on, includes theory nodes", () => {
    const out = visibleNodes(all, "go-deep", true);
    expect(out.map((o) => o.node.id)).toContain("theory");
  });
});

describe("ghostKeyToTermId", () => {
  it("maps known keys to dedicated glossary ids", () => {
    expect(ghostKeyToTermId("C")).toBe("c-major");
    expect(ghostKeyToTermId("G")).toBe("g-major");
    expect(ghostKeyToTermId("am")).toBe("a-minor");
  });

  it("falls back to the generic scale concept for keys without a dedicated entry", () => {
    expect(ghostKeyToTermId("D")).toBe("major-scale"); // uppercase = major
    expect(ghostKeyToTermId("em")).toBe("minor-scale"); // lowercase = minor
  });
});

describe("nodeToTermId", () => {
  it("maps direct-concept nodes to glossary ids", () => {
    expect(nodeToTermId("g-t1-power")).toBe("power-chord");
    expect(nodeToTermId("g-t2-bend")).toBe("string-bending");
    expect(nodeToTermId("p-key-C")).toBe("c-major");
  });

  it("returns undefined for nodes with no direct concept map", () => {
    expect(nodeToTermId("g-t0-posture")).toBeUndefined();
    expect(nodeToTermId("p-key-D")).toBeUndefined();
    expect(nodeToTermId("does-not-exist")).toBeUndefined();
  });
});
