// Clerk middleware, Next 16 edition.
//
// Next 16 renamed the `middleware` file convention to `proxy` (the function is
// now `proxy`, not `middleware`). Clerk's `clerkMiddleware()` returns a standard
// Next middleware function, which we export as the proxy entrypoint.
//
// This is intentionally PERMISSIVE: we do NOT call `auth.protect()` anywhere.
// Nothing in the app is force-protected — clerkMiddleware only attaches the auth
// context so that `auth()` works inside the /api/sync route handler. A user who
// never signs in is completely unaffected.
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Defensive: clerkMiddleware() throws at request time without keys, which would
// take the whole site down on a deploy missing the Clerk env vars. So only run it
// when both keys are configured; otherwise pass through untouched. Cloud sync is
// opt-in, so a key-less deploy is a valid state (the app just has no sync).
const enabled =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

const handler = enabled ? clerkMiddleware() : () => NextResponse.next();

// Next 16 expects a `proxy` (or default) export. Provide both so the file works
// regardless of which the framework resolves first.
export default handler;
export const proxy = handler;

export const config = {
  matcher: [
    // Run on everything EXCEPT Next internals and static assets (the standard
    // Clerk matcher), so static files stay zero-overhead...
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // ...and always run on API routes (so auth() resolves there).
    "/(api|trpc)(.*)",
  ],
};
