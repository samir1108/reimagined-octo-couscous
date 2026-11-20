"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: "display" | "display-sm" | "h1" | "h2" | "h3" | "h4" | "body" | "body-lg" | "sm" | "caption" | "micro";
  color?: "primary" | "secondary" | "muted" | "faint" | "inverse" | "gold";
  weight?: "normal" | "medium" | "semibold" | "bold";
  gold?: boolean;
  goldIntense?: boolean;
  align?: "left" | "center" | "right";
  as?: keyof JSX.IntrinsicElements;
}

const variantStyles = {
  display: "font-display text-[clamp(3rem,8vw,7rem)] leading-[1.1] tracking-[-0.03em] font-semibold",
  "display-sm": "font-display text-[clamp(2rem,5vw,4rem)] leading-[1.1] tracking-[-0.03em] font-semibold",
  h1: "font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] tracking-[-0.03em] font-semibold",
  h2: "font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.25] tracking-[-0.03em] font-semibold",
  h3: "font-display text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.25] tracking-normal font-semibold",
  h4: "font-display text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.5] tracking-normal font-semibold",
  body: "font-body text-[clamp(1rem,1.25vw,1.0625rem)] leading-[1.65] tracking-normal font-normal",
  "body-lg": "font-body text-[clamp(1.125rem,1.5vw,1.25rem)] leading-[1.65] tracking-normal font-normal",
  sm: "font-body text-[clamp(0.875rem,1vw,0.9375rem)] leading-[1.5] tracking-normal font-normal",
  caption: "font-body text-[0.8125rem] leading-[1.5] tracking-normal font-normal",
  micro: "font-body text-[0.75rem] leading-normal tracking-[0.1em] uppercase font-medium",
};

const colorStyles = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  muted: "text-text-muted",
  faint: "text-text-faint",
  inverse: "text-text-inverse",
  gold: "text-gold-400",
};

const weightStyles = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const alignStyles = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const goldStyles = {
  true: "bg-gradient-gold-text bg-[length:200%_200%] bg-clip-text text-transparent animate-[gold-shimmer_8s_ease-in-out_infinite]",
  intense: "bg-gradient-gold-text-intense bg-[length:200%_200%] bg-clip-text text-transparent animate-[gold-shimmer_5s_ease-in-out_infinite]",
};

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      variant = "body",
      color = "primary",
      weight = "normal",
      gold = false,
      goldIntense = false,
      align = "left",
      as,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp: any = as || "p";

    return (
      <Comp
        ref={ref}
        className={cn(
          variantStyles[variant],
          !gold && !goldIntense && colorStyles[color],
          weightStyles[weight],
          alignStyles[align],
          gold && goldStyles.true,
          goldIntense && goldStyles.intense,
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Text.displayName = "Text";