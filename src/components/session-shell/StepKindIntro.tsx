import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { StepKind } from "@/lib/session-shell/types";

/**
 * StepKindIntro
 * ──────────────────────────────────────────────────────────────
 * The FIRST time a user encounters each kind of session step
 * (breathwork, witness, self-inquiry, guide chat, wisdom, etc.)
 * we show a small, dismissible explainer card above the step —
 * one sentence about what it is and how to engage with it.
 *
 * This is the "onboarding by doing" answer to: users don't know
 * what a loop / observation / witness / kriya is yet, and a
 * single upfront video can't cover all 9+ step kinds a session
 * can weave together.
 *
 * Seen-status is stored in localStorage keyed by step kind so
 * it never repeats after the first encounter.
 */

const SEEN_KEY = "session-step-intro-seen:v1";

type IntroCopy = {
  eyebrow: string;
  title: string;
  body: string;
  tip: string;
};

const INTROS: Record<StepKind, IntroCopy> = {
  "wisdom-read": {
    eyebrow: "New here",
    title: "This is a Wisdom read",
    body: "A short teaching from a master — a few lines meant to be read slowly, not skimmed. Let it land before you tap next.",
    tip: "Read it twice. The second read is where it opens.",
  },
  breathwork: {
    eyebrow: "New here",
    title: "This is Breathwork",
    body: "You'll follow a guided breathing rhythm — usually in through the nose, out through the mouth. The screen paces you.",
    tip: "Sit comfortably. Even 60 seconds shifts your nervous system.",
  },
  journal: {
    eyebrow: "New here",
    title: "This is a Journal moment",
    body: "A prompt to write to — not for anyone else, only you. There is no wrong answer. One line is enough.",
    tip: "Write the first thing, not the best thing.",
  },
  "micro-act": {
    eyebrow: "New here",
    title: "This is a Micro-act",
    body: "One small real-world action to carry out of this session — a text message, a pause, a look at the sky. Small on purpose.",
    tip: "Commit to it before you tap next.",
  },
  reflection: {
    eyebrow: "New here",
    title: "This is a Reflection",
    body: "A quiet question to sit with. No typing needed — just let it turn over inside you for a moment.",
    tip: "Don't try to answer. Let the question do the work.",
  },
  "guide-chat": {
    eyebrow: "New here",
    title: "This is Guide chat",
    body: "Talk to your guide as you would a wise friend. Ask anything — about the day, the practice, or what's on your mind.",
    tip: "The more real you are, the more useful the reply.",
  },
  practice: {
    eyebrow: "New here",
    title: "This is a Practice",
    body: "A guided inner practice — meditation, self-inquiry, mantra, or witnessing. The screen walks you through, step by step.",
    tip: "Close your eyes when it feels right. The voice will guide you.",
  },
  "temple-chat": {
    eyebrow: "New here",
    title: "This is the Temple council",
    body: "A conversation with more than one master at once. Different traditions, one question — yours.",
    tip: "Ask the hard thing. That's what they're here for.",
  },
  witness: {
    eyebrow: "New here",
    title: "This is Witnessing",
    body: "Instead of fixing or analyzing, you simply watch — thoughts, sensations, emotions — as if from one step back. That gap is the practice.",
    tip: "You are not the thoughts. You are the one noticing them.",
  },
  silent_sit: {
    eyebrow: "New here",
    title: "This is Pure Silence",
    body: "No prompts. No counting. Just sitting. The timer runs. You don't have to do anything.",
    tip: "The mind will try to fill the silence. Let it. The silence is still there.",
  },
  body_scan: {
    eyebrow: "New here",
    title: "This is a Body Scan",
    body: "We'll move through your body slowly — feet, legs, belly, chest, hands, face. Don't change anything. Just notice.",
    tip: "The body knows what the mind has forgotten.",
  },
  gratitude: {
    eyebrow: "New here",
    title: "This is Gratitude",
    body: "Name three things you're grateful for. They can be small — a sound, a feeling, a moment.",
    tip: "Gratitude is not a feeling. It's a practice. The feeling comes after.",
  },
  loving_kindness: {
    eyebrow: "New here",
    title: "This is Loving Kindness",
    body: "A metta practice. Begin with yourself, then expand outward — to someone you love, someone neutral, someone difficult, all beings.",
    tip: "Begin with yourself. Not selfish — necessary.",
  },
  forgiveness: {
    eyebrow: "New here",
    title: "This is Forgiveness",
    body: "A gentle practice. No force. No grand gestures. Just honesty. Who needs forgiving? What needs releasing?",
    tip: "Forgiveness is not for them. It is for you.",
  },
  movement: {
    eyebrow: "New here",
    title: "This is Movement",
    body: "A simple physical movement — stretch, release, shift. Timer-guided. Follow the instructions slowly.",
    tip: "The body is the door. Move through it.",
  },
  walking: {
    eyebrow: "New here",
    title: "This is Walking Meditation",
    body: "Walk very slowly. Feel the lift. The step. The landing. Each phase is its own practice.",
    tip: "Slow down until it feels almost too slow. That's the pace.",
  },
  yoga_asana: {
    eyebrow: "New here",
    title: "This is a Yoga Asana",
    body: "Hold a pose. Breathe into it. The timer guides the duration. Stay with the sensation.",
    tip: "The pose is not the point. The awareness is.",
  },
  sound_bath: {
    eyebrow: "New here",
    title: "This is a Sound Bath",
    body: "Let sound move through you. No analysis. No naming. Just receive. The timer holds the space.",
    tip: "Sound bypasses the mind. Let it.",
  },
  mantra: {
    eyebrow: "New here",
    title: "This is Mantra",
    body: "Repeat a word or phrase. Silently or aloud. Let the sound become the mind. The counter tracks your repetitions.",
    tip: "What you repeat, you become.",
  },
  visualization: {
    eyebrow: "New here",
    title: "This is Visualization",
    body: "Let images come. Don't force them. The guide will lead you through scenes — just follow along.",
    tip: "The mind already has the image. This brings it forward.",
  },
  scripture: {
    eyebrow: "New here",
    title: "This is Wisdom Reading",
    body: "Passages from masters and traditions, revealed line by line. Read slowly. Let each line land.",
    tip: "The teaching isn't new. Your ear is.",
  },
  affirmation: {
    eyebrow: "New here",
    title: "This is an Affirmation",
    body: "A phrase to hold — not to believe, but to sit with. Repeat it. Let it land.",
    tip: "Speak it until it sounds like the truth. Then it is.",
  },
  contemplation: {
    eyebrow: "New here",
    title: "This is Contemplation",
    body: "A question to sit with. No answer needed. The question is the practice. Gentle prompts will appear to bring you back.",
    tip: "The answer is beside the point. The sitting is the point.",
  },
  noticing: {
    eyebrow: "New here",
    title: "This is Noticing",
    body: "Notice and name what arises — thoughts, feelings, sensations. Don't analyze. Just name. Tap to count what you notice.",
    tip: "What you notice, you own. What you own, you can release.",
  },
  stretching: {
    eyebrow: "New here",
    title: "This is Stretching",
    body: "Release tension through gentle stretches. Each one timed. Move slowly. No force.",
    tip: "Release slowly. Force creates the same tension it's trying to release.",
  },
  tai_chi: {
    eyebrow: "New here",
    title: "This is Tai Chi",
    body: "Slow, flowing movement. One posture at a time. The timer guides the pace. Follow the breath.",
    tip: "In slowness, everything is visible.",
  },
  balance: {
    eyebrow: "New here",
    title: "This is Balance",
    body: "Stand on one foot. Soften the knee. Find still. Timer-guided. Switch sides when ready.",
    tip: "Balance isn't about not falling. It's about recovering.",
  },
  "free_write": {
    eyebrow: "New here",
    title: "This is Free Write",
    body: "Write for the full duration. No editing. No censorship. Just keep the pen moving. The first sentence is enough.",
    tip: "The mind streams. Let it.",
  },
  plan: {
    eyebrow: "New here",
    title: "This is Planning",
    body: "Name one thing. Then one way. Then one sign. Three sections. One true intention.",
    tip: "An unnamed intention stays a wish. Naming makes it real.",
  },
};

