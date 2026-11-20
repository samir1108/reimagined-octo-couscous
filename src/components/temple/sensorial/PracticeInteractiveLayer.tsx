/**
 * PracticeInteractiveLayer — universal interactive law applied to every
 * sensorial practice.
 *
 * Exports:
 *   • AskMasterOverlay — floating mic button → STT → temple-chat → TTS reply
 *   • SoulsPresence    — live "N souls sitting with you" chip via Supabase
 *                        realtime presence (no DB table needed)
 *   • InsightWall      — anonymous insights from past sitters of the same
 *                        practice + a one-line share input on completion
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mic, X, Loader2, Users, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────────────────────────────────
   Ask the master — voice chat overlay
   ───────────────────────────────────────────────────────────────────────── */

type AskState = "idle" | "listening" | "thinking" | "speaking";

export function AskMasterOverlay({
  guruId,
  guruName,
  practiceTitle,
  currentStepNarration,
  voiceKey,
  onPauseRequest,
  onResumeRequest,
}: {
  guruId: string;
  guruName: string;
  practiceTitle: string;
  currentStepNarration: string;
  voiceKey: string;
  onPauseRequest: () => void;
  onResumeRequest: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AskState>("idle");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setOpen(false);
    setState("idle");
    setQuestion("");
    setAnswer("");
    onResumeRequest();
  }, [onResumeRequest]);

  const openOverlay = useCallback(() => {
    onPauseRequest();
    setOpen(true);
  }, [onPauseRequest]);

  const ask = useCallback(async () => {
    setState("listening");
    setQuestion("");
    setAnswer("");

    let stream: MediaStream | null = null;
    let transcript = "";
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      const stopped = new Promise<void>((res) => (mr.onstop = () => res()));
      mr.start();
      await new Promise((r) => setTimeout(r, 12000));
      mr.stop();
      await stopped;
      stream.getTracks().forEach((t) => t.stop());

      const fd = new FormData();
      fd.append("audio", new Blob(chunks, { type: "audio/webm" }), "ask.webm");
      const { data: { session } } = await supabase.auth.getSession();
      const sttUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stt-listen`;
      const sttRes = await fetch(sttUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: fd,
      });
      const sttJson = await sttRes.json().catch(() => ({}));
      transcript = (sttJson as any)?.transcript ?? (sttJson as any)?.text ?? "";
    } catch {
      stream?.getTracks().forEach((t) => t.stop());
    }

    if (!transcript) {
      setState("idle");
      setAnswer("I didn't catch that. Tap to try again.");
      return;
    }
    setQuestion(transcript);

    setState("thinking");
    let reply = "";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const chatRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/temple-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            guruId,
            guruName,
            messages: [
              {
                role: "system",
                content: `The seeker is currently inside the "${practiceTitle}" practice with you. The instruction they just heard from you was: "${currentStepNarration}". Speak briefly — 2 to 3 sentences. Stay inside the practice. Do not break the meditative arc.`,
              },
              { role: "user", content: transcript },
            ],
          }),
        }
      );
      const ct = chatRes.headers.get("content-type") || "";
      if (ct.includes("text/event-stream")) {
        const reader = chatRes.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            for (const line of chunk.split("\n")) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const payload = t.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const j = JSON.parse(payload);
                const delta = j?.choices?.[0]?.delta?.content ?? "";
                if (delta) reply += delta;
              } catch { /* ignore */ }
            }
          }
        }
      } else {
        const j = await chatRes.json().catch(() => ({}));
        reply = (j as any)?.message ?? (j as any)?.content ?? "";
      }
    } catch { /* silent */ }

    if (!reply) reply = "Stay with the silence. The question itself is enough right now.";
    setAnswer(reply);

    setState("speaking");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const ttsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-speak`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: reply, voice: voiceKey }),
        }
      );
      const ct = ttsRes.headers.get("content-type") || "";
      if (ttsRes.ok && ct.startsWith("audio/")) {
        const blob = await ttsRes.blob();
        if (blob.size > 200) {
          const url = URL.createObjectURL(blob);
          const a = new Audio(url);
          audioRef.current = a;
          await new Promise<void>((res) => {
            a.onended = () => { URL.revokeObjectURL(url); res(); };
            a.onerror = () => { URL.revokeObjectURL(url); res(); };
            a.play().catch(() => res());
          });
        }
      } else if ("speechSynthesis" in window) {
        await new Promise<void>((res) => {
          const u = new SpeechSynthesisUtterance(reply);
          u.onend = () => res();
          u.onerror = () => res();
          window.speechSynthesis.speak(u);
        });
      }
    } catch { /* silent */ }

    setState("idle");
  }, [guruId, guruName, practiceTitle, currentStepNarration, voiceKey]);

  return (
    <>
      {!open && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={openOverlay}
          aria-label="Ask the master"
          className="fixed z-30 right-[calc(1.25rem+env(safe-area-inset-right))] bottom-[calc(7.5rem+env(safe-area-inset-bottom))] w-12 h-12 rounded-full bg-amber-200/10 border border-amber-200/30 backdrop-blur-md flex items-center justify-center text-amber-100 hover:bg-amber-200/20 transition-all shadow-[0_0_24px_rgba(245,197,102,0.18)]"
        >
          <MessageCircle className="w-5 h-5" />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-xl flex items-center justify-center px-6"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-[calc(1.25rem+env(safe-area-inset-top))] right-[calc(1.25rem+env(safe-area-inset-right))] w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full max-w-md text-center">
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/50 mb-3">
                ask {guruName}
              </p>
              <p className="text-xs text-white/40 mb-8">the practice is paused</p>

              <div className="flex items-center justify-center mb-6">
                <motion.div
                  animate={
                    state === "listening"
                      ? { scale: [1, 1.15, 1] }
                      : state === "thinking" || state === "speaking"
                      ? { opacity: [0.6, 1, 0.6] }
                      : {}
                  }
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
                    state === "listening"
                      ? "border-amber-200/70 bg-amber-200/10"
                      : state === "idle"
                      ? "border-white/15 bg-white/[0.04]"
                      : "border-amber-200/40 bg-amber-200/[0.04]"
                  }`}
                >
                  {state === "thinking" || state === "speaking" ? (
                    <Loader2 className="w-6 h-6 text-amber-100/80 animate-spin" />
                  ) : (
                    <Mic className="w-6 h-6 text-amber-100" />
                  )}
                </motion.div>
              </div>

              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45 mb-8">
                {state === "idle" && "tap to speak — 12 seconds"}
                {state === "listening" && "listening…"}
                {state === "thinking" && "considering…"}
                {state === "speaking" && "speaking…"}
              </p>

              {question && (
                <p className="text-white/70 italic font-display mb-4">"{question}"</p>
              )}
              {answer && (
                <p className="text-amber-100/85 font-display leading-relaxed text-sm">
                  {answer}
                </p>
              )}

              {state === "idle" && (
                <button
                  onClick={ask}
                  className="mt-8 px-8 py-3 rounded-full bg-amber-200/10 border border-amber-200/30 text-amber-100 font-display tracking-wide hover:bg-amber-200/15 transition"
                >
                  {answer ? "Ask again" : "Begin"}
                </button>
              )}

              <button
                onClick={close}
                className="block mx-auto mt-6 text-xs text-white/40 hover:text-white/70"
              >
                Return to practice
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Souls presence — live count of others sitting in the same practice.
   Uses Supabase Realtime presence (no DB table). Falls back to "1 soul"
   if realtime is unreachable.
   ───────────────────────────────────────────────────────────────────────── */

export function SoulsPresence({ practiceKey }: { practiceKey: string }) {
  const [count, setCount] = useState(1);
  const channelIdRef = useRef(crypto.randomUUID());

  useEffect(() => {
    let cancelled = false;
    const channel = supabase.channel(`practice:${practiceKey}:${channelIdRef.current}`, {
      config: { presence: { key: channelIdRef.current } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        if (cancelled) return;
        const state = channel.presenceState();
        const total = Object.keys(state).length || 1;
        setCount(total);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && !cancelled) {
          await channel.track({ at: Date.now() });
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [practiceKey]);

  const label = count === 1 ? "you alone, for now" : `${count} souls sitting with you`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed z-30 left-1/2 -translate-x-1/2 top-[calc(1.25rem+env(safe-area-inset-top))] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-[11px] uppercase tracking-[0.25em] text-white/60"
    >
      <Users className="w-3 h-3 text-amber-200/70" />
      <span>{label}</span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Insight wall — anonymous one-liners from past sitters of this practice +
   share input on completion.
   ───────────────────────────────────────────────────────────────────────── */

interface Insight {
  id: string;
  insight: string;
  created_at: string;
}

async function userHash(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    // Stable per-user pseudonym — never expose user_id.
    const enc = new TextEncoder().encode(`${user.id}:soul`);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

export function InsightWall({ practiceKey }: { practiceKey: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [text, setText] = useState("");
  const [posted, setPosted] = useState(false);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("practice_insights" as any)
        .select("id, insight, created_at")
        .eq("practice_key", practiceKey)
        .order("created_at", { ascending: false })
        .limit(8);
      if (data) setInsights(data as unknown as Insight[]);
    } catch { /* silent */ }
  }, [practiceKey]);

  useEffect(() => { load(); }, [load]);

  const submit = useCallback(async () => {
    const t = text.trim();
    if (!t || t.length > 240 || posting) return;
    setPosting(true);
    try {
      const hash = await userHash();
      const { error } = await supabase.from("practice_insights" as any).insert({
        practice_key: practiceKey,
        insight: t,
        user_hash: hash,
      } as any);
      if (!error) {
        setPosted(true);
        setText("");
        load();
      }
    } catch { /* silent */ }
    setPosting(false);
  }, [text, practiceKey, posting, load]);

  return (
    <div className="w-full text-left">
      {/* Share input */}
      {!posted && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 text-center">
            share one line — anonymous
          </p>
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 240))}
              placeholder="one thing you noticed…"
              maxLength={240}
              className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white/85 placeholder-white/30 focus:outline-none focus:border-amber-200/40"
            />
            <button
              onClick={submit}
              disabled={!text.trim() || posting}
              aria-label="Share insight"
              className="w-10 h-10 rounded-full bg-amber-200/10 border border-amber-200/30 flex items-center justify-center text-amber-100 disabled:opacity-30"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
      {posted && (
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-amber-200/60 mb-6">
          ◇ added to the wall ◇
        </p>
      )}

      {/* Wall */}
      {insights.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 text-center">
            from others who sat with this
          </p>
          <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {insights.map((i) => (
              <li
                key={i.id}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/75 italic"
              >
                "{i.insight}"
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
