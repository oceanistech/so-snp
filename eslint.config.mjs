// ESLint flat config (replaces .eslintrc.json — `next lint` was deprecated in
// Next 15 and is removed in Next 16). The Next.js team's documented migration
// path is to use `@eslint/eslintrc`'s FlatCompat to load the legacy
// `eslint-config-next` package, which is still distributed as a legacy config.
//
// Reference: https://nextjs.org/docs/app/api-reference/config/eslint

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  // Mirrors the ignores `next lint` applied by default. Without this, ESLint
  // walks the build output and generated type files and reports thousands of
  // bogus errors.
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.tsbuildinfo",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
    },
  },

  // tailwind.config.ts uses CommonJS `require()` for the plugin import,
  // which the newer typescript-eslint rule flags as an error. Tailwind's
  // own templates still use this form, so allow it here.
  {
    files: ["tailwind.config.ts", "postcss.config.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
