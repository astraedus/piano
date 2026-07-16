# Piano — multi-instrument practice studio

A nightly practice app for learning **piano and electric guitar**. Every time you open it, it tells you exactly what to do next and keeps a sharp record of what you've learned — so practice never stalls on "wait, what should I do?" or "what was that one thing I forgot?"

## The soul

It deletes two sentences from practice: *"wait, what should I do?"* and *"shit, I forgot that one thing — what was it again?"*
Inside a session, the stand is tonight's plan — what to do now, what's next, when you're done. On the roadmap, Your Path (the skill tree) shows what you've learned, the one thing to learn next, and the way back to anything you forgot. Honest numbers, real teaching, exact next actions — nothing else.

## Live

https://music.raeduslabs.com

## Stack

Next.js 16 / React 19 / TypeScript / Tailwind v4 / Tone.js (audio) / VexFlow (notation) / svguitar (chord diagrams) / @xyflow/react (skill graph). Client-side, localStorage-first with optional signed-in cloud sync.

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
