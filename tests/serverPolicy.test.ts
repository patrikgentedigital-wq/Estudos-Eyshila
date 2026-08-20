import { describe, expect, it } from "vitest";
import { getReadinessStatus, shouldAllowUnauthenticatedLocalFallback } from "../api/serverPolicy";

describe("server deployment policy", () => {
  it("only permits the unauthenticated fallback in explicit local development or tests", () => {
    expect(shouldAllowUnauthenticatedLocalFallback({ NODE_ENV: "test" }, false)).toBe(true);
    expect(shouldAllowUnauthenticatedLocalFallback({ NODE_ENV: "development" }, false)).toBe(true);
    expect(shouldAllowUnauthenticatedLocalFallback({ NODE_ENV: "preview", VERCEL_ENV: "preview" }, false)).toBe(false);
    expect(shouldAllowUnauthenticatedLocalFallback({ NODE_ENV: "production", VERCEL_ENV: "production" }, false)).toBe(false);
    expect(shouldAllowUnauthenticatedLocalFallback({ NODE_ENV: "development" }, true)).toBe(false);
  });

  it("does not report the server ready when any critical dependency is missing", () => {
    expect(getReadinessStatus({ authentication: true, database: true, ai: true }).ready).toBe(true);
    expect(getReadinessStatus({ authentication: true, database: true, ai: false }).ready).toBe(false);
  });
});
