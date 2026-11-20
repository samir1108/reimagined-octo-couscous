import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.02em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.3)] hover:bg-primary/90",
        secondary:
          "border-border/50 bg-secondary/15 text-secondary-foreground hover:bg-secondary/25",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-border/70 bg-card/40 text-foreground backdrop-blur-sm",
        gold: "border-primary/35 bg-primary/12 text-primary shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.15)]",
        soft: "border-border/40 bg-muted/50 text-muted-foreground",
        success: "border-success/30 bg-success/12 text-success",
        warning: "border-warning/30 bg-warning/12 text-warning",
        mode: "border-border/40 bg-muted/40 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Render a leading status dot. */
  dot?: boolean;
  /** Optional explicit mode tint (shadow/sleep/awakening/healing). */
  mode?: string;
  /** Optional size alias kept for design-system parity. */
  size?: string;
  /** Soft pulsing halo used by status badges. */
  pulse?: boolean;
}

function Badge({ className, variant, dot, mode, size, pulse, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), pulse && "animate-pulse", className)} data-mode={mode} data-size={size} {...props}>
      {dot && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
