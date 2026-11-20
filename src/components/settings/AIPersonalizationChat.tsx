/**
 * AIPersonalizationChat — Conversational session personalization
 * ────────────────────────────────────────────────────────────────
 * Chat with AI to personalize your session through natural language.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Check, X, RotateCcw, Loader2 } from "lucide-react";
import { useAIPersonalization } from "@/hooks/useAIPersonalization";
import { DEFAULT_EXTENDED_CONFIG, mergeExtendedConfig } from "@/types/session-config";
import type { ExtendedSessionConfiguration } from "@/types/session-config";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { Badge } from "@/design-system";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function AIPersonalizationChat() {
  const [input, setInput] = useState("");
  const [pendingPatch, setPendingPatch] = useState<Record<string, unknown> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, applyConfigPatch, clearMessages } = useAIPersonalization();

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

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg, currentConfig, "config_tuning");
  }, [input, isLoading, sendMessage, currentConfig]);

  const handleApplyPatch = useCallback(async () => {
    if (!pendingPatch) return;
    const newConfig = applyConfigPatch(pendingPatch, currentConfig);
    // Save to DB
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("user_consciousness_profile")
        .update({ session_config: newConfig as any })
        .eq("user_id", user.id);
    }
    setPendingPatch(null);
    toast({ title: "Settings updated", description: "Your next session will use these preferences." });
  }, [pendingPatch, currentConfig, applyConfigPatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-set pending patch when assistant message has one
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.configPatch && Object.keys(lastMsg.configPatch).length > 0) {
      setPendingPatch(lastMsg.configPatch);
    }
  }, [messages]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-primary" /> AI Personalization Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Talk to the AI to personalize your session. Try: "I want to work on my anger", "Make sessions shorter and more direct", "Push observation to level 3"
        </p>

        {/* Messages */}
        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-muted/20 rounded-xl">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bot className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Tell me how you want to personalize your session</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {["I want to work on my anger", "Make sessions 15 min", "Push breath to level 4", "More gentle guidance"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 rounded-full glass-subtle hover:bg-muted/50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
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
                {msg.configPatch && Object.keys(msg.configPatch).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">Config changes:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(msg.configPatch).map(([key, val]) => (
                        <Badge key={key} variant="outline" className="text-[10px]">
                          {key}: {typeof val === 'object' ? '...' : String(val)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground mb-1">Suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(action)}
                          className="text-[10px] px-2 py-1 rounded-full glass-subtle hover:bg-muted/50 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 justify-start"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="glass-subtle rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Patch Confirmation */}
        <AnimatePresence>
          {pendingPatch && Object.keys(pendingPatch).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl"
            >
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm flex-1">Apply these changes to your session settings?</p>
              <Button size="sm" onClick={handleApplyPatch} className="rounded-xl">
                <Check className="w-3.5 h-3.5 mr-1" /> Apply
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPendingPatch(null)} className="rounded-xl">
                <X className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me how to personalize your session..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
          {messages.length > 0 && (
            <Button variant="outline" onClick={clearMessages} className="rounded-xl">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}