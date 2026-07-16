// PathView tests — scoped to the 4 behaviors specified in the task:
// 1. Tiers render in order with the right section names.
// 2. The "you are here" marker lands on the nextToLearn node.
// 3. A step with a lesson expands to show what / steps / goodWhen.
// 4. A step without a lesson falls back to masteryDrill.

import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { PathView, topoSortTier } from "./PathView";
import type { SkillNode, SkillProgress, AppState } from "@/lib/types";
import { registerInstrumentModule } from "@/lib/instrumentRegistry";
import type { InstrumentModule } from "@/lib/instrumentRegistry";

afterEach(cleanup);

// ── Minimal app state mock ─────────────────────────────────────────────────

// We mock useAppState so tests don't need localStorage / Provider.
vi.mock("@/hooks/useAppState", () => ({
  useAppState: vi.fn(),
}));

import { useAppState } from "@/hooks/useAppState";

// ── Minimal node set: two tiers, covers all status paths ──────────────────

const t0Node: SkillNode = {
  id: "g-t0-anatomy",
  instrument: "guitar",
  title: "Guitar Anatomy & Tuning",
  tier: 0,
  category: "setup",
  prereqs: [],
  masteryDrill: "Name all 6 open strings, tune from scratch <90s",
  unlock: "Tune & orient independently",
  soulTitle: "Your Guitar's Names",
  keepTitle: "Guitar Anatomy & Tuning",
};

const t1NodeA: SkillNode = {
  id: "g-t1-power",
  instrument: "guitar",
  title: "Power Chords",
  tier: 1,
  category: "chords",
  prereqs: ["g-t0-anatomy"],
  masteryDrill: "E5→A5→D5→G5 2 beats each 80bpm, moveable",
  unlock: "Rock rhythm — entire rock/punk/metal vocabulary",
  soulTitle: "The Rock Chug",
  keepTitle: "Power Chords",
};

// A node with NO authored lesson (to test the graceful fallback). Every REAL node
// now has a lesson (lessons.test.ts asserts full coverage), so the fallback branch
// can only be exercised with a synthetic id that intentionally maps to no lesson.
const t1NodeB: SkillNode = {
  id: "g-t1-synthetic-nolesson",
  instrument: "guitar",
  title: "Synthetic No-Lesson Node",
  tier: 1,
  category: "technique",
  prereqs: ["g-t0-anatomy"],
  masteryDrill: "Synthetic drill text for the fallback test",
  unlock: "Synthetic unlock for the fallback test",
  soulTitle: "Fallback Probe",
  keepTitle: "Synthetic No-Lesson Node",
};

// Piano node with an authored lesson
const pianoNode: SkillNode = {
  id: "p-key-C",
  instrument: "piano",
  title: "C major is yours",
  tier: 1,
  category: "scales",
  prereqs: [],
  masteryDrill: "C scale hands-separate, C triad, I–IV–V–I in C.",
  unlock: "C major is yours.",
  soulTitle: "The Home Shape",
  keepTitle: "C major",
};

// The real progression-container node id (isProgressionContainerNode → true).
// No prereqs so it's immediately available + expandable in the test.
const popFormulaNode: SkillNode = {
  id: "p-t2-pop-formula",
  instrument: "piano",
  title: "The Pop Formula",
  tier: 2,
  category: "chords",
  prereqs: [],
  masteryDrill: "Am–F–C–G as block chords, then a melody over the loop.",
  unlock: "You can play half of pop music.",
  soulTitle: "Half of All Pop",
  keepTitle: "The Pop Formula",
};

// ── Mock instrument module ─────────────────────────────────────────────────

const GUITAR_NODES = [t0Node, t1NodeA, t1NodeB];

// Build a minimal InstrumentModule stub for guitar
const guitarModule: InstrumentModule = {
  id: "guitar",
  displayName: "Electric Guitar",
  accentVar: "guitar",
  chainDrills: [],
  warmups: {},
  warmupRotation: { phase1: [], phase2Plus: [] },
  unlockLibrary: [],
  skillNodes: GUITAR_NODES,
  ghostRotation: { 1: [], 2: [], 3: [], 4: [], 5: [] },
  focusKind: "chord",
  focusLabel: (id) => id,
  progressMapKind: "fretboard",
  InstrumentVisual: () => null,
  NotationVisual: () => null,
};

