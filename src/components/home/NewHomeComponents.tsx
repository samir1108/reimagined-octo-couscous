"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, Award, Sun, Moon, Star, ArrowRight, ChevronRight, CheckCircle, Circle, Target, BookOpen, Brain, Heart, Zap, Eye, Leaf, Compass, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/design-system";
import { Card, CardContent } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { Separator } from "@/design-system";
import { Badge } from "@/design-system";
import { Progress } from "@/design-system";

export function HomeHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full mb-8">
      {children}
    </div>
  );
}

export function HomeGreeting({ greeting, subGreeting, date }: { greeting: string; subGreeting: string; date: string }) {
  return (
    <div className="text-center mb-6">
      <p className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/50 mb-1">
        {date}
      </p>
      <h1 className="text-[28px] sm:text-[36px] font-editorial font-medium leading-tight tracking-tight text-foreground mb-2">
        {greeting}
      </h1>
      <p className="text-sm text-muted-foreground/70 max-w-md mx-auto leading-relaxed">
        {subGreeting}
      </p>
    </div>
  );
}

export function HomeStats({ streak, karma, journeyDay, totalSessions }: { streak: number; karma: number; journeyDay: number; totalSessions: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-8">
      <StatItem
        icon={<Flame className="w-4 h-4" />}
        value={streak}
        label="Day Streak"
        accent="text-primary"
      />
      <StatItem
        icon={<Award className="w-4 h-4" />}
        value={karma}
        label="Karma"
        accent="text-amber-400"
      />
      <StatItem
        icon={<Sun className="w-4 h-4" />}
        value={journeyDay}
        label="Journey Day"
        accent="text-orange-400"
      />
      <StatItem
        icon={<Star className="w-4 h-4" />}
        value={totalSessions}
        label="Total Sessions"
        accent="text-primary"
      />
    </div>
  );
}

function StatItem({ icon, value, label, accent }: { icon: React.ReactNode; value: number; label: string; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-2">
      <div className={`flex items-center gap-1.5 ${accent}`}>
        {icon}
        <span className="text-lg font-medium tabular-nums">{value}</span>
      </div>
      <span className="text-[10px] font-display tracking-[0.15em] uppercase text-muted-foreground/50">
        {label}
      </span>
    </div>
  );
}

export function OversoulExperience({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-10">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[280px] h-[280px] rounded-full bg-gradient-to-r from-primary/10 via-transparent to-primary/5 blur-3xl animate-pulse-slow" />
      </div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

export function QuickActions({ onAction }: { onAction: () => void }) {
  const actions = [
    { id: "observe", label: "Observe", icon: Eye, description: "Witness what arises" },
    { id: "journal", label: "Journal", icon: BookOpen, description: "Capture your reflections" },
    { id: "companion", label: "Ask Companion", icon: Brain, description: "Explore with AI guide" },
    { id: "breathe", label: "Breathe", icon: Leaf, description: "Anchor in breath" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <QuickActionButton
            key={action.id}
            icon={action.icon}
            label={action.label}
            description={action.description}
            onClick={action.id === "observe" ? onAction : () => {}}
            disabled={action.id !== "observe"}
          />
        ))}
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, description, onClick, disabled = false }: { icon: React.ComponentType<{ className?: string }>; label: string; description: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      variant="ghost"
      className="flex flex-col items-center gap-2 p-4 h-auto min-h-[100px] text-left transition-all hover:scale-[1.02]"
      onClick={onClick}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground/50 text-center">{description}</span>
    </Button>
  );
}

interface Mission {
  id: string;
  title: string;
  description: string;
  why: string;
  when: string;
  observe: string;
  discover: string;
  type: "observation" | "practice" | "reflection";
  completed: boolean;
}

interface WisdomTeaching {
  title: string;
  source: string;
  teaching: string;
  practicalInterpretation: string;
  realLifeApplication: string;
  relatedPractices: string[];
  sourceText: string;
}

export function DailyGate({
  dayNumber,
  themeTitle,
  themeDescription,
  currentDepth,
  maxDepth,
  evolutionStatus,
  missions,
  wisdomTeaching,
}: {
  dayNumber: number;
  themeTitle: string;
  themeDescription: string;
  currentDepth: number;
  maxDepth: number;
  evolutionStatus: string;
  missions: Mission[];
  wisdomTeaching: WisdomTeaching;
}) {
  const typeIcons = {
    observation: Eye,
    practice: Leaf,
    reflection: BookOpen,
  };

  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="daily-gate-heading">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 id="daily-gate-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary">
            Today's Gate · Day {dayNumber}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-display tracking-wider">
              {evolutionStatus}
            </span>
            <span className="text-[10px] font-display tracking-wider">Layer {currentDepth} of {maxDepth}</span>
          </div>
        </div>
        <h3 className="text-[22px] sm:text-[28px] font-editorial font-medium leading-tight tracking-tight text-foreground mb-2">
          {themeTitle}
        </h3>
        {themeDescription && (
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            {themeDescription}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {missions.map((mission, index) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={index + 1}
            Icon={typeIcons[mission.type] || Target}
          />
        ))}
      </div>

      <Separator className="my-6 border-border/30" />

      <WisdomCard teaching={wisdomTeaching} />
    </section>
  );
}

