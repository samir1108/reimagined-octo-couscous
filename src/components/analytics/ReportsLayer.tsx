import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown, Minus, BarChart3, BookOpen, Target, Flame, Activity, Brain, Heart, Zap } from "lucide-react";
import { format, subDays, subWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears, isWithinInterval, parseISO } from "date-fns";
import { ProgressRing } from "./ProgressRing";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

type Period = "this_week" | "last_week" | "this_month" | "last_month" | "this_year" | "last_year";

interface ReportsLayerProps {
  sessions: any[];
  journals: any[];
  tasks: any[];
  obsTask: any[];
  reflections: any[];
  profile?: any;
}

function getDateRange(period: Period) {
  const now = new Date();
  switch (period) {
    case "this_week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: now, label: "This Week" };
    case "last_week": {
      const lastWeek = subWeeks(now, 1);
      return { start: startOfWeek(lastWeek, { weekStartsOn: 1 }), end: endOfWeek(lastWeek, { weekStartsOn: 1 }), label: "Last Week" };
    }
    case "this_month":
      return { start: startOfMonth(now), end: now, label: format(now, "MMMM yyyy") };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth), label: format(lastMonth, "MMMM yyyy") };
    }
    case "this_year":
      return { start: startOfYear(now), end: now, label: format(now, "yyyy") };
    case "last_year": {
      const lastYear = subYears(now, 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear), label: format(lastYear, "yyyy") };
    }
  }
}

function inRange(dateStr: string, start: Date, end: Date) {
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return isWithinInterval(d, { start, end });
  } catch { return false; }
}

