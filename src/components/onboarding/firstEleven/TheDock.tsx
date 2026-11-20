/**
 * TheDock — chat as a property of every sitting step (Gate 3).
 * ─────────────────────────────────
 * A breathing orb sits in the corner of every step of The First Eleven.
 * Tap it and the guide opens — seeded with the sitting's theme, the
 * master's voice, the current step, and every word the user has written so
 * far. Any line can be marked "keep", and kept lines sharpen the mapping.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bookmark, BookmarkCheck } from "lucide-react";
import { useSittingDock, DOCK_QUICK_PROMPTS, type DockSessionLike, type DockStepLike } from "@/hooks/useSittingDock";

interface Props {
  userId: string;
  session: DockSessionLike;
  step: DockStepLike | null;
  typedWords: string[];
  /** Kept lines flow back into the sitting's answers (map-sharpening). */
  onKeptChange?: (lines: string[]) => void;
  /** Journey labels — defaults suit The First Eleven. */
  journeyLabel?: string;
  stepLabel?: string;
}

export default function TheDock({
  userId, session, step, typedWords, onKeptChange, journeyLabel, stepLabel,
}: Props) {
  const {
    messages, open, setOpen, sending, error, send, toggleKeep, keptLines, scrollRef,
  } = useSittingDock({ userId, session, step, typedWords, journeyLabel, stepLabel });
  const [text, setText] = useState("");

  // Report kept lines upward whenever they change (skip the initial empty).
  const reported = useRef<string>("");
  useEffect(() => {
    const key = keptLines.join("\n");
    if (key !== reported.current) {
      reported.current = key;
      onKeptChange?.(keptLines);
    }
  }, [keptLines, onKeptChange]);

  const submit = (value: string) => {
    const v = value.trim();
    if (!v || sending) return;
    void send(v);
    setText("");
  };

  return (
    <>
      {/* ─── Breathing orb ─── */}
      {!open && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setOpen(true)}
          aria-label="Ask the guide"
          className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-1.5"
        >
          <motion.span
            className="block h-11 w-11 rounded-full border border-primary/40 bg-primary/10"
            animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: "0 0 30px -8px hsl(var(--primary)/0.45)" }}
          />
          <span className="text-[9px] font-display tracking-[0.25em] uppercase text-primary/70">
            Ask
            {keptLines.length > 0 && (
              <span className="ml-1 text-primary/90">· {keptLines.length}</span>
            )}
          </span>
        </motion.button>
      )}

      {/* ─── Chat sheet ─── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg rounded-t-3xl border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-border/30">
              <motion.span
                className="h-7 w-7 shrink-0 rounded-full border border-primary/40 bg-primary/10"
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="min-w-0 flex-1">
              <p className="font-display text-sm text-foreground leading-tight">
                The guide · {stepLabel?.toLowerCase() ?? "sitting"} {session.n}
              </p>
                <p className="text-[10px] text-muted-foreground/70 truncate">
                  {session.title} · {session.master}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close the guide"
                className="h-8 w-8 grid place-items-center rounded-full border border-border/40 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="max-h-[42vh] min-h-[140px] overflow-y-auto px-5 py-4 space-y-3"
            >
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Say what's true right now — about the question, the silence, or whatever
                    is quietly in the way. Nothing here is graded.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DOCK_QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => submit(q)}
                        disabled={sending}
                        className="px-3 py-1.5 rounded-full border border-border/40 text-[11.5px] font-display text-muted-foreground hover:text-foreground hover:border-primary/50 transition disabled:opacity-40"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className="group relative max-w-[88%]">
                    <div
                      className={
                        m.role === "user"
                          ? "rounded-2xl rounded-tr-sm bg-primary/90 px-3.5 py-2.5 text-[14px] text-primary-foreground whitespace-pre-wrap leading-relaxed"
                          : "rounded-2xl rounded-tl-sm border border-border/30 bg-card/50 px-3.5 py-2.5 text-[14px] text-foreground whitespace-pre-wrap leading-relaxed"
                      }
                    >
                      {m.content}
                    </div>
                    <button
                      onClick={() => toggleKeep(i)}
                      aria-label={m.kept ? "Unkeep this line" : "Keep this line"}
                      className={`absolute -bottom-2 ${m.role === "user" ? "-left-7" : "-right-7"} h-6 w-6 grid place-items-center rounded-full border transition ${
                        m.kept
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border/30 bg-background/80 text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-primary"
                      }`}
                    >
                      {m.kept ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}

              {sending && (
                <p className="text-[13px] italic text-muted-foreground">The guide is reflecting…</p>
              )}

              {error && (
                <p className="text-[12px] text-amber-400/80 italic">{error}</p>
              )}
            </div>

            {/* Input */}
            <div className="flex items-end gap-2 px-5 pb-6 pt-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 2000))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(text);
                  }
                }}
                placeholder="Say what's true right now…"
                rows={1}
                disabled={sending}
                className="flex-1 resize-none rounded-2xl border border-border/40 bg-card/40 px-4 py-3 text-[14px] text-foreground focus:border-primary/60 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => submit(text)}
                disabled={sending || !text.trim()}
                aria-label="Send"
                className="h-10 w-10 shrink-0 grid place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-30 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
