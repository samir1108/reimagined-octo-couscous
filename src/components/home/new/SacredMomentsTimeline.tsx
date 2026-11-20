"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Sparkles, Clock, TrendingUp, Award, BookOpen, Heart, Brain, Activity } from "lucide-react";

interface SacredMoment {
  id: string;
  date: string;
  title: string;
  description: string;
  loopId: string;
  practice: string;
  duration: number;
  quality: number;
  breakthrough: boolean;
  arcHarvest: boolean;
}

interface SacredMomentsTimelineProps {
  moments: SacredMoment[];
  onViewAll: () => void;
  onExportJournal: () => void;
  onCreateAnniversary: () => void;
  className?: string;
}

export function SacredMomentsTimeline({
  moments,
  onViewAll,
  onExportJournal,
  onCreateAnniversary,
  className = "",
}: SacredMomentsTimelineProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const filteredMoments = moments.filter(m => {
    if (filter === "breakthrough") return m.breakthrough;
    if (filter === "arc") return m.arcHarvest;
    return true;
  });

  if (!moments.length) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        className={`w-full max-w-2xl mx-auto ${className}`}
      >
        <details className={expanded ? "open" : ""} onToggle={() => setExpanded(!expanded)}>
          <summary className="flex items-center gap-3 cursor-pointer p-4 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl list-none">
            <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
              <Sparkles className="text-amber w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-display font-medium text-foreground">Sacred Moments</h3>
              <p className="text-xs text-muted-foreground">Breakthrough timeline</p>
            </div>
            <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
          </summary>
          <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="p-6 text-center bg-background/40 border border-border/30 rounded-xl"
            >
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No sacred moments recorded yet</p>
              <p className="text-sm text-muted-foreground/70 mb-4">{"Complete sessions with quality >90% to capture breakthroughs"}</p>
            </motion.div>
          </div>
        </details>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      <details className={expanded ? "open" : ""} onToggle={() => setExpanded(!expanded)}>
        <summary className="flex items-center gap-3 cursor-pointer p-4 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl list-none">
          <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
            <Sparkles className="text-amber w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display font-medium text-foreground">Sacred Moments</h3>
            <p className="text-xs text-muted-foreground">{moments.length} breakthroughs captured · {moments.filter(m => m.breakthrough).length} breakthrough · {moments.filter(m => m.arcHarvest).length} arc harvests</p>
          </div>
          <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </summary>
        <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            {/* Filter tabs */}
            <div className="flex gap-1 bg-background/40 border border-border/30 rounded-xl p-1">
              {[
                { value: "all", label: "All", icon: Sparkles },
                { value: "breakthrough", label: "Breakthroughs", icon: TrendingUp },
                { value: "arc", label: "Arc Harvests", icon: Award },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    filter === value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border/30" />
              
              {filteredMoments.slice(0, 10).map((moment, i) => (
                <motion.div
                  key={moment.id}
                  initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="relative pl-12 pb-6 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-1 w-3 h-3 -translate-x-1/2 rounded-full border-2"
                    style={{
                      backgroundColor: moment.breakthrough ? "hsl(var(--primary))" : 
                        moment.arcHarvest ? "hsl(var(--amber))" : "hsl(var(--background))",
                      borderColor: moment.breakthrough ? "hsl(var(--primary))" : 
                        moment.arcHarvest ? "hsl(var(--amber))" : "hsl(var(--border))",
                    }}
                  >
                    {moment.breakthrough && <TrendingUp className="w-2 h-2 text-primary-foreground absolute inset-0 m-auto" />}
                    {moment.arcHarvest && !moment.breakthrough && <Award className="w-2 h-2 text-amber absolute inset-0 m-auto" />}
                  </div>

                  {/* Moment card */}
                  <div className="p-3 bg-background/40 border border-border/30 rounded-xl hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        {moment.breakthrough ? (
                          <TrendingUp className="w-5 h-5 text-primary" />
                        ) : moment.arcHarvest ? (
                          <Award className="w-5 h-5 text-amber" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{moment.title}</p>
                          <span className="text-xs text-muted-foreground">{moment.date}</span>
                          {moment.breakthrough && <span className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded">✨ Breakthrough</span>}
                          {moment.arcHarvest && <span className="px-1.5 py-0.5 text-[10px] bg-amber/10 text-amber rounded">📜 Arc Harvest</span>}
                        </div>
                        <p className="text-sm text-muted-foreground/80 mb-2">{moment.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {moment.practice} · {moment.duration}min</span>
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {Math.round(moment.quality * 100)}%</span>
                          <span className="flex items-center gap-1">↻ {moment.loopId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <button onClick={onViewAll} className="p-3 bg-background/40 border border-border/30 rounded-xl text-center hover:border-primary/50 transition-colors">
                <BookOpen className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">View All</p>
              </button>
              <button onClick={onExportJournal} className="p-3 bg-background/40 border border-border/30 rounded-xl text-center hover:border-primary/50 transition-colors">
                <Brain className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Export Journal</p>
              </button>
              <button onClick={onCreateAnniversary} className="p-3 bg-background/40 border border-border/30 rounded-xl text-center hover:border-primary/50 transition-colors">
                <Heart className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Anniversary</p>
              </button>
            </div>
          </div>
        </div>
      </details>
    </motion.div>
  );
}


