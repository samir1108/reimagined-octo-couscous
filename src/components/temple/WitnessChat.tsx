/**
 * WITNESS CHAT — Live AI guru support during practice
 * User types what they feel → AI responds like a guru sitting beside them
 */
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

interface WitnessChatProps {
  guideId: string;
  guideName: string;
  duration: number;
  timeRemaining: number;
}

interface ChatMessage {
  role: "user" | "guide";
  content: string;
}

export default function WitnessChat({ guideId, guideName, duration, timeRemaining }: WitnessChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message when chat opens
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "guide",
          content: `I'm here with you. Share whatever arises — pain, thoughts, restlessness. Don't filter. I'll guide you through it.`,
        },
      ]);
    }
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Add placeholder for streaming
    setMessages((prev) => [...prev, { role: "guide", content: "" }]);

    try {
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
            messages: [
              {
                role: "system",
                content: `You are ${guideName}, sitting beside the user during their Witness practice. They are doing open-eye meditation, observing their mind, body, and energy. They may type in Hinglish or English. Respond in the SAME language they use. Keep responses VERY short (1-2 sentences). Be like a guru sitting beside them — warm, present, guiding without fixing. Don't give long teachings. Just gentle, present guidance.`,
              },
              ...messages.map((m) => ({ role: m.role === "guide" ? "assistant" : "user", content: m.content })),
              { role: "user", content: text },
            ],
            guruId: guideId,
          }),
        }
      );

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";

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
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            /* partial JSON */
          }
        }
      }
    } catch (e) {
      console.error("Witness chat error:", e);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "guide", content: "The silence speaks when words cannot reach. Just watch." },
      ]);
    }
    setIsStreaming(false);
  };

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-20"
      initial={{ y: isCollapsed ? "calc(100% - 40px)" : 0 }}
      animate={{ y: isCollapsed ? "calc(100% - 40px)" : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Collapse handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-center py-2 bg-black/60 backdrop-blur-sm border-t border-white/[0.06]"
      >
        <span className="text-white/30 text-[10px] font-display">
          {isCollapsed ? "💬 Chat with your guide" : "Hide chat"}
        </span>
      </button>

      {/* Chat panel */}
      {!isCollapsed && (
        <div className="h-64 bg-black/80 backdrop-blur-xl border-t border-white/[0.06] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-none">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.role === "user" ? (
                  <p className="text-white/50 text-xs font-display text-right">{msg.content}</p>
                ) : (
                  <div className="px-3 py-2 rounded-xl rounded-tl-sm bg-white/[0.06] border border-white/[0.08]">
                    <p className="text-amber-200/60 text-xs font-display leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                      {isStreaming && i === messages.length - 1 && (
                        <span className="inline-block w-1 h-3 bg-amber-300/40 ml-0.5 animate-pulse" />
                      )}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Share what's arising... (Hinglish ok)"
                className="flex-1 bg-transparent text-white/60 text-xs font-display placeholder:text-white/20 outline-none"
                disabled={isStreaming}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-amber-300/60 disabled:opacity-20 transition-all"
              >
                {isStreaming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
