import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import type { Guru } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";
import { playWindChime } from "@/lib/templeSounds";
import { supabase } from "@/lib/supabase";
import { useTempleAnalysis } from "@/hooks/useTempleAnalysis";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import { WitnessLoader } from "@/components/WitnessLoader";

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  guru: Guru;
  band: number;
  onBack: () => void;
  onClose: () => void;
  initialMessages?: Msg[];
};

export default function TempleChat({ guru, band, onBack, onClose, initialMessages = [] }: Props) {
  const { analyzeTempleSession } = useTempleAnalysis();
  const userLanguage = useUserLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageSource = MASTER_IMAGES[guru.id] || guru.image;
  const userId = useRef<string | null>(null);

  // Analyze conversation when user closes the chat (fire-and-forget)
  const handleClose = useCallback(() => {
    const userMsgs = messages.filter(m => m.role === "user").map(m => m.content).join("\n");
    if (userMsgs.length >= 20) {
      analyzeTempleSession({
        text: `Conversation with ${guru.name}:\n${userMsgs}`,
        sourceType: "master_chat",
      });
    }
    onClose();
  }, [messages, guru.name, analyzeTempleSession, onClose]);

  const handleBack = useCallback(() => {
    const userMsgs = messages.filter(m => m.role === "user").map(m => m.content).join("\n");
    if (userMsgs.length >= 20) {
      analyzeTempleSession({
        text: `Conversation with ${guru.name}:\n${userMsgs}`,
        sourceType: "master_chat",
      });
    }
    onBack();
  }, [messages, guru.name, analyzeTempleSession, onBack]);

  // Load past conversation history on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoadingHistory(false); return; }
      userId.current = user.id;

      // Fetch last 20 messages with this master
      const { data } = await supabase
        .from("temple_ai_conversations")
        .select("role, content, created_at")
        .eq("user_id", user.id)
        .eq("metadata->>guru_id", guru.id)
        .order("created_at", { ascending: true })
        .limit(30);

      if (data && data.length > 0) {
        const history: Msg[] = data.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        }));
        setMessages(history);
      } else if (initialMessages.length > 0) {
        setMessages(initialMessages);
      }
      setIsLoadingHistory(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    })();
  }, [guru.id, initialMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save message to DB
  const saveMessage = async (role: string, content: string) => {
    if (!userId.current) return;
    await supabase.from("temple_ai_conversations").insert({
      user_id: userId.current,
      role,
      content,
      metadata: { guru_id: guru.id, band },
    });
  };

  // Get user context for the master
  const getUserContext = async () => {
    if (!userId.current) return null;
    
    // Fetch journey with this master + consciousness profile in parallel
    const [journeyRes, profileRes, loopsRes] = await Promise.all([
      supabase
        .from("user_journeys")
        .select("current_day, total_days, streak_days, missed_days, strengths, struggles, recent_reflections, engagement_level, started_at")
        .eq("user_id", userId.current)
        .eq("master_id", guru.id)
        .eq("is_complete", false)
        .maybeSingle(),
      supabase
        .from("user_consciousness_profile")
        .select("overall_band, journey_phase, witness_depth, active_loops, chitta_vritti, journey_day, assessment_data")
        .eq("user_id", userId.current)
        .maybeSingle(),
      supabase
        .from("user_loops")
        .select("loop_id, severity, status")
        .eq("user_id", userId.current)
        .eq("status", "active")
        .limit(5),
    ]);

    return {
      journey: journeyRes.data,
      consciousness: profileRes.data,
      activeLoops: loopsRes.data || [],
    };
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Save user message
    saveMessage("user", text);

    let assistantContent = "";

    try {
      // Get user context for personalization
      const userContext = await getUserContext();

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            band,
            guruId: guru.id,
            guruName: guru.name,
            userContext,
            language: userLanguage,
          }),
        }
      );

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                playWindChime();
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }

      // Save assistant message
      if (assistantContent) {
        saveMessage("assistant", assistantContent);
      }
    } catch (e) {
      console.error("Temple chat error:", e);
      setMessages(prev => [...prev, { role: "assistant", content: "The silence holds what words cannot. Try again." }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Guru background */}
      <div className="absolute inset-0">
        <img src={imageSource} alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
      </div>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <button onClick={handleBack} className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <img src={imageSource} alt={guru.name} className="w-7 h-7 rounded-full object-cover object-top" />
          <span className="text-sm font-display">{guru.name}</span>
        </button>
        <button onClick={handleClose} className="text-white/20 hover:text-white/50 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 md:px-16 space-y-6 scrollbar-none">
        {isLoadingHistory ? (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-white/30 text-sm font-display">Loading your conversation…</span>
          </motion.div>
        ) : messages.length === 0 ? (
          <motion.div
            className="text-center mt-16 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <img src={imageSource} alt={guru.name} className="w-20 h-20 rounded-full object-cover object-top mx-auto ring-1 ring-white/10 mb-4" />
            <p className="text-white/50 text-lg font-display italic">"{guru.quote}"</p>
            <p className="text-white/20 text-xs font-display tracking-[0.2em] uppercase mt-4">Speak what arises…</p>
          </motion.div>
        ) : null}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`max-w-xl ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {msg.role === "user" ? (
              <p className="text-white/60 text-right text-base leading-relaxed">{msg.content}</p>
            ) : (
              <div className="text-white/90 text-base md:text-lg leading-relaxed font-display prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
          </motion.div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div className="mr-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <WitnessLoader />
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 px-4 md:px-16 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        <div className="flex items-center gap-3 max-w-xl mx-auto border border-white/10 rounded-2xl px-5 py-3 bg-white/[0.03] backdrop-blur-sm">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Ask ${guru.name}…`}
            className="flex-1 bg-transparent text-white/80 placeholder:text-white/20 outline-none text-base font-display"
            disabled={isStreaming}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
