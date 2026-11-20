/**
 * WeeklyMirrorModal — Sunday Wrapped style scrollable digest computed
 * client-side from existing analytics data. No edge function, no DB.
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, RefreshCw, Heart, Eye, TrendingUp, BookOpen } from "lucide-react";
import { subDays, isAfter } from "date-fns";
import { getLoopName } from "@/lib/onboarding/getLoopName";

interface Props {
  open: boolean;
  onClose: () => void;
  loops: any[];
  sessions: any[];
  journals: any[];
  reflections: any[];
  profile?: any;
  plan?: any;
}

export default function WeeklyMirrorModal({
  open, onClose, loops, sessions, journals, reflections, profile, plan,
}: Props) {
  const cutoff = subDays(new Date(), 7);

  const weekSessions = sessions.filter((s) => s.session_date && isAfter(new Date(s.session_date), cutoff));
  const weekJournals = journals.filter((j) => j.created_at && isAfter(new Date(j.created_at), cutoff));
  const weekReflections = reflections.filter((r) => r.reflection_date && isAfter(new Date(r.reflection_date), cutoff));

  // Top fired loops
  const loopCounts = new Map<string, number>();
  loops.forEach((l) => {
    const id = l.loop_id || l.id;
    if (!id) return;
    const fired = l.times_fired ?? l.fire_count ?? 1;
    loopCounts.set(id, (loopCounts.get(id) || 0) + fired);
  });
  const topLoops = Array.from(loopCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const avgMood = weekReflections.length
    ? (weekReflections.reduce((s, r) => s + (r.mood || 0), 0) / weekReflections.length).toFixed(1)
    : "—";
  const avgEnergy = weekReflections.length
    ? (weekReflections.reduce((s, r) => s + (r.energy || 0), 0) / weekReflections.length).toFixed(1)
    : "—";

  const band = plan?.band ?? profile?.overall_band ?? 0;
  const vLevel = plan?.vLevel ?? profile?.overall_band ?? 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="min-h-full max-w-2xl mx-auto px-5 py-8 pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/70">
                Weekly Mirror · last 7 days
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-foreground/5 hover:bg-foreground/10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-8">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Your Week, Reflected</h2>
              <p className="text-sm text-muted-foreground italic">
                What the mirror saw between {cutoff.toLocaleDateString()} and today
              </p>
            </div>

            <div className="space-y-4">
              <Stat icon={<TrendingUp className="w-4 h-4" />} label="Where you stand">
                Band {Math.floor(band)} · V-Level {Number(vLevel).toFixed(1)}
              </Stat>

              <Stat icon={<BookOpen className="w-4 h-4" />} label="Practice rhythm">
                {weekSessions.length} sessions · {weekJournals.length} journal entries · {weekReflections.length} reflections
              </Stat>

              <Stat icon={<Heart className="w-4 h-4" />} label="Inner climate">
                Mood {avgMood}/10 · Energy {avgEnergy}/10
              </Stat>

              {topLoops.length > 0 && (
                <Stat icon={<RefreshCw className="w-4 h-4" />} label="Loops you noticed">
                  <div className="space-y-1.5 mt-1">
                    {topLoops.map(([id, count]) => (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground/90">{getLoopName(id)}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{count}×</span>
                      </div>
                    ))}
                  </div>
                </Stat>
              )}

              <Stat icon={<Eye className="w-4 h-4" />} label="Theme for next week">
                <p className="italic text-foreground/85">
                  {band < 3
                    ? "Build the witness. One conscious pause a day is the seed of everything."
                    : band < 6
                      ? "Deepen your strongest dimension. Don't chase new — perfect what's already moving."
                      : "Integrate. Bring the silence of practice into your loudest moments."}
                </p>
              </Stat>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/60">
                The Mirror updates every Sunday
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 bg-foreground/[0.03] border border-border/40">
      <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-display tracking-[0.22em] uppercase">{label}</span>
      </div>
      <div className="text-sm font-body text-foreground/90 leading-relaxed">{children}</div>
    </div>
  );
}