function MissionCard({ mission, index, Icon }: { mission: Mission; index: number; Icon: React.ComponentType<{ className?: string }> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/30"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70">
                Mission {index}
              </span>
              <h4 className="text-base font-medium text-foreground">{mission.title}</h4>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse mission details" : "Expand mission details"}
            >
              <ChevronRight className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground/80 leading-relaxed mb-3">{mission.description}</p>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2 border-t border-border/30"
              >
                <DetailRow label="Why it matters" value={mission.why} />
                <DetailRow label="When to do it" value={mission.when} />
                <DetailRow label="What to observe" value={mission.observe} />
                <DetailRow label="What you may discover" value={mission.discover} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 text-sm">
      <span className="text-[10px] font-display tracking-[0.1em] uppercase text-muted-foreground/50 w-32 sm:w-auto flex-shrink-0">
        {label}
      </span>
      <span className="text-muted-foreground/80 leading-relaxed">{value}</span>
    </div>
  );
}

function WisdomCard({ teaching }: { teaching: WisdomTeaching }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary/70" />
          <span className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70">
            Wisdom for Your Life
          </span>
        </div>
        <h4 className="text-lg font-editorial font-medium text-foreground mb-2">{teaching.title}</h4>
        <p className="text-sm text-muted-foreground/70 leading-relaxed mb-3 italic">"{teaching.teaching}"</p>
        <p className="text-[10px] font-display tracking-[0.1em] uppercase text-primary/50 mb-1">Source</p>
        <p className="text-sm text-muted-foreground/60 mb-4">{teaching.source}</p>
        <p className="text-sm text-muted-foreground/80 leading-relaxed mb-4">{teaching.practicalInterpretation}</p>
        <div className="pt-3 border-t border-primary/10">
          <p className="text-[10px] font-display tracking-[0.1em] uppercase text-primary/50 mb-2">Real-life application</p>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">{teaching.realLifeApplication}</p>
        </div>
      </div>
    </div>
  );
}

interface CompanionInsight {
  id: string;
  type: "pattern" | "milestone" | "observation";
  title: string;
  description: string;
  actions: Array<{ label: string; action: string; data: any }>;
  confidence: "low" | "medium" | "high" | "certain";
  basedOn: string[];
}

export function CompanionInsight({ insights, onAction }: { insights: CompanionInsight[]; onAction: (action: { label: string; action: string; data: any }) => void }) {
  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="companion-heading">
      <h2 id="companion-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary mb-4">
        Your Companion
      </h2>
      <div className="space-y-4">
        {insights.map((insight) => (
          <CompanionInsightCard key={insight.id} insight={insight} onAction={onAction} />
        ))}
      </div>
    </section>
  );
}

function CompanionInsightCard({ insight, onAction }: { insight: CompanionInsight; onAction: (action: { label: string; action: string; data: any }) => void }) {
  const typeIcons = {
    pattern: Brain,
    milestone: Award,
    observation: Eye,
  };
  const Icon = typeIcons[insight.type];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/30">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h4 className="text-base font-medium text-foreground">{insight.title}</h4>
            <Badge variant="outline" className="text-[9px] font-display tracking-wider">
              {insight.confidence}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground/80 leading-relaxed mb-4">{insight.description}</p>
          <div className="flex flex-wrap gap-2">
            {insight.actions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-[10px] font-display tracking-[0.1em] uppercase text-muted-foreground/40">
            Based on: {insight.basedOn.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}

interface RadarCategory {
  id: string;
  label: string;
  value: string;
  trend: string;
  details: string;
  action: { label: string; action: string; data: any };
}

export function DailyRadar({ categories, onAction }: { categories: RadarCategory[]; onAction: (action: { label: string; action: string; data: any }) => void }) {
  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="radar-heading">
      <h2 id="radar-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary mb-4">
        Your Daily Radar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((category) => (
          <RadarCard key={category.id} category={category} onAction={onAction} />
        ))}
      </div>
    </section>
  );
}

