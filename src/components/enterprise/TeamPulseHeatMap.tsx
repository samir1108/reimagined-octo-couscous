import { motion } from "framer-motion";
import { Lock, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useMoodDistribution, useTeamPulseAggregate } from "@/hooks/useOrgPulse";

const BAND_META: Record<string, { label: string; color: string; emoji: string }> = {
  thriving: { label: "Thriving", color: "from-emerald-500/30 to-emerald-500/10 border-emerald-500/40", emoji: "🌟" },
  steady: { label: "Steady", color: "from-sky-500/30 to-sky-500/10 border-sky-500/40", emoji: "🌊" },
  strained: { label: "Strained", color: "from-amber-500/30 to-amber-500/10 border-amber-500/40", emoji: "⚡" },
  struggling: { label: "Struggling", color: "from-rose-500/30 to-rose-500/10 border-rose-500/40", emoji: "🌧️" },
};

export default function TeamPulseHeatMap({
  orgId,
  teamId,
}: {
  orgId: string;
  teamId?: string | null;
}) {
  const { data: dist = [], isLoading: loadingDist } = useMoodDistribution(orgId, teamId, 7);
  const { data: pulse = [], isLoading: loadingPulse } = useTeamPulseAggregate(orgId, teamId, 14);

  const insufficient = dist.length === 1 && dist[0].band === "insufficient";

  if (loadingDist || loadingPulse) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-border/20 animate-pulse">
        <div className="h-4 w-32 bg-muted/30 rounded mb-3" />
        <div className="h-32 bg-muted/20 rounded" />
      </div>
    );
  }

  if (insufficient) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-border/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display text-base font-semibold">Team Pulse</h3>
        </div>
        <p className="text-sm text-muted-foreground font-body">
          Need at least 5 team members to share their pulse before insights can appear here.
          This protects individual privacy.
        </p>
      </motion.div>
    );
  }

  const total = dist.reduce((sum, b) => sum + b.member_count, 0) || 1;
  const recent = pulse[0];
  const prior = pulse[6];
  const moodDelta = recent?.avg_mood && prior?.avg_mood
    ? Number((recent.avg_mood - prior.avg_mood).toFixed(2))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 border border-border/20 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-display text-base font-semibold">Team Pulse · Last 7 days</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body">
          {total} {total === 1 ? "voice" : "voices"} · anonymous
        </p>
      </div>

      {/* Band distribution */}
      <div className="grid grid-cols-4 gap-2">
        {(["thriving", "steady", "strained", "struggling"] as const).map((band) => {
          const item = dist.find((d) => d.band === band);
          const count = item?.member_count ?? 0;
          const pct = Math.round((count / total) * 100);
          const meta = BAND_META[band];
          return (
            <div
              key={band}
              className={`rounded-xl p-3 bg-gradient-to-br ${meta.color} border`}
            >
              <div className="text-2xl mb-1">{meta.emoji}</div>
              <div className="text-2xl font-display font-semibold">{pct}%</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">
                {meta.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend line */}
      {recent && (
        <div className="flex items-center justify-between pt-3 border-t border-border/10">
          <div>
            <p className="text-xs text-muted-foreground font-body">7-day mood</p>
            <p className="font-display text-2xl font-semibold">
              {recent.avg_mood?.toFixed(1) ?? "—"} / 5
            </p>
          </div>
          {moodDelta !== null && (
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body ${
                moodDelta >= 0
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {moodDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {moodDelta >= 0 ? "+" : ""}{moodDelta} vs last week
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground font-body text-center pt-2 border-t border-border/10">
        🔒 Privacy floor: minimum 5 contributors. No individual pulses are ever shown.
      </p>
    </motion.div>
  );
}
