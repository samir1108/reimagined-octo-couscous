// Inline session Guide chat surface.
// Two modes:
//  - companion (default): a compact "Ask Guide about this step" panel that sits
//    beneath a widget/practice and gives the user room to ask questions
//    without leaving the flow.
//  - teaching: a richer chat surface used IN PLACE of a static wisdom card.
//    The step's master image acts as the soft background, Guide auto-streams
//    the opening teaching, the user can reply, and a Continue button advances
//    the step when they're ready.

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle, Send, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/design-system";
import { useGuideChat } from "@/hooks/useGuideChat";
import { useThemeOfDay } from "@/hooks/useThemeOfDay";
import { useAuthReady } from "@/hooks/useAuthReady";
import { getCurrentTimeSlot } from "@/lib/timeSlots";
import { useLanguage } from "@/contexts/LanguageContext";

type Msg = { role: "user" | "assistant"; content: string };

interface MasterPersona {
  id: string;
  name: string;
  image?: string;
  tradition?: string;
}

interface Props {
  currentStepTitle?: string;
  currentStepPrompt?: string;
  sessionIntent?: string;
  /** Master to embody for this step (used as persona + background). */
  master?: MasterPersona | null;
  /** "teaching" auto-streams an opening wisdom and shows Continue. */
  variant?: "companion" | "teaching";
  /** Required for variant="teaching" — advances the session step. */
  onContinue?: () => void;
  /** Rich session context so Guide can teach this exact step with full awareness. */
  themeDescription?: string;
  vLevel?: number | null;
  stepIndex?: number;
  totalSteps?: number;
  priorStepsSummary?: string;  // e.g. "1. Breath orb ✓  2. Journal ✓"
  upcomingStepsSummary?: string;
  stepKind?: string;
}

