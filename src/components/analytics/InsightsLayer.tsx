import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Sparkles, Zap, PauseCircle, Target, RefreshCw, Brain } from "lucide-react";
import { useMachine } from "@xstate/react";
import { insightsMachine, type Timeframe } from "@/machines/insightsMachine";
import { useInsights, type DimensionTrend, type Prediction } from "@/hooks/useInsights";
import { useEffect } from "react";
import { Skeleton } from "@/design-system";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
];

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: any }> = {
  positive: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Sparkles },
  info: { bg: "bg-primary/10", border: "border-primary/20", icon: Brain },
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle },
  critical: { bg: "bg-red-500/10", border: "border-red-500/20", icon: PauseCircle },
};

const DIRECTION_ICON: Record<string, { icon: any; color: string }> = {
  rising: { icon: TrendingUp, color: "text-emerald-400" },
  falling: { icon: TrendingDown, color: "text-red-400" },
  stable: { icon: Minus, color: "text-muted-foreground" },
};

function DimensionTrendCard({ trend }: { trend: DimensionTrend }) {
  const dir = DIRECTION_ICON[trend.direction] || DIRECTION_ICON.stable;
  const Icon = dir.icon;
  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-primary/10`}>
        <Target className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display capitalize text-foreground">{trend.dimension}</p>
        <p className="text-[10px] text-muted-foreground">
          {trend.current.toFixed(1)} band
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Icon className={`w-4 h-4 ${dir.color}`} />
        <span className={`text-xs font-mono ${dir.color}`}>
          {trend.slope > 0 ? "+" : ""}{trend.slope.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  const style = SEVERITY_STYLES[prediction.severity] || SEVERITY_STYLES.info;
  const Icon = style.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${style.bg} ${style.border} border rounded-xl p-4 space-y-1`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <h4 className="text-sm font-display font-semibold text-foreground">{prediction.title}</h4>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">
          {Math.round(prediction.confidence * 100)}%
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{prediction.description}</p>
    </motion.div>
  );
}

export function InsightsLayer() {
  const [state, send] = useMachine(insightsMachine);
  const { data, isLoading, error, refetch } = useInsights(state.context.timeframe);

  useEffect(() => {
    if (isLoading) send({ type: "FETCH_START" });
    else if (error) send({ type: "FETCH_ERROR", error: error.message });
    else if (data) send({ type: "FETCH_SUCCESS" });
  }, [isLoading, error, data, send]);

  return (
    <div className="space-y-5">
      {/* Timeframe Selector */}
      <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => send({ type: "SET_TIMEFRAME", timeframe: tf.value })}
            className={`px-3 py-1.5 rounded-xl text-xs font-display transition-all ${
              state.context.timeframe === tf.value
                ? "bg-primary/10 text-primary border border-primary/20"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {tf.label}
          </button>
        ))}
        <button
          onClick={() => { refetch(); send({ type: "REFRESH" }); }}
          className="ml-auto p-1.5 rounded-lg glass-card text-muted-foreground hover:text-foreground transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      {/* Loading State */}
      {isLoading && !data && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {error && !data && (
        <div className="glass-card rounded-xl p-6 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">Could not load insights. Try again later.</p>
        </div>
      )}

      {/* Data */}
      {data && (
        <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
          {/* AI Summary */}
          {data.aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-4 border border-primary/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-display font-semibold text-foreground">AI Insight</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{data.aiSummary}</p>
            </motion.div>
          )}

          {/* Predictions */}
          {data.predictions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-display text-muted-foreground uppercase tracking-widest">Predictions</h3>
              {data.predictions.map((p, i) => (
                <PredictionCard key={`${p.type}-${i}`} prediction={p} />
              ))}
            </div>
          )}

          {data.predictions.length === 0 && (
            <div className="glass-card rounded-xl p-4 text-center">
              <Zap className="w-6 h-6 text-primary/60 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">No strong patterns detected yet. Keep practicing!</p>
            </div>
          )}

          {/* Dimension Trends */}
          <div className="space-y-2">
            <h3 className="text-xs font-display text-muted-foreground uppercase tracking-widest">Dimension Trends</h3>
            <div className="grid grid-cols-2 gap-2">
              {data.trends.dimensions.map((t) => (
                <DimensionTrendCard key={t.dimension} trend={t} />
              ))}
            </div>
          </div>

          {/* Engagement & Mood */}
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessions</p>
              <p className="text-lg font-display font-bold text-foreground">
                {data.trends.sessions.recentCount}
                <span className="text-xs text-muted-foreground font-normal ml-1">/ {data.meta.daysAnalyzed}d</span>
              </p>
              <div className="flex items-center gap-1">
                {data.trends.sessions.slope >= 0
                  ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                  : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className="text-[10px] text-muted-foreground">
                  {data.trends.sessions.slope >= 0 ? "Increasing" : "Declining"}
                </span>
              </div>
            </div>
            <div className="glass-card rounded-xl p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Mood</p>
              <p className="text-lg font-display font-bold text-foreground">
                {data.trends.mood.avgMood > 0 ? data.trends.mood.avgMood.toFixed(1) : "—"}
                <span className="text-xs text-muted-foreground font-normal ml-1">/10</span>
              </p>
              <div className="flex items-center gap-1">
                {data.trends.mood.slope > 0
                  ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                  : data.trends.mood.slope < 0
                  ? <TrendingDown className="w-3 h-3 text-red-400" />
                  : <Minus className="w-3 h-3 text-muted-foreground" />}
                <span className="text-[10px] text-muted-foreground">
                  {data.trends.mood.slope > 0 ? "Improving" : data.trends.mood.slope < 0 ? "Declining" : "Stable"}
                </span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <p className="text-[10px] text-muted-foreground/50 text-center">
            Based on {data.meta.signalsCount} signals, {data.meta.sessionsCount} sessions, {data.meta.reflectionsCount} reflections over {data.meta.daysAnalyzed} days
          </p>
        </motion.div>
      )}
    </div>
  );
}
