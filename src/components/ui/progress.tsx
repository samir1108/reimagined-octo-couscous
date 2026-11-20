import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "value"> {
  value?: number;
  /** Colour hint retained for design-system parity. */
  variant?: string;
  /** Mode tint (shadow/sleep/awakening/healing). */
  mode?: string;
  /** Size hint: sm | md | lg. */
  size?: string;
  /** Show a label above the track. */
  showLabel?: boolean;
  /** Label copy; defaults to the percentage. */
  label?: string;
}

const sizeMap: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, variant, mode, size = "md", showLabel = false, label, ...props }, ref) => (
  <div className="w-full" data-variant={variant} data-mode={mode}>
    {showLabel && (
      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label ?? `${Math.round(value)}%`}</span>
      </div>
    )}
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cn(
        "relative w-full overflow-hidden rounded-full border border-border/40 bg-muted/60 shadow-[inset_0_1px_2px_hsl(0_0%_0%/0.12)]",
        sizeMap[size] ?? sizeMap.md,
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 rounded-full bg-[linear-gradient(90deg,hsl(var(--secondary)),hsl(var(--primary)))] shadow-[0_0_12px_hsl(var(--primary)/0.4)] transition-transform duration-500 ease-standard"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
