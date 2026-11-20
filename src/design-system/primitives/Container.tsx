import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

const paddingStyles = {
  none: "px-0",
  sm: "px-4 sm:px-6 lg:px-8",
  md: "px-5 sm:px-8 lg:px-12",
  lg: "px-6 sm:px-10 lg:px-16",
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", padding = "md", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full",
        sizeStyles[size],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Container.displayName = "Container";

export { Container };