"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Users, Heart, AlertCircle, Sparkles, ExternalLink, MessageCircle, Share2 } from "lucide-react";

interface LoopResonanceCardProps {
  resonances: Array<{
    relatedUserId: string;
    relatedUserName: string;
    relationshipType: string;
    resonanceScore: number;
    sharedLoops: Array<{
      loopId: string;
      userSeverity: number;
      otherSeverity: number;
      resonanceScore: number;
    }>;
    status: "active" | "resolved" | "archived";
  }>;
  onCoRegulate: (userId: string) => void;
  onInviteFriend: () => void;
  onViewArchive: () => void;
  className?: string;
}

export function LoopResonanceCard({
  resonances,
  onCoRegulate,
  onInviteFriend,
  onViewArchive,
  className = "",
}: LoopResonanceCardProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);

  if (!resonances.length) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
        className={`w-full max-w-2xl mx-auto ${className}`}
      >
        <details className={expanded ? "open" : ""} onToggle={() => setExpanded(!expanded)}>
          <summary className="flex items-center gap-3 cursor-pointer p-4 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl list-none">
            <div className="w-10 h-10 rounded-xl bg-pink/20 flex items-center justify-center">
              <Heart className="text-pink w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-display font-medium text-foreground">Loop Resonance</h3>
              <p className="text-xs text-muted-foreground">Shared patterns with connections</p>
            </div>
            <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
          </summary>
          <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              className="p-6 text-center bg-background/40 border border-border/30 rounded-xl"
            >
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No loop resonances detected yet</p>
              <p className="text-sm text-muted-foreground/70 mb-4">Connect with a partner, family member, or close friend to see shared patterns</p>
              <button
                onClick={onInviteFriend}
                className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Invite Connection
              </button>
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
          <div className="w-10 h-10 rounded-xl bg-pink/20 flex items-center justify-center">
            <Users className="text-pink w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-display font-medium text-foreground">Loop Resonance</h3>
            <p className="text-xs text-muted-foreground">{resonances.length} active connection{resonances.length > 1 ? "s" : ""}</p>
          </div>
          <ChevronDown className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </summary>
        <div className="px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {resonances.map((resonance, i) => (
              <motion.div
                key={resonance.relatedUserId}
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="p-4 bg-background/40 border border-border/30 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-pink/10 border border-pink/20 flex items-center justify-center">
                    <Heart className="text-pink w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{resonance.relatedUserName}</span>
                      <span className="px-2 py-0.5 text-xs bg-muted/50 text-muted-foreground rounded-full capitalize">{resonance.relationshipType}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${resonance.status === "active" ? "bg-green/20 text-green" : "bg-muted/50 text-muted-foreground"}`}>
                        {resonance.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Resonance: {Math.round(resonance.resonanceScore * 100)}%</p>
                  </div>
                </div>

                {/* Shared Loops */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Shared Loops</p>
                  <div className="space-y-1">
                    {resonance.sharedLoops.map(loop => (
                      <div key={loop.loopId} className="p-2 bg-muted/30 border border-border/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground">{loop.loopId}</span>
                          <span className="px-2 py-0.5 text-xs bg-pink/20 text-pink rounded-full">{Math.round(loop.resonanceScore * 100)}% resonance</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs">
                          <span className="text-muted-foreground">You: {loop.userSeverity}/5</span>
                          <span className="text-muted-foreground">Them: {loop.otherSeverity}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Co-regulation Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => onCoRegulate(resonance.relatedUserId)}
                    className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex flex-col items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Breath Together</span>
                    <span className="text-[10px] text-muted-foreground">Sync breathing</span>
                  </button>
                  <button
                    onClick={() => onCoRegulate(resonance.relatedUserId)}
                    className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex flex-col items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Joint Inquiry</span>
                    <span className="text-[10px] text-muted-foreground">Shared question</span>
                  </button>
                  <button
                    onClick={() => onCoRegulate(resonance.relatedUserId)}
                    className="p-3 bg-background/40 border border-border/30 rounded-xl text-left hover:border-primary/50 transition-colors flex flex-col items-center gap-1"
                  >
                    <Share2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Witness Together</span>
                    <span className="text-[10px] text-muted-foreground">Hold space</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Witness Circle */}
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            className="p-4 bg-background/40 border border-border/30 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Witness Circle</p>
              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground/80 mb-3">Weekly Sundays 8pm · Next: "Dark Night" sharing circle</p>
            <div className="grid grid-cols-3 gap-2">
              <button className="p-3 bg-background/40 border border-border/30 rounded-xl text-center hover:border-primary/50 transition-colors">
                <Users className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Join Circle</p>
              </button>
              <button onClick={onInviteFriend} className="p-3 bg-background/40 border border-border/30 rounded-xl text-center hover:border-primary/50 transition-colors">
                <Sparkles className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Invite Friend</p>
              </button>
              <button onClick={onViewArchive} className="p-3 bg-background/40 border border-border/30 rounded-xl text-center hover:border-primary/50 transition-colors">
                <ExternalLink className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">View Archive</p>
              </button>
            </div>
          </motion.div>
        </div>
      </details>
    </motion.div>
  );
}