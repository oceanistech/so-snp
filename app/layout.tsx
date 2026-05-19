import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

/** Body font — Inter, matching the prototype's `--font: 'Inter'` from
 *  html/assets/css/signal-design-system.css. The CSS variable is still
 *  named `--font-lato` for backwards compatibility with `tailwind.config.ts`
 *  (which sets `font-sans` to that variable); only the underlying typeface
 *  changes. Inter has a noticeably larger x-height than Lato, so 12 px text
 *  reads at the same visual size as the prototype. */
const inter = Inter({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

/** Display font — used for the brand mark and h1/h2 in the prototype.
 *  Mirrors `--font-display: 'Inter Tight'` from html/assets/css/signal-design-system.css. */
const interTight = Inter_Tight({
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Signal S&P",
    template: "%s · Signal S&P",
  },
  description:
    "Signal S&P — sale & purchase platform for ship finance teams. Loan Oracle, Cash Flow Engine, Fleet Management, Vessel Certificates and more.",
  applicationName: "Signal S&P",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          interTight.variable,
          jetbrainsMono.variable,
        )}
      >
        {children}
        {/* Sonner toaster — mounted globally so any client component can
            call `toast.info(...)` / `toast.error(...)` and see feedback. */}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
