import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

/**
 * Placeholder — a small, consistent set of branded loading shells used
 * across the app (Home, Practice, Guide, Journal, Library, Analytics,
 * Masters, Temple, Admin, Enterprise…).
 *
 * Goals
 * - One look across every screen (no spinners-vs-blocks inconsistency).
 * - Glass-card surface so it sits naturally inside our cinematic UI.
 * - Composable primitives (`Line`, `Circle`, `Block`) plus opinionated
 *   shells (`Card`, `ListRow`, `Grid`, `Page`).
 *
 * Use:
 *   <Placeholder.Page />
 *   <Placeholder.Card lines={3} />
 *   <Placeholder.Grid count={6} columns={2} />
 *   <Placeholder.ListRow avatar lines={2} />
 */

function Line({ className }: { className?: string }) {
  return <Skeleton className={cn("h-3 rounded-full", className)} />;
}

function Circle({ className }: { className?: string }) {
  return <Skeleton className={cn("w-10 h-10 rounded-full", className)} />;
}

function Block({ className }: { className?: string }) {
  return <Skeleton className={cn("w-full h-24 rounded-2xl", className)} />;
}

function Card({
  lines = 2,
  className,
  withMedia = false,
}: {
  lines?: number;
  className?: string;
  withMedia?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-card rounded-2xl p-4 sm:p-5 space-y-3 border border-border/30",
        className,
      )}
    >
      {withMedia && <Skeleton className="w-full h-32 rounded-xl" />}
      <div className="flex items-center gap-3">
        <Circle className="w-9 h-9" />
        <div className="flex-1 space-y-2">
          <Line className="w-1/2" />
          <Line className="w-1/3 h-2.5" />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        {Array.from({ length: Math.max(1, lines) }).map((_, i) => (
          <Line
            key={i}
            className={cn(i === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ListRow({
  avatar = true,
  lines = 2,
  className,
}: {
  avatar?: boolean;
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-3.5 py-3 rounded-xl",
        className,
      )}
    >
      {avatar && <Circle className="w-8 h-8 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0 space-y-2">
        <Line className="w-2/3" />
        {Array.from({ length: Math.max(0, lines - 1) }).map((_, i) => (
          <Line key={i} className={i === 0 ? "w-1/2 h-2.5" : "w-1/3 h-2.5"} />
        ))}
      </div>
    </div>
  );
}

function Grid({
  count = 6,
  columns = 2,
  className,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols =
    columns === 4
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      : columns === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={cn("grid gap-3", gridCols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} lines={2} />
      ))}
    </div>
  );
}

/**
 * Page — full-screen placeholder used as Suspense fallbacks and for
 * top-level route loading. Mirrors the standard app layout: header strip,
 * hero card, a couple of content cards.
 */
function Page({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5",
        className,
      )}
      role="status"
      aria-busy="true"
      aria-label={label ?? "Loading"}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Circle className="w-9 h-9 shrink-0" />
          <div className="space-y-2 min-w-0">
            <Line className="w-32" />
            <Line className="w-20 h-2.5" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>

      {/* Hero card */}
      <Card lines={3} withMedia />

      {/* Two stacked content cards */}
      <Card lines={2} />
      <Card lines={2} />

      <span className="sr-only">{label ?? "Loading content…"}</span>
    </div>
  );
}

export const Placeholder = {
  Line,
  Circle,
  Block,
  Card,
  ListRow,
  Grid,
  Page,
};

export default Placeholder;
