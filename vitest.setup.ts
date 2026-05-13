/**
 * Vitest global setup — runs once per worker before any tests.
 *
 *   - Extends Vitest's `expect` with @testing-library/jest-dom matchers
 *     (toBeInTheDocument, toHaveTextContent, etc.)
 *   - Cleans up React Testing Library DOM after each test
 *
 * Anything broader (DB reset between suites, MSW server lifecycle) lives
 * inside the individual test files that need it — global hooks add overhead
 * to tests that don't.
 */
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
