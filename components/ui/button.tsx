import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — mirrors the prototype's `.btn` family from
 * html/assets/css/signal-design-system.css.
 *
 * Sizing tokens:
 *   - default → `.btn`     (32px, padding 7/14, --text-sm, gap 4)
 *   - sm      → `.btn-sm`  (26px, padding 4/10, --text-xs)
 *   - lg      → `.btn-lg`  (40px, padding 10/20, --text-md)
 *   - icon    → square 32px (matches default height)
 *
 * Variants:
 *   - default     → `.btn-primary` (solid blue, white text, shadow)
 *   - outline     → `.btn-secondary` (WHITE bg, gray border, text-foreground, shadow)
 *   - secondary   → alias of outline (same as `.btn-secondary`)
 *   - destructive → `.btn-danger` (magenta-tinted)
 *   - ghost       → `.btn-ghost` (transparent, hover gray bg)
 *   - link        → underlined link text
 *
 * Every variant carries a 1px transparent border by default (mirrors
 * the prototype's `.btn { border: 1px solid transparent }`) so the box
 * dimensions stay constant when a colored border is applied on hover.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded border font-semibold leading-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // .btn-primary — solid Signal blue, white text, subtle shadow.
        default:
          "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-[#1278e0] hover:border-[#1278e0] hover:shadow active:bg-[#0e66c7] active:shadow-none",
        // .btn-danger — magenta-tinted (subtle bg).
        destructive:
          "border-transparent bg-signal-magenta/10 text-signal-magenta hover:bg-signal-magenta/15",
        // .btn-secondary — WHITE bg, gray border, dark text, soft shadow.
        outline:
          "border-input bg-card text-foreground shadow-sm hover:bg-background hover:border-foreground/25 hover:shadow active:bg-muted active:shadow-none",
        // alias of outline so existing `variant="secondary"` callsites keep working.
        secondary:
          "border-input bg-card text-foreground shadow-sm hover:bg-background hover:border-foreground/25 hover:shadow active:bg-muted active:shadow-none",
        // .btn-ghost — transparent until hover.
        ghost:
          "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        // Inline text link.
        link:
          "h-auto border-transparent px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        // .btn — 32px tall, 14px horizontal padding, 12px text.
        default: "h-8 px-3.5 text-[12px] [&_svg]:size-3.5",
        // .btn-sm — 26px tall, 10px horizontal padding, 11px text.
        sm: "h-[26px] px-2.5 text-[11px] [&_svg]:size-3",
        // .btn-lg — 40px tall, 20px horizontal padding, 14px text.
        lg: "h-10 px-5 text-[14px] [&_svg]:size-4",
        // Square icon-only button matching default height.
        icon: "size-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
