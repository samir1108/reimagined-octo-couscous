"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/design-system";
import { Button } from "@/design-system";
import { cn } from "@/lib/utils";
import { MessageCircle, Send, Loader2, ArrowLeft, Feather } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/design-system";
import { toast } from "sonner";
import { consumeWhisper, type FutureWhisper } from "@/lib/whisperChain";
import { BottomSheet } from "@/design-system";

export type TimeAskChoice = { minutes: number; energy: "low" | "medium" | "high"; guruId?: string; intent?: string };

const TIME_PRESETS = [
  { minutes: 5,  label: "5 min",  hint: "Micro"   },
  { minutes: 12, label: "12 min", hint: "Steady"  },
  { minutes: 25, label: "25 min", hint: "Deep"    },
  { minutes: 45, label: "Open",   hint: "Spacious" },
];

const ENERGY_OPTIONS: Array<{ id: "low" | "medium" | "high"; label: string; emoji: string }> = [
  { id: "low",    label: "Low",    emoji: "🌙" },
  { id: "medium", label: "Steady", emoji: "🌤" },
  { id: "high",   label: "Alive",  emoji: "☀️" },
];

const STORAGE_KEY = "time-ask:last";

/**
 * Lightweight pre-session sheet. One tap on time, optional tap on energy, Begin.
 * Pre-fills from last choice so it's a single tap most days.
 */
