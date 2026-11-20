import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Eye, Layers, Clock, Shield, Flame, Zap, ArrowRight, Activity, AlertCircle, TrendingUp, TrendingDown, CircleDot, Sparkles, Compass } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Progress } from "@/design-system";
import { Badge } from "@/design-system";
import LoopMappingQuestionnaire from "@/components/pre-journey/LoopMappingQuestionnaire";
import { getLoopName } from "@/lib/onboarding/getLoopName";
import { AnimatedPath } from "@/components/animation/AnimatedPath";
import { Reveal } from "@/components/animation/Reveal";

const spring = { type: "spring", stiffness: 300, damping: 30 } as const;

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string; glow: string; icon: typeof Flame; intensityDesc: string }> = {
  dormant: {
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    label: "Dormant",
    glow: "",
    icon: CircleDot,
    intensityDesc: "This loop is sleeping. It exists in your subconscious but isn't actively influencing your behavior right now.",
  },
  mild: {
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    label: "Mild",
    glow: "shadow-[0_0_15px_-3px_hsl(var(--chart-1)/0.2)]",
    icon: Activity,
    intensityDesc: "Subtle whispers. You might notice this pattern occasionally — a slight pull, a familiar thought. Easy to observe and redirect.",
  },
  moderate: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    label: "Moderate",
    glow: "shadow-[0_0_20px_-3px_hsl(var(--chart-4)/0.3)]",
    icon: AlertCircle,
    intensityDesc: "Gaining momentum. This loop is actively coloring your perception. You may catch yourself mid-pattern but feel pulled back.",
  },
  active: {
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    label: "Active",
    glow: "shadow-[0_0_25px_-3px_hsl(var(--primary)/0.25)]",
    icon: Zap,
    intensityDesc: "Running strong. This pattern is driving decisions and emotional reactions. Breaking free requires conscious effort and practice.",
  },
  intense: {
    color: "text-destructive",
    bg: "bg-destructive/15",
    label: "Intense",
    glow: "shadow-[0_0_30px_-3px_hsl(var(--destructive)/0.4)]",
    icon: Flame,
    intensityDesc: "Full activation. This loop has significant hold on your behavior. Deep awareness and sustained practice are needed.",
  },
  strong: {
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    label: "Strong",
    glow: "shadow-[0_0_25px_-3px_hsl(var(--primary)/0.25)]",
    icon: Zap,
    intensityDesc: "Running strong. This pattern is influencing daily choices and needs steady witnessing.",
  },
  dominant: {
    color: "text-destructive",
    bg: "bg-destructive/15",
    label: "Dominant",
    glow: "shadow-[0_0_30px_-3px_hsl(var(--destructive)/0.35)]",
    icon: Flame,
    intensityDesc: "Dominant pattern. It has a strong grip right now, so the work is compassionate witnessing, not force.",
  },
};

const SEVERITY_ORDER = ["dominant", "intense", "strong", "active", "moderate", "mild", "emerging", "dormant"];

function severityRank(severity: string) {
  const rank = SEVERITY_ORDER.indexOf(severity);
  return rank === -1 ? SEVERITY_ORDER.length : rank;
}

function formatRelativeDate(value: string | null | undefined) {
  if (!value) return "during onboarding";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "during onboarding";
  return formatDistanceToNow(date, { addSuffix: true });
}

const LIFECYCLE_STAGES = [
  { label: "Seed", desc: "A deep impression (samskara) lies dormant in the subconscious" },
  { label: "Trigger", desc: "An external event or internal thought activates the pattern" },
  { label: "Rise", desc: "Emotional charge builds — the loop gains energy and momentum" },
  { label: "Peak", desc: "Full activation — automatic behavior takes over" },
  { label: "Aftermath", desc: "The reaction completes, often followed by regret or numbness" },
  { label: "Dormancy", desc: "The loop rests until the next trigger — unless awareness breaks it" },
];

