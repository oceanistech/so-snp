import type { Metadata } from "next";
import { Lato, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const lato = Lato({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
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
          lato.variable,
          jetbrainsMono.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
