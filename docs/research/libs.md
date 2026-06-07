I now have all the data I need. Here is the full recommendation.

---

## Library Recommendations for the Piano + Guitar App

Current deps to keep: `vexflow@^5.0.0` (reuse for tab), `tone@^15` (audio). All recommendations below add to those.

---

### 1. Guitar Chord Diagrams

**RECOMMENDED: `svguitar` v2.5.1**

```
npm install svguitar
```

- Framework-agnostic TypeScript library. No React peer dep at all — zero compatibility risk with React 19. Renders pure SVG that you target via a DOM ref in a `useEffect`.
- Latest release: v2.5.1 (February 23, 2026). Actively maintained.
- SSR gotcha: calls DOM APIs, so the component wrapping it must be `'use client'` and the `SVGuitarChord` instance must be created inside `useEffect` (or behind `typeof window !== 'undefined'`). Standard pattern for any canvas/SVG lib.
- Bundle: ~35 KB gzipped. No transitive deps.
- RISK: None. Zero React coupling is a feature here.

**Runner-up: `@techies23/react-chords` v1.0.7**

React wrapper around the same chord-rendering concept, peer deps `react >= 18.0.0` (covers React 19). The original `@tombatossals/react-chords` is stuck at npm v0.2.10 (5 years old, unpublished v1.1.0 with React 19 in devDeps). The `@techies23` fork adds TypeScript + fixes console errors, but it's a community fork with fewer downloads and no guarantee of long-term maintenance. Prefer `svguitar` for stability.

**Why not `react-guitar`:** last published 2021, no React 19 peer support, effectively abandoned.

---

### 2. Fretboard Visualization (scales/notes on the neck)

**RECOMMENDED: Roll your own SVG component**

- `@moonwave99/fretboard.js` v0.2.13 was last published November 2022. No maintenance in 3.5 years. No React peer dep awareness. At React 19 the internal d3 manipulation is a risk.
- `react-fretboard` is similarly stale (last update 2018).
- A guitar neck is geometrically simple: `N` strings × `M` frets on a fixed grid. A custom SVG React component is ~120 LOC, trivially SSR-safe (no DOM APIs needed for the static SVG), fully styleable with Tailwind classes, and you can animate dot placements with `motion` (see #6). You own the rendering — no dependency rot.
- If you want a head start: use `@moonwave99/fretboard.js` only as a reference for the math (string/fret → SVG `cx/cy` calculation), then build the render yourself.
- RISK: None (you write it). Authoring time: ~2-4 hours for a solid interactive component.

**Runner-up: `@moonwave99/fretboard.js` v0.2.13 (with caution)**

If you want to ship faster and accept the stale dep: wrap it in a `'use client'` component, instantiate in `useEffect`, and pin the version. Works today but will eventually break on a React upgrade. Treat as tech debt from day 1.

---

### 3. Guitar Tab / Notation Rendering

**RECOMMENDED: VexFlow 5 TabStave (already in the project)**

```
# Already installed: vexflow@^5.0.0
```

- VexFlow 5 ships a full `TabStave` + `TabNote` API with bends, slides, hammer-ons, vibrato. It renders both standard notation above and tab below simultaneously when combined with a regular `Stave`. You already know how to wire VexFlow into React refs — the tab API follows the same pattern.
- No new dependency, no new SSR surface, no bundle bloat.
- Integration: `'use client'` component, `Renderer.Backends.SVG` into a `ref`, draw `TabStave` + `TabNote` arrays the same way the existing piano staff uses `Stave` + `StaveNote`.
- Limitation: authoring GP/MusicXML import is not supported — you write tab data as JS objects. For a personal practice app that's fine; you control the song data anyway.

**Runner-up: `@coderline/alphatab` v1.8.3** — use this if you need Guitar Pro file (`.gp`/`.gpx`) import or playback-synchronized scrolling. It is genuinely full-featured. But: it spawns WebWorkers and AudioWorklets, requires `@coderline/alphatab-webpack` v1.8.3 in `next.config.js`, and Next.js 16 now defaults to Turbopack for `next build` — the webpack plugin will cause build failure unless you add `--webpack` flag or configure turbopack separately. That's real friction. The `@coderline/alphatab-webpack` package had a "bugfix for Next.js integration" as recently as 13 days ago, suggesting the integration is still being ironed out. RISK: MEDIUM. Use only if GP import is a hard requirement.

**Why not VexTab (the text parser):** `0xfe/vextab` is unmaintained (last commit 2019), targets VexFlow 3.x, incompatible with VexFlow 5.

---

### 4. Skill Tree / Graph Visualization

**RECOMMENDED: `@xyflow/react` v12.11.0**

```
npm install @xyflow/react
```

- Peer deps: `react >= 17`, `react-dom >= 17` — React 19.2.4 is fully covered. Latest release June 1, 2026. Actively maintained by a dedicated company (xyflow).
- Built-in: pan/zoom, drag nodes, minimap, background grid, animated edges, custom node renderers. A skill tree is exactly the use case (locked/unlocked states as node `data`, prerequisite arrows as edges, dagre layout for auto-positioning).
- For tree layout (prerequisites as a DAG): add `dagre` or `elkjs` as layout engine — xyflow's own docs show both patterns. `dagre` is lighter (~50 KB); `elkjs` handles complex crossing-edge routing better.
- SSR: the `ReactFlow` component must be in a `'use client'` component. Import the CSS: `import '@xyflow/react/dist/style.css'`. That's it.
- Bundle: ~150 KB gzipped for `@xyflow/react` itself, tree-shakeable. Worth it for what you get.
- RISK: None. This is the industry standard for interactive node graphs in React.

**Runner-up: `react-d3-tree` v3.6.6** — peer deps `react 16.x || 17.x || 18.x || 19.x`, React 19 safe. Good for simple hierarchical trees (parent → child) but does NOT handle DAGs (a node with multiple prerequisites). Last published ~1 year ago. If the skill tree is a pure tree (no shared prerequisites), this is 60 KB lighter. Use `@xyflow/react` for the DAG case, which is more realistic for an instrument skill tree.

**Why not d3-hierarchy + custom SVG:** technically possible, but you'd rebuild pan/zoom, drag, edge routing, and interactivity from scratch. The time cost vastly exceeds the bundle savings.

---

### 5. Testing Stack

**RECOMMENDED: Vitest + React Testing Library + jsdom**

Official Next.js 16 documented stack (last updated Feb 2026).

```
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

Versions as of June 2026: `vitest@4.1.8`, `@vitejs/plugin-react@6.0.2`, `@testing-library/react@16.3.2`, `@testing-library/dom@10.4.1`, `vite-tsconfig-paths@6.1.1`.

`vitest.config.mts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
})
```

`package.json` scripts: add `"test": "vitest"`, `"test:run": "vitest run"`.

**Why jsdom over happy-dom here:** happy-dom is 2-4x faster but has gaps in CSS/DOM API coverage. The existing codebase uses VexFlow (which does DOM measurements) and Tone.js — jsdom's more complete spec coverage reduces false failures. For pure logic tests in `src/lib/` (trinity.ts, music.ts, songs.ts, chainDrills.ts, unlocks.ts), both environments work; jsdom is the safer universal choice. If CI gets slow (500+ tests), switch to happy-dom by changing one line.

**Key notes for Next.js 16 App Router:**
- Async Server Components cannot be unit-tested with Vitest — test them with Playwright E2E instead.
- Mock `next/navigation` hooks (`useRouter`, `usePathname`) in component tests — they throw without a Next.js context.
- The pure domain logic in `src/lib/` tests with no mocks needed at all — just import and call.
- Jest is not recommended: Next.js 16 App Router integration requires a custom transform, and the official docs point to Vitest as the primary path.

**E2E (optional but recommended for the Tone.js / VexFlow rendered output):** Playwright. `npm install -D @playwright/test`. Not required for the initial testing sprint but worth adding for the interactive components.

---

### 6. Animation / Motion for Reward Moments

**RECOMMENDED: `motion` v12.40.0** (the package formerly known as framer-motion)

```
npm install motion
```

- Peer deps: `react ^18.0.0 || ^19.0.0` — explicitly covers React 19.
- The package name is now `motion` (not `framer-motion`). Import: `import { motion, AnimatePresence } from 'motion/react'`.
- For Next.js 16 App Router: any component using `motion.*` elements needs `'use client'`. AnimatePresence for unlock celebrations, `motion.div` for spring-based node reveals on the skill tree, `keyframes` for confetti-style effects.
- The React Compiler (enabled in Next.js 16) auto-memoizes motion components — no extra work needed.
- Bundle: ~34 KB gzipped for the `motion/react` entrypoint (tree-shaken from the full package).
- RISK: None. Explicitly tested with Next.js 16 / React 19 as of March 2026.

---

### Consolidated Install Command

```
npm install svguitar @xyflow/react motion

npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

No new dep needed for tab/notation (VexFlow already installed) or fretboard (build custom SVG component). The alphaTab webpack integration is deferred unless Guitar Pro file import becomes a requirement.

**Full picture of what each new dep does:**

| Package | Purpose | Size (gz) | React 19 safe |
|---|---|---|---|
| `svguitar` | Chord diagram SVG renderer | ~35 KB | Yes (no React dep) |
| `@xyflow/react` | Skill tree / DAG graph | ~150 KB | Yes (`>= 17`) |
| `motion` | Reward animations | ~34 KB | Yes (`^18 || ^19`) |
| `vitest` + RTL stack | Unit testing | dev-only | Yes |
| `vexflow` (existing) | Piano staff + guitar TabStave | already installed | Yes (no React dep) |

Sources:
- [svguitar - npm](https://www.npmjs.com/package/svguitar)
- [GitHub - omnibrain/svguitar](https://github.com/omnibrain/svguitar)
- [GitHub - tombatossals/react-chords](https://github.com/tombatossals/react-chords)
- [@techies23/react-chords - npm](https://www.npmjs.com/package/@techies23/react-chords)
- [@moonwave99/fretboard.js - npm](https://www.npmjs.com/package/@moonwave99/fretboard.js)
- [@coderline/alphatab - npm](https://www.npmjs.com/package/@coderline/alphatab)
- [alphaTab Installation (Web)](https://alphatab.net/docs/getting-started/installation-web)
- [@coderline/alphatab-webpack - npm](https://www.npmjs.com/package/@coderline/alphatab-webpack)
- [GitHub - 0xfe/vexflow](https://github.com/0xfe/vexflow)
- [@xyflow/react - npm](https://www.npmjs.com/package/@xyflow/react)
- [Migrate to React Flow 12](https://reactflow.dev/learn/troubleshooting/migrate-to-v12)
- [react-d3-tree - npm](https://www.npmjs.com/package/react-d3-tree)
- [Testing: Vitest | Next.js](https://nextjs.org/docs/app/guides/testing/vitest)
- [happy-dom vs jsdom (2026)](https://www.pkgpulse.com/guides/happy-dom-vs-jsdom-2026)
- [Motion for React: Get started](https://motion.dev/docs/react)
- [Motion & Framer Motion upgrade guide](https://motion.dev/docs/react-upgrade-guide)