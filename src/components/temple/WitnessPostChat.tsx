/**
 * POST-WITNESS CHAT REFLECTION
 * After session ends: conversational reflection → AI analysis → insights
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import { useTempleAnalysis } from "@/hooks/useTempleAnalysis";

export interface PostSessionResult {
  insights: string;
  suggestedMasterId?: string;
  suggestedMasterReason?: string;
  journalPrompt?: string;
  nextPracticeSuggestion?: string;
}

interface WitnessPostChatProps {
  sessionDuration: number;
  onComplete: (result: PostSessionResult) => void;
  onSkip: () => void;
}

interface ChatMsg {
  role: "assistant" | "user";
  content: string;
}

const INITIAL_MESSAGE = "How was your practice? Anything come up — thoughts, feelings, body sensations? Share whatever you noticed. 🙏";

export default function WitnessPostChat({ sessionDuration, onComplete, onSkip }: WitnessPostChatProps) {
  const { analyzeTempleSession } = useTempleAnalysis();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userReplied, setUserReplied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setUserReplied(true);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsStreaming(false);
        return;
      }

      const systemPrompt = `You are a warm, wise witness practice guide. The user just completed a ${sessionDuration}-minute open-eye witness meditation (Sakshi Bhav). They are sharing their experience.

Your role:
- Listen deeply, validate their experience
- Ask ONE gentle follow-up question if they share something interesting
- Keep responses to 1-2 sentences, warm and present
- Mirror their language (Hindi/Hinglish/English)
- After 2-3 exchanges, naturally wrap up with encouragement
- Don't lecture or teach — just be present and curious

If they mention specific patterns (recurring thoughts, body tension, emotional loops), acknowledge them specifically.`;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              ...newMessages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
            ],
            guruId: "witness",
            guruName: "The Witness Guide",
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        setIsStreaming(false);
        setMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = { role: "assistant", content: "Thank you for sharing. Your awareness itself is the practice. 🙏" };
          return msgs;
        });
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setMessages(prev => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                if (last?.role === "assistant") {
                  msgs[msgs.length - 1] = { ...last, content: last.content + content };
                }
                return msgs;
              });
            }
          } catch { break; }
        }
      }
    } catch (e) {
      console.error("Post-witness chat error:", e);
      setMessages(prev => {
        const msgs = [...prev];
        if (msgs[msgs.length - 1]?.role === "assistant" && !msgs[msgs.length - 1].content) {
          msgs[msgs.length - 1] = { role: "assistant", content: "Thank you for sharing. 🙏" };
        }
        return msgs;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, sessionDuration]);

  const analyzeAndComplete = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onComplete({ insights: "Practice reflection saved." });
        return;
      }

      const userMessages = messages.filter(m => m.role === "user").map(m => m.content).join("\n");
      
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [
              { 
                role: "system", 
                content: `Analyze this witness meditation reflection and respond ONLY with valid JSON (no markdown, no backticks). Format:
{"insights":"2-3 line pattern insight specific to what they shared (use 🔍 prefix)","suggestedMasterId":"one of: veer,rumi,laozi,buddha,patanjali,osho,krishnamurti,ramana,kabir,mirabai,sadhguru,thich,yogananda,amma,swami_vivekananda — pick the most relevant based on what surfaced","suggestedMasterReason":"1 line why this master (match user language)","journalPrompt":"A specific journal prompt based on what they shared","nextPracticeSuggestion":"A specific next practice suggestion like breathing, body scan, longer session, etc"}
Match the user's language (Hindi/Hinglish/English). Keep each field under 30 words.`
              },
              { role: "user", content: `Session: ${sessionDuration} min witness meditation. User shared:\n${userMessages}` },
            ],
            guruId: "witness",
            guruName: "Witness Analyzer",
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        onComplete({ insights: "Practice reflection saved. Keep witnessing. 🙏" });
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullText += content;
          } catch { break; }
        }
      }

      // Fire consciousness engine analysis in background (don't block UI)
      analyzeTempleSession({
        text: `Witness meditation (${sessionDuration} min). User reflection:\n${userMessages}`,
        sourceType: "witness_practice",
      });

      // Try to parse JSON from AI response
      try {
        const parsed = JSON.parse(fullText);
        onComplete({
          insights: parsed.insights || fullText,
          suggestedMasterId: parsed.suggestedMasterId,
          suggestedMasterReason: parsed.suggestedMasterReason,
          journalPrompt: parsed.journalPrompt,
          nextPracticeSuggestion: parsed.nextPracticeSuggestion,
        });
      } catch {
        onComplete({ insights: fullText || "Practice reflection saved. Keep witnessing. 🙏" });
      }
    } catch {
      onComplete({ insights: "Practice reflection saved. Keep witnessing. 🙏" });
    }
  }, [messages, sessionDuration, onComplete, analyzeTempleSession]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex flex-col bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300/50" />
          <span className="text-white/60 text-xs font-display">Post-Session Reflection</span>
        </div>
        <button
          onClick={onSkip}
          className="text-white/30 text-[10px] font-display hover:text-white/50 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs font-display leading-relaxed ${
                  msg.role === "user"
                    ? "bg-amber-500/15 border border-amber-500/20 text-amber-100/80 rounded-br-md"
                    : "bg-white/[0.06] border border-white/[0.08] text-white/60 rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-xs">
                    <ReactMarkdown>{msg.content || "..."}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-4"
          >
            <div className="flex items-center gap-2 text-amber-300/50 text-xs font-display">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analyzing your reflection...
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-white/[0.06] space-y-2">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what you observed..."
            rows={1}
            disabled={isStreaming || isAnalyzing}
            className="flex-1 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs font-display placeholder:text-white/20 outline-none resize-none disabled:opacity-40"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming || isAnalyzing}
            className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-200/60 disabled:opacity-30 hover:bg-amber-500/25 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Done button — appears after user has replied at least once */}
        {userReplied && !isStreaming && !isAnalyzing && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={analyzeAndComplete}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/20 text-amber-200/70 text-xs font-display tracking-wider hover:from-amber-600/30 hover:to-orange-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Done — Analyze My Practice
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
