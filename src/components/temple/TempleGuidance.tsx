import { motion, AnimatePresence } from "framer-motion";
import { X, Send, HeartPulse, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Guru } from "@/lib/guru-data";
import { GUIDANCE_CATEGORIES, type GuidanceCategory } from "@/temple/types";
import { matchMasterForGuidance } from "@/lib/masterMatching";
import { GURUS } from "@/lib/guru-data";

interface TempleGuidanceProps {
  onClose: () => void;
  onTalk: (guru: Guru) => void;
}

export default function TempleGuidance({ onClose, onTalk }: TempleGuidanceProps) {
  const [mode, setMode] = useState<"select" | "type" | "response">("select");
  const [selectedCategory, setSelectedCategory] = useState<GuidanceCategory | null>(null);
  const [freeText, setFreeText] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === "type") {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [mode]);

  const handleSubmit = async () => {
    const text = freeText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    setMessages([{ role: "user", content: text }]);

    // Real AI master matching
    const matchResult = matchMasterForGuidance(text);

    // If crisis, show resources immediately
    if (matchResult.isCrisis) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Thank you for sharing. What you're feeling is valid, and it takes courage to name it.\n\n⚠️ I want to make sure you're safe. Please reach out:\n\n📞 National Suicide Prevention: 988\n📞 Crisis Text Line: Text HOME to 741741\n📞 Emergency: 911\n\nThe Temple walks WITH you. Professional help AND spiritual support can both serve you.\n\nWould you like to:\n1. Continue this conversation\n2. Sit with a master in silence\n3. Begin a gentle grounding practice`,
        },
      ]);
      setMode("response");
      setIsSubmitting(false);
      return;
    }

    // Call the real temple-chat edge function for AI response
    try {
      const topMaster = matchResult.topMasters[0];
      const matchedGuru = GURUS.find((g) => g.id === topMaster?.masterId) || GURUS[1];

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
            messages: [{ role: "user", content: text }],
            guruId: matchedGuru.id,
            isGuidance: true,
            category: matchResult.category,
          }),
        }
      );

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
      console.error("Guidance AI error:", e);
      // Fallback to template if edge function fails
      const matchedGuru = GURUS[1]; // Buddha fallback
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Thank you for sharing. What you're feeling is valid.\n\nI hear you struggling with "${matchResult.category}". Let me walk with you through this.\n\n${matchedGuru.name} says: "${matchedGuru.quote}"\n\nWould you like to:\n\n1. Continue this conversation\n2. Begin a gentle practice\n3. Explore a program for this`,
        },
      ]);
    }
    setMode("response");
    setIsSubmitting(false);
  };

  const handleCategorySelect = (category: GuidanceCategory) => {
    setSelectedCategory(category);
    setMode("type");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <div className="flex items-center gap-2">
          {mode !== "select" && (
            <button
              onClick={() => setMode(mode === "response" ? "type" : "select")}
              className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <HeartPulse className="w-5 h-5 text-amber-400/60" />
          <h2 className="text-white/70 text-sm font-display tracking-wider">I Need Guidance</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] scrollbar-none">
        <AnimatePresence mode="wait">
          {/* Category Selection */}
          {mode === "select" && (
            <motion.div
              key="select"
              className="pt-8 pb-8 px-4 md:px-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <p className="text-white/20 text-[10px] font-display tracking-[0.4em] uppercase mb-2">
                  The Sanctuary
                </p>
                <h3 className="text-white/80 text-lg font-display tracking-wide">
                  What weighs on your heart?
                </h3>
                <p className="text-white/30 text-xs font-display mt-1">
                  Select a category or type freely
                </p>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GUIDANCE_CATEGORIES.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <p className="text-white/60 text-xs font-display mt-2">{cat.label}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Free Text Input */}
          {mode === "type" && (
            <motion.div
              key="type"
              className="pt-8 pb-8 px-4 md:px-8 flex flex-col h-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                {selectedCategory && (
                  <p className="text-white/30 text-xs font-display mb-2">
                    Category: {GUIDANCE_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                  </p>
                )}
                <h3 className="text-white/80 text-lg font-display tracking-wide">
                  Speak freely
                </h3>
                <p className="text-white/30 text-xs font-display mt-1">
                  Hinglish supported · Private · No judgment
                </p>
              </div>

              <textarea
                ref={inputRef}
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Share what's on your heart... (Hinglish is fine)"
                rows={6}
                className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-display placeholder:text-white/20 outline-none focus:border-white/[0.15] transition-colors resize-none"
              />

              <motion.button
                onClick={handleSubmit}
                disabled={!freeText.trim() || isSubmitting}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    The masters are present...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Temple, Guide Me
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Response */}
          {mode === "response" && (
            <motion.div
              key="response"
              className="pt-8 pb-8 px-4 md:px-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`mb-6 ${msg.role === "user" ? "text-right" : "text-left"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  {msg.role === "user" ? (
                    <p className="text-white/60 text-sm font-display leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <p className="text-white/80 text-sm font-display leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Action buttons */}
              {messages[messages.length - 1]?.role === "assistant" && (
                <motion.div
                  className="space-y-2 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button className="w-full py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/60 text-xs font-display tracking-wider hover:bg-white/[0.1] hover:text-white/80 transition-all">
                    Continue Conversation
                  </button>
                  <button className="w-full py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/60 text-xs font-display tracking-wider hover:bg-white/[0.1] hover:text-white/80 transition-all">
                    Begin a Gentle Practice
                  </button>
                  <button className="w-full py-2.5 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-200/80 text-xs font-display tracking-wider hover:bg-amber-500/25 transition-all">
                    Explore a Program
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
