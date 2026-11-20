/**
 * JourneyPicker — "App kya chahata hai?" (Gate 6)
 * ─────────────────────────────────
 * The question after the mapping. Seven doors, ranked by fit against the
 * user's own mapping — lowest dimension, spiral position, loudest loops —
 * each showing WHY it was put in front of them. Starting one is an API call
 * (useStartJourney) that opens the enrollment and logs day one.
 */
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { rankJourneys } from "@/lib/onboarding/journeyDefinitions";
import { useStartJourney } from "@/hooks/useStartJourney";
import type { FirstElevenMapping } from "@/lib/onboarding/firstElevenTypes";

interface Props {
  mapping: FirstElevenMapping;
  onStarted: () => void;
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.12 + i * 0.08, duration: 0.5, ease: "easeOut" as const },
});

export default function JourneyPicker({ mapping, onStarted }: Props) {
  const [startingSlug, setStartingSlug] = useState<string | null>(null);
  const startJourney = useStartJourney();
  const ranked = rankJourneys(mapping);

  const start = async (slug: string) => {
    setStartingSlug(slug);
    try {
      await startJourney.mutateAsync({ journeySlug: slug, mapping });
      onStarted();
    } catch {
      // mutation error — the button un-freezes and the guard message shows
    } finally {
      setStartingSlug(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100dvh] bg-background px-5 py-10"
    >
      <div className="w-full max-w-md mx-auto">
        {/* ─── Header ─── */}
        <motion.p {...stagger(0)} className="text-[10px] uppercase tracking-[0.32em] text-primary/80 text-center mb-2">
          The second question
        </motion.p>
        <motion.h1 {...stagger(1)} className="font-display text-3xl text-foreground text-center leading-tight mb-2">
          Where do you want to go?
        </motion.h1>
        <motion.p {...stagger(1)} className="text-xs text-muted-foreground text-center mb-2 leading-relaxed">
          The map is drawn — {mapping.bandMicro} · {mapping.bandLabel}. Now choose a direction.
          Every door below was placed by your own answers.
        </motion.p>

        {startJourney.isError && (
          <motion.p {...stagger(2)} className="text-[12px] text-amber-400/90 text-center mb-3">
            The door didn't open — check your connection and try again.
          </motion.p>
        )}

        {/* ─── Journey cards ─── */}
        <div className="space-y-3 pt-4 pb-4">
          {ranked.map((fit, i) => (
            <motion.div
              key={fit.journey.slug}
              {...stagger(3 + i)}
              className={`rounded-3xl border px-5 py-4 ${
                i === 0
                  ? "border-primary/50 bg-primary/[0.07]"
                  : "border-border/40 bg-card/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display text-[16px] text-foreground">{fit.journey.title}</span>
                {i === 0 && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-primary font-display">
                    <Sparkles className="h-3 w-3" />
                    closest fit
                  </span>
                )}
              </div>
              <p className="text-[12.5px] text-primary/90 font-display mb-1.5">{fit.journey.subtitle}</p>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-2">{fit.journey.essence}</p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-display mb-3">
                <span>{fit.journey.master}</span>
                <span>·</span>
                <span>{fit.journey.estSessions}</span>
                <span>·</span>
                <span className="text-primary/80">{fit.reason}</span>
              </div>

              <button
                onClick={() => void start(fit.journey.slug)}
                disabled={startingSlug !== null}
                className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide text-[14px] flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-40 transition"
              >
                {startingSlug === fit.journey.slug ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening the door…
                  </>
                ) : (
                  <>
                    Begin this journey
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p {...stagger(11)} className="text-[11px] text-muted-foreground/70 text-center pb-8 leading-relaxed">
          You can change journeys any time — nothing here is permanent.
          The map recalculates; the doors stay open.
        </motion.p>
      </div>
    </motion.div>
  );
}
