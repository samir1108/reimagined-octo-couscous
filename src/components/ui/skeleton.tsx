import { cn } from "@/lib/utils";

/**
 * Base Skeleton — uses the brand `skeleton-shimmer` class defined in
 * `src/index.css` for a consistent, on-brand loading shimmer across the app.
 *
 * Falls back to an `animate-pulse` muted block if the shimmer class is
 * unavailable so it still degrades gracefully.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-lg bg-muted/50",
        "motion-reduce:animate-pulse motion-reduce:bg-muted/60",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
