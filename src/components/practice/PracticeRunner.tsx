/**
 * PracticeRunner — Cinematic full-screen practice experience.
 * ─────────────────────────────────────────────────────────────
 * Opens when a user taps any practice. Looks like the Today/Temple flow:
 *   • Breathing orb timer (visual anchor + countdown)
 *   • Practice name + current level + step text
 *   • Live chat with a guru (via guru-practice-session edge fn)
 *   • Single close button (top-right)
 *
 * Pure presentation + edge-fn integration. No bottom sheets, no extra steps.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Pause, Play, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getPracticeById, type PracticeId } from "@/types/practices";

interface Props {
  practiceId: PracticeId;
  currentLevel: number;
  onClose: () => void;
  onComplete?: () => void | Promise<void>;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const DURATIONS = [60, 180, 300, 600, 900]; // 1m, 3m, 5m, 10m, 15m

const BREATH_PATTERNS: Record<string, { in: number; hold: number; out: number; holdOut?: number; label: string }> = {
  "p:breath-446-3m": { in: 4, hold: 4, out: 6, label: "4-4-6" },
  "p:breath-478-4m": { in: 4, hold: 7, out: 8, label: "4-7-8" },
  "p:breath-fire-3m": { in: 1, hold: 0, out: 1, label: "Breath of Fire" },
  "p:breath-box-1m": { in: 4, hold: 4, out: 4, holdOut: 4, label: "Box Breath" },
};

// Map a PracticeId → guru that best embodies it (used by guru-practice-session)
const PRACTICE_GURU: Record<string, string> = {
  observation: "krishnamurti",
  "self-inquiry": "ramana",
  breath: "sadhguru",
  witnessing: "ramana",
  body: "sadhguru",
  bhakti: "rumi",
  karma: "vivekananda",
  jnana: "krishnamurti",
  raja: "babaji",
  kriya: "sadhguru",
  tantra: "osho",
  neuroscience: "frankl",
};

function fmtClock(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function PracticeRunner({ practiceId, currentLevel, onClose, onComplete }: Props) {
  const practice = getPracticeById(practiceId);
  const guruId = PRACTICE_GURU[practiceId] ?? "krishnamurti";

  const breathPattern = BREATH_PATTERNS[practiceId];
  const cycleDuration = breathPattern
    ? (breathPattern.in + breathPattern.hold + breathPattern.out + (breathPattern.holdOut || 0))
    : 6;

  // ── Resolve "active level" — the next one the seeker is working on
  const activeLevel = useMemo(() => {
    if (!practice) return null;
    const next = practice.levels.find((lv) => lv.level === Math.max(1, currentLevel + 1));
    return next ?? practice.levels[0];
  }, [practice, currentLevel]);

  const practiceSteps = useMemo(() => {
    if (!practice) return [];
    return practice.levels.slice(0, Math.max(1, currentLevel + 1)).map((lv) => `${lv.name}: ${lv.description}`);
  }, [practice, currentLevel]);

  // ── Timer
  const [duration, setDuration] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const intRef = useRef<number | null>(null);
  const completionReported = useRef(false);

  useEffect(() => {
    if (!running) {
      if (intRef.current) window.clearInterval(intRef.current);
      return;
    }
    intRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intRef.current) window.clearInterval(intRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (remaining !== 0 || completionReported.current || !onComplete) return;
    completionReported.current = true;
    void Promise.resolve(onComplete()).catch((error) => {
      console.error("Practice completed but its daily gate could not be marked", error);
    });
  }, [onComplete, remaining]);

  const setDur = (d: number) => {
    setDuration(d);
    setRemaining(d);
    setRunning(false);
  };

  const progress = 1 - remaining / Math.max(1, duration);

  // ── Chat
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Open with a guru greeting tailored to this practice
  useEffect(() => {
    if (!practice || !activeLevel) return;
    setMessages([
      {
        role: "assistant",
        content: `Welcome. We will sit together with **${activeLevel.name}** — ${activeLevel.description.toLowerCase()}. When you are ready, breathe with the orb. Tell me what you notice.`,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !practice) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guru-practice-session`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          guruId,
          practiceName: `${practice.label} · ${activeLevel?.name ?? ""}`,
          practiceSteps,
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`status ${resp.status}`);
      }

      // Stream SSE
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const ln of lines) {
          if (!ln.startsWith("data:")) continue;
          const payload = ln.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const j = JSON.parse(payload);
            const delta = j?.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              assistant += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      console.error("guru chat failed", e);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "The line went quiet. Stay with the breath; ask again when ready." },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!practice) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cinematic backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 h-[140vw] w-[140vw] rounded-full bg-primary/[0.04] blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-5 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-display tracking-[0.32em] uppercase text-primary/70">
            {practice.layer} · L{currentLevel + 1}
          </p>
          <h2 className="font-display text-lg text-foreground truncate">
            {practice.label} <span className="text-muted-foreground">· {activeLevel?.name}</span>
          </h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 h-10 w-10 rounded-full border border-border/40 bg-card/40 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close practice"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Orb + timer */}
      <section className="relative z-10 flex flex-col items-center pt-2 pb-4">
        <button
          onClick={() => setRunning((r) => !r)}
          className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-full flex items-center justify-center group"
          aria-label={running ? "Pause" : "Begin"}
        >
          {/* Outer pulse */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/10 blur-2xl"
            animate={running ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: cycleDuration, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Breathing core */}
          <motion.div
            className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-gradient-to-br from-primary/40 via-primary/20 to-accent/30 backdrop-blur-md border border-primary/30 flex items-center justify-center"
            animate={running ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: cycleDuration, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="text-center">
              <div className="font-display tabular-nums text-3xl sm:text-4xl text-foreground">
                {fmtClock(remaining)}
              </div>
              <div className="mt-1 text-[10px] font-display tracking-[0.3em] uppercase text-primary/80 flex items-center justify-center gap-1.5">
                {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {running ? (breathPattern ? breathPattern.label.toLowerCase() : "breathe") : "tap to begin"}
              </div>
            </div>
          </motion.div>
          {/* Progress ring */}
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
              strokeWidth="0.5"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 48}
              animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - progress) }}
              transition={{ duration: 0.8 }}
            />
          </svg>
        </button>

        {/* Duration chips */}
        <div className="mt-5 flex gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDur(d)}
              className={`px-3 py-1 rounded-full text-[10px] font-display tracking-wider transition-colors ${
                duration === d
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-card/40 text-muted-foreground border border-border/30 hover:text-foreground"
              }`}
            >
              {d < 60 ? `${d}s` : `${Math.round(d / 60)}m`}
            </button>
          ))}
        </div>
      </section>

      {/* Chat */}
      <section
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 pb-2 mx-auto w-full max-w-2xl space-y-3"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm font-body leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary/15 text-foreground border border-primary/20"
                    : "bg-card/60 text-foreground/90 border border-border/30"
                }`}
              >
                {m.content || (sending && i === messages.length - 1 ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : null)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {/* Input */}
      <footer className="relative z-10 px-4 pb-5 pt-3 border-t border-border/20 bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Share what you notice…"
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-card/40 border border-border/30 px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 max-h-32"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </footer>
    </motion.div>,
    document.body,
  );
}