const ESCAPE_STRATEGIES: Record<string, { title: string; steps: string[] }> = {
  dormant: {
    title: "Prevention Mode",
    steps: [
      "Notice the subtle seed — what situations historically trigger this?",
      "Build awareness of early warning signs in body sensations",
      "Practice equanimity meditation to strengthen non-reactivity",
    ],
  },
  mild: {
    title: "Early Catch",
    steps: [
      "Pause when you notice the familiar thought pattern arising",
      "Name it: 'I see this loop wanting to activate'",
      "Take 3 conscious breaths and choose a different response",
      "Journal about what triggered the pattern",
    ],
  },
  moderate: {
    title: "Active Redirection",
    steps: [
      "Stop and feel the pull in your body — where is it?",
      "Ask: 'What am I really avoiding or seeking right now?'",
      "Apply the witness: observe without judging yourself",
      "Replace the automatic behavior with one conscious action",
      "Talk to the Guide about this pattern today",
    ],
  },
  active: {
    title: "Deep Intervention",
    steps: [
      "Acknowledge: this loop has strong momentum right now",
      "Practice body scanning — locate the emotional charge physically",
      "Use inquiry: 'Who would I be without this pattern?'",
      "Commit to one micro-choice against the loop's direction",
      "Seek the root wound beneath — what samskara feeds this?",
      "Be compassionate — this pattern once protected you",
    ],
  },
  intense: {
    title: "Compassionate Surrender",
    steps: [
      "Don't fight it violently — that strengthens the loop",
      "Sit with the intensity as a witness, not a participant",
      "Feel the full energy without acting on it — let it pass through",
      "Ask: 'What is this pattern trying to teach me?'",
      "Ground yourself: feet on floor, 5 things you can see",
      "After the wave passes, journal what you observed",
      "This is your deepest work — each awareness moment weakens the loop",
    ],
  },
};

interface AnalyticsLoop {
  id: string;
  loop_id: string;
  severity: string;
  awareness_score?: number | null;
  first_detected_at?: string | null;
  last_activated_at?: string | null;
  source?: string;
  status?: string;
}

interface AnalyticsSamskara {
  id: string;
  depth?: number | string | null;
  awareness?: number | string | null;
  connected_loop_ids?: string[] | null;
  root_wound?: string | null;
}

interface Props {
  loops: AnalyticsLoop[];
  samskaras: AnalyticsSamskara[];
}

function IntensityMeter({ severity }: { severity: string }) {
  const levels = ["dormant", "mild", "moderate", "active", "intense"];
  const currentIdx = levels.indexOf(severity);

  return (
    <div className="flex items-center gap-1">
      {levels.map((level, i) => {
        const isActive = i <= currentIdx;
        const colors = [
          "bg-muted-foreground/40",
          "bg-blue-400",
          "bg-yellow-400",
          "bg-orange-400",
          "bg-destructive",
        ];
        return (
          <motion.div
            key={level}
            className={`h-2 rounded-full ${isActive ? colors[i] : "bg-muted/30"}`}
            style={{ width: i === currentIdx ? 20 : 12 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ ...spring, delay: i * 0.05 }}
          />
        );
      })}
    </div>
  );
}

