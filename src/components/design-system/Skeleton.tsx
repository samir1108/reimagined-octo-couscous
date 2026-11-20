import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "avatar" | "button" | "input";
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", width, height, lines = 1, animate = true, ...props }, ref) => {
    const baseStyles = "bg-border overflow-hidden rounded-md";
    const animated = animate ? "skeleton" : "";

    const variants = {
      text: "h-4 w-full max-w-xs",
      circular: "rounded-full",
      rectangular: "rounded-lg",
      card: "rounded-xl",
      avatar: "rounded-full",
      button: "rounded-lg",
      input: "rounded-lg",
    };

    const widths = {
      text: width || "100%",
      circular: width || height || "40px",
      rectangular: width || "100%",
      card: width || "100%",
      avatar: width || height || "40px",
      button: width || "120px",
      input: width || "100%",
    };

    const heights = {
      text: height || "1rem",
      circular: height || width || "40px",
      rectangular: height || "16px",
      card: height || "120px",
      avatar: height || width || "40px",
      button: height || "40px",
      input: height || "44px",
    };

    if (variant === "text" && lines > 1) {
      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                baseStyles,
                animated,
                variants[variant],
                i === lines - 1 && "w-3/4"
              )}
              style={{ width: widths[variant], height: heights[variant] }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, animated, variants[variant], className)}
        style={{ width: widths[variant], height: heights[variant] }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "featured" | "premium";
  lines?: number;
  animate?: boolean;
}

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, variant = "default", lines = 3, animate = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card p-6 space-y-4",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          <Skeleton variant="avatar" size="lg" animate={animate} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" animate={animate} />
            <Skeleton variant="text" width="60%" animate={animate} />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="text" width={i === lines - 1 ? "70%" : "100%"} animate={animate} />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Skeleton variant="button" width="100px" animate={animate} />
          <Skeleton variant="button" width="100px" animate={animate} style={{ opacity: 0.5 }} />
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

export interface SkeletonListProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
  variant?: "default" | "avatar" | "card";
  animate?: boolean;
}

export const SkeletonList = forwardRef<HTMLDivElement, SkeletonListProps>(
  ({ className, count = 5, variant = "default", animate = true, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} variant={variant === "default" ? "rectangular" : variant} animate={animate} />
        ))}
      </div>
    );
  }
);

SkeletonList.displayName = "SkeletonList";