import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface LeaderboardEntry {
  name: string;
  value: number;
  teamName?: string;
  completed: boolean;
}

export default function ChallengeLeaderboard({
  entries,
  targetValue,
  type,
}: {
  entries: LeaderboardEntry[];
  targetValue: number;
  type: string;
}) {
  const sorted = [...entries].sort((a, b) => b.value - a.value);

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-yellow-500" />
        <h3 className="font-display text-base font-semibold text-foreground">Leaderboard</h3>
      </div>
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body text-center py-4">No participants yet</p>
        ) : sorted.map((entry, i) => (
          <div key={`${entry.name}-${i}`} className="flex items-center gap-3 py-2 border-b border-border/5 last:border-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-display ${
              i === 0 ? "bg-yellow-500/20 text-yellow-500" :
              i === 1 ? "bg-muted text-muted-foreground" :
              i === 2 ? "bg-orange-500/20 text-orange-500" :
              "bg-muted/30 text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body font-medium text-foreground truncate">{entry.name}</p>
              {entry.teamName && <p className="text-[10px] text-muted-foreground font-body">{entry.teamName}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-display font-bold text-foreground">{entry.value}</p>
              {entry.completed && <span className="text-[10px] text-yellow-500">✓</span>}
            </div>
            <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min((entry.value / targetValue) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
