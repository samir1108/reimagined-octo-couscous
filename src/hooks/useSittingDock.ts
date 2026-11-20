/**
 * useSittingDock — the brain of The Dock (Gate 3).
 * ─────────────────────────────────
 * Chat stops being a step and becomes a property of every sitting step:
 * the breathing "Ask" orb is always present, and every exchange is seeded
 * with where the user is — the sitting's theme, the master's voice, the
 * current step, and every typed word so far.
 *
 * Words the user marks "keep" flow back into the sitting's answers, so
 * what is said to the guide sharpens the mapping just like a question
 * answer does.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface DockMessage {
  role: "user" | "guide";
  content: string;
  kept?: boolean;
}

/**
 * Structural minimum the Dock needs from a journey session. Kept structural
 * (not the First Eleven's SESession) so any journey — the eleven sittings or
 * the awakening journey — can reuse the Dock.
 */
export interface DockSessionLike {
  /** Position in the journey, 1-based. */
  n: number;
  title: string;
  /** The voice the guide speaks from. */
  master: string;
  essence?: string;
}

/** Structural minimum for the current step the user is on. */
export interface DockStepLike {
  kind: string;
  /** Pre-resolved human label for the beat (question title, act title…). */
  label?: string;
  /** How the beat should be described to the guide. */
  rolePhrase?: string;
  subtitle?: string;
  body?: string;
  seconds?: number;
  pattern?: string;
  rounds?: number;
}

/** How each journey beat should be described to the guide. */
export const DOCK_ROLE_PHRASES: Record<string, string> = {
  arrival: "the arrival check-in",
  observation: "the observation",
  investigation: "the investigation",
  practice: "the practice",
  application: "the real-world application",
  reflection: "the reflection",
  open: "the opening question",
  deepen: "going deeper",
  body: "the body question",
  mirror: "the mirror question — the one that turns it back",
  choice: "the turning — choosing one small act",
};

const dockKey = (uid: string, n: number) => `first_eleven_dock_${uid}_${n}`;

/** Builds the aiContext seed the guide-chat edge function receives. */
export function buildDockContext(input: {
  session: DockSessionLike;
  step: DockStepLike | null;
  typedWords: string[];
  /** e.g. "THE ELEVEN SITTINGS" or "THE AWAKENING JOURNEY". */
  journeyLabel?: string;
  /** e.g. "SITTING" or "SESSION". */
  stepLabel?: string;
  total?: number;
}): string {
  const { session, step, typedWords, journeyLabel = "THE ELEVEN SITTINGS", stepLabel = "SITTING", total = 11 } = input;
  const lines: string[] = [
    `--- ${journeyLabel} · ${stepLabel} ${session.n} of ${total} ---`,
    `Theme: ${session.title}${session.essence ? ` — ${session.essence}` : ""}`,
    `Master voice to speak from: ${session.master}. Never claim to BE them; speak as a wise sibling trained in their view.`,
  ];

  if (step) {
    if (step.kind === "question") {
      lines.push(`Current step — ${step.rolePhrase ?? "the question"}: "${step.label ?? ""}"`);
      if (step.subtitle) lines.push(`(subtitle: ${step.subtitle})`);
    } else if (step.kind === "silence") {
      lines.push(`Current step — a ${step.seconds ?? 60}-second silence. Prompt: ${step.body ?? step.label ?? ""}`);
    } else if (step.kind === "breath") {
      lines.push(`Current step — breath practice (${step.pattern ?? ""}, ${step.rounds ?? 4} rounds).`);
    } else {
      lines.push(`Current step — ${step.kind}: ${step.label ?? ""}${step.body ? ` — ${step.body}` : ""}`);
    }
  }

  if (typedWords.length) {
    lines.push(`The user's own words earlier in this session: ${typedWords.map((w) => `"${w}"`).join(" · ")}`);
  } else {
    lines.push("The user has not written anything yet this session.");
  }

  lines.push(
    "",
    "How to speak: brief (under 120 words unless asked for more), concrete, no flattery, no pep talks, no bullet lists.",
    "Ask one good question back more often than you explain. If the user is raw, be gentle; if they are performing honesty, name it kindly.",
    "Never break the session's frame: you are inside the conversation, not coaching about it.",
  );

  return lines.join("\n");
}

export function useSittingDock(input: {
  userId: string;
  session: DockSessionLike;
  step: DockStepLike | null;
  typedWords: string[];
  journeyLabel?: string;
  stepLabel?: string;
  total?: number;
}) {
  const { userId, session, step, typedWords, journeyLabel, stepLabel, total } = input;

  const [messages, setMessages] = useState<DockMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── hydrate from localStorage per sitting ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(dockKey(userId, session.n));
      setMessages(raw ? (JSON.parse(raw) as DockMessage[]) : []);
    } catch {
      setMessages([]);
    }
  }, [userId, session.n]);

  const persist = useCallback(
    (next: DockMessage[]) => {
      try { localStorage.setItem(dockKey(userId, session.n), JSON.stringify(next)); } catch { /* ignore */ }
    },
    [userId, session.n]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const aiContext = useMemo(
    () => buildDockContext({ session, step, typedWords, journeyLabel, stepLabel, total }),
    [session, step, typedWords, journeyLabel, stepLabel, total]
  );

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || sending) return;

      const userMsg: DockMessage = { role: "user", content: message };
      const history = [...messages, userMsg];
      setMessages(history);
      persist(history);
      setSending(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("guide-chat", {
          body: {
            messages: history
              .filter((m) => m.content.trim().length > 0)
              .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
            timeSlot: "evening",
            themeName: session.title,
            userName: "friend",
            mode: "sitting",
            language: "en",
            aiContext,
          },
        });
        if (fnError) throw fnError;

        const reply =
          (data as { reply?: string })?.reply ??
          (data as { message?: string })?.message ??
          (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content ??
          "Sit with that for a moment.";
        const next = [...history, { role: "guide" as const, content: String(reply) }];
        setMessages(next);
        persist(next);
      } catch (e) {
        const msg = (e as { message?: string })?.message ?? "The guide is quiet right now.";
        setError(/credit/i.test(msg) ? "The guide needs a few credits. Your words are kept either way." : msg);
      } finally {
        setSending(false);
      }
    },
    [aiContext, messages, persist, sending, session.title]
  );

  /** Mark/unmark a line as kept — kept lines flow into the sitting's answers. */
  const toggleKeep = useCallback(
    (index: number) => {
      setMessages((prev) => {
        const next = prev.map((m, i) => (i === index ? { ...m, kept: !m.kept } : m));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const keptLines = useMemo(
    () => messages.filter((m) => m.kept).map((m) => m.content),
    [messages]
  );

  const reset = useCallback(() => {
    setMessages([]);
    try { localStorage.removeItem(dockKey(userId, session.n)); } catch { /* ignore */ }
  }, [userId, session.n]);

  return {
    messages,
    open,
    setOpen,
    sending,
    error,
    send,
    toggleKeep,
    keptLines,
    reset,
    scrollRef,
  };
}

export const DOCK_QUICK_PROMPTS = [
  "Say more about this.",
  "What am I avoiding right now?",
  "Give me one practice for this.",
  "Is this normal?",
] as const;