function RadarCard({ category, onAction }: { category: RadarCategory; onAction: (action: { label: string; action: string; data: any }) => void }) {
  const trendColors = {
    stable: "text-green-400",
    "active loops": "text-amber-400",
    "attention needed": "text-red-400",
    monitoring: "text-muted-foreground",
    evolving: "text-blue-400",
    consistent: "text-green-400",
    dormant: "text-muted-foreground",
    deepening: "text-purple-400",
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 transition-all hover:border-primary/30">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-foreground">{category.label}</h4>
        <span className={cn("text-[10px] font-display tracking-wider", trendColors[category.trend as keyof typeof trendColors] || "text-muted-foreground")}>
          {category.trend}
        </span>
      </div>
      <p className="text-lg font-medium text-foreground mb-1">{category.value}</p>
      <p className="text-[11px] text-muted-foreground/60 mb-3">{category.details}</p>
      <Button
        variant="ghost"
        size="sm"
        className="w-full h-8 text-xs justify-start gap-2"
        onClick={() => onAction(category.action)}
      >
        {category.action.label}
        <ArrowRight className="w-3 h-3" />
      </Button>
    </div>
  );
}

interface ContinueJourneyData {
  lastSessionContext: string;
  lastDiscovery: string;
  relatedPractice: string;
  continueLabel: string;
}

