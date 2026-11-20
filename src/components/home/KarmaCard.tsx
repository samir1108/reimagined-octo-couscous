/**
 * KarmaCard — compact karma/streak display with fire icon and number.
 * Shown on mobile after the ticker, before the theme card.
 */
import { Flame } from "lucide-react";

interface KarmaCardProps {
  streak: number;
  className?: string;
}

export default function KarmaCard({ streak, className = "" }: KarmaCardProps) {
  return (
    <div className={`w-full max-w-xl mb-4 ${className}`}>
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/30 bg-background/30 backdrop-blur-md px-5 py-3">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-display font-medium text-foreground/90">
          {streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "Begin today"}
        </span>
      </div>
    </div>
  );
}