// We also need a piano module stub for the piano lesson test
const pianoModule: InstrumentModule = {
  ...guitarModule,
  id: "piano",
  displayName: "Piano",
  accentVar: "piano",
  skillNodes: [pianoNode, popFormulaNode],
  focusKind: "key",
  progressMapKind: "keymap",
};

// Register both modules before tests run
beforeAll(() => {
  registerInstrumentModule(guitarModule);
  registerInstrumentModule(pianoModule);
});

// ── Helper: build AppState-like context ──────────────────────────────────

function mockState(
  instrument: "guitar" | "piano",
  skillProgress: Record<string, SkillProgress> = {},
  overrides: { patch?: ReturnType<typeof vi.fn>; markFluent?: ReturnType<typeof vi.fn> } = {},
): void {
  (useAppState as ReturnType<typeof vi.fn>).mockReturnValue({
    state: {
      instrument,
      skillProgress,
      sessions: [],
      pieces: [],
    } as Partial<AppState>,
    ready: true,
    setState: vi.fn(),
    patch: overrides.patch ?? vi.fn(),
    dismissUnlock: vi.fn(),
    dismissLevelUp: vi.fn(),
    bumpRep: vi.fn(),
    reviewSkill: vi.fn(),
    markFluent: overrides.markFluent ?? vi.fn(),
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("PathView — tier ordering and section names", () => {
  it("renders tier 0 before tier 1 with correct section names", () => {
    mockState("guitar");
    render(<PathView />);

    const tier0 = screen.getByTestId("path-tier-0");
    const tier1 = screen.getByTestId("path-tier-1");

    expect(tier0).toBeTruthy();
    expect(tier1).toBeTruthy();

    // Tier 0 must appear before tier 1 in the DOM
    expect(
      tier0.compareDocumentPosition(tier1) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Section name text
    expect(within(tier0).getByTestId("path-tier-name-0").textContent).toBe(
      "Start Here — Setup & Orientation",
    );
    expect(within(tier1).getByTestId("path-tier-name-1").textContent).toBe("Foundations");
  });

  it("shows all three nodes in the correct tiers", () => {
    mockState("guitar");
    render(<PathView />);

    // t0 node in tier-0
    expect(
      within(screen.getByTestId("path-tier-0")).getByTestId(`path-step-${t0Node.id}`),
    ).toBeTruthy();

    // t1 nodes in tier-1
    const tier1 = screen.getByTestId("path-tier-1");
    expect(within(tier1).getByTestId(`path-step-${t1NodeA.id}`)).toBeTruthy();
    expect(within(tier1).getByTestId(`path-step-${t1NodeB.id}`)).toBeTruthy();
  });
});

describe("PathView — you are here marker", () => {
  it("places 'you are here' badge on the first available (frontier) node", () => {
    // t0Node has no prereqs → it is immediately available.
    // With empty progress, t0Node should be the frontier.
    mockState("guitar", {});
    render(<PathView />);

    const badge = screen.getByTestId("you-are-here-badge");
    // The badge lives inside the step for t0Node
    const step = screen.getByTestId(`path-step-${t0Node.id}`);
    expect(step.contains(badge)).toBe(true);
  });

  it("moves 'you are here' to t1 nodes when t0 is learned", () => {
    const progress: Record<string, SkillProgress> = {
      [t0Node.id]: { status: "learned", reps: 5 },
    };
    mockState("guitar", progress);
    render(<PathView />);

    // The frontier now sits in tier 1 (either t1NodeA or t1NodeB — both are
    // now available). nextToLearn returns the first by tier+title sort.
    const badges = screen.getAllByTestId("you-are-here-badge");
    expect(badges.length).toBe(1);

    // The badge must NOT be on t0Node
    const t0Step = screen.getByTestId(`path-step-${t0Node.id}`);
    expect(t0Step.contains(badges[0])).toBe(false);

    // The badge must be on one of the tier-1 nodes
    const t1aStep = screen.getByTestId(`path-step-${t1NodeA.id}`);
    const t1bStep = screen.getByTestId(`path-step-${t1NodeB.id}`);
    const onT1 = t1aStep.contains(badges[0]) || t1bStep.contains(badges[0]);
    expect(onT1).toBe(true);
  });
});

describe("PathView — expand a step with a full lesson", () => {
  it("clicking a node with a lesson expands to show what, steps, and goodWhen", () => {
    // t0Node (g-t0-anatomy) has a gold-standard lesson authored in guitar/lessons.ts
    mockState("guitar", {});
    render(<PathView />);

    // Initially collapsed
    expect(screen.queryByTestId(`path-lesson-${t0Node.id}`)).toBeNull();

    // Click the toggle
    fireEvent.click(screen.getByTestId(`path-step-toggle-${t0Node.id}`));

    const lessonPanel = screen.getByTestId(`path-lesson-${t0Node.id}`);
    expect(lessonPanel).toBeTruthy();

    // "what" section
    const what = within(lessonPanel).getByTestId("lesson-what");
    expect(what.textContent?.length).toBeGreaterThan(10);

    // Steps numbered list
    const steps = within(lessonPanel).getByTestId("lesson-steps");
    expect(steps.querySelectorAll("li").length).toBeGreaterThan(0);

    // goodWhen
    const goodWhen = within(lessonPanel).getByTestId("lesson-good-when");
    expect(goodWhen.textContent?.length).toBeGreaterThan(5);
  });

  it("clicking again collapses the lesson", () => {
    mockState("guitar", {});
    render(<PathView />);

    const toggle = screen.getByTestId(`path-step-toggle-${t0Node.id}`);
    fireEvent.click(toggle);
    expect(screen.getByTestId(`path-lesson-${t0Node.id}`)).toBeTruthy();

    fireEvent.click(toggle);
    expect(screen.queryByTestId(`path-lesson-${t0Node.id}`)).toBeNull();
  });

  it("shows the piano lesson (p-key-C) for the piano instrument", () => {
    mockState("piano", {});
    render(<PathView />);

    // Tier 1 has p-key-C; it's available (no prereqs)
    fireEvent.click(screen.getByTestId(`path-step-toggle-${pianoNode.id}`));

    const lessonPanel = screen.getByTestId(`path-lesson-${pianoNode.id}`);
    // what text should include "C major"
    expect(within(lessonPanel).getByTestId("lesson-what").textContent).toContain("C major");
  });
});

describe("PathView — Songs You Can Now Play panel (the real surface)", () => {
  it("renders the songs catalog inside the expanded pop-formula accordion", () => {
    mockState("piano", {});
    render(<PathView />);

    // Collapsed: no songs panel yet.
    expect(screen.queryByTestId("songs-you-can-play")).toBeNull();

    // Expand the pop-formula node — the accordion surface users actually open.
    fireEvent.click(screen.getByTestId(`path-step-toggle-${popFormulaNode.id}`));

    const lessonPanel = screen.getByTestId(`path-lesson-${popFormulaNode.id}`);
    const songs = within(lessonPanel).getByTestId("songs-you-can-play");
    expect(songs).toBeTruthy();

    // The canonical heading + a real song title + all three group headings.
    expect(within(songs).getByText("Songs You Can Now Play")).toBeTruthy();
    expect(within(songs).getByText("Let It Be")).toBeTruthy();
    expect(within(songs).getByText(/I–V–vi–IV/)).toBeTruthy();
    expect(within(songs).getByText(/I–IV–V/)).toBeTruthy();
    expect(within(songs).getByText(/I–vi–IV–V/)).toBeTruthy();
  });

  it("does NOT render the songs panel for a non-container node (p-key-C)", () => {
    mockState("piano", {});
    render(<PathView />);

    fireEvent.click(screen.getByTestId(`path-step-toggle-${pianoNode.id}`));
    const lessonPanel = screen.getByTestId(`path-lesson-${pianoNode.id}`);
    expect(within(lessonPanel).queryByTestId("songs-you-can-play")).toBeNull();
  });
});

describe("PathView — fallback when no lesson authored", () => {
  it("shows masteryDrill and unlock when node has no authored lesson", () => {
    // t1NodeA (g-t1-power) has a lesson. t1NodeB is a synthetic id that maps to no
    // lesson, so getLesson returns undefined and the fallback path renders.
    // Make t0 learned so t1NodeB is available.
    const progress: Record<string, SkillProgress> = {
      [t0Node.id]: { status: "learned", reps: 5 },
    };
    mockState("guitar", progress);
    render(<PathView />);

    // Click g-t1-fretting (no authored lesson)
    fireEvent.click(screen.getByTestId(`path-step-toggle-${t1NodeB.id}`));

    const panel = screen.getByTestId(`path-lesson-${t1NodeB.id}`);
    const drill = within(panel).getByTestId("fallback-mastery-drill");
    const unlock = within(panel).getByTestId("fallback-unlock");

    expect(drill.textContent).toContain(t1NodeB.masteryDrill);
    expect(unlock.textContent).toContain(t1NodeB.unlock);

    // No full lesson elements
    expect(within(panel).queryByTestId("lesson-what")).toBeNull();
    expect(within(panel).queryByTestId("lesson-steps")).toBeNull();
  });
});

describe("PathView — progression controls", () => {
  it("an available node's expanded panel shows Add to Today and Mark Learned", () => {
    mockState("guitar", {});
    render(<PathView />);

    // t0Node is available (no prereqs). Expand it.
    fireEvent.click(screen.getByTestId(`path-step-toggle-${t0Node.id}`));

    expect(screen.getByTestId(`path-add-today-${t0Node.id}`)).toBeTruthy();
    expect(screen.getByTestId(`path-mark-learned-${t0Node.id}`)).toBeTruthy();
    // Not yet learned → no Mark Fluent control.
    expect(screen.queryByTestId(`path-mark-fluent-${t0Node.id}`)).toBeNull();
  });

  it("Mark Learned writes learned progress through patch()", () => {
    const patch = vi.fn();
    mockState("guitar", {}, { patch });
    render(<PathView />);

    fireEvent.click(screen.getByTestId(`path-step-toggle-${t0Node.id}`));
    fireEvent.click(screen.getByTestId(`path-mark-learned-${t0Node.id}`));

    expect(patch).toHaveBeenCalledTimes(1);
    const arg = patch.mock.calls[0][0] as { skillProgress: Record<string, SkillProgress> };
    expect(arg.skillProgress[t0Node.id].status).toBe("learned");
  });

  it("Add to Today bumps a rep through patch()", () => {
    const patch = vi.fn();
    mockState("guitar", {}, { patch });
    render(<PathView />);

    fireEvent.click(screen.getByTestId(`path-step-toggle-${t0Node.id}`));
    fireEvent.click(screen.getByTestId(`path-add-today-${t0Node.id}`));

    expect(patch).toHaveBeenCalledTimes(1);
    const arg = patch.mock.calls[0][0] as { skillProgress: Record<string, SkillProgress> };
    expect(arg.skillProgress[t0Node.id].reps).toBe(1);
    expect(arg.skillProgress[t0Node.id].status).toBe("in-progress");
  });

  it("a learned node shows ✓ Learned + a Mark Fluent button that calls markFluent", () => {
    const markFluent = vi.fn();
    const progress: Record<string, SkillProgress> = {
      [t0Node.id]: { status: "learned", reps: 5 },
    };
    mockState("guitar", progress, { markFluent });
    render(<PathView />);

    fireEvent.click(screen.getByTestId(`path-step-toggle-${t0Node.id}`));

    // No add/learn buttons once learned.
    expect(screen.queryByTestId(`path-add-today-${t0Node.id}`)).toBeNull();
    expect(screen.queryByTestId(`path-mark-learned-${t0Node.id}`)).toBeNull();

    const fluentBtn = screen.getByTestId(`path-mark-fluent-${t0Node.id}`);
    fireEvent.click(fluentBtn);
    expect(markFluent).toHaveBeenCalledWith(t0Node.id);
  });

  it("a fluent node shows the Fluent badge, not the Mark Fluent button", () => {
    const progress: Record<string, SkillProgress> = {
      [t0Node.id]: { status: "learned", reps: 5, fluent: true },
    };
    mockState("guitar", progress);
    render(<PathView />);

    fireEvent.click(screen.getByTestId(`path-step-toggle-${t0Node.id}`));
    expect(screen.getByTestId(`path-fluent-${t0Node.id}`)).toBeTruthy();
    expect(screen.queryByTestId(`path-mark-fluent-${t0Node.id}`)).toBeNull();
  });
});

describe("PathView — reward moment", () => {
  it("Mark Learned surfaces the UnlockCardModal", () => {
    mockState("guitar", {});
    render(<PathView />);

    // No modal initially.
    expect(screen.queryByText("New Skill Unlocked")).toBeNull();

    fireEvent.click(screen.getByTestId(`path-step-toggle-${t0Node.id}`));
    fireEvent.click(screen.getByTestId(`path-mark-learned-${t0Node.id}`));

    // The modal's signature heading appears. Scope content assertions to the
    // modal subtree (the soulTitle also appears as the card headline behind it).
    const modalHeading = screen.getByText("New Skill Unlocked");
    const modal = modalHeading.closest("div")!;
    // Fallback card (no unlockCardId on the test node): title is the soulTitle and
    // the tryLine is the node's unlock copy.
    expect(within(modal).getByText(t0Node.soulTitle!)).toBeTruthy();
    expect(within(modal).getByText(t0Node.unlock)).toBeTruthy();
  });

  it("dismissing the reward modal removes it", () => {
    mockState("guitar", {});
    render(<PathView />);

    fireEvent.click(screen.getByTestId(`path-step-toggle-${t0Node.id}`));
    fireEvent.click(screen.getByTestId(`path-mark-learned-${t0Node.id}`));
    expect(screen.getByText("New Skill Unlocked")).toBeTruthy();

    fireEvent.click(screen.getByText("Nice"));
    expect(screen.queryByText("New Skill Unlocked")).toBeNull();
  });
});

describe("PathView — locked card feedback", () => {
  it("clicking a locked card shows the locked-reason line naming the unmet prereq", () => {
    // Empty progress → t1NodeA (prereq g-t0-anatomy) is locked.
    mockState("guitar", {});
    render(<PathView />);

    // No reason shown until clicked.
    expect(screen.queryByTestId(`path-locked-reason-${t1NodeA.id}`)).toBeNull();
    // The lesson panel must NOT open for a locked card.
    expect(screen.queryByTestId(`path-lesson-${t1NodeA.id}`)).toBeNull();

    fireEvent.click(screen.getByTestId(`path-step-toggle-${t1NodeA.id}`));

    const reason = screen.getByTestId(`path-locked-reason-${t1NodeA.id}`);
    expect(reason.textContent).toContain(t0Node.title);
    expect(reason.textContent).toContain("Locked");
    // Still no lesson panel — locked nodes are not runnable.
    expect(screen.queryByTestId(`path-lesson-${t1NodeA.id}`)).toBeNull();
  });

  it("clicking the locked card again hides the reason", () => {
    mockState("guitar", {});
    render(<PathView />);

    const toggle = screen.getByTestId(`path-step-toggle-${t1NodeA.id}`);
    fireEvent.click(toggle);
    expect(screen.getByTestId(`path-locked-reason-${t1NodeA.id}`)).toBeTruthy();

    fireEvent.click(toggle);
    expect(screen.queryByTestId(`path-locked-reason-${t1NodeA.id}`)).toBeNull();
  });
});

describe("topoSortTier — unit", () => {
  it("puts prereqs before dependents within a tier", () => {
    // t1NodeB has no tier-local prereqs; t1NodeA has no tier-local prereqs either.
    // A case where A depends on B:
    const root: SkillNode = {
      id: "root",
      instrument: "guitar",
      title: "Root",
      tier: 1,
      category: "technique",
      prereqs: [],
      masteryDrill: "drill",
      unlock: "unlock",
    };
    const dep: SkillNode = {
      id: "dep",
      instrument: "guitar",
      title: "Dep",
      tier: 1,
      category: "technique",
      prereqs: ["root"],
      masteryDrill: "drill",
      unlock: "unlock",
    };
    const sorted = topoSortTier([dep, root]); // dep first, reversed intentionally
    expect(sorted[0].id).toBe("root");
    expect(sorted[1].id).toBe("dep");
  });

  it("handles nodes with no tier-local prereqs (cross-tier) in title order", () => {
    const a: SkillNode = { ...t1NodeA, id: "z-node", title: "Zzz" };
    const b: SkillNode = { ...t1NodeB, id: "a-node", title: "Aaa" };
    const sorted = topoSortTier([a, b]);
    expect(sorted[0].id).toBe("a-node");
    expect(sorted[1].id).toBe("z-node");
  });
});

// ── V4 path treatment + all-done (PathView now honors the chosen path) ────────

function mockStateWithPath(
  instrument: "guitar" | "piano",
  learningPath: AppState["learningPath"],
  theoryEnabled: boolean,
  skillProgress: Record<string, SkillProgress> = {},
): void {
  (useAppState as ReturnType<typeof vi.fn>).mockReturnValue({
    state: {
      instrument,
      skillProgress,
      sessions: [],
      pieces: [],
      learningPath,
      theoryEnabled,
    } as Partial<AppState>,
    ready: true,
    setState: vi.fn(),
    patch: vi.fn(),
    dismissUnlock: vi.fn(),
    dismissLevelUp: vi.fn(),
    bumpRep: vi.fn(),
    reviewSkill: vi.fn(),
    markFluent: vi.fn(),
  });
}

describe("PathView — learning-path treatment + all-done", () => {
  const onPathNode: SkillNode = {
    id: "g-t0-anatomy",
    instrument: "guitar",
    title: "Guitar Anatomy & Tuning",
    tier: 0,
    category: "setup",
    prereqs: [],
    masteryDrill: "tune",
    unlock: "tuned",
    soulTitle: "Your Guitar's Names",
    keepTitle: "Guitar Anatomy & Tuning",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  };
  const offPathNode: SkillNode = {
    id: "g-t2-deep-only",
    instrument: "guitar",
    title: "Deep Only",
    tier: 2,
    category: "technique",
    prereqs: [],
    masteryDrill: "deep",
    unlock: "deep",
    soulTitle: "Deep Only",
    keepTitle: "Deep Only",
    pathTags: ["go-deep"],
  };
  const theoryNode: SkillNode = {
    id: "g-theory-1",
    instrument: "guitar",
    title: "Theory Node",
    tier: 1,
    category: "technique",
    prereqs: [],
    masteryDrill: "theory",
    unlock: "theory",
    theory: true,
  };

  beforeAll(() => {
    registerInstrumentModule({ ...guitarModule, skillNodes: [onPathNode, offPathNode, theoryNode] });
  });

  it("dims off-path steps but keeps them visible + expandable", () => {
    mockStateWithPath("guitar", "just-play", false);
    render(<PathView />);
    expect(
      screen.getByTestId(`path-step-${onPathNode.id}`).getAttribute("data-treatment"),
    ).toBe("on-path");
    const off = screen.getByTestId(`path-step-${offPathNode.id}`);
    expect(off.getAttribute("data-treatment")).toBe("off-path");
    // Still expandable — the toggle affordance is present.
    expect(screen.getByTestId(`path-step-toggle-${offPathNode.id}`)).toBeTruthy();
  });

  it("hides theory steps until the theory toggle is turned on", () => {
    mockStateWithPath("guitar", "just-play", false);
    render(<PathView />);
    expect(screen.queryByTestId(`path-step-${theoryNode.id}`)).toBeNull();
    fireEvent.click(screen.getByTestId("pv-theory-toggle").querySelector("input")!);
    expect(screen.getByTestId(`path-step-${theoryNode.id}`)).toBeTruthy();
  });

  it("shows the all-done celebration when every visible step is learned", () => {
    const progress: Record<string, SkillProgress> = {
      [onPathNode.id]: { status: "learned", reps: 5, learnedAt: "2026-01-01" },
      [offPathNode.id]: { status: "learned", reps: 5, learnedAt: "2026-01-01" },
    };
    mockStateWithPath("guitar", "just-play", false, progress);
    render(<PathView />);
    expect(screen.getByTestId("path-all-done")).toBeTruthy();
  });
});
