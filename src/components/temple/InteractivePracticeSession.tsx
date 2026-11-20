import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Eye, PenLine, Loader2 } from "lucide-react";
import type { Guru, GuruPractice } from "@/lib/guru-data";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guru-practice-session`;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "chat" | "observe" | "write";
};

type SessionPhase = "greeting" | "guided" | "complete";

/* ─── Streaming helper ─── */
async function streamPractice({
  messages,
  guruId,
  practiceName,
  practiceSteps,
  onDelta,
  onDone,
}: {
  messages: { role: string; content: string }[];
  guruId: string;
  practiceName: string;
  practiceSteps: string[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, guruId, practiceName, practiceSteps }),
  });

  if (!resp.ok || !resp.body) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to connect");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

/* ─── Observe Timer ─── */
function ObserveTimer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onComplete(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onComplete]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <motion.div
      className="flex flex-col items-center gap-4 py-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="3" />
          <circle
            cx="40" cy="40" r="36" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/60 text-lg font-display tabular-nums">{remaining}s</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-white/30 text-xs font-display">
        <Eye className="w-3.5 h-3.5" />
        <span>Observe in silence...</span>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function InteractivePracticeSession({
  practice,
  guru,
  onBack,
}: {
  practice: GuruPractice;
  guru: Guru;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [phase, setPhase] = useState<SessionPhase>("greeting");
  const [showObserve, setShowObserve] = useState(false);
  const [observeDuration, setObserveDuration] = useState(30);
  const [practiceStep, setPracticeStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initiated = useRef(false);

  const steps = practice.steps || [];
  const totalSteps = steps.length;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 80);
  }, []);

  /* ─── Send message to AI ─── */
  const sendToAI = useCallback(async (allMessages: Message[]) => {
    setIsStreaming(true);
    const aiMessages = allMessages.map((m) => ({ role: m.role, content: m.content }));
    let assistantText = "";
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);
    scrollToBottom();

    try {
      await streamPractice({
        messages: aiMessages,
        guruId: guru.id,
        practiceName: practice.name,
        practiceSteps: steps,
        onDelta: (chunk) => {
          assistantText += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m))
          );
          scrollToBottom();
        },
        onDone: () => setIsStreaming(false),
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: "The silence speaks when words cannot reach..." } : m))
      );
      setIsStreaming(false);
    }
  }, [guru.id, practice.name, steps, scrollToBottom]);

  /* ─── Initiate session — guru greets ─── */
  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    const greetingPrompt: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: `[SYSTEM: The student has chosen to practice "${practice.name}" with you. Begin by greeting them warmly in your style, briefly introduce what you'll explore together, and then guide them into the first step. Ask them something or give them the first instruction.]`,
      type: "chat",
    };

    // Don't show system message in chat
    sendToAI([greetingPrompt]);
    setPhase("guided");
  }, [practice.name, sendToAI]);

  /* ─── User sends a message ─── */
  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, type: "write" };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    scrollToBottom();

    // Track practice progress
    if (practiceStep < totalSteps - 1) setPracticeStep((s) => s + 1);
    else setPhase("complete");

    sendToAI(newMessages);
  };

  /* ─── Start observation ─── */
  const startObservation = (seconds = 30) => {
    setObserveDuration(seconds);
    setShowObserve(true);
  };

  const handleObserveComplete = useCallback(() => {
    setShowObserve(false);
    // After observation, prompt user to write
    const promptMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      type: "chat",
    };

    const allMsg = [...messages, { id: crypto.randomUUID(), role: "user" as const, content: "[The student completed the observation period in silence.]" }];
    sendToAI(allMsg);
  }, [messages, sendToAI]);

  /* ─── Key handler ─── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progressPct = totalSteps > 0 ? ((practiceStep + 1) / totalSteps) * 100 : 0;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img src={guru.image} alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
      </div>

      {/* Top bar */}
      <div className="relative z-20 flex items-center gap-3 px-4 pt-4 pb-3">
        <motion.button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/80 transition-colors shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>

        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs font-display font-medium truncate">{guru.name}</p>
          <p className="text-white/30 text-[10px] font-display truncate">{practice.name}</p>
        </div>

        {/* Progress bar */}
        <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden shrink-0">
          <motion.div
            className="h-full rounded-full bg-white/30"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 pb-2 space-y-4">
        <AnimatePresence initial={false}>
          {messages.filter(m => !m.content.startsWith("[SYSTEM")).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" ? (
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <img
                    src={guru.image}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover object-top ring-1 ring-white/10 shrink-0 mt-1"
                  />
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.06] backdrop-blur-sm border border-white/[0.08]">
                    <p className="text-white/75 text-sm font-display leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                      {isStreaming && messages[messages.length - 1]?.id === msg.id && (
                        <motion.span
                          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-text-bottom"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                        />
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-w-[80%]">
                  <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-white/[0.12] backdrop-blur-sm border border-white/[0.12]">
                    <p className="text-white/85 text-sm font-display leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Observe timer */}
        {showObserve && (
          <ObserveTimer seconds={observeDuration} onComplete={handleObserveComplete} />
        )}

        {/* Streaming indicator */}
        {isStreaming && messages.length === 0 && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
            <span className="text-white/30 text-xs font-display">{guru.name} is present...</span>
          </motion.div>
        )}
      </div>

      {/* Action buttons — observe + write prompts */}
      {!isStreaming && !showObserve && messages.length > 0 && (
        <motion.div
          className="relative z-20 flex items-center gap-2 px-4 pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => startObservation(30)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/40 text-[10px] font-display hover:bg-white/[0.1] hover:text-white/60 transition-all"
          >
            <Eye className="w-3 h-3" />
            Observe 30s
          </button>
          <button
            onClick={() => startObservation(60)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/40 text-[10px] font-display hover:bg-white/[0.1] hover:text-white/60 transition-all"
          >
            <Eye className="w-3 h-3" />
            Observe 60s
          </button>
        </motion.div>
      )}

      {/* Input area */}
      <div className="relative z-20 px-4 pb-5 pt-2">
        <div className="flex items-end gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.1] rounded-2xl px-4 py-2.5">
          <PenLine className="w-4 h-4 text-white/20 shrink-0 mb-1" />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what you observe..."
            rows={1}
            className="flex-1 bg-transparent text-white/80 text-sm font-display placeholder:text-white/20 resize-none outline-none max-h-24 leading-relaxed"
            style={{ minHeight: "1.5rem" }}
            disabled={isStreaming}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-7 h-7 rounded-full bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.2] transition-all disabled:opacity-30 shrink-0"
            whileTap={{ scale: 0.9 }}
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
