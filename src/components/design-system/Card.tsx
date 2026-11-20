import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "featured" | "premium" | "minimal" | "immersive" | "glass" | "glass-subtle" | "glass-strong" | "glass-gold" | "glass-gold-intense";
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "surface", hover = false, children, ...props }, ref) => {
    const variants = {
      surface: "card-surface",
      featured: "card-featured",
      premium: "card-premium",
      minimal: "card-minimal",
      immersive: "card-immersive",
      glass: "glass-card",
      "glass-subtle": "glass-card-subtle",
      "glass-strong": "glass-card-strong",
      "glass-gold": "glass-gold-card",
      "glass-gold-intense": "glass-gold-card-intense",
    };

    const hoverClasses = {
      surface: "hover-lift",
      featured: "hover-lift",
      premium: "hover-lift",
      glass: "glass-card-hover",
      "glass-subtle": "glass-card-hover",
      "glass-strong": "glass-card-hover",
      "glass-gold": "glass-gold-card-hover",
      "glass-gold-intense": "glass-gold-card-hover",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          hover && hoverClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 pt-6 pb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-h4 text-primary", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-body text-secondary mt-1", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center px-6 pb-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";