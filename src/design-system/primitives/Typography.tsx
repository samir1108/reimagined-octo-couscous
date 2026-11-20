import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-editorial font-medium tracking-[-0.02em] text-foreground", {
  variants: {
    level: {
      h1: "text-display-xl md:text-display-2xl leading-[1.02]",
      h2: "text-display-lg md:text-display-xl leading-[1.05]",
      h3: "text-display-md leading-[1.1]",
      h4: "text-display-sm leading-[1.12]",
      h5: "text-xl leading-[1.2]",
      h6: "text-lg leading-[1.3]",
    },
    weight: {
      default: "font-medium",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-semibold",
    },
  },
  defaultVariants: {
    level: "h2",
    weight: "default",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  color?: string;
  /** Alias for `level`, used by feature cards. */
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, variant, as, weight, ...props }, ref) => {
    const resolvedLevel = (level ?? variant ?? "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    const Component: any = as || resolvedLevel;
    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ level: resolvedLevel, weight, className }))}
        {...props}
      />
    );
  },
);
Heading.displayName = "Heading";

const eyebrowVariants = cva("font-semibold uppercase text-[11px] tracking-[0.18em] text-muted-foreground", {
  variants: {
    color: {
      default: "text-muted-foreground",
      primary: "text-primary",
      accent: "text-accent",
    },
  },
  defaultVariants: {
    color: "default",
  },
});

export interface EyebrowProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">, VariantProps<typeof eyebrowVariants> {}

const Eyebrow = React.forwardRef<HTMLSpanElement, EyebrowProps>(
  ({ className, color, ...props }, ref) => (
    <span ref={ref} className={cn(eyebrowVariants({ color, className }))} {...props} />
  ),
);
Eyebrow.displayName = "Eyebrow";

const bodyVariants = cva("text-base leading-relaxed text-foreground", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      accent: "text-accent",
    },
  },
  defaultVariants: {
    size: "md",
    color: "default",
  },
});

export interface BodyProps extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">, VariantProps<typeof bodyVariants> {}

const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, size, color, ...props }, ref) => (
    <p ref={ref} className={cn(bodyVariants({ size, color, className }))} {...props} />
  ),
);
Body.displayName = "Body";

const captionVariants = cva("text-xs text-muted-foreground", {
  variants: {
    weight: {
      default: "font-normal",
      medium: "font-medium",
    },
  },
  defaultVariants: {
    weight: "default",
  },
});

export interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof captionVariants> {}

const Caption = React.forwardRef<HTMLSpanElement, CaptionProps>(
  ({ className, weight, ...props }, ref) => (
    <span ref={ref} className={cn(captionVariants({ weight, className }))} {...props} />
  ),
);
Caption.displayName = "Caption";

export { Heading, headingVariants, Eyebrow, eyebrowVariants, Body, bodyVariants, Caption, captionVariants };
