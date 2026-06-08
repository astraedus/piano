import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk's server auth() and the Neon db layer so we can unit-test the route's
// security-critical logic (auth gating, validation, size cap, tenant isolation)
// without a real session or database.
const authMock = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({ auth: () => authMock() }));

const getState = vi.fn();
const putState = vi.fn();
vi.mock("@/lib/db", () => ({
  getState: (id: string) => getState(id),
  putState: (id: string, s: unknown) => putState(id, s),
}));

import { GET, POST } from "./route";

function postReq(body: unknown, raw?: string) {
  return new Request("http://localhost/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ?? JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.DATABASE_URL = "postgresql://test"; // present unless a test clears it
});

describe("/api/sync GET", () => {
  it("401 when not signed in", async () => {
    authMock.mockResolvedValue({ userId: null });
    const res = await GET();
    expect(res.status).toBe(401);
    expect(getState).not.toHaveBeenCalled();
  });

  it("returns the signed-in user's state, scoped to their userId", async () => {
    authMock.mockResolvedValue({ userId: "user_abc" });
    getState.mockResolvedValue({ xp: 10 });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ state: { xp: 10 } });
    // Tenant isolation: the query is keyed by the server-resolved userId only.
    expect(getState).toHaveBeenCalledWith("user_abc");
  });

  it("503 when the database is not configured", async () => {
    authMock.mockResolvedValue({ userId: "user_abc" });
    delete process.env.DATABASE_URL;
    const res = await GET();
    expect(res.status).toBe(503);
  });
});

describe("/api/sync POST", () => {
  it("401 when not signed in (never writes)", async () => {
    authMock.mockResolvedValue({ userId: null });
    const res = await POST(postReq({ xp: 1 }));
    expect(res.status).toBe(401);
    expect(putState).not.toHaveBeenCalled();
  });

  it("400 on invalid JSON", async () => {
    authMock.mockResolvedValue({ userId: "u1" });
    const res = await POST(postReq(null, "{not json"));
    expect(res.status).toBe(400);
    expect(putState).not.toHaveBeenCalled();
  });

  it("400 on array / non-object body", async () => {
    authMock.mockResolvedValue({ userId: "u1" });
    expect((await POST(postReq([1, 2, 3]))).status).toBe(400);
    expect((await POST(postReq("a string"))).status).toBe(400);
    expect(putState).not.toHaveBeenCalled();
  });

  it("413 on oversized payload", async () => {
    authMock.mockResolvedValue({ userId: "u1" });
    const huge = { blob: "x".repeat(600 * 1024) };
    const res = await POST(postReq(huge));
    expect(res.status).toBe(413);
    expect(putState).not.toHaveBeenCalled();
  });

  it("writes a valid body to the caller's own row and returns ok", async () => {
    authMock.mockResolvedValue({ userId: "user_xyz" });
    putState.mockResolvedValue("2026-06-08T00:00:00Z");
    const res = await POST(postReq({ xp: 42, instrument: "guitar" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, updated_at: "2026-06-08T00:00:00Z" });
    // The write is bound to the server-resolved userId, never client-supplied.
    expect(putState).toHaveBeenCalledWith("user_xyz", { xp: 42, instrument: "guitar" });
  });

  it("503 when the database is not configured", async () => {
    authMock.mockResolvedValue({ userId: "u1" });
    delete process.env.DATABASE_URL;
    const res = await POST(postReq({ xp: 1 }));
    expect(res.status).toBe(503);
    expect(putState).not.toHaveBeenCalled();
  });
});
