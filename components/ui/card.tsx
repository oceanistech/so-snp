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
 *   padding: var(--sp-md) var(--sp-lg)       →  py-3 (12px) / px-6 (24px)
 *   border-bottom: 1px solid var(--color-border)  →  border-b
 *   min-height                              →  ensures every card header
 *                                              on a page renders at the
 *                                              same height regardless of
 *                                              whether the right side
 *                                              carries an action chip /
 *                                              button or not.
 *
 * The default layout is `flex flex-col justify-center` so the typical
 * `<CardTitle/> + <CardDescription/>` stack vertically centers within
 * the `min-h-[56px]` box. Headers that need action items on the right
 * pass `className="flex flex-row items-center justify-between"` and the
 * existing form-section pattern keeps working — the row override
 * naturally fits inside the same 56px slot because the chip/button
 * height (26px) + padding (12px × 2) = 50px ≤ 56px.
 *
 * NOTE: For consistency across pages, prefer the higher-level
 * `<AppCardHeader>` component (components/app/card-header.tsx) which
 * gives you `title` / `subtitle` / `actions` props in one shot.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex min-h-[56px] flex-col justify-center space-y-1 border-b px-6 py-3",
      className,
    )}
    {...props}
  />
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
