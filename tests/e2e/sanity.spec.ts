/**
 * Sanity E2E test — confirms Playwright + the Next.js dev server boot together.
 *
 * Real feature tests live under `tests/e2e/fleets/`, `tests/e2e/vessels/`, etc.
 * and get added in the steps that build those features.
 */
import { test, expect } from "@playwright/test";

test("home page responds", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  // Any 2xx or redirect is fine — auth middleware may bounce unauthenticated
  // users to /sign-in, which is a successful framework boot signal.
  const status = response!.status();
  expect([200, 301, 302, 307, 308]).toContain(status);
});
