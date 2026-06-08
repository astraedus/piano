# V4 Build — Soul-First Learning + UX/Resume Fixes

Two inputs, built together (they touch the same screens):
1. **Soul-first learning model** — spec: `docs/research/soul-first-learning.md` (glossary, TermChip/Explain, soul-first node reframes, Just Play / Play With Soul / Go Deep paths + theory toggle).
2. **UX audit findings** (frontend-qa, 2026-06-08) — folded in below.

## UX audit fix list (fold into the relevant phase)
- **P0 mobile overflow:** at 390px the top bar overflows 30px and the "Just Play" CTA is clipped off-screen. Below ~640px collapse the top bar (second row / bottom bar / condense nav). [Stand/AppShell agent]
- **P0 hydration:** real React error #418 on every load (SSR/client mismatch, localStorage-derived). Fix properly (mounted-gate / suppressHydrationWarning on the right node). [Foundation]
- **P1 desktop wastes ~40%:** single 768px column on a 1280px screen. Add a >=1024px 2-column layout (info rail + slots), kill the dead gutter; fix nav/content width misalignment. [Stand agent]
- **P1 resume UX (highest-leverage):** no NOW marker, no done-state on slots, and reload does NOT restore the rep counter (data persists in `skillReps` but UI resets to Rep 1). Add: NOW/"start here" marker + auto-expand current slot; checkmarks + muted style on done slots; restore in-progress rep state on load; a "Resume: <slot>, rep N" affordance. [Stand agent]
- **P1 chain-drill density:** rep-engine (the action) is buried under steps + keyboard. Lead with / pin the rep engine; collapse steps + keyboard behind disclosure. [Stand agent]
- **P2:** sub-44px tap targets on small links (Change/nav/toast x); progression keyboard clips a key at right edge (768/1280); "The Tree" nav wraps below 430px.

## Phases (P-A,P-B sequential → P-C 3 parallel worktrees → gate)
| Phase | What | Isolation | Status |
|-------|------|-----------|--------|
| P-A Foundation | `SkillNode`/`Warmup`/`ChainDrill`/`ChainStep`/`EarChoice` soul+path+term fields; `GlossaryEntry` + `glossary.ts` data (guitar-first ship set + core); `pathFilter.ts` logic + helpers; AppState `learningPath`/`theoryEnabled` + v5 migration; **TermChip/Explain/useExplain components** (standalone); **hydration #418 fix**. Tests. | main | ⬜ |
| P-B Content | Apply soul/path tables from the spec to guitar+piano `skillNodes`, `chainDrills` (soulName), `warmups` (soulSummary), `earRounds` (termId). Data only. | main | ⬜ |
| P-C1 Stand | PracticeStand + slots + AppShell: desktop 2-col, resume UX (NOW/done/restore), chain-drill progressive disclosure, mobile P0 fix, soul titles + TermChips in stand surfaces (Key-of-Week header, slot subtitles, ear prompts). | worktree | ⬜ |
| P-C2 Tree | SkillGraph + Node + Panel: path filtering (dim off-path, hide theory unless enabled), soul titles, TermChips in panel. | worktree | ⬜ |
| P-C3 Onboarding/Settings | Onboarding "What do you want to do?" path step; Settings path + theory toggle. | worktree | ⬜ |
| P-D | Merged all 3 UI phases, gated (372 tests), deployed | main | ✅ |

Detail for every field/component/table/surfacing-location: `docs/research/soul-first-learning.md`. Worktree agents: `git merge main --no-edit` at start. LSP diagnostics STALE; trust `npx tsc --noEmit`.
