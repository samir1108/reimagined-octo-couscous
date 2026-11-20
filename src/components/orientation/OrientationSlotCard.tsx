/**
 * OrientationSlotCard
 * The full session player for the Orientation Path.
 * Replaces the time-of-day slot hero on Home while the user is in orientation.
 *
 * Flow per session: Intro → Teach → Practice → Reflect → Integrate → Complete.
 * Bingeable: after Complete, a "Begin next session" CTA loads the next one in place.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Heart, Sparkles, SkipForward } from "lucide-react";
import { useOrientation } from "@/hooks/useOrientation";
import { getActForSession } from "@/data/programs/v2/orientation";
import ActMilestoneScreen from "./ActMilestoneScreen";

type Phase = "intro" | "teach" | "practice" | "reflect" | "integrate" | "done";

interface Props {
  userId: string | undefined;
}

export default function OrientationSlotCard({ userId }: Props) {
  const {
    loading,
    inOrientation,
    currentSession,
    currentIndex,
    totalSessions,
    completeCurrent,
    skip,
    actMilestoneJustHit,
    acknowledgeMilestone,
  } = useOrientation(userId);

  const [phase, setPhase] = useState<Phase>("intro");
  const [reflectAnswer, setReflectAnswer] = useState("");
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneActId, setMilestoneActId] = useState<number>(1);

  // Reset to intro whenever the current session changes (binge mode).
  useEffect(() => {
    if (currentSession) {
      setPhase("intro");
      setReflectAnswer("");
    }
  }, [currentSession?.index]);

  // Show milestone celebration when flag flips on.
  useEffect(() => {
    if (actMilestoneJustHit && currentSession) {
      setMilestoneActId(getActForSession(Math.max(1, currentIndex - 1)).id);
      setShowMilestone(true);
      acknowledgeMilestone();
    } else if (actMilestoneJustHit && !currentSession) {
      // last session done
      setMilestoneActId(5);
      setShowMilestone(true);
      acknowledgeMilestone();
    }
  }, [actMilestoneJustHit]);

  if (loading || !inOrientation || !currentSession) return null;

  const act = getActForSession(currentSession.index);

  const next = async () => {
    if (phase === "intro") setPhase("teach");
    else if (phase === "teach") setPhase("practice");
    else if (phase === "practice") setPhase("reflect");
    else if (phase === "reflect") setPhase("integrate");
    else if (phase === "integrate") {
      await completeCurrent();
      setPhase("done");
    } else if (phase === "done") {
      // beginning next session — useEffect on session change resets to intro
      setPhase("intro");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="relative rounded-3xl p-6 sm:p-8">
        {/* Header */}
        <div className="relative mb-6 flex items-center justify-between text-xs text-amber-200/60">
          <span>Path {currentSession.index} of {totalSessions}</span>
          <span className="uppercase tracking-[0.25em]">Act {act.id} · {act.title}</span>
        </div>

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="relative"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                <Sparkles className="h-3 w-3" /> Next session ready
              </div>
              <h1 className="mb-2 font-display text-3xl text-amber-50">{currentSession.title}</h1>
              <p className="mb-8 text-base text-amber-100/70">{currentSession.subtitle}</p>
              <div className="flex items-center justify-between">
                <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400">
                  Begin <ArrowRight className="h-4 w-4" />
                </button>
                {currentSession.index === 1 && (
                  <button onClick={skip} className="inline-flex items-center gap-1.5 text-xs text-amber-200/40 transition hover:text-amber-200/80">
                    <SkipForward className="h-3 w-3" /> I've practiced before — skip
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {phase === "teach" && (
            <motion.div key="teach" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300/60">
                <BookOpen className="h-3 w-3" /> Teach
              </div>
              <p className="mb-4 font-display text-xl italic text-amber-50/90">"{currentSession.teach.hook}"</p>
              <p className="mb-6 text-[15px] leading-relaxed text-amber-100/80">{currentSession.teach.body}</p>
              <p className="mb-8 rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4 text-sm text-amber-200/80">
                <span className="text-amber-300/60">Why it matters · </span>{currentSession.teach.whyItMatters}
              </p>
              <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400">
                To the practice <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {phase === "practice" && (
            <motion.div key="practice" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300/60">
                <Heart className="h-3 w-3" /> Practice · ~{currentSession.practice.durationMinutes} min
              </div>
              <h2 className="mb-4 font-display text-2xl text-amber-50">{currentSession.practice.title}</h2>
              <ol className="mb-8 space-y-3">
                {currentSession.practice.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-amber-100/80">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-amber-500/30 text-xs text-amber-200">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400">
                I've practiced <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="mb-4 text-xs uppercase tracking-[0.25em] text-amber-300/60">Reflect</div>
              <p className="mb-6 font-display text-xl text-amber-50/90">{currentSession.reflect.prompt}</p>
              <textarea
                value={reflectAnswer}
                onChange={(e) => setReflectAnswer(e.target.value)}
                placeholder="A few words is enough. Or skip."
                rows={4}
                className="mb-6 w-full resize-none rounded-2xl border border-amber-500/20 bg-black/40 p-4 text-[15px] text-amber-100/90 placeholder:text-amber-200/30 focus:border-amber-500/50 focus:outline-none"
              />
              <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="mb-4 text-xs uppercase tracking-[0.25em] text-amber-300/60">Carry into your day</div>
              <p className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 font-display text-xl italic text-amber-50/95">
                {currentSession.integrate.cue}
              </p>
              {currentSession.unlocks && currentSession.unlocks.length > 0 && (
                <div className="mb-6 text-xs text-amber-200/50">
                  Unlocked: {currentSession.unlocks.join(" · ")}
                </div>
              )}
              <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400">
                Complete session
              </button>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="text-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="mx-auto mb-6 h-16 w-16 rounded-full bg-amber-500/40 blur-md"
              />
              <h2 className="mb-2 font-display text-2xl text-amber-50">Session complete.</h2>
              <p className="mb-8 text-sm text-amber-200/60">Take a breath. Or keep going — the path is yours.</p>
              <button onClick={next} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400">
                Begin next session <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ActMilestoneScreen
        open={showMilestone}
        completedActId={milestoneActId}
        onClose={() => setShowMilestone(false)}
      />
    </div>
  );
}
