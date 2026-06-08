// V3 P3 screenshot script — seeds localStorage, drives the dev server, captures
// the five P3 surfaces. Reused P2's seeded-localStorage approach.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.OUT_DIR || `${process.env.HOME}/Pictures/screenshots`;

// Build a v4 AppState with: learned prereq chain → p-key-C learned (+ quality for
// a "too-hard" difficulty verdict, + a due review), p-key-G already fluent.
const nowIso = new Date().toISOString();
const dueIso = new Date(Date.now() - 86400000).toISOString(); // due yesterday
const learned = (extra = {}) => ({ status: "learned", reps: 5, learnedAt: nowIso, ...extra });

const state = {
  version: 4,
  instrument: "piano",
  firstOpenedAt: "2026-01-01T00:00:00.000Z",
  name: "Anti",
  northStar: "Play by ear.",
  phase: 2,
  grade: "g2",
  earLevel: 3,
  currentPieceId: "piece-tickery-tockery",
  pieces: [
    { id: "piece-tickery-tockery", title: "Tickery Tockery", composer: "Charlton", grade: "initial", keyId: "C", status: "learning", section: "bars 9-16", startedAt: nowIso, minutes: 30 },
  ],
  keyDepths: { C: 3, am: 2, G: 2 },
  sessions: [],
  arc: [],
  unlocks: [],
  pendingUnlocks: [],
  ghostOverride: null,
  notifyAfter5Days: false,
  recentDrillIds: [],
  skillProgress: {
    "p-t0-keyboard-map": learned(),
    "p-t0-posture": learned(),
    "p-t0-staff": learned(),
    // learned + low success rate → "Too Hard" verdict; has fluencyTest → fluency check.
    "p-key-C": learned({ attempts: 10, successes: 5 }),
    // already fluent → Fluent badge on node + panel.
    "p-key-G": learned({ fluent: true, fluentAt: nowIso, attempts: 8, successes: 7 }),
    "p-key-am": learned({ attempts: 8, successes: 7 }),
  },
  skillReview: {
    // due now → surfaces in Free Play "Bring back" card.
    "p-key-am": { dueAt: dueIso, intervalIndex: 1 },
  },
  xp: 320,
  level: 3,
  streak: { current: 4, longest: 9, lastPracticeDate: nowIso.slice(0, 10) },
  pendingLevelUps: [],
};

async function seed(page) {
  await page.addInitScript((s) => {
    window.localStorage.setItem("practice.state", JSON.stringify(s));
  }, state);
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log("saved", name);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await seed(page);

// 1) Stand: daily-framing line + mental-practice card.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForSelector('[data-testid="daily-framing"]', { timeout: 15000 });
await shot(page, "piano-v3b-stand-framing-mental");

// 2) Free Play review prompt (expand the Free Play slot).
const freeHeader = page.getByRole("button", { name: /Free Play/ });
await freeHeader.click();
await page.waitForSelector('[data-testid="free-reviews"]', { timeout: 10000 });
await shot(page, "piano-v3b-free-review-prompt");

// 3) Onboarding daily-framing line.
const ob = await ctx.newPage();
await seed(ob);
await ob.goto(`${BASE}/onboarding`, { waitUntil: "networkidle" });
// advance to the last step where the framing line lives.
await ob.getByRole("button", { name: "Piano" }).click();
await ob.getByRole("button", { name: "Next" }).click();
await ob.locator("ul li button").first().click();
await ob.getByRole("button", { name: "Next" }).click();
await ob.getByRole("button", { name: "Next" }).click();
await ob.waitForSelector('[data-testid="onboarding-daily-framing"]', { timeout: 10000 });
await ob.screenshot({ path: `${OUT}/piano-v3b-onboarding-framing.png`, fullPage: true });
console.log("saved piano-v3b-onboarding-framing");

// 4) Skill tree panel: fluency check + difficulty on p-key-C; 5) Fluent badge on p-key-G.
const tree = await ctx.newPage();
await seed(tree);
await tree.goto(`${BASE}/tree`, { waitUntil: "networkidle" });
// The skill graph lives behind the "Skill Graph" tab (default tab is the Key Map).
await tree.getByRole("button", { name: "Skill Graph" }).click();
await tree.waitForSelector('[data-testid="sg-canvas"]', { timeout: 15000 });
// Click the C major node to open the panel (fluency check + difficulty).
await tree.waitForSelector('[data-testid="sg-node-p-key-C"]', { timeout: 15000 });
await tree.locator('[data-testid="sg-node-p-key-C"]').click();
await tree.waitForSelector('[data-testid="sg-panel-fluency-check"]', { timeout: 10000 });
await tree.screenshot({ path: `${OUT}/piano-v3b-skill-fluency-difficulty.png`, fullPage: true });
console.log("saved piano-v3b-skill-fluency-difficulty");

// Click the already-fluent G node → panel shows the Fluent badge; node shows it too.
await tree.locator('[data-testid="sg-node-p-key-G"]').click();
await tree.waitForSelector('[data-testid="sg-panel-fluent"]', { timeout: 10000 });
await tree.screenshot({ path: `${OUT}/piano-v3b-skill-fluent-badge.png`, fullPage: true });
console.log("saved piano-v3b-skill-fluent-badge");

await browser.close();
console.log("done");
