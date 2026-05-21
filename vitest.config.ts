/**
 * Vitest configuration — unit + integration test runner.
 *
 * Runs three flavors of tests, all driven by the same config:
 *   1. Pure unit tests (validators, formatters, mappers) — Node env, no DB.
 *   2. Repository / Prisma tests                         — Node env, real test DB.
 *   3. React component tests (RTL)                       — jsdom env.
 *
 * Playwright (E2E) is configured separately in `playwright.config.ts`.
 *
 * Path aliases mirror tsconfig.json's `paths` ("@/*": "./*"). We resolve them
 * manually via `resolve.alias` rather than pulling in `vite-tsconfig-paths`,
 * which is ESM-only and breaks Vitest's CJS config loader.
 *
 * Coverage thresholds are enforced on lib/ and the server-action files only —
 * components are excluded because UI churn doesn't deserve obsessive coverage.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "lib/**/*.{test,spec}.{ts,tsx}",
      "components/**/*.{test,spec}.{ts,tsx}",
      "app/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules/**",
      ".next/**",
      "tests/e2e/**",
      "playwright-report/**",
      "test-results/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      // Coverage scope intentionally narrows to the *feature* surface
      // that's actually exercised by unit / integration tests: domain
      // validation, services, server actions. Plumbing layers (mail,
      // verification, auth/session, repositories, reference-data seed
      // service, API route handlers) are excluded — they're either
      // exercised end-to-end via Playwright (where coverage isn't
      // tracked) or trivial wrappers around external SDKs that don't
      // benefit from unit tests. Excluding them keeps the threshold
      // gate meaningful for the feature code rather than dragged down
      // by infrastructure with zero unit-test surface.
      include: [
        "lib/actions/**/*.{ts,tsx}",
        "lib/services/**/*.{ts,tsx}",
        "lib/validation/**/*.{ts,tsx}",
        "lib/prisma.ts",
        "lib/utils.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.{test,spec}.{ts,tsx}",
        "**/__tests__/**",
        "lib/test-utils/**",
        // Reference-data service is plumbing for the seed pipeline and
        // is exercised by the seed tests + Playwright, not by unit
        // tests in this suite.
        "lib/services/reference.service.ts",
      ],
      thresholds: {
        // Tuned to the current feature-code reality. The dominant
        // file (vessel.service.ts) sits at ~22 % line coverage, so the
        // overall weighted average lands roughly here. These are the
        // floor — bump them up as we add tests rather than letting
        // them drift unenforced, but never lower them without raising
        // a ticket first.
        lines: 40,
        functions: 30,
        branches: 70,
        statements: 40,
      },
    },
  },
});
