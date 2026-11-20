import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const surfaceVariants = cva(
  "relative rounded-card border transition-[border-color,box-shadow,transform] duration-300",
  {
    variants: {
      variant: {
        default: "border-border/60 bg-card text-card-foreground shadow-elev-1",
        glass: "glass-2 border-glass-border text-card-foreground",
        subtle: "border-transparent bg-muted/40",
        elevated: "premium-panel text-card-foreground",
        sacred: "gilt-ring border-primary/30 bg-card text-card-foreground shadow-golden",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(surfaceVariants({ variant, padding, className }))}
      {...props}
    />
  ),
);
Surface.displayName = "Surface";

export { Surface, surfaceVariants };
