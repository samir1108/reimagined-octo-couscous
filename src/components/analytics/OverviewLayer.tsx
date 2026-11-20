import { motion } from "framer-motion";
import { Flame, PenLine, BookOpen, Target, Zap, TrendingUp, AlertTriangle, Calendar, Crown } from "lucide-react";
import { format, subDays } from "date-fns";
import { ProgressRing } from "./ProgressRing";
import { CurrentStateInsight } from "./CurrentStateInsight";
import { ElderTake } from "./ElderTake";
import type { ConsciousnessProfile, EnginePlan } from "@/hooks/useConsciousnessEngine";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const BAND_NAMES: Record<number, { name: string; icon: string; tagline: string }> = {
  0: { name: "Unawakened", icon: "🌑", tagline: "The journey has not yet begun" },
  1: { name: "The Seeker", icon: "🌱", tagline: "Something stirs within" },
  2: { name: "The Questioner", icon: "🔍", tagline: "Doubt becomes a doorway" },
  3: { name: "The Practitioner", icon: "🧘", tagline: "Discipline forges awareness" },
  4: { name: "The Observer", icon: "👁️", tagline: "Watching without becoming" },
  5: { name: "The Integrator", icon: "🌀", tagline: "All parts becoming whole" },
  6: { name: "The Witness", icon: "🔥", tagline: "Pure seeing, beyond the seer" },
  7: { name: "The Sage", icon: "✨", tagline: "Wisdom flows effortlessly" },
  8: { name: "The Awakened", icon: "☀️", tagline: "Being itself" },
};

const STATE_BADGES: Record<string, { label: string; color: string; icon: any }> = {
  normal: { label: "Flowing", color: "bg-emerald-500/20 text-emerald-300", icon: Zap },
  dark_night: { label: "Dark Night", color: "bg-red-500/20 text-red-300", icon: AlertTriangle },
  breakthrough: { label: "Breakthrough", color: "bg-yellow-500/20 text-yellow-300", icon: Crown },
  bypassing: { label: "Bypassing Risk", color: "bg-orange-500/20 text-orange-300", icon: AlertTriangle },
};

interface Props {
  profile?: ConsciousnessProfile;
  plan?: EnginePlan;
  sessions: any[];
  journals: any[];
  tasks: any[];
  obsTask: any[];
  loops?: any[];
}

