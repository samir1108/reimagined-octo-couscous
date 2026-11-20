import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gold" | "gold-ghost" | "glass" | "glass-gold" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, iconOnly, fullWidth, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-interface font-medium transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variants = {
      primary: "bg-gradient-to-r from-gold-light via-primary-gold to-gold-light text-void font-semibold shadow-[0_4px_12px_rgba(214,180,106,0.25)] hover:shadow-[0_6px_16px_rgba(214,180,106,0.35)] hover:brightness-105 active:brightness-95 active:scale-[0.98] rounded-lg border-none",
      secondary: "bg-transparent text-primary border border-border hover:border-primary-gold hover:bg-primary-gold/10 rounded-lg transition-all",
      ghost: "bg-transparent text-secondary hover:text-primary hover:bg-elevated-surface rounded-lg transition-all",
      outline: "bg-transparent text-primary border border-border hover:border-primary-gold hover:bg-primary-gold/5 rounded-lg transition-all",
      gold: "bg-gradient-to-r from-gold-light via-primary-gold to-gold-light text-void font-semibold shadow-[0_4px_12px_rgba(214,180,106,0.25)] hover:shadow-[0_6px_16px_rgba(214,180,106,0.35)] rounded-lg",
      "gold-ghost": "border border-primary-gold/30 text-primary-gold bg-transparent hover:bg-primary-gold/10 hover:border-primary-gold/50 rounded-lg transition-all",
      glass: "glass text-primary border-glass-border hover:border-primary-gold/30 hover:bg-primary-gold/5 rounded-lg transition-all",
      "glass-gold": "glass-gold text-primary-gold border-glass-gold-border hover:border-glass-border-intense hover:bg-primary-gold/10 rounded-lg transition-all",
      destructive: "bg-transparent text-error border border-error/30 hover:bg-error/10 hover:border-error rounded-lg transition-all",
    };

    const sizes = {
      xs: "px-3 py-1.5 text-metadata gap-1.5",
      sm: "px-4 py-2 text-caption gap-2",
      md: "px-6 py-2.5 text-body gap-2",
      lg: "px-7 py-3 text-body-lg gap-2.5",
      xl: "px-8 py-4 text-body-lg gap-3",
    };

    const iconSizes = {
      xs: "w-7 h-7",
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
      xl: "w-14 h-14",
    };

    const width = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          iconOnly ? iconSizes[size] : sizes[size],
          width,
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "gold" | "glass" | "glass-gold" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "default", size = "md", loading, disabled, children, "aria-label": ariaLabel, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-interface transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-gold focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variants = {
      default: "bg-transparent text-secondary hover:text-primary hover:bg-elevated-surface rounded-lg",
      gold: "bg-gradient-to-r from-gold-light via-primary-gold to-gold-light text-void font-semibold shadow-[0_4px_12px_rgba(214,180,106,0.25)] hover:shadow-[0_6px_16px_rgba(214,180,106,0.35)] rounded-lg",
      glass: "glass text-primary border-glass-border hover:border-primary-gold/30 hover:bg-primary-gold/5 rounded-lg",
      "glass-gold": "glass-gold text-primary-gold border-glass-gold-border hover:border-glass-border-intense hover:bg-primary-gold/10 rounded-lg",
      destructive: "bg-transparent text-error hover:bg-error/10 rounded-lg",
    };

    const sizes = {
      xs: "w-7 h-7",
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
      xl: "w-14 h-14",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-label={ariaLabel}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          children
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";