import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const vercelConfig = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as {
  functions?: Record<string, unknown>;
  headers?: Array<{ source: string }>;
  rewrites?: Array<{ source: string; destination: string }>;
};

describe("Vercel routing contract", () => {
  it("keeps API routes ahead of the SPA fallback", () => {
    expect(vercelConfig.functions?.["api/index.ts"]).toBeDefined();
    expect(vercelConfig.headers?.find((header) => header.source.startsWith("/api/"))?.source).toBe("/api/:path*");
    expect(vercelConfig.rewrites?.[0]).toEqual({ source: "/api/:path*", destination: "/api/index" });
    expect(vercelConfig.rewrites?.[1]).toEqual({ source: "/:path*", destination: "/index.html" });
  });
});
