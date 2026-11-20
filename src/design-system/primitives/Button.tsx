import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium tracking-[-0.01em] ring-offset-background transition-[color,background-color,border-color,box-shadow,transform,filter] duration-200 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.38),0_1px_2px_hsl(0_0%_0%/0.22),0_6px_16px_hsl(var(--primary)/0.26)] hover:brightness-[1.06]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.18),0_6px_16px_hsl(var(--destructive)/0.28)] hover:brightness-110",
        outline:
          "border border-border/70 bg-card/40 text-foreground backdrop-blur-sm hover:border-primary/40 hover:bg-primary/[0.07]",
        secondary:
          "border border-border/50 bg-secondary/15 text-secondary-foreground hover:border-border hover:bg-secondary/25",
        ghost: "text-foreground/80 hover:bg-primary/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sacred:
          "bg-[linear-gradient(135deg,hsl(var(--gold-300)),hsl(var(--primary))_48%,hsl(var(--gold-600)))] text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.55),0_1px_2px_hsl(0_0%_0%/0.22),0_8px_22px_hsl(var(--primary)/0.32)] hover:brightness-[1.06]",
        glass: "glass-1 text-foreground hover:border-primary/30 hover:shadow-[var(--elev-2)]",
        primary:
          "bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.38)] hover:brightness-[1.06]",
        gold: "bg-[linear-gradient(135deg,hsl(var(--gold-300)),hsl(var(--primary)))] text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.45)] hover:brightness-[1.06]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-[13px]",
        md: "h-10 rounded-lg px-5",
        lg: "h-11 rounded-lg px-8 text-[15px]",
        xl: "h-12 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
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
  /** Show a spinner and block interaction. */
  loading?: boolean;
  /** Motion hint retained for design-system parity. */
  motion?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, motion: motionHint, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        data-motion={motionHint}
        {...props}
      >
        {loading && (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
