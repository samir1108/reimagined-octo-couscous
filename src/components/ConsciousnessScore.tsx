import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ChevronRight, Zap } from "lucide-react";
import type { ConsciousnessProfile, EnginePlan } from "@/hooks/useConsciousnessEngine";

interface ConsciousnessScoreProps {
  profile?: ConsciousnessProfile;
  plan?: EnginePlan;
  /** compact = Home widget, full = Analytics detail */
  variant?: "compact" | "full";
  onTap?: () => void;
}

// ═══════════════════════════════════════
// SCORE CALCULATION (0-1000)
// Weighted composite of all consciousness dimensions
// ═══════════════════════════════════════

interface ScoreBreakdown {
  total: number;
  dimensions: number;
  consistency: number;
  witness: number;
  integration: number;
  loops: number;
  trend: "up" | "down" | "stable";
}

function calculateScore(profile?: ConsciousnessProfile, plan?: EnginePlan): ScoreBreakdown {
  if (!profile) return { total: 0, dimensions: 0, consistency: 0, witness: 0, integration: 0, loops: 0, trend: "stable" };

  const band = plan?.band ?? profile.overall_band ?? 0;
  const dims = profile.dimension_bands || { thought: 0, emotion: 0, body: 0, awareness: 0 };
  const dimAvg = (dims.thought + dims.emotion + dims.body + dims.awareness) / 4;

  // 1. Dimensions score (0-300) — average of 4 dimensions on 0-10 scale
  const dimensions = Math.round((dimAvg / 10) * 300);

  // 2. Consistency score (0-200) — streak + total sessions + journal entries
  const streakPart = Math.min(100, (profile.streak_current || 0) * 5);
  const sessionPart = Math.min(60, (profile.total_sessions || 0) * 2);
  const journalPart = Math.min(40, (profile.total_journal_entries || 0) * 2);
  const consistency = Math.round(streakPart + sessionPart + journalPart);

  // 3. Witness score (0-200) — witness depth, stability, gap
  const witnessAvg = ((profile.witness_depth || 0) + (profile.witness_stability || 0) + (profile.witness_gap || 0)) / 3;
  const witness = Math.round((witnessAvg / 10) * 200);

  // 4. Integration score (0-200) — from profile
  const integration = Math.round(((profile.integration_score || 0) / 10) * 200);

  // 5. Loop mastery (0-100) — loop awareness score minus bypassing penalty
  const bypassPenalty = (profile.bypassing_risk || 0) * 10;
  const loopAwareness = Object.values(profile.loop_awareness || {}).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0);
  const activeLoops = Array.isArray(profile.active_loops) ? profile.active_loops.length : Object.keys(profile.active_loops || {}).length;
  const loopAwarenessScore = Math.min(70, loopAwareness * 3);
  const loopResolutionBonus = Math.min(30, Math.max(0, 30 - activeLoops * 3)); // fewer active loops = higher mastery
  const loops = Math.round(Math.max(0, loopAwarenessScore + loopResolutionBonus - bypassPenalty));

  const total = Math.min(1000, dimensions + consistency + witness + integration + loops);

  // Trend: compare current vs baseline
  const trend = (profile.v_level_current || 0) > (profile.v_level_baseline || 0) + 0.3
    ? "up"
    : (profile.v_level_current || 0) < (profile.v_level_baseline || 0) - 0.3
      ? "down"
      : "stable";

  return { total, dimensions, consistency, witness, integration, loops, trend };
}

const SCORE_TIERS = [
  { min: 0, max: 150, label: "Dormant", color: "text-muted-foreground", ring: "from-muted-foreground/30 to-muted-foreground/10" },
  { min: 151, max: 300, label: "Stirring", color: "text-blue-400", ring: "from-blue-400/40 to-blue-400/10" },
  { min: 301, max: 500, label: "Awakening", color: "text-emerald-400", ring: "from-emerald-400/50 to-emerald-400/15" },
  { min: 501, max: 700, label: "Expanding", color: "text-amber-400", ring: "from-amber-400/60 to-amber-400/15" },
  { min: 701, max: 850, label: "Radiant", color: "text-orange-400", ring: "from-orange-400/70 to-orange-400/20" },
  { min: 851, max: 1000, label: "Luminous", color: "text-primary", ring: "from-primary/80 to-primary/20" },
];

function getTier(score: number) {
  return SCORE_TIERS.find(t => score >= t.min && score <= t.max) || SCORE_TIERS[0];
}

// ═══ Animated Score Number ═══
function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="tabular-nums"
    >
      {value}
    </motion.span>
  );
}

