import { motion } from "framer-motion";

interface StreakFlameProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  /** Show dimmed/grace visual (missed 1 day but streak preserved) */
  grace?: boolean;
  /** Show "X/30 days" imperfect streak badge */
  daysPresent30?: number;
  /** Click handler */
  onClick?: () => void;
}

export default function StreakFlame({ streak, size = "md", grace, daysPresent30, onClick }: StreakFlameProps) {
  if (streak <= 0 && !daysPresent30) return null;

  const sizeMap = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  const containerSize = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14" };

  const isGolden = streak >= 30;
  const isSteady = streak >= 7;

  // Duolingo/Snap-style: show progress ring to next milestone
  const nextGoal = streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : null;
  const pct = nextGoal ? Math.min(100, (streak / nextGoal) * 100) : 100;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-1 ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <motion.div
        className={`${containerSize[size]} rounded-xl flex items-center justify-center relative ${grace ? "opacity-50" : ""}`}
        animate={
          grace
            ? { scale: [1, 1.01, 1], opacity: [0.4, 0.6, 0.4] }
            : isGolden
            ? { scale: [1, 1.08, 1] }
            : isSteady
            ? { scale: [1, 1.04, 1] }
            : { scale: [1, 1.02, 1] }
        }
        transition={{
          duration: grace ? 4 : isGolden ? 1.5 : isSteady ? 2 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* progress ring */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted) / 0.25)"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={grace ? "hsl(var(--muted-foreground) / 0.4)" : "hsl(var(--primary) / 0.55)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 18 18)"
          />
        </svg>

        {isGolden && !grace && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ boxShadow: "0 0 20px hsl(45 100% 70% / 0.4), 0 0 40px hsl(45 100% 70% / 0.15)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {grace && (
          <span className="absolute -top-1 -left-1 text-[10px]" aria-label="Streak protected">
            🛡️
          </span>
        )}

        <span className={sizeMap[size]}>{grace ? "🕯️" : "🔥"}</span>
        <span className="absolute -bottom-1 -right-1 text-[10px] font-display font-bold text-primary bg-background rounded-full w-5 h-5 flex items-center justify-center border border-border/30">
          {streak}
        </span>
      </motion.div>
      {nextGoal && !grace && streak > 0 && streak < nextGoal && (
        <span className="text-[9px] font-display text-muted-foreground">
          {streak}/{nextGoal}
        </span>
      )}
      {daysPresent30 !== undefined && daysPresent30 > 0 && (
        <span className="text-[9px] font-display text-muted-foreground">
          {daysPresent30}/30 days
        </span>
      )}
    </div>
  );
}
