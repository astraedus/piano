// Cloud-sync Route Handler (opt-in, Clerk-authed, Neon-backed).
//
//   GET  /api/sync  -> { state: <blob>|null }   (the signed-in user's synced state)
//   POST /api/sync  -> { ok: true, updated_at }  (upsert the posted state blob)
//
// Auth: every request is gated by Clerk's `auth()` (async). No userId -> 401.
// The userId is ALWAYS the server-resolved Clerk subject — never trusted from
// the request body — so a user can only ever read/write their own row.
//
// Graceful degradation: if DATABASE_URL is unset, the db helpers throw; we catch
// that and return 503 (never an unhandled 500), so a misconfigured deploy fails
// soft. Neon's HTTP driver runs on the node runtime, so we pin runtime=nodejs.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getState, putState } from "@/lib/db";

export const runtime = "nodejs";

// Cap the stored blob so a signed-in user cannot abuse storage / push an enormous
// payload. The real practice state is a few KB; 512KB is generous headroom.
const MAX_BYTES = 512 * 1024;

function dbUnavailable() {
  return NextResponse.json(
    { error: "Cloud sync is not configured (database unavailable)" },
    { status: 503 },
  );
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) return dbUnavailable();

  try {
    const state = await getState(userId);
    return NextResponse.json({ state });
  } catch (err) {
    console.error("[sync] GET failed", err);
    return NextResponse.json({ error: "Failed to read cloud state" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) return dbUnavailable();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate it's a non-null plain object (the practice.state shape). Reject
  // arrays / primitives / null so we never persist a malformed blob.
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Body must be a practice-state object" },
      { status: 400 },
    );
  }

  // Size cap (anti-abuse): reject blobs far larger than a real practice state.
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const updated_at = await putState(userId, body);
    return NextResponse.json({ ok: true, updated_at });
  } catch (err) {
    console.error("[sync] POST failed", err);
    return NextResponse.json({ error: "Failed to write cloud state" }, { status: 500 });
  }
}