export function TimeAskSheet({
  open,
  onOpenChange,
  onConfirm,
  loading,
  whisper,
  onTalkFirst,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (choice: TimeAskChoice) => void;
  onTalkFirst?: (choice: TimeAskChoice) => void;
  loading?: boolean;
  whisper?: FutureWhisper | null;
}) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [minutes, setMinutes] = useState<number>(12);
  const [energy, setEnergy] = useState<"low" | "medium" | "high">("medium");
  const [guruId, setGuruId] = useState<string | undefined>(undefined);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [intentText, setIntentText] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TimeAskChoice>;
        if (parsed.minutes) setMinutes(parsed.minutes);
        if (parsed.energy) setEnergy(parsed.energy);
        if (parsed.guruId) setGuruId(parsed.guruId);
      }
    } catch { /* ignore */ }
    setChatOpen(false);
    setMessages([]);
    setInput("");
    setIntentText("");
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, sending, reducedMotion]);

  const userIntent = messages.filter((m) => m.role === "user").map((m) => m.content).join(" \n");

  const handleBegin = () => {
    const choice: TimeAskChoice = {
      minutes,
      energy,
      guruId,
      intent: (userIntent.trim() || intentText.trim() || undefined),
    };
    if (whisper?.id) void consumeWhisper(whisper.id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(choice)); } catch { /* ignore */ }
    // Close first — the full-screen orb takes over the hand-off.
    onOpenChange(false);
    onConfirm(choice);
  };

  async function sendChat() {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("guide-chat", {
        body: {
          messages: next,
          context: {
            source: "pre-session",
            timeBudgetMin: minutes,
            energy,
            prompt: "The user is about to begin a session and wants it more personalized. Ask ONE short question to tune it, or reflect briefly. Keep replies under 40 words.",
          },
        },
      });
      if (error) throw error;
      const responseData = data as { reply?: string; message?: string; choices?: Array<{ message?: { content?: string } }> };
      const reply =
        responseData.reply ??
        responseData.message ??
        responseData.choices?.[0]?.message?.content ??
        "Tell me more about what you need right now.";
      setMessages((m) => [...m, { role: "assistant", content: typeof reply === "string" ? reply : JSON.stringify(reply) }]);
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Guide is quiet right now");
      setMessages((m) => m.slice(0, -1));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  // The mobile path renders inside BottomSheet, which is not a Radix Dialog,
  // so Dialog primitives (DialogTitle/DialogDescription) would throw there.
  const SheetHeading = ({
    title,
    description,
    className = "mb-5",
    children,
  }: {
    title: string;
    description: string;
    className?: string;
    children?: ReactNode;
  }) => {
    if (isMobile) {
      return (
        <div className={cn("text-left", className)}>
          {children}
          <h2 className="text-xl font-light tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      );
    }
    return (
      <DialogHeader className={cn("text-left", className)}>
        {children}
        <DialogTitle className="text-xl font-light tracking-tight">{title}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
      </DialogHeader>
    );
  };

  const renderContent = () => {
    return (
      <>
        {!chatOpen ? (
          <>
            <SheetHeading
              title="How much space do we open?"
              description="Today's session will shape itself to fit."
            />

            {whisper?.whisper && (
              <div className="mb-5 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
                <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.25em] uppercase text-primary/80">
                  <Feather className="h-3 w-3" />
                  From your last sitting
                </div>
                <p className="mt-1.5 text-sm italic text-foreground/90 leading-relaxed">
                  "{whisper.whisper}"
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  You wrote this to yourself. The session will carry it in.
                </p>
              </div>
            )}

            {/* Time presets */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {TIME_PRESETS.map((p) => {
                const active = p.minutes === minutes;
                return (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => setMinutes(p.minutes)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border py-3 transition-all",
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/40 bg-muted/20 text-muted-foreground hover:border-border/60",
                    )}
                  >
                    <span className="text-sm font-medium">{p.label}</span>
                    <span className="text-[10px] uppercase tracking-wider mt-0.5 opacity-70">{p.hint}</span>
                  </button>
                );
              })}
            </div>

            {/* Energy */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Energy right now</p>
              <div className="grid grid-cols-3 gap-2">
                {ENERGY_OPTIONS.map((e) => {
                  const active = e.id === energy;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEnergy(e.id)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 text-sm transition-all",
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/40 bg-muted/20 text-muted-foreground hover:border-border/60",
                      )}
                    >
                      <span>{e.emoji}</span>
                      <span>{e.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personalization */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What's on your mind? <span className="normal-case tracking-normal opacity-70">(optional)</span></p>
              <Textarea
                value={intentText}
                onChange={(e) => setIntentText(e.target.value)}
                placeholder="e.g. I'm feeling anxious about work, or I want silence today..."
                disabled={loading}
                className="min-h-[60px] rounded-2xl bg-background/50 text-sm resize-none"
              />
            </div>

            <Button
              onClick={handleBegin}
              disabled={loading}
              className="w-full h-12 rounded-full text-base"
            >
              {loading ? "Composing…" : (intentText.trim() || userIntent) ? "Begin personalized session" : "Begin"}
            </Button>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              disabled={loading}
              className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{userIntent ? "Continue talking to guide" : "Talk to a guide first"}</span>
            </button>
          </>
        ) : (
          <>
            <SheetHeading
              className="mb-3"
              title="Talk to the guide"
              description="Say what you want from today's session — the guide will tune it for you."
            >
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </SheetHeading>

            <div
              ref={scrollRef}
              className="min-h-[220px] max-h-[300px] overflow-y-auto rounded-2xl border border-border/40 bg-muted/10 p-3 space-y-3"
            >
              {messages.length === 0 && !sending && (
                <div className="text-sm text-muted-foreground/70 italic">
                  e.g. "make it more personalized to my anxiety about work" or "I want silence, less talking"
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground whitespace-pre-wrap"
                      : "mr-auto max-w-[95%] text-[14px] leading-relaxed text-foreground whitespace-pre-wrap"
                  }
                >
                  {m.content}
                </div>
              ))}
              {sending && (
                <div className="mr-auto text-sm text-muted-foreground italic">Guide is reflecting…</div>
              )}
            </div>

            <div className="mt-3 flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendChat();
                  }
                }}
                placeholder="Say what you need…"
                disabled={sending}
                className="min-h-[60px] rounded-2xl bg-background/50 text-sm"
              />
              <Button
                type="button"
                onClick={() => void sendChat()}
                disabled={sending || !input.trim()}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            <Button
              onClick={() => { setChatOpen(false); handleBegin(); }}
              disabled={loading || sending}
              className="mt-4 w-full h-12 rounded-full text-base"
            >
              {loading ? "Composing…" : messages.length > 0 ? "Begin personalized session" : "Begin session"}
            </Button>
          </>
        )}
      </>
    );
  };

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={() => onOpenChange(false)}
        title="Begin Session"
        maxHeight="90vh"
      >
        {renderContent()}
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-border/40 rounded-3xl px-6 pt-6 pb-6 max-w-md sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
