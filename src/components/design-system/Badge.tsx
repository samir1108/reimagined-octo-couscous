import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "gold-soft" | "gold-intense" | "observation" | "self-inquiry" | "meditation" | "healing" | "focus" | "shadow-work" | "awakening" | "sleep" | "integration" | "glass" | "glass-gold" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot, children, ...props }, ref) => {
    const variants = {
      default: "bg-elevated-surface text-secondary border border-border",
      gold: "bg-primary-gold/15 text-primary-gold border-primary-gold/30",
      "gold-soft": "bg-gradient-to-r from-gold-light/20 via-primary-gold/15 to-gold-light/20 text-gold-light border-primary-gold/30",
      "gold-intense": "bg-gradient-to-r from-gold-light/30 via-primary-gold/20 to-gold-light/30 text-gold-light border-primary-gold/50 shadow-[0_0_20px_rgba(214,180,106,0.3)]",
      observation: "bg-observation/15 text-observation border-observation/30",
      "self-inquiry": "bg-self-inquiry/15 text-self-inquiry border-self-inquiry/30",
      meditation: "bg-meditation/15 text-meditation border-meditation/30",
      healing: "bg-healing/15 text-healing border-healing/30",
      focus: "bg-focus/15 text-focus border-focus/30",
      "shadow-work": "bg-shadow-work/15 text-shadow-work border-shadow-work/30",
      awakening: "bg-awakening/15 text-awakening border-awakening/30",
      sleep: "bg-sleep/15 text-sleep border-sleep/30",
      integration: "bg-integration/15 text-integration border-integration/30",
      glass: "glass-subtle text-primary border-glass-border",
      "glass-gold": "glass-gold text-primary-gold border-glass-gold-border",
      success: "bg-success/15 text-success border-success/30",
      warning: "bg-warning/15 text-warning border-warning/30",
      error: "bg-error/15 text-error border-error/30",
    };

    const sizes = {
      xs: "px-2 py-0.5 text-metadata gap-1",
      sm: "px-2.5 py-0.5 text-caption gap-1.5",
      md: "px-3 py-1 text-label gap-1.5",
      lg: "px-4 py-1.5 text-body gap-2",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full border transition-colors duration-150",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "rounded-full",
              "w-1.5 h-1.5",
              variant === "default" && "bg-muted",
              variant === "gold" && "bg-primary-gold",
              variant === "observation" && "bg-observation",
              variant === "self-inquiry" && "bg-self-inquiry",
              variant === "meditation" && "bg-meditation",
              variant === "healing" && "bg-healing",
              variant === "focus" && "bg-focus",
              variant === "shadow-work" && "bg-shadow-work",
              variant === "awakening" && "bg-awakening",
              variant === "sleep" && "bg-sleep",
              variant === "integration" && "bg-integration",
              variant === "success" && "bg-success",
              variant === "warning" && "bg-warning",
              variant === "error" && "bg-error",
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";