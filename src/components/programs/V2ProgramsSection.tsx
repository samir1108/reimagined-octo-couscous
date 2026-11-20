import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Wind, MessageSquare, Anchor, Check, X } from "lucide-react";
import {
  V2_PROGRAMS,
  useActiveV2Enrollment,
  useEnrollV2Program,
  useCompleteV2Session,
  getNextSession,
  getProgramRemaining,
} from "@/hooks/useV2Programs";
import { getV2ProgramById, V2_TRADITION_LABELS } from "@/data/programs/v2";
import type { SessionProgram } from "@/data/programs/v2/types";

type Phase = "list" | "detail" | "running";
type Step = "teach" | "practice" | "reflect" | "integrate" | "rate";

export default function V2ProgramsSection() {
  const [phase, setPhase] = useState<Phase>("list");
  const [selected, setSelected] = useState<SessionProgram | null>(null);
  const [step, setStep] = useState<Step>("teach");
  const [practiceStepIdx, setPracticeStepIdx] = useState(0);
  const [reflectText, setReflectText] = useState("");
  const [quality, setQuality] = useState<number>(0.7);

  const { data: active } = useActiveV2Enrollment();
  const enroll = useEnrollV2Program();
  const complete = useCompleteV2Session();

  const activeProgram = active ? getV2ProgramById(active.program_id) : null;
  const session = active ? getNextSession(active) : null;

  const startSession = () => {
    setStep("teach");
    setPracticeStepIdx(0);
    setReflectText("");
    setQuality(0.7);
    setPhase("running");
  };

  const finishSession = async () => {
    if (!active) return;
    await complete.mutateAsync({ enrollment: active, qualityScore: quality, reflectText });
    setPhase("list");
  };

  // ─── Running session ───
  if (phase === "running" && active && session && activeProgram) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setPhase("list")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" /> Exit session
        </button>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-display tracking-wider uppercase">
            <span>{activeProgram.title}</span>
            <span>Session {session.sessionIndex} · {session.phase}</span>
          </div>

          {/* progress dots */}
          <div className="flex gap-1.5">
            {(["teach", "practice", "reflect", "integrate", "rate"] as Step[]).map((s, i) => {
              const idx = ["teach", "practice", "reflect", "integrate", "rate"].indexOf(step);
              return (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-muted/40"}`}
                />
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === "teach" && (
              <motion.div key="teach" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2 text-primary text-sm font-display">
                  <BookOpen className="w-4 h-4" /> Teach · ~{Math.round((session.teach.seconds || 90) / 60)}m
                </div>
                <p className="font-body text-foreground/90 leading-relaxed">{session.teach.text}</p>
                <button
                  onClick={() => setStep("practice")}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm"
                >
                  I've read this
                </button>
              </motion.div>
            )}

            {step === "practice" && (() => {
              const steps = session.practice.steps;
              const total = steps.length;
              const isLast = practiceStepIdx >= total - 1;
              const isSingle = total === 1;
              return (
                <motion.div key={`practice-${practiceStepIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center gap-2 text-primary text-sm font-display">
                    <Wind className="w-4 h-4" /> Practice · {session.practice.title} · {session.practice.durationMinutes}m
                  </div>
                  {!isSingle && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Step {practiceStepIdx + 1} of {total}</span>
                      <div className="flex gap-1">
                        {steps.map((_, i) => (
                          <div key={i} className={`h-1 w-4 rounded-full ${i <= practiceStepIdx ? "bg-primary" : "bg-muted/40"}`} />
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="font-body text-foreground/90 leading-relaxed text-base min-h-[80px]">
                    {steps[practiceStepIdx]}
                  </p>
                  <div className="flex gap-2">
                    {practiceStepIdx > 0 && (
                      <button
                        onClick={() => setPracticeStepIdx((i) => Math.max(0, i - 1))}
                        className="px-4 py-3 rounded-xl glass-subtle text-sm font-display"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (isLast) setStep("reflect");
                        else setPracticeStepIdx((i) => i + 1);
                      }}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm"
                    >
                      {isLast ? "Practice complete" : "Next step"}
                    </button>
                  </div>
                </motion.div>
              );
            })()}

            {step === "reflect" && (
              <motion.div key="reflect" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2 text-primary text-sm font-display">
                  <MessageSquare className="w-4 h-4" /> Reflect · skippable
                </div>
                <p className="font-body text-foreground/90 italic">"{session.reflect.prompt}"</p>
                <textarea
                  value={reflectText}
                  onChange={(e) => setReflectText(e.target.value)}
                  rows={4}
                  placeholder="Write what arises… (optional)"
                  className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border/40 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2">
                  <button onClick={() => setStep("integrate")} className="flex-1 py-3 rounded-xl glass-subtle text-sm font-display">Skip</button>
                  <button onClick={() => setStep("integrate")} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-display">Continue</button>
                </div>
              </motion.div>
            )}

            {step === "integrate" && (
              <motion.div key="integrate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2 text-primary text-sm font-display">
                  <Anchor className="w-4 h-4" /> Integrate · carry today
                </div>
                <p className="font-body text-foreground/90 leading-relaxed">{session.integrate.cue}</p>
                <button
                  onClick={() => setStep("rate")}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm"
                >
                  I'll carry this
                </button>
              </motion.div>
            )}

            {step === "rate" && (
              <motion.div key="rate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="text-sm font-display text-foreground">How did this session land?</div>
                <div className="flex gap-2">
                  {[
                    { v: 0.3, label: "Hard / scattered" },
                    { v: 0.6, label: "OK" },
                    { v: 0.85, label: "Clear / strong" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setQuality(o.v)}
                      className={`flex-1 py-3 rounded-xl text-xs font-display transition-colors ${
                        quality === o.v ? "bg-primary text-primary-foreground" : "glass-subtle text-foreground/70"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={finishSession}
                  disabled={complete.isPending}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Complete session
                </button>
                {session.reason && (
                  <p className="text-[11px] text-muted-foreground text-center italic">{session.reason}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── Detail ───
  if (phase === "detail" && selected) {
    const isActive = active?.program_id === selected.id;
    return (
      <div className="space-y-4">
        <button onClick={() => setPhase("list")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className={`rounded-2xl p-5 bg-gradient-to-br ${selected.coverGradient} border border-border/40`}>
          <p className="text-[11px] text-foreground/70 font-display tracking-wider uppercase">{V2_TRADITION_LABELS[selected.tradition]}</p>
          <h2 className="text-xl font-display font-semibold text-foreground mt-1">{selected.title}</h2>
          <p className="text-sm text-foreground/80 font-body mt-1">{selected.subtitle}</p>
          <p className="text-xs text-foreground/70 font-body mt-3">≈{selected.estSessions.typical} sessions · adaptive · {selected.difficulty}</p>
        </div>

        <p className="text-sm text-foreground/80 font-body leading-relaxed">{selected.description}</p>

        <div className="space-y-2">
          <p className="text-xs font-display tracking-wider uppercase text-muted-foreground">The arc</p>
          {selected.arc.map((p, i) => (
            <div key={i} className="glass-card rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-display text-foreground">{i + 1}. {p.phase}</span>
                <span className="text-[11px] text-muted-foreground">~{p.sessions} sessions</span>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">{p.focus}</p>
            </div>
          ))}
        </div>

        <button
          onClick={async () => {
            if (!isActive) await enroll.mutateAsync(selected);
            startSession();
          }}
          disabled={enroll.isPending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm disabled:opacity-50"
        >
          {isActive ? "Continue practice" : "Begin program"}
        </button>
      </div>
    );
  }

  // ─── List ───
  return (
    <div className="space-y-4">
      {active && activeProgram && (
        <div className="glass-card rounded-2xl p-4 border border-primary/20">
          <p className="text-[11px] text-primary font-display tracking-wider uppercase">Active · adaptive</p>
          <p className="text-sm font-display font-semibold text-foreground mt-1">{activeProgram.title}</p>
          <p className="text-xs text-muted-foreground font-body">
            Session {active.current_session} · {active.current_phase} · ~{getProgramRemaining(active)} left
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setSelected(activeProgram); setPhase("detail"); }}
              className="flex-1 py-2 rounded-xl glass-subtle text-xs font-display"
            >
              View arc
            </button>
            <button onClick={startSession} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-display">
              Start session
            </button>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-display tracking-wider uppercase text-muted-foreground mb-2">Session-based programs · adaptive</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {V2_PROGRAMS.map((p) => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSelected(p); setPhase("detail"); }}
              className={`text-left rounded-2xl p-4 bg-gradient-to-br ${p.coverGradient} border border-border/40 hover:border-primary/30 transition-colors`}
            >
              <p className="text-[10px] text-foreground/70 font-display tracking-wider uppercase">{V2_TRADITION_LABELS[p.tradition]}</p>
              <p className="text-sm font-display font-semibold text-foreground mt-1">{p.title}</p>
              <p className="text-[11px] text-foreground/70 font-body mt-1 line-clamp-2">{p.subtitle}</p>
              <p className="text-[10px] text-foreground/60 font-body mt-2">≈{p.estSessions.typical} sessions · {p.difficulty}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
