import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

/**
 * CardHeader — tuned to the prototype's `.card-header` from
 * html/assets/css/signal-design-system.css:
 *   padding: var(--sp-md) var(--sp-lg)  →  py-4 (16px) / px-6 (24px)
 *
 * NOTE: For consistency across pages, prefer the higher-level
 * `<AppCardHeader>` component (components/app/card-header.tsx) which
 * gives you `title` / `subtitle` / `actions` props in one shot.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1 px-6 py-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle — matches the prototype's `.card-title`:
 *   font-size: var(--text-md) (14px), font-weight: 700, line-height: snug
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[14px] font-bold leading-snug tracking-tight text-foreground", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription — matches the prototype's `.card-subtitle`:
 *   font-size: var(--text-xs) (11px), color: muted, margin-top: 2px
 */
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[11px] leading-normal text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent — body of a card. Mirrors the prototype's `.card-body`:
 *   padding: var(--sp-lg) → p-6 (24px all sides), including the top so
 *   the body breathes below the header's border-b separator.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
