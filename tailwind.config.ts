import type { Config } from "tailwindcss";

/**
 * Tailwind config for Signal S&P.
 *
 * RULES (mirrored from platform-brd.md §4.2):
 *  - No raw hex colours in components. Use semantic tokens via CSS variables.
 *  - All design tokens originate here or in app/globals.css; no per-component
 *    custom CSS. Components compose Tailwind utilities only.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand semantic aliases (Signal Ocean palette).
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          accent: "hsl(var(--brand-accent))",
          surface: "hsl(var(--brand-surface))",
          ink: "hsl(var(--brand-ink))",
        },
        // Sidebar — always dark, regardless of theme.
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          muted: "hsl(var(--sidebar-muted))",
          active: "hsl(var(--sidebar-active))",
          border: "hsl(var(--sidebar-border))",
          hover: "hsl(var(--sidebar-hover))",
        },
        // Signal accent palette — KPI tiles, alert chips, chart series.
        signal: {
          green:   "hsl(var(--signal-green))",
          magenta: "hsl(var(--signal-magenta))",
          orange:  "hsl(var(--signal-orange))",
          purple:  "hsl(var(--signal-purple))",
          yellow:  "hsl(var(--signal-yellow))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-lato)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
        // Display font — used for the brand mark and prototype h1/h2.
        display: ["var(--font-display)", "var(--font-lato)", "system-ui", "sans-serif"],
      },
      // Type scale mirrors the prototype's --text-* tokens from
      // html/assets/css/signal-design-system.css. Tailwind's default scale
      // (text-sm = 14px, text-base = 16px, text-lg = 18px) is bigger than
      // the prototype's, so we override the entire scale here. Components can
      // also use exact-pixel arbitrary values like `text-[12px]` when needed.
      fontSize: {
        xs:   ["11px", { lineHeight: "1.4" }],   // --text-xs
        sm:   ["12px", { lineHeight: "1.5" }],   // --text-sm
        md:   ["14px", { lineHeight: "1.5" }],   // --text-md
        base: ["14px", { lineHeight: "1.5" }],   // alias for md
        lg:   ["16px", { lineHeight: "1.4" }],   // --text-lg
        xl:   ["20px", { lineHeight: "1.3" }],   // --text-xl
        "2xl":["24px", { lineHeight: "1.2" }],   // --text-2xl
        "3xl":["28px", { lineHeight: "1.15" }],  // larger display
        "4xl":["32px", { lineHeight: "1.1" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
