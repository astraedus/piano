# Plan — Current Lesson card in the session + /tree deep-link

Owner ask (Anti, 2026-07-17): the stand/session never shows WHICH lesson on the
path you're currently on. Add a small "current lesson" card in the session that
bridges the stand ("what do I do now") and the tree ("where am I on the path"),
with a deep-link into the tree.

## Increments
1. **Pure helper** `src/lib/currentLesson.ts` + `currentLesson.test.ts`.
   `currentLessonNode(nodes, progress, chainDrill)`:
   - chainDrill present + a node's `chainDrillId === chainDrill.id` → that node.
   - else the frontier `nextToLearn(nodes, progress, 1)[0]`.
   - else null.
2. **Extract tier labels** to `src/lib/tierLabels.ts` (pure). PathView imports +
   re-exports `tierLabel` (keeps WhatYouKnow's existing import working). This
   decouples the new card from PathView's heavy component graph.
3. **Card** `src/components/CurrentLessonCard.tsx` (Warm Studio, `no-print`,
   `data-testid="current-lesson-card"`): eyebrow "Your path", node title + tier
   name, one-line context (first sentence of the lesson `why`, term-linked),
   "N of M learned" fraction, CTA `/tree?node=<id>`. Null → renders nothing.
   Mounted in `PracticeStand` under the slots, above the Footer (not in just-play).
4. **Deep-link**: `PathView` gains `initialNodeId?` prop → on mount auto-expands
   that node's inline lesson + scrolls it into view once (locked nodes: don't
   force-open). Tree page reads `?node=` via `useSearchParams` inside a
   `<Suspense>` boundary and passes it down.
5. **Tests**: currentLesson unit (3 cases) + CurrentLessonCard RTL (resolved →
   href, null → absent) + PathView deep-link RTL (param → expanded node).

## Gate
`npx tsc --noEmit && npm run test:run && npm run build`
