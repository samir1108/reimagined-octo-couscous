"use client";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Zap, Clock, Target, Sparkles, TrendingUp } from "lucide-react";

interface DayMissionTimelineProps {
  mission: {
    date: string;
    wakeTime: string;
    sleepTime: string;
    theme: string;
    intention: string;
    vLevel: number;
    blocks: Array<{
      gate: "morning" | "midday" | "evening" | "night";
      label: string;
      icon: string;
      startTime: string;
      endTime: string;
      session?: {
        id: string;
        completed: boolean;
        title?: string;
        duration?: number;
        quality?: number;
        status?: string;
      };
      recommended?: {
        practice: string;
        duration: number;
        reason: string;
      };
      isCurrent: boolean;
      isPast: boolean;
    }>;
    arc?: {
      title: string;
      day: number;
      total: number;
      phase: string;
    } | null;
    adaptiveInsight?: {
      type: "loop" | "dimension" | "arc" | "celebration" | "crisis";
      message: string;
      action?: string;
    } | null;
    completionRate: number;
    totalSessions: number;
    totalMinutes: number;
  } | null;
  isLoading: boolean;
  onQuickStart: (gate: string) => void;
  onViewSession: (sessionId: string) => void;
  className?: string;
}

const gateColors = {
  morning: "from-amber to-orange",
  midday: "from-yellow to-amber",
  evening: "from-blue to-indigo",
  night: "from-indigo to-purple",
};

