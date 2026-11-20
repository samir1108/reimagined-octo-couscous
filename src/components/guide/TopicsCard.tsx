import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Heart, Brain, Compass, Sun, Moon, Flame, Mountain, Waves } from "lucide-react";
import { Button } from "@/design-system";
import { GURUS } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";

type Topic = {
  id: string;
  label: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  suggestedGuruId?: string;
};

const TOPICS: Topic[] = [
  { id: "anxious", label: "I feel anxious", prompt: "I'm feeling anxious right now. Can you help me understand what's underneath this and guide me through it?", icon: Waves, suggestedGuruId: "buddha" },
  { id: "stuck", label: "I feel stuck", prompt: "I feel stuck in my life and don't know how to move forward. Where do I begin?", icon: Mountain, suggestedGuruId: "krishna" },
  { id: "overthinking", label: "Mind won't stop", prompt: "My mind keeps spinning the same thoughts. How do I break this loop?", icon: Brain, suggestedGuruId: "ramana" },
  { id: "heartbreak", label: "Heartbreak / loss", prompt: "I'm carrying heartbreak. Sit with me and help me move through this gently.", icon: Heart, suggestedGuruId: "rumi" },
  { id: "purpose", label: "What's my purpose?", prompt: "I want to explore my dharma — what is my real purpose in this life?", icon: Compass, suggestedGuruId: "krishna" },
  { id: "morning", label: "Start my day", prompt: "Help me set a clear, conscious intention for today.", icon: Sun },
  { id: "evening", label: "Reflect on today", prompt: "I want to reflect on what happened today and extract the lesson.", icon: Moon },
  { id: "anger", label: "I'm angry", prompt: "I'm feeling angry. Help me see what this anger is really about.", icon: Flame, suggestedGuruId: "shiva" },
  { id: "free", label: "Just talk", prompt: "I just want to talk freely. No agenda.", icon: Sparkles },
];

interface TopicsCardProps {
  open: boolean;
  onClose: () => void;
  onPick: (prompt: string, suggestedGuruId?: string) => void;
}

export default function TopicsCard({ open, onClose, onPick }: TopicsCardProps) {
  const [showGurus, setShowGurus] = useState<Topic | null>(null);

  const featuredGurus = useMemo(() => GURUS.slice(0, 8), []);

  const handleTopicClick = (topic: Topic) => {
    if (topic.suggestedGuruId) {
      setShowGurus(topic);
    } else {
      onPick(topic.prompt);
      onClose();
    }
  };

  const handleGuruPick = (guruId: string | undefined) => {
    if (showGurus) {
      onPick(showGurus.prompt, guruId);
      setShowGurus(null);
      onClose();
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-1/2 z-[61] -translate-y-1/2 md:left-1/2 md:right-auto md:w-[calc(100vw-2rem)] md:max-w-md md:-translate-x-1/2 max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-3xl glass-card border border-border/40 shadow-2xl p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-lg md:text-xl text-foreground truncate">
                  {showGurus ? "Choose your guide" : "What's alive for you?"}
                </h3>
                <p className="text-[11px] md:text-xs text-muted-foreground font-body mt-0.5">
                  {showGurus ? "Who would you like to talk to?" : "Pick a topic — or just talk freely"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => (showGurus ? setShowGurus(null) : onClose())}
                className="rounded-full h-8 w-8 shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {!showGurus ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <motion.button
                      key={topic.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleTopicClick(topic)}
                      className="flex flex-col items-start gap-2 p-3 rounded-2xl glass-subtle border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all text-left min-w-0"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-[12px] md:text-sm font-body text-foreground leading-tight">
                        {topic.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleGuruPick(undefined)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl glass-subtle border border-border/30 hover:border-primary/40 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-sunrise flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm text-foreground">Any guide</div>
                    <div className="text-[11px] text-muted-foreground font-body">Let the Elder choose</div>
                  </div>
                </button>
                {featuredGurus.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleGuruPick(g.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl glass-subtle border border-border/30 hover:border-primary/40 transition-all text-left"
                  >
                    <img
                      src={MASTER_IMAGES[g.id] || g.image}
                      alt={g.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-display text-sm text-foreground truncate">{g.name}</div>
                      <div className="text-[11px] text-muted-foreground font-body truncate">{g.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
