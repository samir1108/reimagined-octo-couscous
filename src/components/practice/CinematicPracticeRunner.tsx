/**
 * CinematicPracticeRunner
 * ───────────────────────
 * Revolutionary full-screen practice surface.
 *
 *   • Master's portrait as cinematic background (Ken-Burns zoom + dark overlay)
 *   • Step-by-step text reveal (auto-paced ~ duration / steps; user can tap to advance)
 *   • Breathing orb synced to step pace
 *   • Progress bar (which step / how many)
 *   • Quiet "Reflect" chat opens automatically at the end (and on demand mid-practice)
 *
 * Designed to feel like meditation cinema, not a form.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, MessageCircle, Send, Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useStepNarration } from "@/hooks/useStepNarration";
import { useDailyRoutine, routineToPromptContext } from "@/hooks/useDailyRoutine";

export interface CinematicRunnerProps {
  title: string;             // e.g. "Observation · Sensory Observation"
  subtitle?: string;         // small eyebrow, e.g. "with Krishnamurti"
  bgImage?: string;          // master portrait or scenery
  steps: string[];           // ordered guidance beats
  totalMinutes?: number;     // default 5
  guruId?: string;           // for chat
  practiceName?: string;     // for chat context
  onClose: () => void;
}

interface ChatMsg { role: "user" | "assistant"; content: string; }

export default function CinematicPracticeRunner({
  title,
  subtitle,
  bgImage,
  steps,
  totalMinutes = 5,
  guruId = "krishnamurti",
  practiceName,
  onClose,
}: CinematicRunnerProps) {
  const initialSteps = steps.length ? steps : ["Settle in. Soften the shoulders.", "Breathe naturally. Notice."];
  // Adaptive: queue can be mutated mid-practice by AI Director
  const [queue, setQueue] = useState<string[]>(initialSteps);
  const stepDurMs = Math.max(8000, Math.round((totalMinutes * 60_000) / queue.length));

  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);

  // Daily routine context (intake screen removed; still use saved routine if any)
  const { data: routine } = useDailyRoutine();
  const showRoutineIntake = false;
  const routineCtx = routineToPromptContext(routine);
  const sessionRunning = running;

  // Speak the current step (paused while routine intake is open)
  useStepNarration({ text: queue[stepIdx], guruId, enabled: voiceOn && sessionRunning && !completed });
  const safeSteps = queue;

  // Auto-advance step
  useEffect(() => {
    if (!sessionRunning || completed) return;
    const id = window.setTimeout(() => {
      setStepIdx((i) => {
        if (i + 1 >= safeSteps.length) {
          setCompleted(true);
          setChatOpen(true);
          return i;
        }
        return i + 1;
      });
    }, stepDurMs);
    return () => window.clearTimeout(id);
  }, [stepIdx, sessionRunning, completed, safeSteps.length, stepDurMs]);

  const progress = (stepIdx + 1) / safeSteps.length;

  const advance = () => {
    if (completed) return;
    setStepIdx((i) => {
      if (i + 1 >= safeSteps.length) {
        setCompleted(true);
        setChatOpen(true);
        return i;
      }
      return i + 1;
    });
  };

  // ── Chat
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: completed
          ? `The practice is complete. Stay here a moment. What did you notice?`
          : `I am with you. Tell me what's arising.`,
      }]);
    }
  }, [chatOpen, completed, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guru-practice-session`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({
          messages: next,
          guruId,
          practiceName: practiceName ?? title,
          practiceSteps: safeSteps,
          userContext: routineCtx || undefined,
          adaptiveHint: `${routineCtx ? routineCtx + " " : ""}You are guiding a live cinematic meditation. The seeker is on step ${stepIdx + 1}/${safeSteps.length}: "${safeSteps[stepIdx]}". Reply warmly in 1-2 sentences, weaving in their daily rhythm where natural. If their reflection suggests they need a different next step (struggling, distracted, ready to deepen), append on a new line exactly: [ADAPT: replacement step text | optional second step]. Otherwise omit the tag.`,
        }),
      });
      if (!resp.ok || !resp.body) throw new Error(String(resp.status));
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let asst = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const ln of lines) {
          if (!ln.startsWith("data:")) continue;
          const p = ln.slice(5).trim();
          if (!p || p === "[DONE]") continue;
          try {
            const j = JSON.parse(p);
            const d = j?.choices?.[0]?.delta?.content ?? "";
            if (d) {
              asst += d;
              setMessages((m) => {
                const c = [...m];
                c[c.length - 1] = { role: "assistant", content: asst.replace(/\[ADAPT:[^\]]*\]/g, "").trim() };
                return c;
              });
            }
          } catch { /* ignore */ }
        }
      }
      // Adaptive Director: parse [ADAPT: step1 | step2] and splice into upcoming queue
      const adaptMatch = asst.match(/\[ADAPT:\s*([^\]]+)\]/i);
      if (adaptMatch) {
        const newSteps = adaptMatch[1].split("|").map((s) => s.trim()).filter(Boolean);
        if (newSteps.length) {
          setQueue((q) => {
            const before = q.slice(0, stepIdx + 1);
            const after = q.slice(stepIdx + 1);
            return [...before, ...newSteps, ...after];
          });
        }
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "The line went quiet. Stay with the breath." }]);
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[120] bg-black flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Daily routine intake removed — see src/_archive/DailyRoutineIntake.en.tsx */}
      {/* ── Cinematic background: master portrait with Ken-Burns ── */}
      {bgImage && (
        <motion.img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.0, opacity: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
        />
      )}
      {/* Dark gradient overlay so text is readable */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.92) 100%)",
        }}
      />
      {/* Soft primary halo */}
      <div aria-hidden className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[120vw] w-[120vw] rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />

      {/* ── Top bar ── */}
      <header className="relative z-20 flex items-start justify-between px-5 pt-6">
        <div className="min-w-0">
          {subtitle && (
            <p className="text-[10px] font-display tracking-[0.32em] uppercase text-white/60">
              {subtitle}
            </p>
          )}
          <h1 className="font-display text-base sm:text-lg text-white/95 truncate max-w-[70vw]">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceOn((v) => !v)}
            className="h-10 w-10 rounded-full bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center text-white/80 hover:bg-white/20 transition"
            aria-label={voiceOn ? "Mute voice" : "Unmute voice"}
          >
            {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setChatOpen((o) => !o)}
            className="h-10 w-10 rounded-full bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center text-white/80 hover:bg-white/20 transition"
            aria-label="Reflect with guide"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center text-white/80 hover:bg-white/20 transition"
            aria-label="Exit"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Center: orb + step text ── */}
      <main
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 select-none cursor-pointer"
        onClick={advance}
        role="button"
        aria-label="Tap to continue"
      >
        {/* Breath orb */}
        <div className="relative h-48 w-48 sm:h-56 sm:w-56 mb-10 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/15 blur-3xl"
            animate={running ? { scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] } : { scale: 1 }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.65), hsl(var(--primary) / 0.15) 70%)",
              boxShadow: "0 0 80px hsl(var(--primary) / 0.45)",
            }}
            animate={running ? { scale: [0.9, 1.12, 0.9] } : { scale: 1 }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Step text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="font-display text-xl sm:text-2xl text-white/95 text-center leading-relaxed max-w-xl"
          >
            {safeSteps[stepIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: completed ? 1 : 0.45 }}
          transition={{ duration: 1 }}
          className="mt-10 text-[11px] font-display tracking-[0.3em] uppercase text-white/55 flex items-center gap-2"
        >
          {completed ? "Complete · reflect below" : (
            <>
              <ChevronRight className="h-3 w-3" />
              Tap to continue
            </>
          )}
        </motion.div>
      </main>

      {/* ── Bottom: progress + pause ── */}
      <footer className="relative z-10 px-6 pb-6 pt-3">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-display tracking-[0.3em] uppercase text-white/55">
              {stepIdx + 1} / {safeSteps.length}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setRunning((r) => !r); }}
              className="h-8 w-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/15 transition"
              aria-label={running ? "Pause" : "Resume"}
            >
              {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
          </div>
          <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/80 to-accent/80"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </footer>

      {/* ── Floating chat panel (slides up) ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="chat-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="absolute inset-x-0 bottom-0 z-30 max-h-[68vh] flex flex-col bg-black/85 backdrop-blur-xl border-t border-white/10 rounded-t-3xl"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/60">
                Reflect with {subtitle?.replace(/^with /, "") ?? "guide"}
              </p>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/60 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary/25 text-white border border-primary/30"
                        : "bg-white/5 text-white/90 border border-white/10"
                    }`}
                  >
                    {m.content || (sending && i === messages.length - 1
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white/60" />
                      : null)}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-5 pt-2 flex items-end gap-2 border-t border-white/10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Share what you noticed…"
                rows={1}
                className="flex-1 resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 max-h-32"
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center disabled:opacity-40"
                aria-label="Send"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}
