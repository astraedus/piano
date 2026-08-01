# Music Practice

A free, open-source practice app for piano, electric guitar, and drums that always tells you what to practice next, and why.

Music Practice runs entirely in your browser. No account, no install, no paywall. Open it tonight and it tells you exactly what to work on, in what order, and why that skill matters before you drill it.

## Live

https://music.raeduslabs.com

## What makes it different

- **A real prerequisite skill tree, not arbitrary levels.** Each skill becomes available only once its prerequisites are actually learned, resolved by a real DAG (`src/lib/skillTree.ts`: `resolveStatus`, `nextToLearn`, `prereqsMet`).
- **BPM-laddered drills.** Technique drills start under tempo and step up only after a clean run, instead of grinding at a fixed speed.
- **Spaced review at 1, 3, 7, and 14 days.** Skills you have learned come back on a schedule so they do not quietly fade once you have "passed" them (`src/lib/skillReview.ts`).
- **Honestly gated ear training.** Ear rounds only quiz intervals, chords, and progressions the tree has actually taught you, never ahead of the curriculum.
- **Every musical term is tappable.** Tap any term for a plain-language glossary explanation. No unexplained jargon anywhere.
- **Free, no account required.** The whole app works with nothing but a browser. Signed-in cloud sync is optional, for people who want their progress on two devices.

## The three instruments

| Instrument | Skill nodes | Notes |
|---|---|---|
| Piano | 32 | Full keyboard curriculum, fundamentals through advanced technique |
| Electric guitar | 36 | Fretboard-native drills, chord diagrams, capo teaching |
| Drums | 20 | Practice-pad only in this first version. No full kit, no pedals |

These counts are current as of this writing and will grow as the curriculum expands. Check the live count yourself:

```bash
grep -c 'id: "' src/lib/{piano,guitar,drums}/skillNodes.ts
```

## The soul

It deletes two sentences from practice: *"wait, what should I do?"* and *"shit, I forgot that one thing, what was it again?"*

Inside a session, the stand is tonight's plan: what to do now, what's next, when you're done. On the roadmap, Your Path (the skill tree) shows what you've learned, the one thing to learn next, and the way back to anything you forgot. Fundamentals first, plain language, open to anyone. Every musical term stays tappable, so a total beginner can follow any lesson cold. Honest numbers, real teaching, exact next actions. Nothing else.

## Stack

Next.js 16, React 19, TypeScript, Tailwind v4, Tone.js (audio), VexFlow 5 (notation), svguitar (chord diagrams), @xyflow/react with dagre (skill graph), motion (animations). Storage is client-side and localStorage-first. Signed-in cloud sync (Clerk plus Neon) is optional, for syncing progress across two devices. Nothing beyond a browser is required to use the whole app.

## Develop

```bash
npm run dev
```

Gate before any commit:

```bash
npx tsc --noEmit && npm run test:run && npm run build
```

## Architecture

See [CLAUDE.md](./CLAUDE.md) for the product soul, architecture, and workflow, and [`docs/`](./docs/) for the build history and research reports.

## Feedback

Music Practice is free and open source. If you use it, even for five minutes, I want to know what confused you or what you wished it did next. Open an issue: [github.com/astraedus/piano/issues](https://github.com/astraedus/piano/issues).

## Licence

MIT licensed. See [LICENSE](./LICENSE).
