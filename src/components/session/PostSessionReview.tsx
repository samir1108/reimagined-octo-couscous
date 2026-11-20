/**
 * PostSessionReview — Conversational session review
 * ────────────────────────────────────────────────
 * After a session, chat with AI about how it felt and
 * auto-adjust future sessions based on feedback.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Star, ThumbsUp, ThumbsDown, Loader2, RotateCcw } from "lucide-react";
import { useAIPersonalization } from "@/hooks/useAIPersonalization";
import { DEFAULT_EXTENDED_CONFIG } from "@/types/session-config";
import type { ExtendedSessionConfiguration } from "@/types/session-config";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { Badge } from "@/design-system";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface SessionSummary {
  sessionId: string;
  archetype: string;
  leadMaster: string;
  primaryLoop?: string;
  primaryDimension?: string;
  durationMin: number;
  steps: { kind: string; title: string }[];
  qualityScore?: number;
}

interface Props {
  sessionSummary: SessionSummary;
  onComplete?: () => void;
}

export default function PostSessionReview({ sessionSummary, onComplete }: Props) {
  const [input, setInput] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, clearMessages } = useAIPersonalization();

  const { data: config } = useQuery({
    queryKey: ["extended-session-config"],
    queryFn: async (): Promise<ExtendedSessionConfiguration> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEFAULT_EXTENDED_CONFIG;
      const { data } = await supabase
        .from("user_consciousness_profile")
        .select("session_config")
        .eq("user_id", user.id)
        .single();
      if (!data?.session_config) return DEFAULT_EXTENDED_CONFIG;
      return { ...DEFAULT_EXTENDED_CONFIG, ...data.session_config } as ExtendedSessionConfiguration;
    },
  });

  const currentConfig = config || DEFAULT_EXTENDED_CONFIG;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-generate initial review message
  useEffect(() => {
    const initialMsg = generateInitialReview(sessionSummary);
    setMessages([{ role: "assistant", content: initialMsg, id: "init" }]);
  }, [sessionSummary]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");

    const userMsg = { role: "user" as const, content: msg, id: `user-${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await sendMessage(msg, currentConfig, "session_review");
    } catch (e) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sendMessage, currentConfig]);

  const handleRating = useCallback(async (r: number) => {
    setRating(r);
    const msg = r >= 4 ? "That was great!" : r >= 3 ? "It was okay" : "That was difficult";
    const userMsg = { role: "user" as const, content: `${msg} (rated ${r}/5)`, id: `rating-${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await sendMessage(
        `I rated this session ${r}/5. ${r >= 4 ? "It felt really good." : r >= 3 ? "It was okay but could be better." : "It was difficult."} What should I adjust?`,
        currentConfig,
        "session_review"
      );
    } finally {
      setIsLoading(false);
    }
  }, [sendMessage, currentConfig]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="w-4 h-4 text-primary" /> Session Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Summary */}
        <div className="p-3 glass-subtle rounded-xl space-y-1">
          <p className="text-sm font-medium">{sessionSummary.archetype} Session</p>
          <p className="text-[10px] text-muted-foreground">
            {sessionSummary.durationMin} min · {sessionSummary.leadMaster} · {sessionSummary.steps.length} steps
          </p>
          {sessionSummary.primaryLoop && (
            <p className="text-[10px] text-muted-foreground">Loop: {sessionSummary.primaryLoop}</p>
          )}
        </div>

        {/* Rating */}
        {rating === null && (
          <div className="flex items-center gap-2 justify-center">
            <p className="text-sm text-muted-foreground">How was this session?</p>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => handleRating(r)}
                className="w-8 h-8 rounded-full glass-subtle hover:bg-primary/20 transition-colors flex items-center justify-center text-sm"
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="h-48 overflow-y-auto space-y-3 p-3 bg-muted/20 rounded-xl">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass-subtle text-foreground"
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="glass-subtle rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How did it feel? What should change?"
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {onComplete && (
          <Button variant="outline" onClick={onComplete} className="w-full rounded-xl">
            Done Reviewing
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function generateInitialReview(summary: SessionSummary): string {
  const parts = [
    `You just completed a ${summary.durationMin}-minute ${summary.archetype} session.`,
    `Led by ${summary.leadMaster}'s voice.`,
  ];
  if (summary.primaryLoop) {
    parts.push(`This session targeted the ${summary.primaryLoop} pattern.`);
  }
  if (summary.primaryDimension) {
    parts.push(`Your ${summary.primaryDimension} dimension was the focus.`);
  }
  parts.push("How did it feel? Rate it 1-5, or tell me what worked and what didn't.");
  return parts.join(" ");
}