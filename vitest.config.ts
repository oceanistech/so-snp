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
      include: [
        "lib/**/*.{ts,tsx}",
        "app/**/actions.{ts,tsx}",
        "app/api/**/route.{ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.{test,spec}.{ts,tsx}",
        "**/__tests__/**",
        "lib/test-utils/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
