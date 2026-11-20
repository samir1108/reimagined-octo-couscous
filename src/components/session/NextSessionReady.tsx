import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GURUS } from "@/lib/guru-data";
import type { TimeSlot } from "@/lib/timeSlots";

export interface NextSessionPreview {
  slot: TimeSlot;
  slotLabel: string;
  themeTitle: string;
  themeSubtitle: string;
  wisdom: string;
  reasoning: string;
  explore: string[];
  guru: { id: string; openingLine: string };
  alternateGurus: Array<{ id: string; name: string; reason: string }>;
  fallback?: boolean;
}

interface Props {
  nextSlot: TimeSlot;
  justCompletedSlot: TimeSlot | null;
  currentGuruId: string | null;
  lastInsight?: string;
  /** If provided, skip the fetch and render this preview directly. */
  initialPreview?: NextSessionPreview | null;
  onBegin: (chosenGuruId: string) => void;
  onSkip: () => void;
}

/**
 * Rich "Next Session Ready" card shown after a session completes.
 * Fetches theme, assigned guru, wisdom, reasoning, explore prompts
 * and alternate yogis in ONE call to `next-session-preview`.
 */
export default function NextSessionReady({
  nextSlot,
  justCompletedSlot,
  currentGuruId,
  lastInsight,
  initialPreview,
  onBegin,
  onSkip,
}: Props) {
  const [preview, setPreview] = useState<NextSessionPreview | null>(initialPreview ?? null);
  const [loading, setLoading] = useState(!initialPreview);
  const [chosenGuruId, setChosenGuruId] = useState<string | null>(
    initialPreview?.guru?.id ?? currentGuruId,
  );
  const [showSwap, setShowSwap] = useState(false);

  useEffect(() => {
    if (initialPreview) {
      setPreview(initialPreview);
      setChosenGuruId(initialPreview.guru?.id || currentGuruId);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase.functions
      .invoke("next-session-preview", {
        body: {
          nextSlot,
          justCompletedSlot,
          currentGuruId,
          lastInsight,
        },
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          // Minimal local fallback
          setPreview({
            slot: nextSlot,
            slotLabel: nextSlot.charAt(0).toUpperCase() + nextSlot.slice(1),
            themeTitle: "Return to Presence",
            themeSubtitle: "Meet this moment as it is.",
            wisdom: "The next breath is the only door.",
            reasoning: "A natural next step in your daily rhythm.",
            explore: ["What is alive now?", "Where is my attention?", "What wants release?"],
            guru: { id: currentGuruId || "krishna", openingLine: "Welcome back." },
            alternateGurus: [],
            fallback: true,
          });
        } else {
          setPreview(data as NextSessionPreview);
          setChosenGuruId((data as NextSessionPreview).guru?.id || currentGuruId);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nextSlot, justCompletedSlot, currentGuruId, lastInsight, initialPreview]);

  const activeGuru = GURUS.find((g) => g.id === (chosenGuruId || preview?.guru.id));

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-background/95 backdrop-blur-xl overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-lg mx-auto px-5 py-8 md:py-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[10px] font-display tracking-[0.3em] uppercase text-primary/70 mb-2">
            Next Session Ready · {preview?.slotLabel ?? nextSlot}
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-primary/70" />
            <span>Composed for this moment</span>
          </div>
        </div>

        {loading || !preview ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary/70" />
            <p className="text-xs text-muted-foreground font-display tracking-wide">
              Preparing your next step…
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Theme card */}
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur p-5 shadow-lg">
              <h2 className="text-2xl font-display font-bold text-foreground tracking-tight leading-tight">
                {preview.themeTitle}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {preview.themeSubtitle}
              </p>
            </div>

            {/* Guru block */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/30 flex-shrink-0 bg-muted">
                  {activeGuru?.image ? (
                    <img
                      src={activeGuru.image}
                      alt={activeGuru.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🪔</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/70">
                    Guiding you
                  </p>
                  <p className="text-base font-display font-semibold text-foreground">
                    {activeGuru?.name ?? preview.guru.id}
                  </p>
                  <p className="text-sm text-muted-foreground italic mt-1.5 leading-snug">
                    "{preview.guru.openingLine}"
                  </p>
                </div>
              </div>

              {/* Swap yogi */}
              {preview.alternateGurus.length > 0 && (
                <button
                  onClick={() => setShowSwap((v) => !v)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] font-display tracking-wide text-primary/70 hover:text-primary transition py-1.5"
                >
                  Choose a different yogi
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showSwap ? "rotate-180" : ""}`}
                  />
                </button>
              )}

              <AnimatePresence>
                {showSwap && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1.5 pt-2 border-t border-primary/10">
                      {preview.alternateGurus.map((alt) => {
                        const g = GURUS.find((x) => x.id === alt.id);
                        const isSelected = chosenGuruId === alt.id;
                        return (
                          <button
                            key={alt.id}
                            onClick={() => {
                              setChosenGuruId(alt.id);
                              setShowSwap(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                              isSelected
                                ? "bg-primary/15 border border-primary/30"
                                : "hover:bg-primary/8 border border-transparent"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                              {g?.image ? (
                                <img src={g.image} alt={g.name} className="w-full h-full object-cover object-top" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm">🪔</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-display text-foreground truncate">
                                {g?.name ?? alt.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {alt.reason}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wisdom */}
            <div className="rounded-2xl border border-border/30 bg-card/30 p-4">
              <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/60 mb-2">
                Wisdom
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed font-body">
                {preview.wisdom}
              </p>
            </div>

            {/* Reasoning */}
            <div className="rounded-2xl border border-border/30 bg-card/30 p-4">
              <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/60 mb-2">
                Why this for you now
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{preview.reasoning}</p>
            </div>

            {/* Explore */}
            {preview.explore.length > 0 && (
              <div className="rounded-2xl border border-border/30 bg-card/30 p-4">
                <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/60 mb-2.5">
                  Explore
                </p>
                <ul className="space-y-1.5">
                  {preview.explore.map((q, i) => (
                    <li key={i} className="text-sm text-foreground/90 flex gap-2 leading-snug">
                      <span className="text-primary/60 flex-shrink-0">·</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => onBegin(chosenGuruId || preview.guru.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-display text-sm tracking-wide hover:bg-primary/90 transition shadow-lg shadow-primary/25"
              >
                Begin {preview.slotLabel} Session
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onSkip}
                className="w-full py-2.5 text-xs font-display tracking-wide text-muted-foreground/70 hover:text-foreground transition"
              >
                Not now — return home
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
