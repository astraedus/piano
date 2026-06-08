# Plan: Opt-in Cloud Sync (Clerk auth + Neon Postgres)

## Goal
Add an opt-in cloud sync of `practice.state` behind Clerk auth, stored in Neon Postgres, fully additive — zero change for users who never sign in (localStorage stays source of truth).

## Key API findings (verified against installed packages, NOT training data)
- **Next 16**: `middleware.ts` is deprecated → renamed to `proxy.ts` (root or `src/`). File exports a `proxy` function or default. Matcher syntax unchanged. (Doc: `node_modules/next/dist/docs/.../file-conventions/proxy.md`.) **BUT** Clerk's `clerkMiddleware()` returns a Next middleware. Clerk expects the file at `middleware.ts`/`src/middleware.ts` — verify Clerk picks it up; if Next 16 only runs `proxy.ts`, re-export clerkMiddleware as `proxy`.
- **Clerk 7.4.3** (`@clerk/nextjs`): verified via `dist/esm/index.js` export list:
  - EXPORTED: `ClerkProvider`, `SignInButton`, `SignUpButton`, `SignOutButton`, `UserButton`, `useUser`, `useAuth`.
  - **NOT EXPORTED**: `<SignedIn>`, `<SignedOut>`, `<Protect>`. The spec asked for `<SignedIn>/<SignedOut>` — they do not exist in this version. Resolution: drive the signed-in/out split with `useUser()` → `{ isLoaded, isSignedIn, user }` (verified return type in `@clerk/shared`). This is the documented modern hook approach.
  - `clerkMiddleware`, `auth`, `createRouteMatcher` from `@clerk/nextjs/server`. `auth()` is ASYNC → `const { userId } = await auth()`.
- **Neon 1.1.0** (`@neondatabase/serverless`): `neon(connStr)` returns a tagged-template fn that also has `.query(text, params)` for `$1`-placeholder parameterized queries. Use `.query()` for safe parameterized SQL.

## Steps
- [ ] `src/lib/db.ts` — Neon client + `getState`/`putState`, throws if DATABASE_URL missing
- [ ] `src/app/api/sync/route.ts` — GET/POST route handler, auth-gated, 503 on missing DB, runtime=nodejs
- [ ] middleware/proxy at correct location — clerkMiddleware, permissive matcher
- [ ] `src/app/layout.tsx` — conditional ClerkProvider (only if publishable key present)
- [ ] `src/components/CloudSync.tsx` — Warm Studio styled push/pull UI using useUser + SignInButton + UserButton
- [ ] wire CloudSync into settings page
- [ ] unit test: db SQL shape + route auth-gating (mocked)
- [ ] gate: tsc + build (with .env.local) + full test suite once

## Decisions made
- Use `useUser()` not `<SignedIn>` — installed Clerk version lacks the control components. Documented divergence from spec.
- Conditional ClerkProvider keeps a no-env deploy from crashing (defensive requirement).
- Push/pull use exact `STORAGE_KEY = "practice.state"` + raw localStorage string so shape matches the app 1:1; pull writes the string and reloads (lets the app's own migration ladder run on next load).
