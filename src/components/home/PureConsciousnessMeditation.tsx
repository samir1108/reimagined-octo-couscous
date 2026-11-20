/**
 * PureConsciousnessMeditation — full-screen meditation screen.
 *
 * Opened from Home by tapping the orb: the field grows out of the tapped
 * circle, so the small home orb is the same object as this full-screen one.
 * Cycles slowly through the negations of the Atma Shatakam, settling on
 * "I am pure consciousness. I am bliss. I am Shiva." A single cross closes it.
 *
 * The field and halo shift colour as the lines move, the Home-tab WebGL orb
 * sits in the middle at full size, and a voice reads each line aloud so the
 * practice can be received with eyes closed.
 */
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import HomeOrb from "@/components/orb/HomeOrb";
import { getCurrentGateForSchedule } from "@/lib/timeSlots";

/** Atma Shatakam — the negations, then the recognition. */
const AFFIRMATIONS = [
  "I am not the mind, the intellect, or the ego.",
  "I am not memory, nor hearing, taste, sight, or smell.",
  "I am not earth, water, fire, air, or space.",
  "I am not energy, nor the sheaths that veil.",
  "I am not attachment, nor the doer, nor the deed.",
  "I am not the body that ages.",
  "I am not the breath that comes and goes.",
  "I am not the thoughts that rise and fall.",
  "I am not the emotions that move through me.",
  "I am not the roles I have been given.",
  "I am not the story I tell about myself.",
  "I am not my successes, nor my failures.",
  "I am not the past that remembers me.",
  "I am not the future I imagine.",
  "I am not this name.",
  "I am not this form.",
  "I am the awareness in which all of this appears.",
  "I am the silence between two thoughts.",
  "I am the space that holds the world.",
  "I am unmoved by what comes and goes.",
  "I am pure consciousness.",
  "I am bliss. I am bliss. I am bliss.",
  "I am Shiva. I am Shiva.",
  "I am. I am. I am.",
];

/** Cool-to-warm sweep so each line arrives in a different light. */
const HUES = [38, 30, 348, 320, 288, 258, 224, 190, 168, 120];

const LINE_MS = 9000;
const SPEECH_GAP_MS = 2400;
const RECOGNITION_FROM = 20;

function hueFor(index: number) {
  return HUES[index % HUES.length];
}

function getPreferredVoice(): SpeechSynthesisVoice | null {
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  return (
    voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Female")),
    ) ||
    voices.find((v) => v.lang === "en-IN") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null
  );
}

export default function PureConsciousnessMeditation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const gate = useMemo(() => getCurrentGateForSchedule(new Date()), []);
  const [lineIdx, setLineIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);


  const line = AFFIRMATIONS[lineIdx];
  const hue = hueFor(lineIdx);
  const isRecognition = lineIdx >= RECOGNITION_FROM;

  // One owner for the line loop: the voice advances it when it finishes
  // speaking, otherwise a calm timer does. Changing the voice restarts the
  // current line instead of the whole sequence.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let timer: number | undefined;
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;

    const next = () => {
      if (cancelled) return;
      setLineIdx((i) => (i + 1) % AFFIRMATIONS.length);
    };

    const scheduleNext = () => {
      timer = window.setTimeout(next, SPEECH_GAP_MS);
    };

    if (voiceOn && synth) {
      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(AFFIRMATIONS[lineIdx]);
        utterance.rate = 0.82;
        utterance.pitch = 1;
        utterance.volume = 1;
        const voice = getPreferredVoice();
        if (voice) utterance.voice = voice;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => {
          setSpeaking(false);
          scheduleNext();
        };
        utterance.onerror = () => {
          setSpeaking(false);
          timer = window.setTimeout(next, LINE_MS);
        };
        synth.speak(utterance);
      } catch {
        timer = window.setTimeout(next, LINE_MS);
      }
    } else {
      timer = window.setTimeout(next, LINE_MS);
    }

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      setSpeaking(false);
      try {
        synth?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [open, lineIdx, voiceOn]);

  // First open always begins from the first negation.
  useEffect(() => {
    if (open) setLineIdx(0);
  }, [open]);

  // Elapsed timer
  useEffect(() => {
    if (!open) return;
    setElapsed(0);
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Stop speaking on close
  const handleClose = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [open]);

  const mmss = useMemo(() => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [elapsed]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="meditation"
          role="dialog"
          aria-modal="true"
          aria-label="Pure consciousness meditation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-[#050403]"
        >
          {/* Colour-shifting field */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              transition: "filter 3200ms ease, opacity 1800ms ease",
              filter: `hue-rotate(${hue - 38}deg) saturate(${isRecognition ? 1.15 : 1})`,
              opacity: 0.9,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, hsl(38 88% 58% / 0.16) 0%, hsl(24 80% 44% / 0.07) 38%, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 18% 82%, hsl(348 70% 52% / 0.1) 0%, transparent 58%), radial-gradient(circle at 84% 16%, hsl(258 70% 56% / 0.1) 0%, transparent 55%)",
              }}
            />
          </div>

          {/* Breathing halo */}
          {!reducedMotion && (
            <motion.div
              className="pointer-events-none absolute h-[78vmin] w-[78vmin] rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(${hue} 92% 66% / 0.16) 0%, hsl(${hue} 88% 52% / 0.05) 46%, transparent 70%)`,
                transition: "background 3200ms ease",
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* The orb: the same WebGL Home orb, blown up full screen */}
          <motion.div
            initial={reducedMotion ? false : { scale: 0.55 }}
            animate={reducedMotion ? undefined : { scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8 flex h-[62vmin] max-h-[26rem] w-[62vmin] max-w-[26rem] items-center justify-center sm:h-[30rem] sm:w-[30rem]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[-14%] rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(${hue} 92% 60% / 0.14) 0%, hsl(${hue} 88% 50% / 0.05) 46%, transparent 72%)`,
                transition: "background 3200ms ease",
              }}
            />
            <HomeOrb
              gate={gate}
              mood="calm"
              interactive={false}
              fallback={null}
              hideWebglFallback
              className="h-full w-full"
            />
            {speaking && !reducedMotion && (
              <motion.div
                className="pointer-events-none absolute inset-[-4%] rounded-full border"
                style={{ borderColor: `hsl(${hue} 90% 70% / 0.3)` }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.15, 0.6] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>

          {/* Voice toggle */}
          <button
            type="button"
            onClick={() => setVoiceOn((v) => !v)}
            aria-pressed={voiceOn}
            aria-label={voiceOn ? "Mute guided voice" : "Unmute guided voice"}
            className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:border-white/25 hover:text-white"
          >
            {voiceOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Close meditation"
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:border-white/25 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="pointer-events-none absolute top-[max(1.25rem,env(safe-area-inset-top))] left-0 right-0 flex flex-col items-center gap-1">
            <p className="text-[10px] font-display uppercase tracking-[0.3em] text-amber/60">Meditation</p>
            <p className="text-[10px] tabular-nums text-white/30">{mmss}</p>
          </div>

          {/* The line */}
          <div className="relative max-w-xl px-10 text-center" role="status" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={lineIdx}
                initial={reducedMotion ? {} : { opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reducedMotion ? {} : { opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 2.4, ease: "easeInOut" }}
                className={`font-display leading-snug ${isRecognition
                  ? "text-2xl text-amber/90 sm:text-3xl"
                  : "text-xl text-white/70 sm:text-2xl"
                  }`}
              >
                {line}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Footer hint */}
          <p className="pointer-events-none absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-0 right-0 text-center text-[10px] text-white/25">
            Rest as the one who is aware · tap the cross to return
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
