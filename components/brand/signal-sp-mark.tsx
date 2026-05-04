import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Signal S&P brand mark — a stylised "S" wave on a circular brand-blue field.
 * Pure SVG so it scales cleanly and inherits Tailwind sizing utilities via
 * the wrapper className.
 */
export function SignalSpMark({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Signal S&P"
      className={cn("text-primary", className)}
      {...props}
    >
      <circle cx="32" cy="32" r="32" fill="currentColor" />
      <path
        d="M20 38c4 4 9 6 14 5s9-4 9-9-3-7-9-9-9-3-9-7 4-6 9-6 8 2 11 5"
        fill="none"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="18" r="3" fill="hsl(188,100%,56%)" />
    </svg>
  );
}
