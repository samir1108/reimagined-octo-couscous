import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Target } from "lucide-react";
import { format } from "date-fns";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  start_date: string;
  end_date: string;
  status: string;
  rewards_badge: string | null;
  participantCount: number;
  myProgress?: number;
  joined?: boolean;
}

export default function ChallengeCard({
  challenge,
  onJoin,
  index = 0,
}: {
  challenge: Challenge;
  onJoin: (id: string) => void;
  index?: number;
}) {
  const progress = challenge.myProgress || 0;
  const pct = Math.min((progress / challenge.target_value) * 100, 100);
  const isComplete = progress >= challenge.target_value;
  const isActive = challenge.status === "active";

  const typeLabels: Record<string, string> = {
    streak: "🔥 Streak",
    minutes: "⏱️ Minutes",
    sessions: "🧘 Sessions",
  };

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className={`w-4 h-4 ${isComplete ? "text-yellow-500" : "text-primary"}`} />
            <h3 className="font-display text-sm font-semibold text-foreground">{challenge.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-body">{challenge.description}</p>
        </div>
        {challenge.rewards_badge && (
          <span className="text-lg ml-2">{challenge.rewards_badge}</span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {typeLabels[challenge.challenge_type] || challenge.challenge_type}
        </span>
        <span className="text-[10px] font-body text-muted-foreground flex items-center gap-1">
          <Target className="w-3 h-3" /> {challenge.target_value}
        </span>
        <span className="text-[10px] font-body text-muted-foreground flex items-center gap-1">
          <Users className="w-3 h-3" /> {challenge.participantCount}
        </span>
        <span className="text-[10px] font-body text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {format(new Date(challenge.end_date), "MMM d")}
        </span>
      </div>

      {/* Progress */}
      {challenge.joined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-body text-muted-foreground">Your progress</span>
            <span className="text-[10px] font-body font-medium text-foreground">{progress}/{challenge.target_value}</span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isComplete ? "bg-gradient-to-r from-yellow-500 to-yellow-400" : "bg-gradient-to-r from-primary/60 to-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      )}

      {!challenge.joined && isActive && (
        <button
          onClick={() => onJoin(challenge.id)}
          className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs font-medium hover:opacity-90 transition-opacity"
        >
          Join Challenge
        </button>
      )}
      {isComplete && (
        <p className="text-xs text-yellow-500 font-body font-medium text-center">🏆 Challenge Complete!</p>
      )}
    </motion.div>
  );
}
