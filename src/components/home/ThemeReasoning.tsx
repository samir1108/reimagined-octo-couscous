/**
 * ThemeReasoning — "Why the Elder chose this theme today"
 * Reveals the hidden layers powering today's daily theme:
 *  - Yoga path blend (Karma / Bhakti / Jnana / Raja)
 *  - Target dimensions (thought / emotion / body / awareness)
 *  - Loop being observed
 *  - Journey context
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Target, Layers, Compass, Brain, AlertTriangle, Check, TrendingUp, Wind, Tag, Compass as CompassIcon, X } from "lucide-react";

type Intensity = "soft" | "medium" | "strong";

interface PredictionVariant {
  mind: string;
  body: string;
  trap: string;
}

// Intensity-aware predictions — same loop, different volume
const PREDICTIONS: Record<string, Record<Intensity, PredictionVariant>> = {
  "need for validation": {
    soft:   { mind: "may wonder 'did they see that?'", body: "a faint pull in the chest.", trap: "you'll add one extra sentence to be sure." },
    medium: { mind: "will whisper: 'no one will notice if you don't say it.'", body: "tightens in the chest when ignored.", trap: "you'll over-explain or seek a reaction." },
    strong: { mind: "will demand proof you matter.", body: "chest grips; throat tight; urge to perform.", trap: "you'll chase a reply, like, or look." },
  },
  "need to control": {
    soft:   { mind: "drafts a small backup plan.", body: "shoulders lift slightly.", trap: "you'll re-check one thing 'just in case.'" },
    medium: { mind: "will rehearse outcomes and 'what-ifs' on loop.", body: "jaw clenches; shoulders rise.", trap: "you'll micromanage one small thing to feel safe." },
    strong: { mind: "insists nothing is okay until everything is fixed.", body: "whole body braces; breath shortens.", trap: "you'll grip harder the moment you feel slip." },
  },
  "avoidance": {
    soft:   { mind: "suggests 'just five more minutes.'", body: "a soft heaviness.", trap: "you'll switch tabs once." },
    medium: { mind: "will offer 10 'better' things to do.", body: "feels heavy, sleepy, scattered.", trap: "you'll open a screen instead of sitting with it." },
    strong: { mind: "convinces you it's not the right day.", body: "fog, fatigue, restlessness — all at once.", trap: "you'll vanish into hours of distraction." },
  },
  "overthinking": {
    soft:   { mind: "circles a single question politely.", body: "slight tension behind the eyes.", trap: "you'll re-read the same line." },
    medium: { mind: "will spin the same thought from new angles.", body: "shallow breath; restless legs.", trap: "you'll mistake analysis for action." },
    strong: { mind: "loops with no exit door.", body: "tight chest, racing pulse, locked jaw.", trap: "you'll postpone living until you 'figure it out.'" },
  },
  "emotional reactivity": {
    soft:   { mind: "labels things faster than usual.", body: "a small spark in the chest.", trap: "you'll send a slightly sharper message." },
    medium: { mind: "will justify the first reaction as 'true.'", body: "heat rises in chest or face.", trap: "you'll respond before you feel." },
    strong: { mind: "fuses with the emotion as identity.", body: "flush, tremor, voice rising.", trap: "you'll act in a way you'll need to repair later." },
  },
  "self-judgment": {
    soft:   { mind: "offers a small critique.", body: "a brief inward pull.", trap: "you'll dismiss a small win." },
    medium: { mind: "will replay what you 'should have' done.", body: "shoulders curl inward; eyes drop.", trap: "you'll punish yourself instead of noticing." },
    strong: { mind: "writes a verdict about who you are.", body: "heaviness, low energy, withdrawal.", trap: "you'll confuse self-attack with growth." },
  },
  "patterns of unconscious reaction": {
    soft:   { mind: "skips one micro-moment of choice.", body: "you act before you blink.", trap: "you'll catch it 10 seconds late." },
    medium: { mind: "will say 'this is just how I am.'", body: "moves on autopilot — you'll only catch it after.", trap: "you'll forget the theme by mid-day." },
    strong: { mind: "denies a pattern is even there.", body: "the body runs the script; the mind narrates.", trap: "you'll mistake the loop for your personality." },
  },
};

// 3-step response plan per loop (Pause · Label · Redirect)
const RESPONSE_PLANS: Record<string, { pause: string; label: string; redirect: string }> = {
  "need for validation": {
    pause: "One slow breath before you reach for the reply.",
    label: "Say silently: 'seeking proof I matter.'",
    redirect: "Place a hand on your chest. Stay 10 seconds.",
  },
  "need to control": {
    pause: "Drop your shoulders. Exhale longer than you inhale.",
    label: "Name it: 'gripping for safety.'",
    redirect: "Choose one thing you'll consciously not fix.",
  },
  "avoidance": {
    pause: "Stand up. Three breaths before any screen.",
    label: "Say: 'I'm leaving the moment.'",
    redirect: "Sit with the feeling for 60 seconds — no fix.",
  },
  "overthinking": {
    pause: "Close your eyes. Inhale 4, exhale 6.",
    label: "Whisper: 'thinking about thinking.'",
    redirect: "Put attention in your feet for 30 seconds.",
  },
  "emotional reactivity": {
    pause: "Wait one full breath before responding.",
    label: "Name the emotion in one word.",
    redirect: "Feel where it lives in the body, then choose.",
  },
  "self-judgment": {
    pause: "Soften the jaw. Drop the shoulders.",
    label: "Notice: 'judge is speaking — not me.'",
    redirect: "Offer one true, kind sentence to yourself.",
  },
  "patterns of unconscious reaction": {
    pause: "The instant you notice — freeze for 2 seconds.",
    label: "Say: 'pattern, not personality.'",
    redirect: "Make one small different choice on purpose.",
  },
};

interface ThemeReasoningProps {
  theme: any;
  journeyDay: number;
  vLevel?: number;
  activeLoops?: string[];
}

// Derive per-path user level (1-5) from journey day + V-Level
// Each path grows at a different rate based on dominant theme exposure
function computePathLevels(journeyDay: number, vLevel: number = 2) {
  const base = Math.min(5, Math.max(1, Math.floor(journeyDay / 20) + 1));
  const vBoost = Math.floor(vLevel / 3); // 0-3
  return {
    karma: Math.min(5, base + (journeyDay % 4 === 0 ? 1 : 0)),
    bhakti: Math.min(5, Math.max(1, base - 1 + vBoost)),
    jnana: Math.min(5, base + Math.floor(vBoost / 2)),
    raja: Math.min(5, Math.max(1, base + vBoost - 1)),
  };
}

const PATH_LEVEL_NAMES: Record<string, string[]> = {
  karma: ["Beginner Doer", "Mindful Actor", "Detached Worker", "Selfless Server", "Pure Offering"],
  bhakti: ["Curious Heart", "Open Heart", "Trusting Heart", "Devoted Heart", "Surrendered Heart"],
  jnana: ["Questioner", "Observer", "Witness", "Inquirer", "Knower"],
  raja: ["Restless", "Steadying", "Disciplined", "One-Pointed", "Absorbed"],
};

// Heuristic: derive a yoga blend + dimension targets from theme content
// (Backend can later return these explicitly; this gives a consistent UI now.)
function deriveBlend(theme: any) {
  const text = `${theme?.title || ""} ${theme?.description || ""} ${(theme?.focus_areas || []).join(" ")}`.toLowerCase();

  const paths: { key: string; label: string; weight: number; emoji: string }[] = [
    { key: "karma", label: "Karma Yoga", weight: 0, emoji: "⚡" },
    { key: "bhakti", label: "Bhakti Yoga", weight: 0, emoji: "🙏" },
    { key: "jnana", label: "Jnana Yoga", weight: 0, emoji: "🧠" },
    { key: "raja", label: "Raja Yoga", weight: 0, emoji: "🧘" },
  ];

  if (/(act|action|do|serve|task|work|effort)/.test(text)) paths[0].weight += 2;
  if (/(offer|surrender|devot|trust|love|heart|accept)/.test(text)) paths[1].weight += 2;
  if (/(observ|notic|witness|aware|inquir|see|watch|question)/.test(text)) paths[2].weight += 2;
  if (/(disciplin|breath|stillness|focus|practice|silence|pause)/.test(text)) paths[3].weight += 2;

  // Default fallback so UI never feels empty
  if (paths.every((p) => p.weight === 0)) {
    paths[2].weight = 2;
    paths[3].weight = 1;
  }

  const sorted = paths.filter((p) => p.weight > 0).sort((a, b) => b.weight - a.weight);
  const dominant = sorted[0];
  const support = sorted[1];

  const dims: string[] = [];
  if (/(thought|mind|story|narrativ|belief|question)/.test(text)) dims.push("Thought");
  if (/(emot|feel|heart|fear|anger|joy|sad|grief)/.test(text)) dims.push("Emotion");
  if (/(body|breath|sensation|posture|somatic)/.test(text)) dims.push("Body");
  if (/(aware|witness|presence|observ|consciousness)/.test(text)) dims.push("Awareness");
  if (dims.length === 0) dims.push("Awareness");

  // Loop heuristic
  let loop = "patterns of unconscious reaction";
  if (/(validat|appreciat|recogni)/.test(text)) loop = "need for validation";
  else if (/(control|fix|manag)/.test(text)) loop = "need to control";
  else if (/(avoid|escape|distract)/.test(text)) loop = "avoidance";
  else if (/(overthink|analyz|loop|rumin)/.test(text)) loop = "overthinking";
  else if (/(react|trigger|irritat|anger)/.test(text)) loop = "emotional reactivity";
  else if (/(judg|compar|criticiz)/.test(text)) loop = "self-judgment";

  return { dominant, support, dims, loop };
}

// ---- Resistance acknowledgement storage (localStorage, daily) ----
const ACK_KEY = "resistance_ack_log_v1";
const todayKey = () => new Date().toISOString().slice(0, 10);

function readAckLog(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(ACK_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeAckLog(log: Record<string, number>) {
  try { localStorage.setItem(ACK_KEY, JSON.stringify(log)); } catch {}
  try { window.dispatchEvent(new CustomEvent("resistance-ack-updated")); } catch {}
}

export default function ThemeReasoning({ theme, journeyDay, vLevel, activeLoops }: ThemeReasoningProps) {
  const [open, setOpen] = useState(false);
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [ackLog, setAckLog] = useState<Record<string, number>>(() => readAckLog());

  useEffect(() => {
    const handler = () => setAckLog(readAckLog());
    window.addEventListener("storage", handler);
    window.addEventListener("resistance-ack-updated", handler as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("resistance-ack-updated", handler as EventListener);
    };
  }, []);

  const blend = useMemo(() => (theme ? deriveBlend(theme) : null), [theme]);
  const levels = useMemo(() => computePathLevels(journeyDay, vLevel), [journeyDay, vLevel]);

  // Allow external triggers (e.g. HomeSideRail "Reasoning" pill) to open this modal
  // MUST be declared before any early return to keep hook order stable.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("home:open-reasoning", handler);
    return () => window.removeEventListener("home:open-reasoning", handler);
  }, []);

  if (!theme || !blend || typeof document === "undefined") return null;
  const { dominant, support, dims, loop } = blend;

  const pathOrder: { key: keyof typeof levels; label: string; emoji: string; tint: string }[] = [
    { key: "karma", label: "Karma", emoji: "⚡", tint: "from-amber-500/20 to-amber-500/5 border-amber-400/30 text-amber-700 dark:text-amber-200" },
    { key: "bhakti", label: "Bhakti", emoji: "🙏", tint: "from-rose-500/20 to-rose-500/5 border-rose-400/30 text-rose-700 dark:text-rose-200" },
    { key: "jnana", label: "Jnana", emoji: "🧠", tint: "from-sky-500/20 to-sky-500/5 border-sky-400/30 text-sky-200" },
    { key: "raja", label: "Raja", emoji: "🧘", tint: "from-violet-500/20 to-violet-500/5 border-violet-400/30 text-violet-700 dark:text-violet-200" },
  ];

  const predBundle = PREDICTIONS[loop] || PREDICTIONS["patterns of unconscious reaction"];
  const pred = predBundle[intensity];
  const plan = RESPONSE_PLANS[loop] || RESPONSE_PLANS["patterns of unconscious reaction"];
  const todayCount = ackLog[todayKey()] || 0;
  const last7 = (() => {
    const out: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      out.push({ day: k.slice(5), count: ackLog[k] || 0 });
    }
    return out;
  })();
  const weekTotal = last7.reduce((s, d) => s + d.count, 0);
  const peak = Math.max(1, ...last7.map((d) => d.count));

  const handleAcknowledge = () => {
    const log = { ...readAckLog() };
    log[todayKey()] = (log[todayKey()] || 0) + 1;
    writeAckLog(log);
    setAckLog(log);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      {createPortal(
        <AnimatePresence>
          {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center bg-background/85 backdrop-blur-md p-0 sm:p-6"
            onClick={() => setOpen(false)}
          >
            {/* Floating close — sibling of panel so it stays at viewport top-right
                regardless of panel scroll position. */}
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full flex items-center justify-center bg-background/90 backdrop-blur-md border border-border text-foreground hover:bg-background transition-all shadow-xl"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full sm:max-w-lg sm:rounded-3xl bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-2xl border border-border/50 shadow-2xl overflow-y-auto max-h-screen sm:max-h-[90vh]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-xl border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-display tracking-[0.2em] uppercase text-foreground font-semibold">
                    Why This Theme
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
              {/* Elder's reasoning */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-3.5 h-3.5 text-amber-400/80" />
                  <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/70">
                    Elder's reasoning
                  </span>
                </div>
                <p className="text-sm font-body text-foreground/85 leading-relaxed italic">
                  {theme.deepened_reasoning ||
                    theme.theme_rationale ||
                    `On day ${journeyDay}, your path calls for ${dominant.label.toLowerCase()} — softened by ${support?.label?.toLowerCase() || "presence"}. Today we observe the subtle ${loop}.`}
                </p>
              </div>

              {/* Yoga path blend */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Layers className="w-3.5 h-3.5 text-violet-400/80" />
                  <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/70">
                    Path blend
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-xs font-display text-violet-700 dark:text-violet-200">
                    {dominant.emoji} {dominant.label} <span className="opacity-60">· dominant</span>
                  </span>
                  {support && (
                    <span className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-400/20 text-xs font-display text-rose-700/90 dark:text-rose-200/90">
                      {support.emoji} {support.label} <span className="opacity-60">· support</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Your levels — per yoga path */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary/80" />
                  <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/70">
                    Your levels
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pathOrder
                    .filter((p) => p.key === dominant.key || p.key === support?.key)
                    .map((p) => {
                    const lvl = levels[p.key];
                    const isDominant = dominant.key === p.key;
                    const isSupport = support?.key === p.key;
                    return (
                      <div
                        key={p.key}
                        className={`relative p-2.5 rounded-xl bg-gradient-to-br ${p.tint} border ${
                          isDominant ? "ring-1 ring-primary/40" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-display tracking-wide flex items-center gap-1">
                            <span>{p.emoji}</span>
                            <span>{p.label}</span>
                          </span>
                          <span className="text-[10px] font-display opacity-70">L{lvl}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`flex-1 h-1 rounded-full ${
                                i <= lvl ? "bg-current opacity-80" : "bg-current opacity-15"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[9px] font-body opacity-70 leading-tight">
                          {PATH_LEVEL_NAMES[p.key][lvl - 1]}
                          {isDominant && " · today"}
                          {isSupport && " · support"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400/80" />
                  <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground/70">
                    Targeting today
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dims.map((d) => (
                    <span
                      key={d}
                      className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-[11px] font-display text-emerald-700/90 dark:text-emerald-200/90"
                    >
                      {d}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-[11px] font-display text-amber-700/90 dark:text-amber-200/90">
                    Loop: {loop}
                  </span>
                </div>
              </div>

              {/* What to expect — intensity-aware prediction + 3-step plan + acknowledge */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-500/10 to-rose-500/5 border border-orange-400/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400/80" />
                    <span className="text-[10px] font-display tracking-[0.2em] uppercase text-orange-700/80 dark:text-orange-200/80">
                      What to expect
                    </span>
                  </div>
                  <div className="flex gap-1 p-0.5 rounded-full bg-background/30 border border-orange-400/20">
                    {(["soft", "medium", "strong"] as Intensity[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setIntensity(lvl)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-display tracking-wider uppercase transition-all ${
                          intensity === lvl
                            ? "bg-orange-400/30 text-orange-800 dark:text-orange-100"
                            : "text-orange-700/50 dark:text-orange-200/50 hover:text-orange-700/80 dark:text-orange-200/80"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs font-body text-foreground/80 leading-relaxed">
                  <li className="flex gap-2">
                    <Brain className="w-3 h-3 mt-0.5 shrink-0 text-orange-600/70 dark:text-orange-300/70" />
                    <span><span className="text-orange-700/90 dark:text-orange-200/90">Your mind</span> {pred.mind}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-3 h-3 mt-0.5 shrink-0 text-center text-orange-600/70 dark:text-orange-300/70 text-[10px]">◐</span>
                    <span><span className="text-orange-700/90 dark:text-orange-200/90">Your body</span> {pred.body}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-3 h-3 mt-0.5 shrink-0 text-center text-rose-600/70 dark:text-rose-300/70 text-[10px]">⚠</span>
                    <span><span className="text-rose-700/90 dark:text-rose-200/90">The trap:</span> {pred.trap}</span>
                  </li>
                </ul>

                {/* 3-step response plan */}
                <div className="pt-2.5 border-t border-orange-400/15">
                  <div className="flex items-center gap-2 mb-2">
                    <CompassIcon className="w-3 h-3 text-emerald-600/80 dark:text-emerald-300/80" />
                    <span className="text-[10px] font-display tracking-[0.2em] uppercase text-emerald-700/80 dark:text-emerald-200/80">
                      When it happens
                    </span>
                  </div>
                  <ol className="space-y-1.5 text-xs font-body text-foreground/85 leading-relaxed">
                    <li className="flex gap-2">
                      <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-display flex items-center justify-center text-emerald-700 dark:text-emerald-200">1</span>
                      <span><Wind className="inline w-3 h-3 mr-1 -mt-0.5 text-emerald-600/80 dark:text-emerald-300/80" /><span className="text-emerald-700/90 dark:text-emerald-200/90">Pause —</span> {plan.pause}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-display flex items-center justify-center text-emerald-700 dark:text-emerald-200">2</span>
                      <span><Tag className="inline w-3 h-3 mr-1 -mt-0.5 text-emerald-600/80 dark:text-emerald-300/80" /><span className="text-emerald-700/90 dark:text-emerald-200/90">Label —</span> {plan.label}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-display flex items-center justify-center text-emerald-700 dark:text-emerald-200">3</span>
                      <span><CompassIcon className="inline w-3 h-3 mr-1 -mt-0.5 text-emerald-600/80 dark:text-emerald-300/80" /><span className="text-emerald-700/90 dark:text-emerald-200/90">Redirect —</span> {plan.redirect}</span>
                    </li>
                  </ol>
                </div>

                {/* Acknowledge + counter + 7-day trend */}
                <div className="pt-2.5 border-t border-orange-400/15 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={handleAcknowledge}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-[11px] font-display tracking-wide text-emerald-800 dark:text-emerald-100 transition-all active:scale-95"
                    >
                      <Check className="w-3 h-3" />
                      I notice it now
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] font-display tracking-wider uppercase text-emerald-700/80 dark:text-emerald-200/80">
                      <TrendingUp className="w-3 h-3" />
                      <span>Resistance noted</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-800 dark:text-emerald-100">
                        {todayCount} today · {weekTotal}/7d
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-8">
                    {last7.map((d, i) => (
                      <div key={d.day + i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className="w-full rounded-sm bg-emerald-400/60"
                          style={{ height: `${(d.count / peak) * 100}%`, minHeight: d.count > 0 ? 3 : 1, opacity: d.count > 0 ? 1 : 0.2 }}
                          title={`${d.day}: ${d.count}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] font-body text-muted-foreground/60 leading-tight">
                    Each tap trains the witness. Trends sync to your progress screen.
                  </p>
                </div>
              </div>


              <div className="pt-3 border-t border-border/30 flex items-center justify-between text-[10px] font-display tracking-wider uppercase text-muted-foreground/60">
                <span>Day {journeyDay}</span>
                {typeof vLevel === "number" && <span>V-Level {vLevel.toFixed(1)}</span>}
                {activeLoops && activeLoops.length > 0 && (
                  <span>{activeLoops.length} active loop{activeLoops.length > 1 ? "s" : ""}</span>
                )}
              </div>
            </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  );
}
