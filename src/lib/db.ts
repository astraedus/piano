// Thin Neon Postgres client for the opt-in cloud-sync experiment.
//
// One table backs this (already provisioned in Neon):
//   practice_state (
//     user_id    text        primary key,   -- Clerk userId
//     state      jsonb       not null,       -- the full practice.state blob
//     updated_at timestamptz not null default now()
//   )
//
// This module is server-only: the route handler that imports it runs on the
// node runtime and is auth-gated by Clerk, so `userId` is always a trusted,
// server-resolved value (never client-supplied). All SQL is parameterized via
// the driver's `$1` placeholders — no string interpolation of user input.

// Hard build-time guard: importing this module from a client component becomes a
// compile error, so DATABASE_URL can never be pulled into the client bundle.
import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * Lazily build a Neon SQL client. We don't `neon(...)` at module top-level so
 * that importing this file (e.g. in tests, or on a deploy with no DATABASE_URL)
 * doesn't throw — the throw only happens when a helper is actually called
 * without a configured database, and the route turns that into a graceful 503.
 */
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — cloud sync is unavailable");
  }
  return neon(url);
}

/**
 * Read a user's synced practice state. Returns the stored blob, or `null` when
 * the user has never synced (no row yet). The caller treats `null` as "nothing
 * in the cloud", not an error.
 */
export async function getState(userId: string): Promise<unknown | null> {
  const sql = getSql();
  const rows = (await sql.query(
    "SELECT state FROM practice_state WHERE user_id = $1",
    [userId],
  )) as Array<{ state: unknown }>;
  return rows.length > 0 ? rows[0].state : null;
}

/**
 * Upsert a user's practice state. INSERT, or on a primary-key conflict update
 * the existing row's state + bump updated_at. Returns the new updated_at so the
 * client can show a "last synced" timestamp.
 */
export async function putState(userId: string, state: unknown): Promise<string> {
  const sql = getSql();
  const rows = (await sql.query(
    `INSERT INTO practice_state (user_id, state)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET state = EXCLUDED.state, updated_at = now()
     RETURNING updated_at`,
    [userId, JSON.stringify(state)],
  )) as Array<{ updated_at: string }>;
  return rows[0]?.updated_at;
}