function TrendIcon({ current, previous }: { current: number; previous: number }) {
  if (current > previous) return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (current < previous) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

function trendPercent(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "—";
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

export function ReportsLayer({ sessions, journals, tasks, obsTask, reflections, profile }: ReportsLayerProps) {
  const [period, setPeriod] = useState<Period>("this_week");

  const report = useMemo(() => {
    const { start, end, label } = getDateRange(period);

    // Comparison period
    const compMap: Record<Period, Period> = {
      this_week: "last_week", last_week: "this_week",
      this_month: "last_month", last_month: "this_month",
      this_year: "last_year", last_year: "this_year",
    };
    const comp = getDateRange(compMap[period]);

    // Sessions
    const periodSessions = sessions.filter(s => inRange(s.session_date || s.created_at, start, end));
    const compSessions = sessions.filter(s => inRange(s.session_date || s.created_at, comp.start, comp.end));

    // Journals
    const periodJournals = journals.filter(j => inRange(j.created_at, start, end));
    const compJournals = journals.filter(j => inRange(j.created_at, comp.start, comp.end));

    // Tasks
    const periodTasks = tasks.filter(t => inRange(t.task_date || t.created_at, start, end));
    const compTasks = tasks.filter(t => inRange(t.task_date || t.created_at, comp.start, comp.end));
    const periodCompleted = periodTasks.filter(t => t.status === "completed").length;
    const compCompleted = compTasks.filter(t => t.status === "completed").length;
    const completionRate = periodTasks.length > 0 ? Math.round((periodCompleted / periodTasks.length) * 100) : 0;

    // Obs tasks
    const periodObs = obsTask.filter(t => inRange(t.created_at, start, end));
    const periodObsCompleted = periodObs.filter(t => t.status === "completed").length;

    // Reflections
    const periodReflections = reflections.filter(r => inRange(r.reflection_date || r.created_at, start, end));
    const avgMood = periodReflections.length > 0
      ? Math.round(periodReflections.reduce((sum: number, r: any) => sum + (r.mood || 0), 0) / periodReflections.length * 10) / 10
      : null;
    const avgEnergy = periodReflections.length > 0
      ? Math.round(periodReflections.reduce((sum: number, r: any) => sum + (r.energy || 0), 0) / periodReflections.length * 10) / 10
      : null;

    // Streak (active days in period)
    const activeDays = new Set<string>();
    periodSessions.forEach(s => activeDays.add(format(parseISO(s.session_date || s.created_at), "yyyy-MM-dd")));
    periodJournals.forEach(j => activeDays.add(format(parseISO(j.created_at), "yyyy-MM-dd")));
    periodTasks.filter(t => t.status === "completed").forEach(t => activeDays.add(format(parseISO(t.task_date || t.created_at), "yyyy-MM-dd")));

    // Days in period
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const consistencyRate = Math.round((activeDays.size / totalDays) * 100);

    // Domain breakdown from tasks
    const domainCounts: Record<string, number> = {};
    periodTasks.filter(t => t.status === "completed").forEach((t: any) => {
      domainCounts[t.domain] = (domainCounts[t.domain] || 0) + 1;
    });
    const topDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      label,
      start,
      end,
      sessions: { current: periodSessions.length, previous: compSessions.length },
      journals: { current: periodJournals.length, previous: compJournals.length },
      tasksCompleted: { current: periodCompleted, previous: compCompleted },
      totalTasks: periodTasks.length,
      completionRate,
      obsCompleted: periodObsCompleted,
      obsTotal: periodObs.length,
      reflections: periodReflections.length,
      avgMood,
      avgEnergy,
      activeDays: activeDays.size,
      totalDays,
      consistencyRate,
      topDomains,
    };
  }, [period, sessions, journals, tasks, obsTask, reflections]);

  const periods: { id: Period; label: string }[] = [
    { id: "this_week", label: "This Week" },
    { id: "last_week", label: "Last Week" },
    { id: "this_month", label: "This Month" },
    { id: "last_month", label: "Last Month" },
    { id: "this_year", label: "This Year" },
    { id: "last_year", label: "Last Year" },
  ];

  return (
    <div className="space-y-5">
      {/* Period Selector */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={spring}
      >
        {periods.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display whitespace-nowrap transition-all shrink-0 ${
              period === p.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-3 h-3" />
            {p.label}
          </button>
        ))}
      </motion.div>

      {/* Report Header */}
      <motion.div
        className="glass-card rounded-2xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h3 className="text-lg font-display font-bold text-foreground mb-1">{report.label} Report</h3>
        <p className="text-xs text-muted-foreground font-body">
          {format(report.start, "MMM d")} – {format(report.end, "MMM d, yyyy")}
        </p>

        {/* Consistency Ring */}
        <div className="flex items-center gap-5 mt-4">
          <ProgressRing value={report.consistencyRate} max={100} size={90} strokeWidth={7}>
            <span className="text-xl font-display font-bold text-foreground">{report.consistencyRate}%</span>
          </ProgressRing>
          <div className="space-y-1">
            <p className="text-sm font-display font-semibold text-foreground">Consistency Score</p>
            <p className="text-xs text-muted-foreground font-body">
              {report.activeDays} active days out of {report.totalDays}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={Activity}
          label="Sessions"
          value={report.sessions.current}
          trend={report.sessions}
          delay={0.05}
        />
        <MetricCard
          icon={BookOpen}
          label="Journal Entries"
          value={report.journals.current}
          trend={report.journals}
          delay={0.1}
        />
        <MetricCard
          icon={Target}
          label="Tasks Done"
          value={report.tasksCompleted.current}
          subtitle={`${report.completionRate}% rate`}
          trend={report.tasksCompleted}
          delay={0.15}
        />
        <MetricCard
          icon={Flame}
          label="Active Days"
          value={report.activeDays}
          subtitle={`of ${report.totalDays} days`}
          delay={0.2}
        />
      </div>

      {/* Mood & Energy */}
      {(report.avgMood !== null || report.avgEnergy !== null) && (
        <motion.div
          className="glass-card rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.25 }}
        >
          <h3 className="text-xs font-body uppercase tracking-wider text-muted-foreground">Avg. Wellbeing</h3>
          <div className="flex gap-6">
            {report.avgMood !== null && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <div>
                  <p className="text-lg font-display font-bold text-foreground">{report.avgMood}/10</p>
                  <p className="text-[10px] text-muted-foreground font-body">Mood</p>
                </div>
              </div>
            )}
            {report.avgEnergy !== null && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-lg font-display font-bold text-foreground">{report.avgEnergy}/10</p>
                  <p className="text-[10px] text-muted-foreground font-body">Energy</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <div>
                <p className="text-lg font-display font-bold text-foreground">{report.reflections}</p>
                <p className="text-[10px] text-muted-foreground font-body">Reflections</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Domains */}
      {report.topDomains.length > 0 && (
        <motion.div
          className="glass-card rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.3 }}
        >
          <h3 className="text-xs font-body uppercase tracking-wider text-muted-foreground">Top Practice Domains</h3>
          <div className="space-y-2">
            {report.topDomains.map(([domain, count], i) => {
              const maxCount = report.topDomains[0][1] as number;
              const width = Math.max(10, (count / maxCount) * 100);
              return (
                <div key={domain} className="flex items-center gap-3">
                  <span className="text-xs font-display text-foreground/80 w-24 truncate capitalize">{domain}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-sunrise"
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.6, delay: 0.35 + i * 0.05 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-body w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Observation Tasks */}
      {report.obsTotal > 0 && (
        <motion.div
          className="glass-card rounded-2xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.35 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1">Observation Tasks</h3>
              <p className="text-2xl font-display font-bold text-foreground">
                {report.obsCompleted}<span className="text-base text-muted-foreground">/{report.obsTotal}</span>
              </p>
            </div>
            <ProgressRing value={report.obsCompleted} max={Math.max(1, report.obsTotal)} size={56} strokeWidth={5}>
              <span className="text-xs font-display font-bold text-foreground">
                {report.obsTotal > 0 ? Math.round((report.obsCompleted / report.obsTotal) * 100) : 0}%
              </span>
            </ProgressRing>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtitle, trend, delay = 0 }: {
  icon: any; label: string; value: string | number; subtitle?: string;
  trend?: { current: number; previous: number }; delay?: number;
}) {
  return (
    <motion.div
      className="glass-card rounded-2xl p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          <span className="text-[10px] font-body uppercase tracking-wider">{label}</span>
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            <TrendIcon current={trend.current} previous={trend.previous} />
            <span className="text-[10px] font-body text-muted-foreground">
              {trendPercent(trend.current, trend.previous)}
            </span>
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground font-body">{subtitle}</p>}
    </motion.div>
  );
}