function LifecycleTimeline({ severity }: { severity: string }) {
  const levels = ["dormant", "mild", "moderate", "active", "intense"];
  const currentIdx = levels.indexOf(severity);
  // Map severity to lifecycle stage: dormant=0, mild=1, moderate=2, active=3, intense=4→mapped to 0-5
  const activeStage = Math.min(currentIdx + 1, 5);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-display font-semibold text-foreground flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        Loop Lifecycle — Where You Are
      </h4>
      <div className="flex items-center gap-0.5">
        {LIFECYCLE_STAGES.map((stage, i) => {
          const isPast = i < activeStage;
          const isCurrent = i === activeStage;
          return (
            <div key={stage.label} className="flex-1 flex flex-col items-center">
              <motion.div
                className={`w-full h-1.5 rounded-full ${
                  isCurrent
                    ? "bg-primary"
                    : isPast
                    ? "bg-primary/40"
                    : "bg-muted/30"
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ ...spring, delay: i * 0.06 }}
              />
              <span
                className={`text-[8px] mt-1 font-body ${
                  isCurrent ? "text-primary font-semibold" : isPast ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground font-body italic">
        {LIFECYCLE_STAGES[activeStage]?.desc || LIFECYCLE_STAGES[0].desc}
      </p>
    </div>
  );
}

function MultiLoopWarning({ loops }: { loops: AnalyticsLoop[] }) {
  const activeLoops = loops.filter((l) =>
    ["active", "intense", "moderate"].includes(l.severity)
  );
  if (activeLoops.length < 2) return null;

  return (
    <motion.div
      className="glass-card rounded-2xl p-4 border border-destructive/20 bg-destructive/5 space-y-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-destructive/15">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-display font-bold text-foreground">
            Multiple Loops Active ({activeLoops.length})
          </h3>
          <p className="text-[10px] text-muted-foreground font-body">
            Compounding pattern zone detected
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-body leading-relaxed">
        When multiple loops are active simultaneously, they can <span className="text-foreground font-medium">feed each other</span> — 
        creating a compounding effect. One loop triggers another, which intensifies the first. 
        This is normal but requires <span className="text-foreground font-medium">extra awareness</span>.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {activeLoops.map((loop) => {
          const sev = SEVERITY_CONFIG[loop.severity] || SEVERITY_CONFIG.dormant;
          return (
            <Badge
              key={loop.id}
              variant="outline"
              className={`text-[10px] ${sev.color} border-current/20`}
            >
              {getLoopName(loop.loop_id)}
            </Badge>
          );
        })}
      </div>
      <div className="pt-1 space-y-1">
        <p className="text-[10px] font-display font-semibold text-foreground">What to do:</p>
        <ul className="text-[10px] text-muted-foreground font-body space-y-0.5">
          <li className="flex items-start gap-1.5">
            <ArrowRight className="w-2.5 h-2.5 mt-0.5 text-primary shrink-0" />
            Focus on <span className="text-foreground">one loop at a time</span> — start with the most intense
          </li>
          <li className="flex items-start gap-1.5">
            <ArrowRight className="w-2.5 h-2.5 mt-0.5 text-primary shrink-0" />
            Look for the <span className="text-foreground">shared root</span> — often multiple loops stem from one samskara
          </li>
          <li className="flex items-start gap-1.5">
            <ArrowRight className="w-2.5 h-2.5 mt-0.5 text-primary shrink-0" />
            Increase <span className="text-foreground">witness practice</span> — observe the cascade without reacting
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

const FIELD_SEVERITY_COLORS: Record<string, string> = {
  dormant: "hsl(var(--muted-foreground))",
  mild: "hsl(205 80% 62%)",
  moderate: "hsl(48 95% 58%)",
  active: "hsl(26 92% 58%)",
  strong: "hsl(26 92% 58%)",
  intense: "hsl(0 76% 60%)",
  dominant: "hsl(0 76% 60%)",
};

function LoopField({
  loops,
  selected,
  onSelect,
}: {
  loops: AnalyticsLoop[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const fieldLoops = loops.filter((loop) => loop.loop_id).slice(0, 8);

  if (fieldLoops.length === 0) return null;

  return (
    <Reveal>
      <section className="glass-card overflow-hidden rounded-2xl border border-primary/15 p-4" aria-labelledby="loop-field-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="loop-field-title" className="text-sm font-display font-semibold text-foreground">Your pattern field</h3>
            <p className="mt-1 text-[10px] text-muted-foreground/70">
              A visual index of your mapped loops; color reflects recorded intensity.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-border/40 px-2.5 py-1 text-[9px] text-muted-foreground">
            {loops.length} mapped
          </span>
        </div>

        <svg viewBox="0 0 300 150" className="mt-3 h-36 w-full" aria-hidden="true">
          <circle cx="150" cy="75" r="52" fill="none" stroke="hsl(var(--border) / 0.45)" strokeDasharray="2 5" />
          <circle cx="150" cy="75" r="32" fill="hsl(var(--primary) / 0.06)" stroke="hsl(var(--primary) / 0.28)" />
          <circle cx="150" cy="75" r="4" fill="hsl(var(--primary))" />
          {fieldLoops.map((loop, index) => {
            const angle = (index / fieldLoops.length) * Math.PI * 2 - Math.PI / 2;
            const x = 150 + Math.cos(angle) * 52;
            const y = 75 + Math.sin(angle) * 52;
            const color = FIELD_SEVERITY_COLORS[loop.severity] ?? FIELD_SEVERITY_COLORS.dormant;
            const id = String(loop.id ?? loop.loop_id);
            return (
              <React.Fragment key={id}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={selected === id ? 6 : 4.5}
                  fill={color}
                  stroke={selected === id ? "hsl(var(--foreground))" : "hsl(var(--background))"}
                  strokeWidth="1.5"
                  initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                  animate={reduceMotion
                    ? { scale: 1, opacity: 1 }
                    : { scale: [1, 1.12, 1], opacity: [0.72, 1, 0.72] }}
                  transition={reduceMotion
                    ? { duration: 0 }
                    : { delay: index * 0.08, duration: 2.8 + (index % 3) * 0.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </React.Fragment>
            );
          })}
          <text x="150" y="72" textAnchor="middle" className="fill-foreground" fontSize="8" fontWeight="600">
            PATTERNS
          </text>
          <text x="150" y="84" textAnchor="middle" className="fill-muted-foreground" fontSize="6">
            {fieldLoops.length} shown
          </text>
          <AnimatedPath
            d="M 150 23 A 52 52 0 1 1 149.9 23"
            fill="none"
            stroke="hsl(var(--primary) / 0.28)"
            strokeWidth="0.8"
            duration={1.1}
          />
        </svg>

        <div className="flex flex-wrap gap-1.5">
          {fieldLoops.map((loop) => {
            const id = String(loop.id ?? loop.loop_id);
            const isSelected = selected === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(isSelected ? "" : id)}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  isSelected ? "border-primary/50 bg-primary/10 text-foreground" : "border-border/35 bg-background/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: FIELD_SEVERITY_COLORS[loop.severity] ?? FIELD_SEVERITY_COLORS.dormant }} aria-hidden />
                <span className="truncate">{getLoopName(loop.loop_id)}</span>
              </button>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}

export function LoopsLayer({ loops, samskaras }: Props) {
  const sortedLoops = [...loops].sort((a, b) => {
    return severityRank(a.severity) - severityRank(b.severity);
  });

  const [expandedLoop, setExpandedLoop] = React.useState<string | null>(null);
  const [showMapper, setShowMapper] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring}>
        <h2 className="text-lg font-display font-bold text-foreground">Your Loops</h2>
        <p className="text-sm text-muted-foreground font-body">
          Recurring patterns, their intensity, and how to work with them
        </p>
      </motion.div>

      {/* Map your loops CTA */}
      <motion.button
        onClick={() => setShowMapper(true)}
        className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left border border-primary/20 hover:border-primary/40 transition-all"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.04 }}
      >
        <div className="p-2 rounded-xl bg-primary/10">
          <Compass className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display font-semibold text-foreground">Map your loops</p>
          <p className="text-[11px] text-muted-foreground font-body">Tell the Mirror which loops run you — intensity, triggers, connections</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </motion.button>

      {showMapper && (
        <LoopMappingQuestionnaire
          onClose={() => setShowMapper(false)}
          onComplete={() => setShowMapper(false)}
        />
      )}

      {/* How Loops Work — Intro */}
      <motion.div
        className="glass-card rounded-2xl p-4 space-y-3 border border-primary/10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-display font-semibold text-foreground">How Loops Work</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground font-body">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[9px] font-bold text-foreground">1</span>
            </div>
            <p><span className="text-foreground font-medium">Loops are born from samskaras</span> — deep impressions stored in the subconscious from past experiences</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[9px] font-bold text-foreground">2</span>
            </div>
            <p><span className="text-foreground font-medium">A trigger activates the loop</span> — a situation, word, or feeling that matches the original impression</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[9px] font-bold text-foreground">3</span>
            </div>
            <p><span className="text-foreground font-medium">Intensity builds through repetition</span> — each unconscious cycle strengthens the neural pathway</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[9px] font-bold text-primary">✦</span>
            </div>
            <p><span className="text-primary font-medium">Awareness breaks the loop</span> — each moment of witnessing weakens the automatic pattern</p>
          </div>
        </div>
      </motion.div>

      {/* Multi-loop warning */}
      <MultiLoopWarning loops={sortedLoops} />

      <LoopField
        loops={sortedLoops}
        selected={expandedLoop}
        onSelect={(id) => setExpandedLoop(id || null)}
      />

      {/* Loop Cards */}
      {sortedLoops.length > 0 ? (
        <div className="space-y-3">
          {sortedLoops.map((loop, i) => {
            const sev = SEVERITY_CONFIG[loop.severity] || SEVERITY_CONFIG.dormant;
            const awareness = Number(loop.awareness_score) || 0;
            const isExpanded = expandedLoop === loop.id;
            const SevIcon = sev.icon;
            const escape = ESCAPE_STRATEGIES[loop.severity] || ESCAPE_STRATEGIES.dormant;

            return (
              <motion.div
                key={loop.id}
                className={`glass-card rounded-2xl overflow-hidden ${sev.glow} transition-shadow`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: i * 0.06 }}
              >
                {/* Main card */}
                <button
                  onClick={() => setExpandedLoop(isExpanded ? null : loop.id)}
                  className="w-full text-left p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${sev.bg}`}>
                        <SevIcon className={`w-3.5 h-3.5 ${sev.color}`} />
                      </div>
                      <span className="text-sm font-display font-medium text-foreground">
                        {loop.loop_id ? getLoopName(loop.loop_id) : "Unknown Loop"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IntensityMeter severity={loop.severity} />
                      <Badge variant="outline" className={`text-[9px] ${sev.color} border-current/20`}>
                        {sev.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Intensity description */}
                  <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                    {sev.intensityDesc}
                  </p>

                  {/* Awareness bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-body">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Your Awareness of This Loop
                      </span>
                      <span className="text-foreground font-medium">{Math.round(awareness * 10)}%</span>
                    </div>
                    <Progress value={awareness * 10} className="h-1.5" />
                    <p className="text-[9px] text-muted-foreground/70 font-body">
                      {awareness < 3
                        ? "Low awareness — this loop mostly runs on autopilot"
                        : awareness < 6
                        ? "Growing awareness — you're starting to catch this pattern"
                        : awareness < 8
                        ? "Good awareness — you can see it arising before it takes hold"
                        : "High awareness — you can witness this loop without getting caught"}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground font-body">
                    <Clock className="w-3 h-3" />
                    <span>
                      Detected{" "}
                      {formatRelativeDate(loop.first_detected_at)}
                    </span>
                    {loop.last_activated_at && (
                      <span>
                        • Last active{" "}
                        {formatRelativeDate(loop.last_activated_at)}
                      </span>
                    )}
                    {loop.source === "onboarding" && <Badge variant="secondary" className="text-[9px]">Onboarding</Badge>}
                  </div>

                  <div className="text-[9px] text-primary/60 font-body text-center pt-1">
                    {isExpanded ? "Tap to collapse" : "Tap to see lifecycle & escape strategies →"}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <motion.div
                    className="border-t border-border/30 p-4 space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Lifecycle */}
                    <LifecycleTimeline severity={loop.severity} />

                    {/* What happens when activated */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-display font-semibold text-foreground flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-orange-400" />
                        When This Loop Activates
                      </h4>
                      <div className="grid gap-1.5">
                        {[
                          { label: "Perception narrows", desc: "You see the world through this pattern's lens" },
                          { label: "Emotional charge", desc: "Strong feelings arise that feel 'justified' and urgent" },
                          { label: "Automatic behavior", desc: "You react before you realize — the loop drives action" },
                          { label: "Confirmation bias", desc: "You unconsciously seek evidence that supports the loop" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-start gap-2 text-[10px]">
                            <TrendingDown className="w-3 h-3 text-destructive/60 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-foreground font-medium">{item.label}</span>
                              <span className="text-muted-foreground"> — {item.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Escape Strategy */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-display font-semibold text-foreground flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-chart-2" />
                        {escape.title} — How to Break Free
                      </h4>
                      <ol className="space-y-1.5">
                        {escape.steps.map((step, si) => (
                          <motion.li
                            key={si}
                            className="flex items-start gap-2 text-[10px]"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: si * 0.05 }}
                          >
                            <span className="w-4 h-4 rounded-full bg-chart-2/15 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[8px] font-bold text-chart-2">{si + 1}</span>
                            </span>
                            <span className="text-muted-foreground font-body leading-relaxed">{step}</span>
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          className="glass-card rounded-2xl p-8 text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={spring}
        >
          <Eye className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground font-body">
            No loops detected yet. Continue your practice and the engine will identify patterns.
          </p>
          <p className="text-xs text-muted-foreground/60 font-body">
            Loops emerge from journal entries, guide conversations, and observation tasks.
          </p>
        </motion.div>
      )}

      {/* Samskara Clusters */}
      {samskaras.length > 0 && (
        <>
          <motion.div
            className="space-y-1 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground text-sm">Samskara Clusters</h3>
                <p className="text-[10px] text-muted-foreground font-body">
                  Deep root imprints — the seeds from which loops grow
                </p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {samskaras.map((sam, i) => {
              const depthVal = Number(sam.depth) || 0;
              const awarenessVal = Number(sam.awareness) || 0;
              const connectedLoopCount = Array.isArray(sam.connected_loop_ids)
                ? sam.connected_loop_ids.length
                : 0;

              return (
                <motion.div
                  key={sam.id}
                  className="glass-card rounded-2xl p-4 space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.35 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-display font-medium text-foreground capitalize">
                      {sam.root_wound?.replace(/_/g, " ") || "Unknown Wound"}
                    </p>
                    {connectedLoopCount > 0 && (
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">
                        Feeds {connectedLoopCount} loop{connectedLoopCount > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-body">
                        <span>Depth</span>
                        <span className="text-foreground font-medium">{depthVal.toFixed(1)}/10</span>
                      </div>
                      <Progress value={depthVal * 10} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-body">
                        <span>Awareness</span>
                        <span className="text-foreground font-medium">{Math.round(awarenessVal * 10)}%</span>
                      </div>
                      <Progress value={awarenessVal * 10} className="h-1" />
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground/70 font-body italic">
                    {depthVal > 7
                      ? "Very deep imprint — this wound shapes many of your automatic responses"
                      : depthVal > 4
                      ? "Moderate depth — this pattern has roots but can be transformed with consistent awareness"
                      : "Surface level — this imprint is accessible and workable through daily practice"}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
