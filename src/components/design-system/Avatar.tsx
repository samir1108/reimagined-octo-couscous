import { forwardRef, type HTMLAttributes, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square" | "rounded";
  status?: "online" | "offline" | "busy" | "away";
  statusPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", shape = "circle", status, statusPosition = "bottom-right", children, ...props }, ref) => {
    const sizes = {
      xs: "w-6 h-6 text-metadata",
      sm: "w-8 h-8 text-caption",
      md: "w-10 h-10 text-body",
      lg: "w-12 h-12 text-body",
      xl: "w-16 h-16 text-h4",
      "2xl": "w-20 h-20 text-h3",
    };

    const shapes = {
      circle: "rounded-full",
      square: "rounded-none",
      rounded: "rounded-xl",
    };

    const statusSizes = {
      xs: "w-1.5 h-1.5",
      sm: "w-2 h-2",
      md: "w-2.5 h-2.5",
      lg: "w-3 h-3",
      xl: "w-3.5 h-3.5",
      "2xl": "w-4 h-4",
    };

    const statusColors = {
      online: "bg-healing",
      offline: "bg-muted",
      busy: "bg-error",
      away: "bg-warning",
    };

    const statusPositions = {
      "bottom-right": "bottom-0 right-0",
      "bottom-left": "bottom-0 left-0",
      "top-right": "top-0 right-0",
      "top-left": "top-0 left-0",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden bg-elevated-surface font-medium",
          "ring-2 ring-void",
          sizes[size],
          shapes[shape],
          className
        )}
        {...props}
      >
        {children}
        {status && (
          <span
            className={cn(
              "absolute rounded-full ring-2 ring-void",
              statusSizes[size],
              statusColors[status],
              statusPositions[statusPosition]
            )}
            aria-label={status}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}
export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn("w-full h-full object-cover", className)}
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {}
export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("w-full h-full flex items-center justify-center bg-elevated-surface text-muted font-medium", className)}
      {...props}
    />
  )
);
AvatarFallback.displayName = "AvatarFallback";

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  children: React.ReactNode;
}

export function AvatarGroup({ className, max = 5, size = "md", children, ...props }: AvatarGroupProps) {
  const kids = React.Children.toArray(children);
  const visible = kids.slice(0, max);
  const remaining = kids.length - max;

  const sizes = {
    xs: "-ml-1",
    sm: "-ml-1.5",
    md: "-ml-2",
    lg: "-ml-2.5",
    xl: "-ml-3",
    "2xl": "-ml-4",
  };

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {visible.map((child, index) =>
        React.cloneElement(child as React.ReactElement, {
          key: index,
          className: cn((child as React.ReactElement).props.className, index > 0 && sizes[size]),
          size,
        })
      )}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden bg-elevated-surface font-medium ring-2 ring-void",
            sizes[size],
            "rounded-full"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}