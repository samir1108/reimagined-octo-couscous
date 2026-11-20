"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Sun, Cloud, Wind, Droplets, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { CountUp } from "@/design-system";

interface CosmicWeatherCardProps {
  weather: {
    clarityScore: number;
    emotionalTurbulence: "low" | "medium" | "high";
    loopWind: Record<string, number>;
    witnessTemperature: number;
    lunarPhase: string;
    lunarNudge: string;
    season: string;
    seasonalNudge: string;
    forecast: Record<string, { predictedLoops: string[]; recommendation: string }>;
    date: string;
  } | null;
  isLoading: boolean;
  onRefetch: () => void;
  className?: string;
}

const turbulenceColors = {
  low: { bg: "bg-green/10", border: "border-green/20", text: "text-green", icon: CheckCircle2 },
  medium: { bg: "bg-amber/10", border: "border-amber/20", text: "text-amber", icon: AlertTriangle },
  high: { bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive", icon: Zap },
};

const lunarIcons: Record<string, React.ReactNode> = {
  new_moon: <span className="text-2xl">🌑</span>,
  waxing_crescent: <span className="text-2xl">🌒</span>,
  waxing_gibbous: <span className="text-2xl">🌔</span>,
  full_moon: <span className="text-2xl">🌕</span>,
  waning_gibbous: <span className="text-2xl">🌖</span>,
  waning_crescent: <span className="text-2xl">🌘</span>,
};

const seasonIcons: Record<string, React.ReactNode> = {
  spring: <Sun className="w-5 h-5 text-green" />,
  summer: <Sun className="w-5 h-5 text-amber" />,
  autumn: <Droplets className="w-5 h-5 text-orange" />,
  winter: <Cloud className="w-5 h-5 text-blue" />,
};

export function CosmicWeatherCard({
  weather,
  isLoading,
  onRefetch,
  className = "",
}: CosmicWeatherCardProps) {
  const reducedMotion = useReducedMotion();

  if (isLoading) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        className={`w-full bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="animate-pulse h-6 w-32 bg-muted rounded" />
          <div className="animate-pulse h-4 w-20 bg-muted rounded ml-auto" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!weather) return null;

  const turb = turbulenceColors[weather.emotionalTurbulence];
  const TurbulenceIcon = turb.icon;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full max-w-4xl mx-auto bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6 md:p-8 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-medium text-foreground">Cosmic Weather</h2>
            <p className="text-sm text-muted-foreground">Consciousness forecast for {weather.date}</p>
          </div>
        </div>
        <button
          onClick={onRefetch}
          className="px-3 py-1.5 text-sm bg-muted/50 border border-border/30 rounded-xl hover:bg-muted/70 transition-colors flex items-center gap-1"
        >
          <Zap className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<Sun className="w-5 h-5 text-amber" />}
          label="Clarity"
          value={`${weather.clarityScore}%`}
          trend={weather.clarityScore > 70 ? "up" : weather.clarityScore > 40 ? "neutral" : "down"}
          reducedMotion={reducedMotion}
        />
        <MetricCard
          icon={<TurbulenceIcon className={`w-5 h-5 ${turb.text}`} />}
          label="Turbulence"
          value={weather.emotionalTurbulence.charAt(0).toUpperCase() + weather.emotionalTurbulence.slice(1)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${turb.bg} ${turb.border} ${turb.text}`}
          reducedMotion={reducedMotion}
        />
        <MetricCard
          icon={<Wind className="w-5 h-5 text-blue" />}
          label="Witness Temp"
          value={`${weather.witnessTemperature}`}
          reducedMotion={reducedMotion}
        />
        <MetricCard
          icon={<Sparkles className="w-5 h-5 text-purple" />}
          label="Active Loops"
          value={Object.keys(weather.loopWind).length}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Lunar & Seasonal */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-2xl ${weather.lunarPhase.includes("new") || weather.lunarPhase.includes("full") ? "bg-primary/10 border border-primary/20" : "bg-background/40 border border-border/30"}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
              {lunarIcons[weather.lunarPhase] || <span className="text-2xl">🌙</span>}
            </div>
            <div>
              <p className="font-medium text-foreground capitalize">{weather.lunarPhase.replace("_", " ")}</p>
              <p className="text-xs text-muted-foreground">Lunar Phase</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground/80">{weather.lunarNudge}</p>
        </div>
        <div className="p-4 bg-background/40 border border-border/30 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
              {seasonIcons[weather.season] || <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-foreground capitalize">{weather.season}</p>
              <p className="text-xs text-muted-foreground">Seasonal</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground/80">{weather.seasonalNudge}</p>
        </div>
      </div>

      {/* Loop Wind */}
      {Object.keys(weather.loopWind).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Loop Wind</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(weather.loopWind).map(([loopId, intensity]) => (
              <div
                key={loopId}
                className="px-3 py-2 bg-background/40 border border-border/30 rounded-xl flex items-center gap-2"
              >
                <span className="font-mono text-xs text-muted-foreground">{loopId}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={reducedMotion ? {} : { width: 0 }}
                    animate={reducedMotion ? {} : { width: `${intensity * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
                <span className="text-xs font-medium text-foreground">{Math.round(intensity * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly Forecast */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Hourly Forecast</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(weather.forecast).map(([hour, data]) => (
            <div
              key={hour}
              className="p-3 bg-background/40 border border-border/30 rounded-xl"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-muted-foreground">{hour}:00</span>
                {data.predictedLoops.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-destructive/10 text-destructive rounded">
                    {data.predictedLoops.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/80">{data.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  trend?: "up" | "neutral" | "down";
  className?: string;
  reducedMotion: boolean;
}

function MetricCard({ icon, label, value, trend, className, reducedMotion }: MetricCardProps) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`p-4 bg-background/40 border border-border/30 rounded-2xl ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">{icon}</div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        {typeof value === "string" ? (
          <>
            <span className="text-2xl font-display font-bold text-foreground">{value}</span>
            {trend && (
              <span className={`text-xs font-medium ${trend === "up" ? "text-green" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
              </span>
            )}
          </>
        ) : (
          value
        )}
      </div>
    </motion.div>
  );
}