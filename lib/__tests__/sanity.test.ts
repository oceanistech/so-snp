/**
 * Sanity unit test — confirms Vitest boots and finds tests in the conventional
 * `__tests__/` folder. This file is intentionally trivial and can be deleted
 * once real tests are in place under `lib/`.
 */
import { describe, expect, it } from "vitest";

describe("vitest framework", () => {
  it("can run a passing assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("can import a tsconfig path alias", async () => {
    const { cn } = await import("@/lib/utils");
    expect(typeof cn).toBe("function");
  });
});
