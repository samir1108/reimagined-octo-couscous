"use client";

import { forwardRef, HTMLAttributes, ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

type TextVariant = 
  | "display-xl" | "display-lg" | "display-md" | "display-sm"
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "body-lg" | "body" | "body-sm" | "sm" | "micro" | "caption" | "metadata" | "label" | "button"
  | "display";

type TextColor = 
  | "primary" | "secondary" | "muted" | "faint" | "inverse" | "gold"
  | "observation" | "inquiry" | "meditation" | "healing" | "focus" | "shadow" | "sleep" | "awakening" | "integration"
  | "success" | "warning" | "error" | "info";

interface TextProps extends Omit<HTMLAttributes<HTMLElement>, "color" | "as"> {
  variant?: TextVariant;
  color?: TextColor;
  weight?: "regular" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right" | "justify";
  italic?: boolean;
  underline?: boolean;
  noWrap?: boolean;
  balance?: boolean;
  pretty?: boolean;
  gold?: boolean;
  goldIntense?: boolean;
  gradient?: "gold" | "gold-intense" | "observation" | "inquiry" | "meditation" | "healing" | "focus" | "shadow" | "sleep" | "awakening" | "integration";
  highlight?: boolean;
  as?: ElementType;
  children: ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  "display-xl": "text-[var(--text-display-xl)] font-display font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tighter)]",
  "display-lg": "text-[var(--text-display-lg)] font-display font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tighter)]",
  "display-md": "text-[var(--text-display-md)] font-display font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]",
  "display-sm": "text-[var(--text-display-sm)] font-display font-semibold leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]",
  display: "text-[var(--text-display-md)] font-display font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]",
  h1: "text-[var(--text-h1)] font-display font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]",
  h2: "text-[var(--text-h2)] font-display font-semibold leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]",
  h3: "text-[var(--text-h3)] font-display font-semibold leading-[var(--leading-snug)] tracking-normal",
  h4: "text-[var(--text-h4)] font-display font-semibold leading-[var(--leading-normal)] tracking-[var(--tracking-wide)]",
  h5: "text-[var(--text-h5)] font-display font-semibold leading-[var(--leading-normal)] tracking-[var(--tracking-wide)]",
  h6: "text-[var(--text-h6)] font-display font-semibold leading-[var(--leading-normal)] tracking-[var(--tracking-wide)]",
  "body-lg": "text-[var(--text-body-lg)] font-body leading-[var(--leading-relaxed)] tracking-normal",
  body: "text-[var(--text-body)] font-body leading-[var(--leading-relaxed)] tracking-normal",
  "body-sm": "text-[var(--text-body-sm)] font-body leading-[var(--leading-normal)] tracking-normal",
  sm: "text-sm font-body leading-snug tracking-normal",
  micro: "text-[10px] font-body font-medium leading-none tracking-[0.12em] uppercase",
  caption: "text-[var(--text-caption)] font-body leading-[var(--leading-normal)] tracking-normal",
  metadata: "text-[var(--text-metadata)] font-body font-medium leading-[var(--leading-normal)] tracking-[var(--tracking-metadata)] uppercase",
  label: "text-[var(--text-label)] font-body font-medium leading-[var(--leading-normal)] tracking-[var(--tracking-metadata)] uppercase",
  button: "text-[var(--text-button)] font-body font-semibold leading-[var(--leading-normal)] tracking-[var(--tracking-wide)]",
};

const colorStyles: Record<TextColor, string> = {
  primary: "text-[var(--text-primary)]",
  secondary: "text-[var(--text-secondary)]",
  muted: "text-[var(--text-muted)]",
  faint: "text-[var(--text-faint)]",
  inverse: "text-[var(--text-inverse)]",
  gold: "text-[var(--text-gold)]",
  observation: "text-[var(--mode-observation-text)]",
  inquiry: "text-[var(--mode-inquiry-text)]",
  meditation: "text-[var(--mode-meditation-text)]",
  healing: "text-[var(--mode-healing-text)]",
  focus: "text-[var(--mode-focus-text)]",
  shadow: "text-[var(--mode-shadow-text)]",
  sleep: "text-[var(--mode-sleep-text)]",
  awakening: "text-[var(--mode-awakening-text)]",
  integration: "text-[var(--mode-integration-text)]",
  success: "text-[var(--success-glow)]",
  warning: "text-[var(--warning-glow)]",
  error: "text-[var(--error-glow)]",
  info: "text-[var(--info-glow)]",
};

const gradientStyles: Record<NonNullable<TextProps["gradient"]>, string> = {
  gold: "bg-[var(--gradient-gold-text)] bg-[size:200%_200%] bg-clip-text text-transparent animate-[gold-shimmer_8s_ease-in-out_infinite]",
  "gold-intense": "bg-[var(--gradient-gold-text-intense)] bg-[size:200%_200%] bg-clip-text text-transparent animate-[gold-shimmer_5s_ease-in-out_infinite]",
  observation: "bg-[var(--grad-observation)] bg-clip-text text-transparent",
  inquiry: "bg-[var(--grad-inquiry)] bg-clip-text text-transparent",
  meditation: "bg-[var(--grad-meditation)] bg-clip-text text-transparent",
  healing: "bg-[var(--grad-healing)] bg-clip-text text-transparent",
  focus: "bg-[var(--grad-focus)] bg-clip-text text-transparent",
  shadow: "bg-[var(--grad-shadow)] bg-clip-text text-transparent",
  sleep: "bg-[var(--grad-sleep)] bg-clip-text text-transparent",
  awakening: "bg-[var(--grad-awakening)] bg-clip-text text-transparent",
  integration: "bg-[var(--grad-integration)] bg-clip-text text-transparent",
};

const weightStyles = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      variant = "body",
      color = "primary",
      weight = "regular",
      align = "left",
      italic = false,
      underline = false,
      noWrap = false,
      balance = false,
      pretty = false,
      gradient,
      gold = false,
      goldIntense = false,
      highlight = false,
      as,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const Component: any = as || (variant.startsWith("display") || variant.startsWith("h") ? "h2" : "p");

    return (
      <Component
        ref={ref}
        className={cn(
          variantStyles[variant],
          colorStyles[color],
          weightStyles[weight],
          gradient && gradientStyles[gradient],
          gold && gradientStyles.gold,
          goldIntense && gradientStyles["gold-intense"],
          highlight && "bg-[hsl(var(--gold-core)/0.15)] px-1 -ml-1 rounded-[2px]",
          align === "center" && "text-center",
          align === "right" && "text-right",
          align === "justify" && "text-justify",
          italic && "italic",
          underline && "underline underline-offset-2 decoration-[hsl(var(--gold-core)/0.5)]",
          noWrap && "whitespace-nowrap",
          balance && "text-balance",
          pretty && "text-pretty",
          className
        )}
        style={style}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";

export { Text, type TextProps };