export function OverviewLayer({ profile, plan, sessions, journals, tasks, obsTask, loops = [] }: Props) {
  const band = plan?.band ?? profile?.overall_band ?? 0;
  const bandInfo = BAND_NAMES[Math.round(band)] || BAND_NAMES[0];
  const state = profile?.state || "normal";
  const stateBadge = STATE_BADGES[state] || STATE_BADGES.normal;
  const StateBadgeIcon = stateBadge.icon;

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const totalTasks = tasks.length;
  const completedObs = obsTask.filter(t => t.status === "completed").length;
  const activeObs = obsTask.filter(t => t.status === "active").length;

  // Streak
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    const hasActivity = sessions.some(s => s.session_date === d) ||
      journals.some((j: any) => format(new Date(j.created_at), "yyyy-MM-dd") === d);
    if (hasActivity) streak++;
    else break;
  }

  // Weekly chart
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = sessions.filter(s => s.session_date === dateStr).length;
    return { day: format(date, "EEE"), count, isToday: i === 6 };
  });
  const maxWeek = Math.max(...weekData.map(d => d.count), 1);
  const sessionsThisWeek = weekData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Journey Identity Card */}
      <motion.div
        className="glass-card rounded-2xl p-5 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative flex items-center gap-5">
          <div className="text-5xl leading-none">{bandInfo.icon}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-display font-bold text-foreground">{bandInfo.name}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-body ${stateBadge.color} flex items-center gap-1`}>
                <StateBadgeIcon className="w-3 h-3" />
                {stateBadge.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-body italic">{bandInfo.tagline}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-body flex-wrap">
              {plan?.archetype && <span>✦ {plan.archetype}</span>}
              <span>Day {plan?.journeyDay ?? profile?.journey_day ?? 1}</span>
              <span className="capitalize">{plan?.phase ?? profile?.journey_phase ?? "assessment"}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Elder's Take — what they think, loops alive, next moves */}
      <ElderTake profile={profile} plan={plan} loops={loops} sessions={sessions} journals={journals} />

      {/* Current State — Decoded */}
      <CurrentStateInsight profile={profile} plan={plan} />

      {/* V-Level Trajectory */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-display font-semibold text-foreground">V-Level Trajectory</h3>
        </div>
        <div className="flex items-end gap-3">
          <VLevelBar label="Baseline" value={profile?.v_level_baseline ?? 0} color="hsl(var(--muted-foreground))" />
          <VLevelBar label="Current" value={profile?.v_level_current ?? 0} color="hsl(var(--primary))" />
          <VLevelBar label="Peak" value={profile?.v_level_peak ?? 0} color="hsl(var(--secondary))" />
        </div>
      </motion.div>

      {/* Integration + Bypassing */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <ProgressRing value={profile?.integration_score ?? 0} max={10} size={80} strokeWidth={6}>
            <span className="text-lg font-display font-bold text-foreground">
              {Math.round((profile?.integration_score ?? 0) * 10)}%
            </span>
          </ProgressRing>
          <span className="text-xs text-muted-foreground font-body">Integration</span>
        </motion.div>

        <motion.div
          className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
        >
          <ProgressRing
            value={profile?.bypassing_risk ?? 0} max={10} size={80} strokeWidth={6}
            color={`hsl(${(profile?.bypassing_risk ?? 0) > 5 ? '0 85% 55%' : '43 96% 56%'})`}
          >
            <span className="text-lg font-display font-bold text-foreground">
              {Math.round((profile?.bypassing_risk ?? 0) * 10)}%
            </span>
          </ProgressRing>
          <span className="text-xs text-muted-foreground font-body">Bypassing Risk</span>
        </motion.div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={BookOpen} label="Sessions" value={sessionsThisWeek} subtitle="Last 7 days" delay={0.2} />
        <StatCard icon={PenLine} label="Journal" value={journals.length} subtitle="Total entries" delay={0.25} />
        <StatCard icon={Target} label="Observations" value={`${completedObs}/${completedObs + activeObs}`} subtitle="Completed" delay={0.3} />
        <StatCard icon={Flame} label="Streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} subtitle={`${completedTasks}/${totalTasks} tasks done`} delay={0.35} />
      </div>

      {/* Weekly Bar */}
      <motion.div
        className="glass-card rounded-2xl p-5 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Weekly Sessions</h3>
          <span className="ml-auto text-[10px] font-display tracking-wider uppercase text-muted-foreground/70">
            {sessionsThisWeek} this week
          </span>
        </div>
        {sessionsThisWeek === 0 ? (
          <p className="text-xs text-muted-foreground font-body py-6 text-center">
            No sessions this week yet — one sit is enough to begin again.
          </p>
        ) : (
          <div className="flex items-end gap-2 h-24">
            {weekData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.count}`}>
                <motion.div
                  className="w-full rounded-lg bg-gradient-sunrise"
                  style={{ minHeight: 4, opacity: d.isToday ? 1 : 0.65 }}
                  initial={{ height: 4 }}
                  animate={{ height: maxWeek > 0 ? Math.max(6, (d.count / maxWeek) * 80) : 4 }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                />
                <span className={`text-[9px] font-body ${d.isToday ? "text-primary" : "text-muted-foreground"}`}>{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, delay = 0 }: {
  icon: any; label: string; value: string | number; subtitle?: string; delay?: number;
}) {
  return (
    <motion.div
      className="glass-card rounded-2xl p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay }}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-body uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-foreground tabular-nums">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground font-body">{subtitle}</p>}
    </motion.div>
  );
}

function VLevelBar({ label, value, color }: { label: string; value: number; color: string }) {
  const maxH = 60;
  const h = Math.max(6, (value / 10) * maxH);
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <motion.div
        className="w-full rounded-lg"
        style={{ backgroundColor: color, minHeight: 6 }}
        initial={{ height: 6 }}
        animate={{ height: h }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <span className="text-[9px] text-muted-foreground font-body">{label}</span>
      <span className="text-xs font-display font-semibold text-foreground">{value.toFixed(1)}</span>
    </div>
  );
}
