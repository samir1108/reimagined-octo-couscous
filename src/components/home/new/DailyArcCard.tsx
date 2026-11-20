"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Layers, ChevronDown, Target, TrendingUp, Sparkles, Moon, Sun, Calendar } from "lucide-react";
import { CountUp } from "@/design-system";

interface DailyArcCardProps {
  arc: {
    title: string;
    day: number;
    total: number;
    phase: string;
  } | null;
  onEnterTemple: () => void;
  onViewConstellation: () => void;
  onViewArcJournal: () => void;
  onPauseArc: () => void;
  className?: string;
}

export function DailyArcCard({
  arc,
  onEnterTemple,
  onViewConstellation,
  onViewArcJournal,
  onPauseArc,
  className = "",
}: DailyArcCardProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);

  if (!arc) return null;

  const progress = arc.day / arc.total;
  const phaseColors = {
    ground: "from-amber to-orange",
    deepen: "from-blue to-indigo",
    integrate: "from-green to-emerald",
    harvest: "from-purple to-pink",
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      <details className={expanded ? "open" : ""} onToggle={() => setExpanded(!expanded)}>
        <summary className="flex items-center gap-3 cursor-pointer p-4 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl list-none">
          <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
            <Layers className="text-amber w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display font-medium text-foreground">Daily Arc — {arc.title}</h3>
            <p className="text-xs text-muted-foreground">Multi-day continuity · {arc.phase} phase</p>
          </div>
          <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </summary>
        <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {/* Progress Header */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-background/40 border border-border/30 rounded-xl"
            >
              <div className="flex-1 text-center p-4 bg-amber/10 border border-amber/20 rounded-xl">
                <CountUp end={arc.day} duration={reducedMotion ? 0 : 1} className="text-3xl font-display font-bold text-amber" />
                <p className="text-xs text-muted-foreground mt-1">Day {arc.day} of {arc.total}</p>
              </div>
              <div className="flex-1 text-center p-4 bg-muted/50 border border-border/30 rounded-xl">
                <p className="text-3xl font-display font-bold text-foreground capitalize">{arc.phase}</p>
                <p className="text-xs text-muted-foreground mt-1">Current Phase</p>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="p-4 bg-background/40 border border-border/30 rounded-xl"
            >
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={reducedMotion ? {} : { width: 0 }}
                  animate={reducedMotion ? {} : { width: `${progress * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${phaseColors[arc.phase as keyof typeof phaseColors] || "from-primary to-accent"} rounded-full`}
                />
              </div>
            </motion.div>

            {/* Phase Guidance */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="p-4 bg-background/40 border border-border/30 rounded-xl"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Phase Guidance</p>
              <p className="text-sm text-foreground/80">
                {arc.phase === "ground" && "Establish the soil. Small, embodied, unambitious. Build the foundation the later phases will stand on."}
                {arc.phase === "deepen" && "Go beneath the surface. The same territory as grounding, but one layer down. Friction is welcome here."}
                {arc.phase === "integrate" && "The arc is becoming part of you. Less new content, more 'what does this look like in your actual life.' Bring it home."}
                {arc.phase === "harvest" && "Final chapter. Ceremonial, complete, honoring. Surface what you walked through. Mark the closing. No new teaching — only integration."}
              </p>
            </motion.div>

            {/* Lunar & Seasonal */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2"
            >
              <div className="p-3 bg-background/40 border border-border/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Lunar</span>
                </div>
                <p className="text-xs text-muted-foreground/80">Waxing Gibbous — Refine, near completion</p>
              </div>
              <div className="p-3 bg-background/40 border border-border/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Seasonal</span>
                </div>
                <p className="text-xs text-muted-foreground/80">Autumn — Release, gratitude, letting fall what is done</p>
              </div>
            </motion.div>

            {/* Arc Actions */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2 pt-2"
            >
              <button 
                onClick={onEnterTemple}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">Enter Temple</p>
                  <p className="text-xs text-muted-foreground">Full arc experience</p>
                </div>
              </button>
              <button 
                onClick={onViewConstellation}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">View Constellation</p>
                  <p className="text-xs text-muted-foreground">Practice evolution</p>
                </div>
              </button>
              <button 
                onClick={onViewArcJournal}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">Arc Journal</p>
                  <p className="text-xs text-muted-foreground">Daily reflections</p>
                </div>
              </button>
              <button 
                onClick={onPauseArc}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">Pause Arc</p>
                  <p className="text-xs text-muted-foreground">Resume tomorrow</p>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </details>
    </motion.div>
  );
}