export function DayMissionTimeline({
  mission,
  isLoading,
  onQuickStart,
  onViewSession,
  className = "",
}: DayMissionTimelineProps) {
  const reducedMotion = useReducedMotion();

  if (isLoading) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        className={`w-full max-w-2xl mx-auto bg-background/30 backdrop-blur-md border border-border/30 rounded-3xl p-6 ${className}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="animate-pulse h-6 w-32 bg-muted rounded" />
          <div className="animate-pulse h-4 w-20 bg-muted rounded ml-auto" />
        </div>
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <motion.div key={i} initial={reducedMotion ? {} : { opacity: 0, x: -20 }} animate={reducedMotion ? {} : { opacity: 1, x: 0 }} className="animate-pulse h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!mission) return null;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: -20 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      {/* Mission Header */}
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
            {mission.date}
          </span>
          <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-full">
            V-Level {mission.vLevel?.toFixed(1) || "—"}
          </span>
          {mission.arc && (
            <span className="px-3 py-1 bg-amber/20 text-amber text-xs font-medium rounded-full">
              Arc: Day {mission.arc.day}/{mission.arc.total} · {mission.arc.phase}
            </span>
          )}
        </div>
        
        <h1 className="text-2xl md:text-3xl font-display font-medium text-foreground mb-2">
          {mission.theme}
        </h1>
        <p className="text-muted-foreground/80 max-w-xl mx-auto">
          {mission.intention}
        </p>

        {/* Progress bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Wake: {mission.wakeTime}</span>
            <span>Sleep: {mission.sleepTime}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={reducedMotion ? {} : { width: 0 }}
              animate={reducedMotion ? {} : { width: `${mission.completionRate * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {Math.round(mission.completionRate * 100)}% complete · {mission.totalSessions} sessions · {mission.totalMinutes} min
          </p>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0 }}
        animate={reducedMotion ? {} : { opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        {/* Timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/30 -translate-x-1/2" />
        
        {mission.blocks.map((block, idx) => (
          <TimelineBlock
            key={block.gate}
            block={block}
            index={idx}
            total={mission.blocks.length}
            reducedMotion={reducedMotion}
            onQuickStart={onQuickStart}
            onViewSession={onViewSession}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface TimelineBlockProps {
  block: {
    gate: "morning" | "midday" | "evening" | "night";
    label: string;
    icon: string;
    startTime: string;
    endTime: string;
    session?: {
      id: string;
      completed: boolean;
      title?: string;
      duration?: number;
      quality?: number;
      status?: string;
    };
    recommended?: {
      practice: string;
      duration: number;
      reason: string;
    };
    isCurrent: boolean;
    isPast: boolean;
  };
  index: number;
  total: number;
  reducedMotion: boolean;
  onQuickStart: (gate: string) => void;
  onViewSession: (sessionId: string) => void;
}

function TimelineBlock({
  block,
  index,
  total,
  reducedMotion,
  onQuickStart,
  onViewSession,
}: TimelineBlockProps) {
  const isLast = index === total - 1;
  const isEven = index % 2 === 0;
  const gateColor = {
    morning: "bg-amber/20 border-amber/30",
    midday: "bg-yellow/20 border-yellow/30",
    evening: "bg-blue/20 border-blue/30",
    night: "bg-indigo/20 border-indigo/30",
  }[block.gate];

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, x: isEven ? -30 : 30 }}
      animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="relative mb-4 flex items-start"
      style={{ 
        flexDirection: isEven ? "row" : "row-reverse",
        paddingRight: isEven ? "52%" : "0",
        paddingLeft: isEven ? "0" : "52%",
      }}
    >
      {/* Timeline dot & connector */}
      <div className="absolute left-1/2 top-2 w-4 h-4 -translate-x-1/2 rounded-full border-2 z-10 flex-shrink-0"
        style={{
          backgroundColor: block.session?.completed ? "hsl(var(--primary))" : 
            block.isCurrent ? "hsl(var(--accent))" : 
            block.isPast ? "hsl(var(--muted))" : "hsl(var(--background))",
          borderColor: block.isCurrent ? "hsl(var(--accent))" : 
            block.session?.completed ? "hsl(var(--primary))" : 
            block.isPast ? "hsl(var(--muted))" : "hsl(var(--border))",
        }}
      >
        {block.session?.completed && (
          <CheckCircle2 className="w-3 h-3 text-primary-foreground absolute inset-0 m-auto" />
        )}
        {block.isCurrent && !block.session?.completed && (
          <Zap className="w-3 h-3 text-accent absolute inset-0 m-auto animate-pulse" />
        )}
      </div>

      {/* Block card */}
      <div className={`w-[48%] ${isEven ? "text-right pr-4" : "pl-4"}`}>
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index + 0.2 }}
          className={`bg-background/40 backdrop-blur-md border rounded-2xl p-4 transition-all ${
            block.isCurrent 
              ? "border-accent/50 shadow-lg shadow-accent/10 ring-1 ring-accent/20" 
              : block.isPast 
                ? "border-border/30" 
                : "border-border/20 opacity-70"
          } ${gateColor}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" role="img" aria-hidden="true">{block.icon}</span>
            <span className="font-display font-medium text-foreground">{block.label}</span>
            {block.isCurrent && (
              <motion.span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full animate-pulse">
                NOW
              </motion.span>
            )}
            {block.session?.completed && (
              <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground mb-3">
            {block.startTime} — {block.endTime}
          </div>

          {block.session ? (
            <div 
              onClick={() => onViewSession(block.session!.id)}
              className="p-3 bg-primary/10 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-primary text-sm">{block.session.title || "Session"}</p>
                {block.session.quality !== undefined && (
                  <span className="text-xs font-medium text-green">
                    {Math.round(block.session.quality * 100)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {block.session.duration} min · {block.session.status || "active"}
              </p>
            </div>
          ) : block.recommended ? (
            <div 
              onClick={() => onQuickStart(block.gate)}
              className="p-3 bg-muted/50 border border-border/30 rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <p className="font-medium text-sm text-foreground">Suggested: {block.recommended.practice}</p>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                ~{block.recommended.duration} min · {block.recommended.reason}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-muted/30 border border-border/20 rounded-xl text-center">
              <p className="text-xs text-muted-foreground">No session scheduled</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Connector line for last item */}
      {!isLast && (
        <div className="absolute left-1/2 top-6 bottom-[-4px] w-px bg-border/30 -translate-x-1/2" />
      )}
    </motion.div>
  );
}