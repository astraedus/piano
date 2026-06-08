// Client-side helpers for the Clerk+Neon cloud sync. Thin fetch wrappers around
// /api/sync (which is Clerk-authed server-side). Same-origin fetch carries the
// Clerk session cookie automatically, so no token plumbing is needed here.
//
// The model: localStorage (STORAGE_KEY) is the live working copy; the cloud row is
// the signed-in account's durable save. CloudSyncManager pulls once per session on
// sign-in and auto-pushes (debounced) on change.

import { STORAGE_KEY } from "./storage";

export type CloudPullResult =
  | { ok: true; state: unknown | null }
  | { ok: false; error: string; status: number };

export type CloudPushResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: string; status: number };

/** GET the signed-in account's saved state (null = nothing saved yet). */
export async function cloudPull(): Promise<CloudPullResult> {
  try {
    const res = await fetch("/api/sync", { method: "GET", cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}`, status: res.status };
    return { ok: true, state: data.state ?? null };
  } catch (e) {
    return { ok: false, error: (e as Error).message, status: 0 };
  }
}

/** POST a state blob to the signed-in account (upsert). */
export async function cloudPush(state: unknown): Promise<CloudPushResult> {
  try {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}`, status: res.status };
    return { ok: true, updatedAt: data.updated_at };
  } catch (e) {
    return { ok: false, error: (e as Error).message, status: 0 };
  }
}

/** The raw local working-copy string, or null. */
export function readLocalRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Overwrite the local working copy with a cloud blob (caller then reloads so the
 *  app re-inits + migrates cleanly via loadState). */
export function writeLocalRaw(state: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode: ignore, cloud is still the source of truth */
  }
}

/** Stable stringify-for-compare (key order is consistent within one runtime, which
 *  is all we need to detect "did the working copy change since last push"). */
export function syncHash(state: unknown): string {
  try {
    return JSON.stringify(state);
  } catch {
    return "";
  }
}