function readSeen(): Record<string, true> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, true>) : {};
  } catch {
    return {};
  }
}

function markSeen(kind: StepKind) {
  try {
    const cur = readSeen();
    cur[kind] = true;
    localStorage.setItem(SEEN_KEY, JSON.stringify(cur));
  } catch {
    /* ignore */
  }
}

interface Props {
  kind: StepKind;
}

export default function StepKindIntro({ kind }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = readSeen();
    if (!seen[kind]) setOpen(true);
    else setOpen(false);
  }, [kind]);

  function dismiss() {
    markSeen(kind);
    setOpen(false);
  }

  const copy = INTROS[kind];
  if (!copy) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={`intro-${kind}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mb-4 w-full max-w-md px-4"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/5 p-4 backdrop-blur-sm">
            <button
              onClick={dismiss}
              aria-label="Dismiss explainer"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-primary/70">
              {copy.eyebrow}
            </p>
            <h3 className="mb-1.5 font-display text-base text-foreground">
              {copy.title}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">
              {copy.body}
            </p>
            <p className="mt-2 text-xs italic text-muted-foreground">
              {copy.tip}
            </p>
            <button
              onClick={dismiss}
              className="mt-3 text-[11px] uppercase tracking-[0.22em] text-primary/80 hover:text-primary transition"
            >
              Got it — begin
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
