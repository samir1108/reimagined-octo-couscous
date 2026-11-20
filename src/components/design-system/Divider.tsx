import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "gold" | "dashed" | "gradient";
  thickness?: "hairline" | "thin" | "medium" | "thick";
  length?: "full" | "auto" | "content";
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = "horizontal", variant = "default", thickness = "thin", length = "full", ...props }, ref) => {
    const thicknessStyles = {
      hairline: orientation === "horizontal" ? "h-[0.5px]" : "w-[0.5px]",
      thin: orientation === "horizontal" ? "h-px" : "w-px",
      medium: orientation === "horizontal" ? "h-[2px]" : "w-[2px]",
      thick: orientation === "horizontal" ? "h-[3px]" : "w-[3px]",
    };

    const variantStyles = {
      default: "bg-border",
      gold: "bg-gradient-to-r from-transparent via-primary-gold/50 to-transparent",
      dashed: "bg-border",
      gradient: "bg-gradient-to-r from-transparent via-primary-gold/30 to-transparent",
    };

    const lengthStyles = {
      full: "w-full",
      auto: orientation === "horizontal" ? "w-auto" : "h-auto",
      content: "max-w-content",
    };

    const orientationStyles = orientation === "horizontal" ? "w-full" : "h-full";

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          orientation === "horizontal" ? "w-full" : "h-full min-h-[100px]",
          className
        )}
        role="separator"
        aria-orientation={orientation}
        {...props}
      >
        <div
          className={cn(
            orientationStyles,
            thicknessStyles[thickness],
            variantStyles[variant],
            lengthStyles[length],
            variant === "dashed" && "border-t border-dashed",
            variant === "dashed" && orientation === "horizontal" && "border-border",
            variant === "dashed" && orientation === "vertical" && "border-l border-border",
          )}
        />
      </div>
    );
  }
);

Divider.displayName = "Divider";

export interface DividerWithTextProps extends Omit<DividerProps, "length"> {
  children: React.ReactNode;
  position?: "left" | "center" | "right";
}

export const DividerWithText = forwardRef<HTMLDivElement, DividerWithTextProps>(
  ({ className, children, orientation = "horizontal", variant = "default", thickness = "thin", position = "center", ...props }, ref) => {
    if (orientation === "vertical") {
      return (
        <Divider ref={ref} className={className} orientation="vertical" variant={variant} thickness={thickness} {...props} />
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-4 w-full", className)}
        role="separator"
        aria-orientation="horizontal"
        {...props}
      >
        <Divider
          variant={variant}
          thickness={thickness}
          length={position === "left" ? "auto" : "full"}
          className={position === "left" ? "flex-1" : "flex-1"}
        />
        <span className={cn("text-metadata text-muted whitespace-nowrap flex-shrink-0", position === "left" && "order-2", position === "right" && "order-1")}>
          {children}
        </span>
        <Divider
          variant={variant}
          thickness={thickness}
          length={position === "right" ? "auto" : "full"}
          className={position === "right" ? "flex-1" : "flex-1"}
        />
      </div>
    );
  }
);

DividerWithText.displayName = "DividerWithText";