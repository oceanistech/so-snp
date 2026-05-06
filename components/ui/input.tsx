import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — mirrors the prototype's `.form-input` / `.filter-input` from
 * html/assets/css/signal-design-system.css.
 *  - 36px height (h-9), padding 8px (px-2)
 *  - --radius-sm rounded corners
 *  - 12px (--text-sm) body text
 *  - white background, gray border
 *  - focus: blue border + 2px primary ring
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-sm border border-input bg-card px-2 text-[12px] text-foreground placeholder:text-muted-foreground transition-colors file:border-0 file:bg-transparent file:text-[12px] file:font-medium hover:border-foreground/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
