/**
 * PreJourneyConversation — adaptive two-way Foundation session.
 *
 * Streams from /functions/v1/pre-journey-chat. The guru runs the dialogue,
 * decides depth (3-6 turns), and emits the literal token [SESSION_COMPLETE]
 * on a new line when the session is fully delivered. The component then
 * surfaces a "Mark complete" CTA which calls usePreJourney.completeSession
 * with the user's last meaningful reply as the reflection.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, BookOpen, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreJourney } from "@/hooks/usePreJourney";
import { getModuleInfo, type PreJourneySession } from "@/data/pre-journey/sessions";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { supabase } from "@/lib/supabase";

interface Props {
  session: PreJourneySession;
  onClose: () => void;
  onComplete: () => void;
  onSwitchToRead: () => void;
}

interface Turn { role: "user" | "assistant"; content: string }

const COMPLETE_TOKEN = "[SESSION_COMPLETE]";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pre-journey-chat`;

export function PreJourneyConversation({ session, onClose, onComplete, onSwitchToRead }: Props) {
  const { completeSession } = usePreJourney();
  const moduleInfo = getModuleInfo(session.module);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionDone, setSessionDone] = useState(false); // guru emitted [SESSION_COMPLETE]
  const [error, setError] = useState<string | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const update = useCallback((next: Turn[]) => {
    turnsRef.current = next;
    setTurns(next);
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const stream = useCallback(async (history: Turn[]) => {
    setStreaming(true);
    setError(null);
    try {
      const { data: { session: auth } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: history,
          session: {
            number: session.number,
            module: session.module,
            moduleName: session.moduleName,
            title: session.title,
            hook: session.hook,
            teaching: session.teaching,
            reflectionPrompt: session.reflectionPrompt,
            microPractice: session.microPractice,
          },
        }),
      });

      if (!resp.ok || !resp.body) {
        const e = await resp.json().catch(() => ({ error: "Connection failed" }));
        setError(e.error || `Error ${resp.status}`);
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let withDraft: Turn[] = [...history, { role: "assistant", content: "" }];
      update(withDraft);

      const pushDelta = (d: string) => {
        acc += d;
        // Hide the completion token from the UI; flag instead.
        let visible = acc;
        if (acc.includes(COMPLETE_TOKEN)) {
          visible = acc.replace(COMPLETE_TOKEN, "").trimEnd();
          setSessionDone(true);
        }
        const next = withDraft.map((t, i) =>
          i === withDraft.length - 1 ? { ...t, content: visible } : t,
        );
        withDraft = next;
        update(next);
        scrollToBottom();
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { setStreaming(false); return; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) pushDelta(c);
          } catch { /* partial */ }
        }
      }
      setStreaming(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
      setStreaming(false);
    }
  }, [session, update, scrollToBottom]);

  // Auto-start: guru opens the conversation
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    stream([]);
  }, [stream]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || streaming || sessionDone) return;
    const next: Turn[] = [...turnsRef.current, { role: "user", content: text }];
    update(next);
    setInput("");
    scrollToBottom();
    stream(next);
  }, [input, streaming, sessionDone, stream, update, scrollToBottom]);

  const finish = useCallback(async () => {
    // Use the user's last reply (or longest reply) as reflection text.
    const userReplies = turnsRef.current.filter(t => t.role === "user").map(t => t.content);
    const reflection = userReplies.length
      ? userReplies.reduce((a, b) => (b.length > a.length ? b : a), "")
      : undefined;
    await completeSession.mutateAsync({
      sessionId: session.id,
      reflection: reflection && reflection.length > 10 ? reflection : undefined,
    });
    onComplete();
  }, [session.id, completeSession, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[130] bg-background flex flex-col"
    >
      {/* Header */}
      <div className={cn("bg-gradient-to-r text-white", moduleInfo.gradient)}>
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] opacity-80 uppercase tracking-wider">
              Module {session.module} · Session {session.number} of 60
            </p>
            <p className="text-sm font-medium mt-0.5 truncate">{session.title}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onSwitchToRead}
              className="p-2 rounded-full hover:bg-white/20 text-white/90"
              title="Read instead"
              aria-label="Switch to read mode"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {turns.length === 0 && (
            <div className="text-center text-muted-foreground text-sm pt-12 flex flex-col items-center gap-2">
              <Sparkles className="w-5 h-5 opacity-60" />
              Your guide is opening the session…
            </div>
          )}
          <AnimatePresence initial={false}>
            {turns.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", t.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 max-w-[88%] text-[15px] leading-relaxed whitespace-pre-wrap",
                    t.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {t.content || (streaming && i === turns.length - 1 ? "…" : "")}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {error && (
            <div className="text-xs text-destructive text-center">{error}</div>
          )}
          {sessionDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2"
            >
              <div className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-muted-foreground text-center">
                Session complete. Sit with the question for as long as you need.
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input + complete CTA */}
      <div className="border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-3 py-3">
          {sessionDone ? (
            <Button
              size="lg"
              className="w-full"
              onClick={finish}
              disabled={completeSession.isPending}
            >
              {completeSession.isPending ? "Saving…" : "Mark complete"}
            </Button>
          ) : (
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={streaming ? "Guide is replying…" : "Reply…"}
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none min-h-[44px] max-h-32 text-[15px]"
              />
              <Button
                size="icon"
                onClick={send}
                disabled={streaming || !input.trim()}
                className="h-[44px] w-[44px] shrink-0"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground mt-2">
            <MessageCircle className="w-3 h-3" />
            Two-way session — your guide adapts to you.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