export function ContinueJourney({ data, onContinue }: { data: ContinueJourneyData; onContinue: () => void }) {
  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="continue-heading">
      <h2 id="continue-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary mb-4">
        Continue Your Journey
      </h2>
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70 mb-1">Your Last Exploration</p>
          <p className="text-sm text-muted-foreground/60 mb-3">{data.lastSessionContext}</p>
          <p className="text-base font-medium text-foreground mb-3 italic">"{data.lastDiscovery}"</p>
          <p className="text-sm text-muted-foreground/70 mb-4">
            Related practice: <span className="text-foreground">{data.relatedPractice}</span>
          </p>
          <Button onClick={onContinue} className="w-full sm:w-auto">
            {data.continueLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

interface Pattern {
  id: string;
  title: string;
  description: string;
  severity: number;
  category: string;
  actions: Array<{ label: string; action: string; data: any }>;
}

export function PatternIntelligence({ patterns, onAction }: { patterns: Pattern[]; onAction: (action: { label: string; action: string; data: any }) => void }) {
  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="patterns-heading">
      <h2 id="patterns-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary mb-4">
        Patterns & Loops
      </h2>
      <div className="space-y-4">
        {patterns.map((pattern) => (
          <PatternCard key={pattern.id} pattern={pattern} onAction={onAction} />
        ))}
      </div>
    </section>
  );
}

function PatternCard({ pattern, onAction }: { pattern: Pattern; onAction: (action: { label: string; action: string; data: any }) => void }) {
  const severityColor = pattern.severity > 70 ? "text-red-400" : pattern.severity > 40 ? "text-amber-400" : "text-green-400";

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/30">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h4 className="text-base font-medium text-foreground">{pattern.title}</h4>
          <p className="text-sm text-muted-foreground/70 mt-1">{pattern.description}</p>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div className={cn("text-lg font-mono tabular-nums", severityColor)}>
            {pattern.severity}
          </div>
          <span className="text-[10px] font-display tracking-wider text-muted-foreground/50">/100</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {pattern.actions.map((action, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => onAction(action)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

interface LifeDimension {
  id: string;
  label: string;
  icon: string;
  score: number | null;
  hasReflections: boolean;
  hasPatterns: boolean;
  hasPractices: boolean;
  hasGoals: boolean;
}

export function LifeMap({ dimensions }: { dimensions: LifeDimension[] }) {
  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="lifemap-heading">
      <h2 id="lifemap-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary mb-4">
        Life Map
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {dimensions.map((dim) => (
          <LifeDimensionCard key={dim.id} dimension={dim} />
        ))}
      </div>
    </section>
  );
}

function LifeDimensionCard({ dimension }: { dimension: LifeDimension }) {
  const scoreColor = dimension.score !== null
    ? dimension.score >= 70 ? "text-green-400" : dimension.score >= 40 ? "text-amber-400" : "text-red-400"
    : "text-muted-foreground/40";

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 transition-all hover:border-primary/30 group">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{dimension.icon}</span>
        <h4 className="text-sm font-medium text-foreground flex-1 truncate">{dimension.label}</h4>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn("text-2xl font-mono tabular-nums font-medium", scoreColor)}>
          {dimension.score !== null ? dimension.score : "—"}
        </span>
        {dimension.score !== null && <span className="text-muted-foreground/40">/100</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <DimensionTag active={dimension.hasReflections} label="Reflections" />
        <DimensionTag active={dimension.hasPatterns} label="Patterns" />
        <DimensionTag active={dimension.hasPractices} label="Practices" />
        <DimensionTag active={dimension.hasGoals} label="Goals" />
      </div>
    </div>
  );
}

function DimensionTag({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={cn(
      "text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full",
      active
        ? "bg-primary/10 text-primary/70"
        : "bg-muted/30 text-muted-foreground/40"
    )}>
      {label}
    </span>
  );
}

interface WisdomData {
  title: string;
  source: string;
  teaching: string;
  practicalInterpretation: string;
  realLifeApplication: string;
  relatedPractices: string[];
  sourceText: string;
}

export function WisdomEngine({ data, onExplore }: { data: WisdomData; onExplore: () => void }) {
  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="wisdom-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="wisdom-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary">
          Wisdom for Your Life
        </h2>
        <Button variant="ghost" size="sm" onClick={onExplore}>
          Explore all
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary/70" />
            <span className="text-[10px] font-display tracking-[0.15em] uppercase text-primary/70">
              Today's Teaching
            </span>
          </div>
          <h3 className="text-lg font-editorial font-medium text-foreground mb-2">{data.title}</h3>
          <p className="text-sm text-muted-foreground/70 leading-relaxed mb-3 italic">"{data.teaching}"</p>
          <p className="text-[10px] font-display tracking-[0.1em] uppercase text-primary/50 mb-1">Source</p>
          <p className="text-sm text-muted-foreground/60 mb-4">{data.source}</p>
          <p className="text-sm text-muted-foreground/80 leading-relaxed mb-4">{data.practicalInterpretation}</p>
          <div className="pt-3 border-t border-primary/10">
            <p className="text-[10px] font-display tracking-[0.1em] uppercase text-primary/50 mb-2">Real-life application</p>
            <p className="text-sm text-muted-foreground/70 leading-relaxed">{data.realLifeApplication}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface EvolutionData {
  sessionsCompleted: number;
  personalDiscoveries: number;
  consistency: string;
  practicesExplored: number;
  reflectionHistory: number;
  journeyMilestones: Array<{ day: number; label: string }>;
  dimensionChanges: any[];
}

export function EvolutionOverview({ data }: { data: EvolutionData }) {
  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="evolution-heading">
      <h2 id="evolution-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary mb-4">
        Your Evolution
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <EvolutionStat label="Sessions" value={data.sessionsCompleted} icon={<Star className="w-5 h-5" />} />
        <EvolutionStat label="Discoveries" value={data.personalDiscoveries} icon={<Sparkles className="w-5 h-5" />} />
        <EvolutionStat label="Practices" value={data.practicesExplored} icon={<Leaf className="w-5 h-5" />} />
        <EvolutionStat label="Consistency" value={data.consistency} icon={<TrendingUp className="w-5 h-5" />} />
      </div>
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Journey Milestones</h3>
        <div className="space-y-3">
          {data.journeyMilestones.map((milestone) => (
            <MilestoneItem key={milestone.day} milestone={milestone} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EvolutionStat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-primary mb-2">
        {icon}
      </div>
      <p className="text-2xl font-mono font-medium tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] font-display tracking-[0.15em] uppercase text-muted-foreground/50">{label}</p>
    </div>
  );
}

function MilestoneItem({ milestone }: { milestone: { day: number; label: string } }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{milestone.label}</p>
        <p className="text-[10px] font-display tracking-wider text-muted-foreground/50">Day {milestone.day}</p>
      </div>
      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
    </div>
  );
}

interface TimelineEvent {
  date: string;
  type: "session" | "discovery" | "milestone" | "reflection";
  title: string;
  description: string;
  milestone: boolean;
}

export function PersonalTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section className="w-full max-w-5xl mx-auto mb-10" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="text-[14px] font-display tracking-[0.2em] uppercase text-primary mb-4">
        Personal Timeline
      </h2>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/30" />
        <div className="space-y-6 pl-14">
          {events.slice(-10).reverse().map((event, index) => (
            <TimelineItem key={`${event.date}-${index}`} event={event} index={index} />
          ))}
          {events.length === 0 && (
            <div className="text-center py-12 text-muted-foreground/50">
              <p>Your timeline begins with your first session.</p>
              <p className="text-sm mt-2">Hold the orb to start your journey.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const typeIcons = {
    session: Sun,
    discovery: Sparkles,
    milestone: Award,
    reflection: BookOpen,
  };
  const Icon = typeIcons[event.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      <div className="absolute left-[-14px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
      <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 transition-all hover:border-primary/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
              <span className="text-[10px] font-display tracking-wider text-muted-foreground/50">
                {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground/70">{event.description}</p>
            {event.milestone && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-display tracking-wider">
                Milestone
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState } from "react";