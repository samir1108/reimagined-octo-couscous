/**
 * TodayThemeSheet — full-screen "Today's Theme" briefing.
 *
 * Opened from Home by tapping the theme card. Presents the complete day
 * as one system: what to expect, what to observe, pitfalls, challenges,
 * things to do, things to avoid, today's practice, active loops,
 * the guru's teaching, and the affirmation.
 */
"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, Target, Eye, AlertTriangle, Brain,
  BookOpen, Leaf, TrendingUp, Timer, CheckCircle2, ChevronRight, Repeat2,
  CalendarDays, Play,
} from "lucide-react";
import { ThemeDayRhythm } from "./ThemeDayRhythm";
import type { DayItemStartRequest } from "@/lib/dayPlan";

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
  tone?: "primary" | "warn" | "muted";
}

function Section({ icon, title, children, delay = 0, tone = "primary" }: SectionProps) {
  const accent =
    tone === "warn" ? "text-amber" :
    tone === "muted" ? "text-muted-foreground/70" : "text-primary";
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-2"
    >
      <div className={`flex items-center gap-2 text-[10px] font-display tracking-[0.18em] uppercase ${accent}`}>
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <div className="pl-5 border-l border-border/30 space-y-2">{children}</div>
    </motion.section>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
      <span className="text-primary/60 mt-[3px] text-[10px]">◆</span>
      <span>{children}</span>
    </p>
  );
}

function toArray(v: any): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim());
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