export function SessionGuideChat({
  currentStepTitle,
  currentStepPrompt,
  sessionIntent,
  master,
  variant = "companion",
  onContinue,
  themeDescription,
  vLevel,
  stepIndex,
  totalSteps,
  priorStepsSummary,
  upcomingStepsSummary,
  stepKind,
}: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [retryPrompt, setRetryPrompt] = useState<string | null>(null);
  const [teachingFailed, setTeachingFailed] = useState(false);
  const { streamChat } = useGuideChat();
  const { data: themeData } = useThemeOfDay();
  const { user } = useAuthReady();
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const openingFired = useRef(false);

  const themeName = themeData?.theme?.title || "Today";
  const userName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    "Friend";
  const timeSlot = getCurrentTimeSlot();

  const buildContext = () =>
    [
      sessionIntent ? `Session intent: ${sessionIntent}` : "",
      themeDescription ? `Today's theme: ${themeDescription}` : "",
      vLevel != null ? `User V-Level: ${vLevel} (calibrate depth & language accordingly)` : "",
      stepIndex != null && totalSteps != null
        ? `Position: step ${stepIndex + 1} of ${totalSteps}`
        : "",
      priorStepsSummary ? `Already done in this session:\n${priorStepsSummary}` : "",
      upcomingStepsSummary ? `Coming next:\n${upcomingStepsSummary}` : "",
      stepKind ? `Step kind: ${stepKind}` : "",
      currentStepTitle ? `Current step: ${currentStepTitle}` : "",
      currentStepPrompt ? `Step prompt: ${currentStepPrompt}` : "",
      master?.tradition ? `Speak in the lineage of ${master.tradition}.` : "",
      variant === "teaching"
        ? "You are teaching THIS step's wisdom in the master's voice. Use ALL the context above — weave the theme, where they are in the session, their level. Open with 2-4 sentences of essence — no greeting, no preamble, no 'welcome'. Stay grounded, evocative, specific to THIS step. End with one gentle invitation: a question to sit with, or simply 'take it in'."
        : "User is mid-session. Reply short (2-4 sentences), warm, do not derail their flow.",
    ]
      .filter(Boolean)
      .join("\n");

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Auto-open wisdom for teaching variant
  useEffect(() => {
    if (variant !== "teaching") return;
    if (openingFired.current) return;
    if (!currentStepTitle && !currentStepPrompt) return;
    openingFired.current = true;
    runTeaching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, currentStepTitle, currentStepPrompt]);

  function runTeaching() {
    setTeachingFailed(false);
    const opener: Msg = {
      role: "user",
      // seed message tells Guide to deliver the teaching — never shown
      content: `(silent · open with the teaching for "${currentStepTitle || "this step"}")`,
    };
    setMessages([{ role: "assistant", content: "" }]);
    setStreaming(true);

    void streamChat({
      messages: [opener],
      timeSlot,
      themeName,
      userName,
      mode: "session-teaching",
      aiContext: buildContext(),
      language: language || "en",
      master: master
        ? { id: master.id, name: master.name, tradition: master.tradition }
        : null,
      onDelta: (chunk) => {
        setMessages((m) => {
          const arr = [...m];
          const last = arr[arr.length - 1];
          if (last?.role === "assistant") {
            arr[arr.length - 1] = { ...last, content: last.content + chunk };
          }
          return arr;
        });
      },
      onDone: () => setStreaming(false),
      onError: () => {
        setStreaming(false);
        setTeachingFailed(true);
        setMessages([
          {
            role: "assistant",
            content:
              currentStepPrompt ||
              currentStepTitle ||
              "Sit with what arises.",
          },
        ]);
      },
    });
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setRetryPrompt(null);

    // Filter out silent seed / stale error messages before sending to model
    const visible = messages.filter(
      (m) =>
        !(m.role === "user" && m.content.startsWith("(silent")) &&
        !(m.role === "assistant" && (!m.content || m.content.startsWith("_Guide is resting")))
    );
    const next: Msg[] = [...visible, { role: "user", content: trimmed }];
    setMessages([...visible, { role: "user", content: trimmed }, { role: "assistant", content: "" }]);
    setStreaming(true);

    await streamChat({
      messages: next,
      timeSlot,
      themeName,
      userName,
      mode: variant === "teaching" ? "session-teaching" : "session-companion",
      aiContext: buildContext(),
      language: language || "en",
      master: master
        ? { id: master.id, name: master.name, tradition: master.tradition }
        : null,
      onDelta: (chunk) => {
        setMessages((m) => {
          const arr = [...m];
          const last = arr[arr.length - 1];
          if (last?.role === "assistant") {
            arr[arr.length - 1] = { ...last, content: last.content + chunk };
          }
          return arr;
        });
      },
      onDone: () => setStreaming(false),
      onError: () => {
        setStreaming(false);
        setRetryPrompt(trimmed);
        setMessages((m) => {
          const arr = [...m];
          const last = arr[arr.length - 1];
          if (last?.role === "assistant" && !last.content) {
            arr[arr.length - 1] = {
              ...last,
              content: "_Guide is resting for a moment. Your step is still here._",
            };
          }
          return arr;
        });
      },
    });
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    await sendMessage(text);
  }

  const isTeaching = variant === "teaching";
  const visibleMessages = messages.filter(
    (m) => !(m.role === "user" && m.content.startsWith("(silent"))
  );

  // ── Teaching variant — full chat surface with master background ────────────
  if (isTeaching) {
    return (
      <div className="relative rounded-3xl border border-primary/30 bg-card/80 backdrop-blur-md overflow-hidden shadow-2xl">
        {/* Master image background */}
        {master?.image && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
              style={{ backgroundImage: `url(${master.image})` }}
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/90 to-background/95"
              aria-hidden
            />
          </>
        )}

        <div className="relative">
          {/* Header */}
          <header className="flex items-center gap-3 border-b border-border/30 bg-background/60 px-4 py-3">
            {master?.image && (
              <div
                className="h-10 w-10 shrink-0 rounded-full border-2 border-primary/40 bg-cover bg-center shadow-lg"
                style={{ backgroundImage: `url(${master.image})` }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-primary flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Wisdom · Guide as {master?.name?.split(" ")[0] || "master"}
              </p>
              {currentStepTitle && (
                <p className="truncate text-sm font-semibold text-foreground mt-0.5">
                  {currentStepTitle}
                </p>
              )}
            </div>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="px-4 py-4 space-y-3 min-h-[60vh] max-h-[65vh] overflow-y-auto"
          >
            {visibleMessages.length === 0 && streaming && (
              <p className="text-sm text-foreground/70 italic">
                {master?.name?.split(" ")[0] || "Guide"} is reflecting…
              </p>
            )}
            {visibleMessages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[95%] text-[15px] leading-relaxed text-foreground"
                }
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1.5 [&_*]:text-foreground">
                    <ReactMarkdown>
                      {m.content || (streaming ? "…" : "")}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            ))}
          </div>

          {/* Composer + Continue */}
          <div className="border-t border-border/30 bg-background/40 p-2.5 space-y-2">
            {teachingFailed && !streaming && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-foreground/85">
                <span>Guide is resting for a moment.</span>
                <Button size="sm" variant="ghost" onClick={runTeaching} className="rounded-full">
                  Retry
                </Button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={`Reply to ${master?.name?.split(" ")[0] || "Guide"} (optional)…`}
                rows={1}
                className="flex-1 resize-none rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
                disabled={streaming}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSend}
                disabled={streaming || !input.trim()}
                className="h-9 w-9 shrink-0 rounded-full"
                title="Send"
              >
                {streaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {onContinue && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={onContinue}
                  disabled={streaming}
                  className="rounded-full"
                >
                  Continue <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Companion variant — compact panel beneath a practice ───────────────────
  return (
    <div className="rounded-2xl border border-primary/25 bg-card/70 backdrop-blur-md overflow-hidden">
      <header className="flex items-center gap-2 border-b border-border/40 bg-primary/5 px-3 py-2">
        <MessageCircle className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/90">
          Ask Guide{master ? ` · as ${master.name.split(" ")[0]}` : ""}
        </span>
      </header>

      {visibleMessages.length > 0 && (
        <div
          ref={scrollRef}
          className="max-h-[280px] overflow-y-auto px-3 py-3 space-y-3"
        >
          {visibleMessages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "mr-auto max-w-[92%] text-sm text-foreground/90"
              }
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1">
                  <ReactMarkdown>
                    {m.content || (streaming ? "…" : "")}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {retryPrompt && !streaming && (
        <div className="flex items-center justify-between gap-2 border-t border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] text-foreground/85">
          <span>Guide is resting for a moment.</span>
          <Button size="sm" variant="ghost" onClick={() => void sendMessage(retryPrompt)} className="rounded-full">
            Retry
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-border/40 bg-background/40 p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Ask anything about this step…"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
          disabled={streaming}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          className="h-9 w-9 shrink-0 rounded-full"
        >
          {streaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
