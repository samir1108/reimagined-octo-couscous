import { useState } from "react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * In-shell single-turn temple message. Wraps the existing temple-chat
 * edge fn so the user receives a master's voice without leaving the session.
 * Master id can be supplied via params.guruId; otherwise the edge fn picks one.
 */
export function TempleChatStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const [text, setText] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!currentStep) return null;
  const guruId = (currentStep.params as any)?.guruId;

  async function send() {
    const message = text.trim() || currentStep?.prompt || "Guide me.";
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("temple-chat", {
        body: {
          messages: [{ role: "user", content: message }],
          guruId,
        },
      });
      if (error) throw error;
      const out =
        (data as any)?.reply ??
        (data as any)?.message ??
        (data as any)?.choices?.[0]?.message?.content ??
        "Stay close to your breath.";
      setReply(typeof out === "string" ? out : JSON.stringify(out));
    } catch (e: any) {
      toast.error(e?.message || "The temple is quiet right now");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 lg:max-w-2xl xl:max-w-3xl">
      <h2 className="text-xl font-semibold">{currentStep.title}</h2>
      {currentStep.prompt && (
        <p className="mt-2 text-sm text-muted-foreground">{currentStep.prompt}</p>
      )}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Speak to the master…"
        className="mt-4 min-h-[120px] rounded-2xl bg-background/50"
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={send} disabled={loading} variant="outline" className="rounded-full">
          {loading ? "…" : "Send"}
        </Button>
      </div>
      {reply && (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {reply}
        </div>
      )}
      <div className="mt-6 flex items-center justify-between">
        {currentStep.optional ? (
          <Button variant="ghost" onClick={skipCurrent}>Skip</Button>
        ) : <span />}
        <Button onClick={() => goToNext({ hadReply: !!reply })} className="rounded-full px-6">
          Continue
        </Button>
      </div>
    </div>
  );
}
