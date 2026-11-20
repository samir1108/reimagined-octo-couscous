/**
 * TodayJourneyMini — Single compact stat row: Sessions / Tasks / Journal.
 * Replaces the larger "Today's Progress" block. Engine-driven counts only.
 */
import { motion } from "framer-motion";

interface TodayJourneyMiniProps {
  sessionsCount: number;
  tasksDone: number;
  tasksTotal: number;
  journalCount: number;
}

export default function TodayJourneyMini({
  sessionsCount,
  tasksDone,
  tasksTotal,
  journalCount,
}: TodayJourneyMiniProps) {
  const stats = [
    { icon: "🧘", value: String(sessionsCount), label: "Sessions" },
    { icon: "✅", value: `${tasksDone}/${Math.max(tasksTotal, tasksDone)}`, label: "Tasks" },
    { icon: "📝", value: String(journalCount), label: "Journal" },
  ];

  return (
    <motion.div
      className="glass-subtle rounded-2xl p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
    >
      <p className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/70 text-center mb-3">
        Today's Journey
      </p>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-base mb-1">{s.icon}</div>
            <p className="text-base font-display font-semibold text-foreground">{s.value}</p>
            <p className="text-[10px] font-body text-muted-foreground/80">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
