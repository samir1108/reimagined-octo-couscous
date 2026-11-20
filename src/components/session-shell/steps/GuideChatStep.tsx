import { useState, useRef, useEffect } from "react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { StepFrame } from "./StepFrame";

type Msg = { role: "user" | "assistant"; content: string };

export function GuideChatStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!currentStep) return null;

  async function send(deeper = false) {
    const lastReply = [...messages].reverse().find((m) => m.role === "assistant")?.content;
    const message = text.trim();
    if (!message && !deeper) { toast.error("Write something first"); return; }
    if (loading) return;

    const outgoing = deeper
      ? `Go one layer deeper into: ${lastReply || message || currentStep?.prompt || "this"}`
      : message;

    const userMsg: Msg = { role: "user", content: deeper ? "Go deeper" : outgoing };
    const nextHistory: Msg[] = [...messages, userMsg];
    setMessages(nextHistory);
    setText("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("guide-chat", {
        body: {
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content }))
            .concat(deeper ? [{ role: "user", content: outgoing }] : []),
          context: { source: "session-shell", prompt: currentStep?.prompt || null },
        },
      });
      if (error) throw error;
      const out = (data as any)?.reply ?? (data as any)?.message
        ?? (data as any)?.choices?.[0]?.message?.content ?? "Sit with that for a moment.";
      setMessages((m) => [...m, { role: "assistant", content: typeof out === "string" ? out : JSON.stringify(out) }]);
    } catch (e: any) {
      toast.error(e?.message || "Guide is quiet right now");
      setMessages((m) => m.slice(0, -1));
      setText(outgoing);
    } finally {
      setLoading(false);
    }
  }

  const hasReply = messages.some((m) => m.role === "assistant");

  return (
    <StepFrame
      kind="guide-chat"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <>
          {hasReply && (
            <Button size="sm" variant="ghost" disabled={loading} onClick={() => send(true)}>
              Go deeper
            </Button>
          )}
          <Button onClick={() => goToNext({ hadReply: hasReply })} className="rounded-full px-6">
            Continue
          </Button>
        </>
      }
    >
      {messages.length > 0 && (
        <div
          ref={scrollRef}
          className="mb-3 max-h-[320px] space-y-3 overflow-y-auto rounded-2xl bg-background/30 p-3"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground whitespace-pre-wrap"
                  : "mr-auto max-w-[95%] text-[15px] leading-relaxed text-foreground whitespace-pre-wrap"
              }
            >
              {m.content}
            </div>
          ))}
          {loading && <div className="mr-auto text-sm italic text-muted-foreground">Guide is reflecting…</div>}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(false); }
          }}
          placeholder="Say what's true right now…"
          disabled={loading}
          className="min-h-[80px] rounded-2xl border-border/40 bg-background/40"
        />
        <Button
          onClick={() => send(false)}
          disabled={loading || !text.trim()}
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </StepFrame>
  );
}
