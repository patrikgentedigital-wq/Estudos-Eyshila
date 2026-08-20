import { describe, expect, it } from "vitest";
import { createHydrationGuard } from "../src/utils/hydrationGuard";

describe("user data hydration guard", () => {
  it("invalidates a request when the account context changes", () => {
    const guard = createHydrationGuard();
    expect(guard.isActive()).toBe(true);
    guard.cancel();
    expect(guard.isActive()).toBe(false);
  });
});