export default function TodayThemeSheet({
  open,
  onClose,
  theme,
  plan,
  profile,
  onBeginPractice,
  onStartDayItem,
  vLevel,
  streak,
  lastResult,
}: {
  open: boolean;
  onClose: () => void;
  theme: any | null;
  plan: any | null;
  profile: any | null;
  guru?: { name: string; image?: string } | null;
  onBeginPractice?: () => void;
  onQuickPractice?: () => void;
  /** Opens the session flow for a tapped rhythm item, starting from that step. */
  onStartDayItem?: (request: DayItemStartRequest) => void | Promise<void>;
  vLevel?: number | null;
  streak?: number | null;
  practiceMinutes?: number | null;
  lastResult?: { minutes?: number; shift?: string; next?: string } | null;
}) {
  const t = theme as any;
  const navigate = useNavigate();
  const todayCard = plan?.todayCard ?? null;
  const guideContext = plan?.guideContext ?? {};
  const tasks: any[] = Array.isArray(plan?.tasks) ? plan.tasks : [];
  const loops: string[] = Array.isArray(profile?.active_loops)
    ? profile.active_loops.filter((l: any) => typeof l === "string")
    : [];

  const title = t?.title || todayCard?.title || plan?.state || "Presence";
  const description = t?.description || todayCard?.description || "";
  const rationale = typeof t?.theme_rationale === "string" ? t.theme_rationale : (t?.theme_rationale?.whyToday || t?.theme_rationale?.summary || "");
  const intentions = toArray(t?.daily_intentions);
  const actionItems = toArray(t?.action_items);
  const focusAreas = toArray(t?.focus_areas);
  const explore = toArray(guideContext.topics_to_explore);
  const avoid = toArray(guideContext.topics_to_avoid);
  const affirmative = t?.affirmation || todayCard?.affirmation || null;
  const practiceSteps = toArray(todayCard?.practiceSteps);
  const microPractice = t?.recommended_practice || null;

  const observeItems: Array<{ text: string }> = [];
  if (t?.engagement_question) observeItems.push({ text: t.engagement_question });
  if (t?.inner_inquiry) observeItems.push({ text: t.inner_inquiry });
  if (t?.felt_sense_opener) observeItems.push({ text: `Felt sense: "${t.felt_sense_opener}"` });
  explore.forEach((text) => observeItems.push({ text }));
  focusAreas.forEach((text) => observeItems.push({ text }));

  const pitfallItems: string[] = [];
  if (t?.resistance_warning) pitfallItems.push(t.resistance_warning);
  if (t?.real_life_trigger) pitfallItems.push(t.real_life_trigger);
  if (t?.forbidden_thing) pitfallItems.push(`Avoid: ${t.forbidden_thing}`);

  const challenges = tasks.filter((task) => String(task?.difficulty || "").toLowerCase().match(/hard|challeng|advanced/));
  const evening = plan?.eveningReflection ?? null;

  const hasPractice = todayCard?.practiceTitle || practiceSteps.length > 0 || todayCard?.offAppPractice || microPractice?.title;

  const begin = () => {
    onBeginPractice?.();
    onClose();
  };

  const watchItems = pitfallItems.slice(0, 2);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="theme-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col"
        >
          {/* Header */}
          <header className="flex-shrink-0 flex items-start gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 border-b border-border/30">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/70 mb-1">Today's Theme</p>
              <h1 className="font-display text-xl font-semibold text-foreground leading-tight">{title}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {[
                  plan?.journeyDay ? `Day ${plan.journeyDay}` : profile?.journey_day ? `Day ${profile?.journey_day}` : null,
                  plan?.phase || profile?.journey_phase || null,
                  plan?.bandName || null,
                  typeof vLevel === "number" ? `V-Level ${vLevel.toFixed(1)}` : null,
                  streak && streak > 1 ? `${streak}-day streak` : null,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              onClick={() => onClose()}
              aria-label="Close"
              className="flex-shrink-0 h-10 w-10 rounded-full bg-background/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="max-w-2xl mx-auto space-y-6">
              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-base text-foreground/90 leading-relaxed"
                >
                  {description}
                </motion.p>
              )}

              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.35 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-[10px] font-display uppercase tracking-[0.18em] text-primary">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="font-semibold">Daily rhythm</span>
                </div>
                <ThemeDayRhythm
                  onStartSession={(request) => {
                    if (onStartDayItem) void onStartDayItem(request);
                    else begin();
                  }}
                />
              </motion.section>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="grid grid-cols-3 gap-2"
              >
                {[
                  { Icon: BookOpen, label: "Journal", to: "/app/journal" },
                  { Icon: Sparkles, label: "Ask Guide", to: "/app/guide" },
                  { Icon: Leaf, label: "Practices", to: "/app/practice" },
                ].map(({ Icon, label, to }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(to);
                    }}
                    className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl border border-border/35 bg-card/30 py-2.5 text-[11px] text-muted-foreground/90 transition-colors hover:border-primary/35 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary/80" />
                    {label}
                  </button>
                ))}
              </motion.div>

              {watchItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.35 }}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-display uppercase tracking-[0.18em] text-amber-400/90">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="font-semibold">Watch for today</span>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {watchItems.map((text, i) => (
                      <li key={`watch-${i}`} className="flex items-start gap-2 text-xs leading-relaxed text-foreground/85">
                        <span className="mt-[3px] text-[9px] text-amber-400/90">▲</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <Section icon={<Target className="w-3.5 h-3.5" />} title="What to expect" delay={0.05}>
                {lastResult?.shift && (
                  <p className="text-xs italic leading-relaxed text-primary/85">
                    Last sitting: “{lastResult.shift}”
                  </p>
                )}
                {rationale && <p className="text-sm text-foreground/80 leading-relaxed">{rationale}</p>}
                {intentions.map((text, i) => <Item key={`intent-${i}`}>{text}</Item>)}
                {t?.deepened_wisdom && <p className="text-sm text-primary/80 italic leading-relaxed">{t.deepened_wisdom}</p>}
                {!rationale && intentions.length === 0 && !t?.deepened_wisdom && (
                  <p className="text-sm text-muted-foreground italic">Today unfolds gently. Stay curious.</p>
                )}
              </Section>

              {observeItems.length > 0 && (
                <Section icon={<Eye className="w-3.5 h-3.5" />} title="Things to observe" delay={0.1}>
                  {observeItems.map((o, i) => <Item key={`obs-${i}`}>{o.text}</Item>)}
                </Section>
              )}

              {pitfallItems.length > 2 && (
                <Section icon={<AlertTriangle className="w-3.5 h-3.5" />} title="Also watch" delay={0.15} tone="warn">
                  {pitfallItems.slice(2).map((text, i) => (
                    <p key={`pit-${i}`} className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                      <span className="text-amber mt-[3px] text-[10px]">▲</span>
                      <span>{text}</span>
                    </p>
                  ))}
                </Section>
              )}

              {(actionItems.length > 0 || tasks.length > 0) && (
                <Section icon={<CheckCircle2 className="w-3.5 h-3.5" />} title="Things to do" delay={0.2}>
                  {actionItems.map((text, i) => <Item key={`act-${i}`}>{text}</Item>)}
                  {tasks.map((task, i) => (
                    <div key={`task-${i}`} className="rounded-xl border border-border/30 bg-background/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        {task.estimated_minutes ? (
                          <span className="flex-shrink-0 text-[10px] text-muted-foreground flex items-center gap-1">
                            <Timer className="w-3 h-3" /> {task.estimated_minutes}m
                          </span>
                        ) : null}
                      </div>
                      {task.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.description}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {task.difficulty && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">{task.difficulty}</span>
                        )}
                        {task.dimension_target && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted/40 text-muted-foreground">{task.dimension_target}</span>
                        )}
                        {task.yoga_path_alignment && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted/40 text-muted-foreground">{task.yoga_path_alignment}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </Section>
              )}

              {challenges.length > 0 && (
                <Section icon={<TrendingUp className="w-3.5 h-3.5" />} title="Challenges" delay={0.25}>
                  {challenges.map((task, i) => (
                    <Item key={`chal-${i}`}>{task.title}{task.h_capacity_target ? ` — grows ${task.h_capacity_target}` : ""}</Item>
                  ))}
                </Section>
              )}

              {avoid.length > 0 && (
                <Section icon={<AlertTriangle className="w-3.5 h-3.5" />} title="Things to avoid" delay={0.3} tone="warn">
                  {avoid.map((text, i) => (
                    <p key={`avd-${i}`} className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                      <span className="text-amber mt-[3px] text-[10px]">✕</span>
                      <span>{text}</span>
                    </p>
                  ))}
                </Section>
              )}

              {hasPractice && (
                <Section icon={<Leaf className="w-3.5 h-3.5" />} title="Today's practice" delay={0.35}>
                  {(todayCard?.practiceTitle || microPractice?.title) && (
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-base font-display font-semibold text-foreground">
                        {todayCard?.practiceTitle || microPractice?.title}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {todayCard?.adjustedMinutes || todayCard?.practiceMinutes || microPractice?.duration_min || ""}
                        {todayCard?.practiceMinutes || microPractice?.duration_min ? " min" : ""}
                      </span>
                    </div>
                  )}
                  {todayCard?.practiceLevel && (
                    <p className="text-xs text-primary/80">Level · {todayCard.practiceLevel}</p>
                  )}
                  {practiceSteps.map((step, i) => (
                    <p key={`step-${i}`} className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                      <span className="text-primary/60 mt-[3px] text-[10px] font-medium">{i + 1}</span>
                      <span>{step}</span>
                    </p>
                  ))}
                  {todayCard?.offAppPractice && (
                    <p className="text-sm text-muted-foreground italic leading-relaxed">Off-app: {todayCard.offAppPractice}</p>
                  )}
                  {microPractice?.why && <p className="text-xs text-muted-foreground leading-relaxed">Why: {microPractice.why}</p>}
                  {todayCard?.adjustReason && <p className="text-xs text-muted-foreground leading-relaxed">{todayCard.adjustReason}</p>}
                </Section>
              )}

              {loops.length > 0 && (
                <Section icon={<Repeat2 className="w-3.5 h-3.5" />} title="Active loops" delay={0.4}>
                  <div className="flex flex-wrap gap-2">
                    {loops.map((loop, i) => (
                      <span key={`loop-${i}`} className="px-2.5 py-1 text-xs rounded-full border border-primary/25 bg-primary/10 text-primary font-medium">
                        {String(loop).replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {(todayCard?.teachingText || todayCard?.guruName) && (
                <Section icon={<BookOpen className="w-3.5 h-3.5" />} title={todayCard?.guruName ? `Teaching · ${todayCard.guruName}` : "Teaching"} delay={0.45}>
                  {todayCard?.teachingSource && <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">{todayCard.teachingSource}</p>}
                  {todayCard?.teachingText && <p className="text-sm text-foreground/85 italic leading-relaxed">"{todayCard.teachingText}"</p>}
                  {guideContext.tone && <p className="text-xs text-muted-foreground">Tone · {guideContext.tone}</p>}
                </Section>
              )}

              {evening && (
                <Section icon={<Brain className="w-3.5 h-3.5" />} title="Evening reflection" delay={0.5} tone="muted">
                  {evening.focus && <p className="text-sm text-foreground/80 leading-relaxed">{evening.focus}</p>}
                  {toArray(evening.questions).map((q, i) => <Item key={`eve-${i}`}>{q}</Item>)}
                </Section>
              )}

              {affirmative && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.35 }}
                  className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-[10px] font-display tracking-[0.18em] uppercase text-primary/70 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-semibold">Affirmation</span>
                  </div>
                  <p className="text-base font-display text-foreground leading-relaxed italic">{affirmative}</p>
                </motion.div>
              )}

              <div className="grid gap-2 pt-1 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={begin}
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Play className="h-3.5 w-3.5" /> Begin practice
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border/40 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  Back to Home <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
