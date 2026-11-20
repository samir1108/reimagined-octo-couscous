/**
 * 100-Day Journey Chat - ADAPTIVE
 * Per temple.md Section 13: Chat-based, progressive, adaptive to user state
 * Uses adaptiveJourneyEngine for personalized daily content
 */
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Clock, Sparkles, Moon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { generateAdaptiveDay, type UserProfile, updateUserProfile } from "@/lib/adaptiveJourneyEngine";
import { WitnessLoader } from "@/components/WitnessLoader";

interface JourneyChatProps {
  masterName: string;
  masterImage: string;
  currentDay: number;
  totalDays: number;
  lastPracticedAt?: string;
  userProfile: UserProfile;
  onBack: () => void;
  onComplete: () => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

// Compassionate missed day messages
const getMissedDayMessage = (daysMissed: number): string => {
  if (daysMissed <= 2) return "Everything okay? The practice awaits. No rush.";
  if (daysMissed <= 5) return "You've skipped a few days. What's arising? No judgment. Just honest observation.";
  return "Your practice misses you. No guilt. Just return. Day 1. Fresh start. The masters understand — they waited through centuries.";
};

export default function JourneyChat({
  masterName,
  masterImage,
  currentDay,
  totalDays,
  lastPracticedAt,
  userProfile,
  onBack,
  onComplete,
  onProfileUpdate,
}: JourneyChatProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentDayContent] = useState(() => generateAdaptiveDay(userProfile, masterName));
  const [showPractice, setShowPractice] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initiated = useRef(false);

  // Calculate missed days
  const daysMissed = lastPracticedAt
    ? Math.floor((Date.now() - new Date(lastPracticedAt).getTime()) / 86400000)
    : 0;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial message from master - ADAPTIVE
  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    const missedMessage = daysMissed > 0 ? getMissedDayMessage(daysMissed) : "";
    const dayMessage = `${missedMessage}\n\n${currentDayContent.teaching}`;

    setMessages([{ role: "assistant", content: dayMessage }]);
  }, [currentDayContent, daysMissed]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg = { role: "user" as const, content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Adaptive response based on user's message
    setTimeout(() => {
      const sentiment = analyzeMessageSentiment(text);
      let response = "";

      if (sentiment === "negative") {
        response = `Thank you for your honesty. That honesty itself is practice.\n\n${masterName} doesn't ask you to feel better. He asks you to feel. Fully. Honestly. Without escape.\n\n${currentDayContent.chatPrompt || "What's underneath what you just shared?"}`;
      } else if (sentiment === "positive") {
        response = `Good. You're noticing the shift.\n\n${masterName} smiles. The practice is working — not in dramatic ways, but in quiet ones.\n\n${currentDayContent.chatPrompt || "What's different about how you experience practice now vs when you started?"}`;
      } else {
        response = `Thank you for sharing.\n\n${currentDayContent.chatPrompt || "Continue to sit with what arises. The practice is working, even when you can't see it."}`;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsStreaming(false);
      setShowPractice(true);
    }, 1500);
  };

  const progress = (currentDay / totalDays) * 100;

  // Handle practice completion - update profile
  const handlePracticeComplete = () => {
    const updatedProfile = updateUserProfile(userProfile, {
      practiced: true,
      practiceMinutes: currentDayContent.practiceDurationMinutes,
      rating: 3, // Will be updated from journal
      chatMessages: messages.filter((m) => m.role === "user").length,
    });
    onProfileUpdate(updatedProfile);
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img src={masterImage} alt="" className="w-full h-full object-cover object-top opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img src={masterImage} alt="" className="w-8 h-8 rounded-full object-cover object-top ring-1 ring-white/10" />
          <div>
            <p className="text-white/70 text-xs font-display font-medium">{masterName}</p>
            <p className="text-white/30 text-[10px] font-display tracking-wider">
              Day {currentDay}/{totalDays}
              {currentDayContent.dayType === "silence" && " · Silence Day"}
              {currentDayContent.dayType === "testing" && " · Testing Day"}
              {currentDayContent.dayType === "reflection" && " · Reflection Day"}
            </p>
          </div>
        </div>

        {/* Day type indicator */}
        {currentDayContent.dayType === "silence" && (
          <div className="flex items-center gap-1 text-blue-300/50 text-[10px] font-display">
            <Moon className="w-3.5 h-3.5" />
            Silence
          </div>
        )}
        {currentDayContent.isGentle && (
          <div className="flex items-center gap-1 text-emerald-300/50 text-[10px] font-display">
            Gentle
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-0.5 bg-white/[0.04]">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500/40 to-orange-500/40"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>

      {/* Chat Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 md:px-16 py-4 space-y-6 scrollbar-none">
        <AnimatePresence>
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
                <div className="text-white/85 text-base leading-relaxed prose prose-invert prose-sm max-w-none">
                  {currentDayContent.dayType === "silence" ? (
                    <div className="text-center py-8">
                      <Moon className="w-8 h-8 text-blue-300/30 mx-auto mb-3" />
                      <p className="text-white/40 text-sm font-display italic">
                        {msg.content}
                      </p>
                    </div>
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && (
          <motion.div className="mr-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <WitnessLoader />
          </motion.div>
        )}

        {/* Practice offer */}
        {showPractice && messages[messages.length - 1]?.role === "assistant" && (
          <motion.div
            className="max-w-xl mx-auto p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400/50" />
              <p className="text-amber-200/60 text-xs font-display font-medium">
                {currentDayContent.isGentle ? "Gentle Practice" : "Practice"}
              </p>
            </div>
            <p className="text-white/60 text-sm font-display mb-3">{currentDayContent.practice}</p>
            <div className="flex items-center justify-between">
              <span className="text-white/30 text-[10px] font-display flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentDayContent.practiceDurationMinutes} min
              </span>
              <button
                onClick={handlePracticeComplete}
                className="px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-200/80 text-xs font-display hover:bg-amber-500/25 transition-all"
              >
                Begin Practice
              </button>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {currentDayContent.dayType !== "silence" && (
        <div className="relative z-10 px-4 md:px-16 pb-6 pt-3">
          <div className="flex items-center gap-3 max-w-xl mx-auto border border-white/10 rounded-2xl px-4 py-2.5 bg-white/[0.03]">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={currentDayContent.chatPrompt || "Share what arises..."}
              className="flex-1 bg-transparent text-white/70 placeholder:text-white/20 outline-none text-sm font-display"
              disabled={isStreaming}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Silence day message */}
      {currentDayContent.dayType === "silence" && (
        <div className="relative z-10 px-4 pb-6 text-center">
          <p className="text-white/20 text-xs font-display italic">
            Today, let silence be your teacher.
          </p>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Simple sentiment analysis for chat messages
 */
function analyzeMessageSentiment(text: string): "negative" | "neutral" | "positive" {
  const lower = text.toLowerCase();
  const negativeWords = ["can't", "won't", "hate", "angry", "sad", "lost", "empty", "tired", "fear", "anxious", "stuck", "frustrated", "failed", "bad", "pain"];
  const positiveWords = ["good", "great", "calm", "peace", "happy", "clear", "better", "progress", "grateful", "love", "beautiful"];

  let score = 0;
  negativeWords.forEach((w) => { if (lower.includes(w)) score--; });
  positiveWords.forEach((w) => { if (lower.includes(w)) score++; });

  if (score < -1) return "negative";
  if (score > 1) return "positive";
  return "neutral";
}