// ═══ Score Ring (SVG) ═══
function ScoreRing({ score, size = 120, strokeWidth = 6 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = Math.max(0, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const progress = score / 1000;
  const offset = circumference - progress * circumference;
  const tier = getTier(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          className="stroke-muted/20"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-display font-bold ${tier.color}`}>
          <AnimatedNumber value={score} />
        </span>
        <span className="text-[9px] font-display tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
          / 1000
        </span>
      </div>
    </div>
  );
}

// ═══ Trend Badge ═══
function TrendBadge({ trend }: { trend: "up" | "down" | "stable" }) {
  const config = {
    up: { icon: TrendingUp, label: "Rising", className: "text-emerald-400 bg-emerald-400/10" },
    down: { icon: TrendingDown, label: "Dipping", className: "text-red-400 bg-red-400/10" },
    stable: { icon: Minus, label: "Stable", className: "text-muted-foreground bg-muted/20" },
  };
  const { icon: Icon, label, className } = config[trend];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ═══ Breakdown Bar ═══
function BreakdownBar({ label, value, max, emoji }: { label: string; value: number; max: number; emoji: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-display text-muted-foreground">
          {emoji} {label}
        </span>
        <span className="text-[11px] font-display font-semibold text-foreground">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary/60"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// COMPACT WIDGET (Home Page)
// ═══════════════════════════════════════
function CompactScore({ profile, plan, onTap }: ConsciousnessScoreProps) {
  const score = calculateScore(profile, plan);
  const tier = getTier(score.total);

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 cursor-pointer glass-card-hover"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.6 }}
      onClick={onTap}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        <ScoreRing score={score.total} size={72} strokeWidth={4} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary font-semibold">
              Consciousness Score
            </p>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-lg font-display font-bold ${tier.color}`}>{tier.label}</span>
            <TrendBadge trend={score.trend} />
          </div>
          <p className="text-[10px] text-muted-foreground font-body">
            Tap to see full breakdown →
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// FULL VIEW (Analytics Page)
// ═══════════════════════════════════════
function FullScore({ profile, plan }: ConsciousnessScoreProps) {
  const score = calculateScore(profile, plan);
  const tier = getTier(score.total);

  return (
    <div className="space-y-6">
      {/* Score Hero */}
      <motion.div
        className="glass-card rounded-2xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/60 mb-4">
          Your Consciousness Score
        </p>
        <div className="flex justify-center mb-4">
          <ScoreRing score={score.total} size={140} strokeWidth={7} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`text-xl font-display font-bold ${tier.color}`}>{tier.label}</span>
          <TrendBadge trend={score.trend} />
        </div>
        <p className="text-xs text-muted-foreground font-body max-w-xs mx-auto">
          A composite measure of your awareness depth, consistency, witness development, integration, and loop mastery.
        </p>
      </motion.div>

      {/* Breakdown */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
      >
        <h3 className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/60 mb-4">
          Score Breakdown
        </h3>
        <div className="space-y-3">
          <BreakdownBar label="Dimensions" value={score.dimensions} max={300} emoji="🧭" />
          <BreakdownBar label="Consistency" value={score.consistency} max={200} emoji="🔥" />
          <BreakdownBar label="Witness" value={score.witness} max={200} emoji="👁️" />
          <BreakdownBar label="Integration" value={score.integration} max={200} emoji="🌀" />
          <BreakdownBar label="Loop Mastery" value={score.loops} max={100} emoji="🔓" />
        </div>
      </motion.div>

      {/* How to improve */}
      <motion.div
        className="glass-card rounded-2xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        <h3 className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/60 mb-3">
          How to Grow Your Score
        </h3>
        <div className="space-y-2">
          {getGrowthTips(score).map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sm mt-0.5">{tip.emoji}</span>
              <p className="text-xs font-body text-muted-foreground leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function getGrowthTips(score: ScoreBreakdown) {
  const tips: { emoji: string; text: string }[] = [];

  if (score.consistency < 100) {
    tips.push({ emoji: "🔥", text: "Build your streak — daily consistency is the fastest way to grow your score." });
  }
  if (score.witness < 80) {
    tips.push({ emoji: "👁️", text: "Practice observation meditation to deepen your witness capacity." });
  }
  if (score.dimensions < 150) {
    tips.push({ emoji: "🧭", text: "Explore all four dimensions — thought, emotion, body, and awareness — not just your strongest." });
  }
  if (score.integration < 80) {
    tips.push({ emoji: "🌀", text: "Journal about how your awareness shows up in daily life to improve integration." });
  }
  if (score.loops < 40) {
    tips.push({ emoji: "🔓", text: "Start naming your loops when they arise — awareness of patterns weakens their grip." });
  }
  if (tips.length === 0) {
    tips.push({ emoji: "✨", text: "You're doing exceptional work. Keep showing up — depth comes with time." });
  }

  return tips.slice(0, 3);
}

// ═══ Main Export ═══
export default function ConsciousnessScore(props: ConsciousnessScoreProps) {
  if (props.variant === "full") return <FullScore {...props} />;
  return <CompactScore {...props} />;
}

export { calculateScore, getTier, type ScoreBreakdown };
