import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual emphasis. "featured" adds a gold ring. */
  variant?: "default" | "featured" | "glass" | string;
  /** Lift on hover. */
  hover?: boolean;
  /** Inner padding shorthand. */
  padding?: "none" | "sm" | "md" | "lg" | string;
  /** Optional mode tint (shadow/sleep/awakening/healing). */
  mode?: string;
}

const paddingMap: Record<string, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, padding, mode, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "premium-panel text-card-foreground",
        variant === "featured" && "ring-1 ring-primary/30",
        variant === "glass" && "glass-1",
        hover && "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--elev-2)]",
        padding && (paddingMap[padding] ?? ""),
        className,
      )}
      data-mode={mode}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-editorial text-2xl font-medium leading-tight tracking-[-0.015em]", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
