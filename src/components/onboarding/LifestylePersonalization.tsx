/**
 * LifestylePersonalization
 * ────────────────────────
 * Tinder-style step-through screen captured before the Elder dialogue.
 * Collects daily anchors (wake / sleep / work / lunch) plus broad personal
 * context (occupation, country, religion, family, energy peak, diet,
 * exercise) so the engines can:
 *
 *   1. Schedule off-app reminders at times that match the user's actual day.
 *   2. Recommend rituals that fit their culture, role, and rhythm.
 *   3. Personalise the Elder dialogue itself with real life context.
 *
 * Storage:
 *   - `profiles.lifestyle` (jsonb)  ← long-term personal context
 *   - `profiles.wake_time / sleep_time / occupation / country` ← quick reads
 *   - `spiritual_dna_assessments.assessment_conversation.daily_anchors`
 *     ← consumed by `useOffAppReminders` to time notifications
 *   - `localStorage.lifestyle_draft_<userId>` while the user is mid-flow
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sunrise, Moon, Briefcase, GraduationCap, Home, Brush, Utensils,
  Heart, Globe2, Dumbbell, Coffee, Leaf, Flame, Wind, Sparkles,
  Users, User, Baby, Building2, Palette, Bike, Sofa, Smile,
  ChevronLeft, ChevronRight, Check, Compass, Zap, Trees,
} from "lucide-react";

// Shared key — Settings reads/writes the same key so users can toggle later.
export const PRACTICE_EXTRAS_KEY = "practice_extras_v1";
export interface PracticeExtras {
  micro_practices: boolean;   // short 1–3 min in-app drills between sessions
  off_app_tasks: boolean;     // real-world awareness tasks for the day
}
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────
export interface LifestyleAnswers {
  wake_time: string;          // "06:30"
  sleep_time: string;         // "22:30"
  brush_time?: string;
  bath_time?: string;
  work_start?: string;
  work_end?: string;
  lunch_time?: string;
  occupation: string;
  country: string;
  age_range: string;
  religion: string;
  family: string;
  energy_peak: string;
  diet: string;
  exercise: string;
  stress_level: string;
}

interface Props {
  userId: string;
  name: string;
  onComplete: (answers: LifestyleAnswers) => void;
  onSkip?: () => void;
}

type Choice = { value: string; label: string; Icon: React.ComponentType<any>; hint?: string };

interface Question {
  id: keyof LifestyleAnswers | "extras";
  title: string;
  subtitle: string;
  type: "choice" | "time" | "country" | "extras";
  choices?: Choice[];
  defaultTime?: string;
  optional?: boolean;
}

// ─── Question deck ────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  // wake_time + sleep_time moved out of onboarding → user sets them in Settings
  // (defaults below are used until then).

  {
    id: "occupation", type: "choice",
    title: "What does most of your day look like?",
    subtitle: "So practices fit the texture of your real life.",
    choices: [
      { value: "student", label: "Student", Icon: GraduationCap, hint: "School / college" },
      { value: "office", label: "Office work", Icon: Briefcase, hint: "9–6, meetings, screens" },
      { value: "remote", label: "Remote / freelance", Icon: Sofa, hint: "Work from home" },
      { value: "creative", label: "Creative / artist", Icon: Palette, hint: "Maker, writer, designer" },
      { value: "founder", label: "Founder / business", Icon: Building2, hint: "High-stakes, long hours" },
      { value: "homemaker", label: "Homemaker / caregiver", Icon: Home, hint: "Family-first day" },
      { value: "service", label: "Frontline / service", Icon: Users, hint: "On your feet" },
      { value: "retired", label: "Retired / semi-retired", Icon: Smile, hint: "Time is yours" },
    ],
  },
  // work_start / lunch_time / work_end moved out of onboarding → Settings → Daily Rhythm

  {
    id: "energy_peak", type: "choice",
    title: "When do you feel most alive?",
    subtitle: "Deep practice will be placed in your peak window.",
    choices: [
      { value: "early_morning", label: "Pre-dawn", Icon: Sunrise, hint: "Before sunrise" },
      { value: "morning", label: "Morning", Icon: Coffee, hint: "After waking" },
      { value: "midday", label: "Midday", Icon: Flame, hint: "10am–2pm" },
      { value: "afternoon", label: "Afternoon", Icon: Wind, hint: "2pm–6pm" },
      { value: "evening", label: "Evening", Icon: Sparkles, hint: "After 6pm" },
      { value: "night", label: "Late night", Icon: Moon, hint: "After 10pm" },
    ],
  },
  {
    id: "religion", type: "choice",
    title: "Which spiritual stream feels closest?",
    subtitle: "Just so the language and imagery feel like home. Nothing dogmatic.",
    choices: [
      { value: "hindu", label: "Hindu / Vedic", Icon: Flame },
      { value: "buddhist", label: "Buddhist", Icon: Leaf },
      { value: "christian", label: "Christian", Icon: Heart },
      { value: "muslim", label: "Muslim / Sufi", Icon: Sparkles },
      { value: "jewish", label: "Jewish", Icon: Compass },
      { value: "sikh", label: "Sikh", Icon: Sparkles },
      { value: "spiritual", label: "Spiritual, not religious", Icon: Wind },
      { value: "secular", label: "Secular / Agnostic", Icon: Brush },
    ],
  },
  // country step removed — birth city captured on the BirthDetails screen
  {
    id: "age_range", type: "choice",
    title: "Your stage of life?",
    subtitle: "So we meet you where you are.",
    choices: [
      { value: "teen", label: "Under 20", Icon: GraduationCap },
      { value: "20s", label: "20s", Icon: Sparkles },
      { value: "30s", label: "30s", Icon: Flame },
      { value: "40s", label: "40s", Icon: Compass },
      { value: "50s", label: "50s", Icon: Leaf },
      { value: "60plus", label: "60+", Icon: Smile },
    ],
  },
  {
    id: "family", type: "choice",
    title: "Who's around you most?",
    subtitle: "Practices flex to your home reality.",
    choices: [
      { value: "alone", label: "I live alone", Icon: User },
      { value: "couple", label: "With a partner", Icon: Heart },
      { value: "young_kids", label: "Young children", Icon: Baby },
      { value: "older_kids", label: "Teens / older kids", Icon: Users },
      { value: "joint", label: "Joint family", Icon: Home },
      { value: "roommates", label: "Roommates", Icon: Users },
    ],
  },
  {
    id: "diet", type: "choice",
    title: "How do you eat?",
    subtitle: "Food shapes the body that meditates.",
    choices: [
      { value: "veg", label: "Vegetarian", Icon: Leaf },
      { value: "vegan", label: "Vegan", Icon: Leaf },
      { value: "non_veg", label: "Mixed / non-veg", Icon: Utensils },
      { value: "jain", label: "Jain / Sattvic", Icon: Sparkles },
      { value: "intermittent", label: "Intermittent fasting", Icon: Flame },
      { value: "flexible", label: "Whatever, no rules", Icon: Smile },
    ],
  },
  {
    id: "exercise", type: "choice",
    title: "How does your body move?",
    subtitle: "We'll layer practice onto what's already there.",
    choices: [
      { value: "daily", label: "Daily — gym / run", Icon: Dumbbell },
      { value: "yoga", label: "Yoga / asana", Icon: Wind },
      { value: "walk", label: "Walks, light cardio", Icon: Bike },
      { value: "weekly", label: "A few times a week", Icon: Bike },
      { value: "rare", label: "Rarely move", Icon: Sofa },
      { value: "injury", label: "Recovering / limited", Icon: Heart },
    ],
  },
  {
    id: "stress_level", type: "choice",
    title: "How heavy is the weight you carry?",
    subtitle: "Honest answer — not the brave one.",
    choices: [
      { value: "light", label: "Light, mostly OK", Icon: Smile },
      { value: "moderate", label: "Moderate, manageable", Icon: Wind },
      { value: "high", label: "High, often stretched", Icon: Flame },
      { value: "burnout", label: "Burned out", Icon: Moon },
      { value: "grief", label: "Grieving / heartbreak", Icon: Heart },
      { value: "transition", label: "Big life transition", Icon: Compass },
    ],
  },
];

const POPULAR_COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Singapore", "UAE", "Germany", "Netherlands", "Japan", "Brazil", "Other",
];

// ─── Component ────────────────────────────────────────────────────────────
export default function LifestylePersonalization({ userId, name, onComplete, onSkip }: Props) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Partial<LifestyleAnswers>>(() => {
    try {
      const raw = localStorage.getItem(`lifestyle_draft_${userId}`);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [saving, setSaving] = useState(false);
  const [extras, setExtras] = useState<PracticeExtras>(() => {
    try {
      const raw = localStorage.getItem(PRACTICE_EXTRAS_KEY);
      if (raw) return { micro_practices: false, off_app_tasks: false, ...JSON.parse(raw) };
    } catch {}
    return { micro_practices: false, off_app_tasks: false };
  });

  const q = QUESTIONS[idx];
  const value = q.id === "extras"
    ? ""
    : (answers[q.id as keyof LifestyleAnswers] as string) || (q.type === "time" ? q.defaultTime || "" : "");
  const isLast = idx === QUESTIONS.length - 1;
  const canNext = q.optional || q.type === "extras" || Boolean((answers[q.id as keyof LifestyleAnswers] as string)?.length);
  const progress = ((idx + 1) / QUESTIONS.length) * 100;

  const persistDraft = useCallback((next: Partial<LifestyleAnswers>) => {
    try { localStorage.setItem(`lifestyle_draft_${userId}`, JSON.stringify(next)); } catch {}
  }, [userId]);

  const setAnswer = useCallback((v: string) => {
    setAnswers((a) => {
      const next = { ...a, [q.id as keyof LifestyleAnswers]: v };
      persistDraft(next);
      return next;
    });
  }, [q.id, persistDraft]);

  const updateExtras = useCallback((patch: Partial<PracticeExtras>) => {
    setExtras((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(PRACTICE_EXTRAS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const finish = useCallback(async () => {
    setSaving(true);
    const final: LifestyleAnswers = {
      wake_time: answers.wake_time || "06:30",
      sleep_time: answers.sleep_time || "22:30",
      brush_time: answers.brush_time,
      bath_time: answers.bath_time,
      work_start: answers.work_start,
      work_end: answers.work_end,
      lunch_time: answers.lunch_time,
      occupation: answers.occupation || "office",
      country: answers.country || "India",
      age_range: answers.age_range || "30s",
      religion: answers.religion || "spiritual",
      family: answers.family || "alone",
      energy_peak: answers.energy_peak || "morning",
      diet: answers.diet || "flexible",
      exercise: answers.exercise || "weekly",
      stress_level: answers.stress_level || "moderate",
    };

    try {
      // 1) Persist to profiles for quick reads + queryability.
      await supabase.from("profiles").upsert(
        {
          user_id: userId,
          display_name: name || "Friend",
          wake_time: final.wake_time,
          sleep_time: final.sleep_time,
          occupation: final.occupation,
          country: final.country,
          lifestyle: { ...final, practice_extras: extras } as any,
        } as any,
        { onConflict: "user_id" },
      );

      // 2) Seed daily_anchors so reminders schedule on the user's clock.
      const anchors: Record<string, string> = {
        wake: final.wake_time,
        sleep: final.sleep_time,
      };
      if (final.work_start) anchors.work_start = final.work_start;
      if (final.work_end) anchors.work_end = final.work_end;
      if (final.lunch_time) anchors.lunch = final.lunch_time;

      const { data: existing } = await supabase
        .from("spiritual_dna_assessments")
        .select("assessment_conversation")
        .eq("user_id", userId)
        .maybeSingle();
      const conv = (existing?.assessment_conversation as Record<string, unknown>) || {};

      await supabase.from("spiritual_dna_assessments").upsert(
        {
          user_id: userId,
          assessment_conversation: {
            ...conv,
            daily_anchors: anchors,
            lifestyle: { ...final, practice_extras: extras },
          } as any,
        } as any,
        { onConflict: "user_id" },
      );

      // 3) Mirror anchors to localStorage so the reminders hook picks them
      //    up immediately without needing a refetch round-trip.
      try {
        localStorage.setItem("off_app_anchors_v1", JSON.stringify(anchors));
      } catch {}

      try { localStorage.removeItem(`lifestyle_draft_${userId}`); } catch {}
      onComplete(final);
    } catch (e) {
      console.error("Lifestyle save failed", e);
      // Still let the user proceed — never block the journey.
      onComplete(final);
    } finally {
      setSaving(false);
    }
  }, [answers, extras, userId, name, onComplete]);

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-background ambient-bg flex flex-col">
      {/* ambient halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 20%, hsl(var(--primary) / 0.18), transparent 65%)" }}
      />

      {/* Header — progress + skip */}
      <div className="relative z-10 px-5 pt-5 pb-3 flex items-center gap-3">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="p-2 rounded-full bg-card/40 border border-border/40 disabled:opacity-30"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex-1 h-1 rounded-full bg-card/40 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] font-display tracking-[0.25em] text-muted-foreground uppercase">
          {idx + 1}/{QUESTIONS.length}
        </span>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="p-6 pb-4 text-center">
                <p className="text-[10px] font-display tracking-[0.3em] text-primary/80 uppercase mb-2">
                  About you
                </p>
                <h2 className="font-display text-xl text-foreground leading-snug mb-1.5">
                  {q.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed px-2">
                  {q.subtitle}
                </p>
              </div>

              <div className="px-5 pb-5">
                {q.type === "choice" && q.choices && (
                  <ChoiceGrid choices={q.choices} value={value} onPick={setAnswer} />
                )}
                {q.type === "time" && (
                  <>
                    <TimePicker value={value} onChange={setAnswer} />
                  </>
                )}
                {q.type === "country" && (
                  <CountryPicker value={value} onPick={setAnswer} />
                )}
              </div>
            </div>

            {/* Action row */}
            <div className="mt-5 flex flex-col items-center justify-center gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => isLast ? finish() : setIdx((i) => i + 1)}
                disabled={!canNext || saving}
                className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 disabled:opacity-30 hover:bg-primary/90 transition"
              >
                {saving ? "Saving…" : isLast ? "Meet the Elder" : "Next"}
                {!saving && (isLast ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </motion.button>
              {!saving && q.type !== "extras" && (
                <button
                  onClick={() => {
                    // Clear any partial answer so defaults take over
                    setAnswers((a) => {
                      const next = { ...a };
                      delete (next as any)[q.id];
                      persistDraft(next);
                      return next;
                    });
                    if (isLast) finish(); else setIdx((i) => i + 1);
                  }}
                  className="text-[11px] text-muted-foreground/80 hover:text-foreground transition pt-1"
                >
                  Skip this question — you can set it later in <span className="text-foreground/80">Settings</span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────
function ExtrasPicker({ extras, onChange }: { extras: PracticeExtras; onChange: (p: Partial<PracticeExtras>) => void }) {
  const items: { key: keyof PracticeExtras; Icon: React.ComponentType<any>; label: string; hint: string }[] = [
    { key: "micro_practices", Icon: Zap, label: "Short in-app practices", hint: "1–3 min awareness drills between sessions" },
    { key: "off_app_tasks",   Icon: Trees, label: "Off-app real-world tasks", hint: "Tiny missions to weave practice into your day" },
  ];
  return (
    <div className="space-y-2.5">
      {items.map(({ key, Icon, label, hint }) => {
        const on = extras[key];
        return (
          <button
            key={key}
            onClick={() => onChange({ [key]: !on } as Partial<PracticeExtras>)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
              on
                ? "bg-primary/15 border-primary/60 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]"
                : "bg-background/40 border-border/30 hover:border-border/60"
            }`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${on ? "text-primary" : "text-foreground/70"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-display ${on ? "text-primary" : "text-foreground"}`}>{label}</p>
              <p className="text-[10px] text-muted-foreground leading-snug">{hint}</p>
            </div>
            <span
              className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${on ? "bg-primary" : "bg-muted"}`}
              aria-hidden
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all"
                style={{ left: on ? 18 : 2 }}
              />
            </span>
          </button>
        );
      })}
      <p className="text-center text-[10px] text-muted-foreground/70 pt-1">
        Skip with Next — change anytime in Settings.
      </p>
    </div>
  );
}

function ChoiceGrid({ choices, value, onPick }: { choices: Choice[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {choices.map((c) => {
        const active = value === c.value;
        const Icon = c.Icon;
        return (
          <motion.button
            key={c.value}
            whileTap={{ scale: 0.96 }}
            onClick={() => onPick(c.value)}
            className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
              active
                ? "bg-primary/15 border-primary/60 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]"
                : "bg-background/40 border-border/30 hover:border-border/60 hover:bg-background/60"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-foreground/70"}`} />
            <span className={`text-[12px] font-display leading-tight ${active ? "text-primary" : "text-foreground"}`}>
              {c.label}
            </span>
            {c.hint && (
              <span className="text-[9px] text-muted-foreground leading-tight px-1">
                {c.hint}
              </span>
            )}
            {active && (
              <motion.span
                layoutId="choice-check"
                className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
              >
                <Check className="h-2.5 w-2.5" />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Parse loose input like "7am", "7:30 pm", "19:45", "7.30", "0730" → "HH:MM"
  const parseLoose = useCallback((raw: string): string | null => {
    if (!raw) return null;
    const s = raw.trim().toLowerCase().replace(/\s+/g, "");
    const ampm = s.endsWith("am") ? "am" : s.endsWith("pm") ? "pm" : "";
    const core = ampm ? s.slice(0, -2) : s;
    const m = core.match(/^(\d{1,2})(?:[:.h]?(\d{2}))?$/);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    if (isNaN(h) || isNaN(min) || min > 59) return null;
    if (ampm === "pm" && h < 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    if (h > 23) return null;
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }, []);

  const [text, setText] = useState(value);
  // Keep text in sync when value changes externally (preset / nudge / new question)
  useMemo(() => { setText(value); }, [value]);

  const commit = (raw: string) => {
    const parsed = parseLoose(raw);
    if (parsed) { onChange(parsed); setText(parsed); }
    else setText(value);
  };

  const nudge = (mins: number) => {
    const [h, m] = (value || "06:30").split(":").map(Number);
    const total = ((h * 60 + m + mins) % 1440 + 1440) % 1440;
    const nh = Math.floor(total / 60);
    const nm = total % 60;
    onChange(`${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`);
  };

  const setNow = () => {
    const d = new Date();
    onChange(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  };

  // Full-day grid in 30-min steps so any hour is one tap away
  const presets = useMemo(() => {
    const out: string[] = [];
    for (let h = 4; h < 24; h++) {
      out.push(`${String(h).padStart(2, "0")}:00`);
      out.push(`${String(h).padStart(2, "0")}:30`);
    }
    return out;
  }, []);

  const formatLabel = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ap = h >= 12 ? "p" : "a";
    const hh = ((h + 11) % 12) + 1;
    return m === 0 ? `${hh}${ap}` : `${hh}:${String(m).padStart(2, "0")}${ap}`;
  };

  return (
    <div className="space-y-3">
      {/* Big typeable display */}
      <div className="flex items-center justify-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit((e.target as HTMLInputElement).value); }
            else if (e.key === "ArrowUp") { e.preventDefault(); nudge(15); }
            else if (e.key === "ArrowDown") { e.preventDefault(); nudge(-15); }
          }}
          placeholder="7:30 am"
          aria-label="Time"
          className="text-3xl font-display tracking-wide bg-transparent text-foreground text-center focus:outline-none border-b border-border/40 pb-1 w-44"
        />
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Pick time"
          className="w-7 h-7 opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none p-0"
        />
      </div>

      {/* Quick adjust + now */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => nudge(-30)} className="px-2.5 py-1 rounded-md text-[11px] font-display bg-background/40 border border-border/30 text-muted-foreground hover:text-foreground">−30m</button>
        <button onClick={() => nudge(-5)} className="px-2.5 py-1 rounded-md text-[11px] font-display bg-background/40 border border-border/30 text-muted-foreground hover:text-foreground">−5m</button>
        <button onClick={setNow} className="px-3 py-1 rounded-md text-[11px] font-display bg-primary/15 border border-primary/40 text-primary">Now</button>
        <button onClick={() => nudge(5)} className="px-2.5 py-1 rounded-md text-[11px] font-display bg-background/40 border border-border/30 text-muted-foreground hover:text-foreground">+5m</button>
        <button onClick={() => nudge(30)} className="px-2.5 py-1 rounded-md text-[11px] font-display bg-background/40 border border-border/30 text-muted-foreground hover:text-foreground">+30m</button>
      </div>

      {/* Scrollable full-day grid */}
      <div className="max-h-44 overflow-y-auto rounded-xl border border-border/30 bg-background/20 p-2">
        <div className="grid grid-cols-4 gap-1.5">
          {presets.map((t) => {
            const active = value === t;
            return (
              <button
                key={t}
                onClick={() => onChange(t)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-display tracking-wide transition-colors ${
                  active
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "bg-background/40 text-muted-foreground border border-border/20 hover:text-foreground"
                }`}
              >
                {formatLabel(t)}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-center text-[10px] text-muted-foreground/70">Type "7am" or "19:45" • ↑↓ to nudge by 15m</p>
    </div>
  );
}

function CountryPicker({ value, onPick }: { value: string; onPick: (v: string) => void }) {
  const [custom, setCustom] = useState("");
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {POPULAR_COUNTRIES.map((c) => {
          const active = value === c;
          return (
            <button
              key={c}
              onClick={() => onPick(c)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                active
                  ? "bg-primary/15 border-primary/60"
                  : "bg-background/40 border-border/30 hover:border-border/60"
              }`}
            >
              <Globe2 className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-display ${active ? "text-primary" : "text-foreground"}`}>
                {c}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Or type your country…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onBlur={() => custom.trim() && onPick(custom.trim())}
          onKeyDown={(e) => { if (e.key === "Enter" && custom.trim()) onPick(custom.trim()); }}
          className="flex-1 px-3 py-2 bg-background/40 border border-border/30 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
        />
      </div>
    </div>
  );
}
