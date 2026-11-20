/**
 * SilentSit — Resistance-friendly passive presence mode.
 * No talking. Master portrait + slow breath ring + ambient timer.
 * After ~60s, master speaks one short teaching, then returns to silence.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";

type Master = { id: string; name: string; tradition?: string | null } | null;

interface Props {
  open: boolean;
  onClose: () => void;
  master: Master;
  masterImage?: string;
  themeTitle?: string | null;
  themeDescription?: string | null;
  language?: string;
  durationSec?: number; // default 60
}

export default function SilentSit({
  open,
  onClose,
  master,
  masterImage,
  themeTitle,
  themeDescription,
  language = "en",
  durationSec = 60,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [teaching, setTeaching] = useState<string>("");
  const [teachingShown, setTeachingShown] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"in" | "out">("in");
  const fetchedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setElapsed(0);
      setTeaching("");
      setTeachingShown(false);
      fetchedRef.current = false;
      startedAtRef.current = Date.now();
    }
  }, [open]);

  // Tick the timer
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      if (!startedAtRef.current) return;
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [open]);

  // Breath ring: 4s in, 6s out (slow box-ish)
  useEffect(() => {
    if (!open) return;
    setBreathPhase("in");
    let isIn = true;
    const id = setInterval(() => {
      isIn = !isIn;
      setBreathPhase(isIn ? "in" : "out");
    }, 5000); // alternate every 5s
    return () => clearInterval(id);
  }, [open]);

  // After durationSec, fetch one short teaching from the master.
  useEffect(() => {
    if (!open || fetchedRef.current) return;
    if (elapsed < durationSec) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const masterName = master?.name || "the elder";
        const themeLine = themeTitle ? `Today's theme: ${themeTitle}.` : "";
        const themeDesc = themeDescription ? `Theme: ${themeDescription}.` : "";
        const prompt = `You are ${masterName}${master?.tradition ? `, ${master.tradition}` : ""}. The seeker is sitting in silence — they did not want to talk. They have just sat with you for ${durationSec} seconds in stillness. ${themeLine} ${themeDesc} Offer ONE very short teaching (2-3 sentences max). Speak in your own voice. No questions. No instructions to do anything. Just one quiet seed of wisdom they can carry. Reply in ${language}.`;

        const { data, error } = await supabase.functions.invoke("guide-chat", {
          body: {
            messages: [{ role: "user", content: prompt }],
            timeSlot: "general",
            themeName: themeTitle || "stillness",
            userName: "friend",
            mode: "auto",
            language,
            master: master ? { id: master.id, name: master.name, tradition: master.tradition } : null,
            stream: false,
          },
        });

        let text = "";
        if (!error && data) {
          if (typeof data === "string") text = data;
          else if (typeof (data as any).text === "string") text = (data as any).text;
          else if (typeof (data as any).content === "string") text = (data as any).content;
          else if (typeof (data as any).message === "string") text = (data as any).message;
        }

        if (!text) {
          // Graceful fallback teaching
          text = `Stillness itself is the teaching. You don't need to do anything. Just keep sitting — the noise will pass.`;
        }
        setTeaching(text.trim());
        setTeachingShown(true);
      } catch {
        setTeaching(`Stillness itself is the teaching. You don't need to do anything. Just keep sitting — the noise will pass.`);
        setTeachingShown(true);
      }
    })();
  }, [open, elapsed, durationSec, master, themeTitle, themeDescription, language]);

  const mmss = useMemo(() => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [elapsed]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Master portrait full-bleed */}
          {masterImage && (
            <img
              src={masterImage}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Deep readable overlay */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, hsl(var(--background) / 0.55) 0%, hsl(var(--background) / 0.85) 60%, hsl(var(--background) / 0.97) 100%)",
            }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="End sit"
            className="absolute top-5 right-5 w-10 h-10 rounded-full glass-subtle border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Center: breath ring + portrait */}
          <div className="relative flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center"
              initial={false}
              animate={{
                scale: breathPhase === "in" ? 1.08 : 0.92,
              }}
              transition={{ duration: 5, ease: [0.45, 0, 0.55, 1] }}
            >
              {/* Outer breath ring */}
              <div className="absolute inset-0 rounded-full border border-primary/30" />
              <div className="absolute inset-3 rounded-full border border-primary/20" />
              <div className="absolute inset-6 rounded-full bg-primary/15 blur-2xl" />
              {masterImage && (
                <img
                  src={masterImage}
                  alt={master?.name || "Master"}
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover ring-2 ring-primary/40 shadow-2xl"
                />
              )}
            </motion.div>

            {/* Breath cue */}
            <p className="mt-6 text-[11px] font-display tracking-[0.4em] uppercase text-primary/70">
              {breathPhase === "in" ? "Breathe in" : "Breathe out"}
            </p>

            {/* Timer */}
            <p className="mt-2 font-display text-2xl tabular-nums text-foreground/85">
              {mmss}
            </p>

            {/* Subtle hint before teaching arrives */}
            {!teachingShown && (
              <p className="mt-6 text-xs text-muted-foreground/70 font-body max-w-xs">
                No talking. No doing. Just sit with {master?.name || "the master"}.
              </p>
            )}

            {/* Teaching appears after duration */}
            <AnimatePresence>
              {teachingShown && teaching && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-8 max-w-md px-5 py-4 rounded-2xl glass-card border border-primary/20"
                >
                  <p className="text-[10px] font-display tracking-[0.3em] uppercase text-primary/70 mb-2">
                    {master?.name || "Master"} speaks
                  </p>
                  <div className="font-body text-sm md:text-base text-foreground/90 leading-relaxed prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{teaching}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
