"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Sparkles, ChevronDown, ExternalLink, BookOpen, RotateCcw, Heart, Brain, Activity } from "lucide-react";

interface GuruTransmissionCardProps {
  guru: {
    id: string;
    name: string;
    path: string;
    tradition?: string;
    avatar?: string;
  } | null;
  rotationStatus: {
    currentGuruId: string;
    daysWithCurrent: number;
    rotationPeriod: number;
    nextGuru?: { name: string; path: string };
    reason?: string;
  } | null;
  onOpenGuide: () => void;
  className?: string;
}

const pathIcons = {
  jnana: Brain,
  bhakti: Heart,
  karma: Activity,
  raja: Activity,
};

export function GuruTransmissionCard({
  guru,
  rotationStatus,
  onOpenGuide,
  className = "",
}: GuruTransmissionCardProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);

  if (!guru) return null;

  const PathIcon = pathIcons[guru.path.toLowerCase() as keyof typeof pathIcons] || Sparkles;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      <details className={expanded ? "open" : ""} onToggle={() => setExpanded(!expanded)}>
        <summary className="flex items-center gap-3 cursor-pointer p-4 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl list-none">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <PathIcon className="text-primary w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display font-medium text-foreground">Guru Transmission — {guru.name}</h3>
            <p className="text-xs text-muted-foreground">{guru.path} · {guru.tradition || "Universal"}</p>
          </div>
          <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </summary>
        <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {/* Daily Transmission */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="p-4 bg-background/40 border border-border/30 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">TODAY'S TEACHING</span>
                <span className="px-2 py-0.5 text-xs bg-muted/50 text-muted-foreground rounded-full">{guru.path}</span>
              </div>
              <blockquote className="text-foreground/90 italic border-l-2 border-primary/30 pl-4">
                "The question 'Who am I?' is not meant to get an answer. It is meant to dissolve the questioner."
              </blockquote>
              <p className="text-xs text-muted-foreground mt-2 text-right">— {guru.name}</p>
            </motion.div>

            {/* Tone Guidance */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="p-4 bg-background/40 border border-border/30 rounded-xl"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Today's Tone</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs font-medium text-primary">Precision</p>
                  <p className="text-xs text-muted-foreground">Cut through seeking</p>
                </div>
                <div className="p-2 bg-muted/50 border border-border/30 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Brevity</p>
                  <p className="text-xs text-muted-foreground">One sentence max</p>
                </div>
                <div className="p-2 bg-muted/50 border border-border/30 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Dryness</p>
                  <p className="text-xs text-muted-foreground">No comfort padding</p>
                </div>
                <div className="p-2 bg-muted/50 border border-border/30 rounded-lg">
                  <p className="text-xs font-medium text-foreground">Directness</p>
                  <p className="text-xs text-muted-foreground">Name the pattern</p>
                </div>
              </div>
            </motion.div>

            {/* Lineage */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="p-4 bg-background/40 border border-border/30 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lineage</p>
                <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  View full
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Ramana", "Krishnamurti", "Nisargadatta", "Shankara"].map((master, i) => (
                  <motion.span
                    key={master}
                    initial={reducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                    animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className="px-3 py-1 bg-muted/50 border border-border/30 rounded-full text-sm text-foreground/80"
                  >
                    {master}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Rotation Status */}
            {rotationStatus && (
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                className="p-4 bg-background/40 border border-border/30 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rotation Status</p>
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex-1">
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-medium text-foreground">{guru.name}</p>
                    <p className="text-xs text-muted-foreground">Day {rotationStatus.daysWithCurrent}/{rotationStatus.rotationPeriod}</p>
                  </div>
                  {rotationStatus.nextGuru && (
                    <div className="flex-1">
                      <p className="text-muted-foreground">Next</p>
                      <p className="font-medium text-foreground">{rotationStatus.nextGuru.name}</p>
                      <p className="text-xs text-muted-foreground">{rotationStatus.nextGuru.path}</p>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-muted-foreground">In</p>
                    <p className="font-medium text-foreground">{rotationStatus.rotationPeriod - rotationStatus.daysWithCurrent} days</p>
                  </div>
                </div>
                {rotationStatus.reason && (
                  <p className="text-xs text-muted-foreground mt-2">Reason: {rotationStatus.reason}</p>
                )}
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2 pt-2"
            >
              <button 
                onClick={onOpenGuide}
                className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-left hover:bg-primary/20 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">Open Guide</p>
                  <p className="text-xs text-muted-foreground">Receive transmission</p>
                </div>
              </button>
              <button 
                onClick={() => {}}
                className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-sm text-foreground">View Teachings</p>
                  <p className="text-xs text-muted-foreground">Archived transmissions</p>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </details>
    </motion.div>
  );
}