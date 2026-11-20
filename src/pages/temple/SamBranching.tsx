import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import samPortrait from "@/assets/showroom/sam-portrait.jpg";
import samIdleVideo from "@/assets/showroom/sam-idle.mp4.asset.json";
import samTalkingVideo from "@/assets/showroom/sam-talking.mp4.asset.json";
import type { WorldId } from "./worldData";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/**
 * Sam — branching guide. 3 questions → recommends a world.
 * Persists choice to localStorage so /auth onboarding can pick it up.
 */

interface Choice { label: string; weight: Partial<Record<WorldId, number>> }
interface Beat {
  sam: string[];        // typewriter lines (last line shows choices)
  choices?: Choice[];
}

const SCRIPT: Beat[] = [
  {
    sam: [
      "Hi. I'm Sam — and I'm not going to sell you anything.",
      "Three quick questions and I'll show you the door that probably fits.",
      "First: when you woke up this morning, what was the loudest thing inside?",
    ],
    choices: [
      { label: "Pressure. Too much to do.",        weight: { corporate: 2, anxious: 1 } },
      { label: "A quiet ache — 'what's the point?'", weight: { seeker: 2, anxious: 1 } },
      { label: "Restlessness. I want to make something.", weight: { creator: 2 } },
      { label: "Honestly, I'm just tired.",          weight: { anxious: 3 } },
    ],
  },
  {
    sam: [
      "Okay. Second question.",
      "If I gave you 20 free minutes today, what would your body actually want?",
    ],
    choices: [
      { label: "Silence. A room with no notifications.", weight: { seeker: 2, anxious: 1 } },
      { label: "A walk and a clearer head before the next meeting.", weight: { corporate: 2 } },
      { label: "To draw, write, play — without it 'mattering'.", weight: { creator: 3 } },
      { label: "To lie down. To do nothing.",                weight: { anxious: 3 } },
    ],
  },
  {
    sam: [
      "Last one.",
      "What would 'better' actually look like — in one sentence?",
    ],
    choices: [
      { label: "I lead my team without leaving my body.", weight: { corporate: 3 } },
      { label: "I know who I am behind all this noise.",  weight: { seeker: 3 } },
      { label: "I'm making the work I came here to make.", weight: { creator: 3 } },
      { label: "I'm okay. Just okay would be enough.",     weight: { anxious: 3 } },
    ],
  },
];

const REVEAL: Record<WorldId, { title: string; line: string }> = {
  corporate: { title: "For Leaders", line: "You're carrying weight. Let's start by making it lighter to carry." },
  seeker:    { title: "For Seekers", line: "The question is real. We'll walk it with you — one master at a time." },
  creator:   { title: "For Creators", line: "Flow is a skill. Let's train it." },
  anxious:   { title: "For the Burnt-Out", line: "Soft landing first. Everything else can wait." },
};

interface Props {
  onPick: (world: WorldId) => void;
  onSkip: () => void;
}

export default function SamBranching({ onPick, onSkip }: Props) {
  const [beat, setBeat] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [scores, setScores] = useState<Record<WorldId, number>>({ corporate: 0, seeker: 0, creator: 0, anxious: 0 });
  const [history, setHistory] = useState<{ from: "sam" | "you"; text: string }[]>([]);
  const [revealed, setRevealed] = useState<WorldId | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(true);
  const [heard, setHeard] = useState("");
  const [samSpeaking, setSamSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const talkVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(true);
  const choicesRef = useRef<Choice[] | undefined>(undefined);
  const pickRef = useRef<(c: Choice) => void>(() => {});
  const nextLineRef = useRef<() => void>(() => {});

  const current = SCRIPT[beat];
  const line = current?.sam[lineIdx];

  // Typewriter
  useEffect(() => {
    if (!line) return;
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i >= line.length) clearInterval(t);
    }, 24);
    return () => clearInterval(t);
  }, [line]);

  // Deepgram TTS — speak each Sam line as it appears (direct fetch for binary audio)
  useEffect(() => {
    if (!line || !voiceOn) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/tts-speak`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ text: line, voice: "guru_male" }),
        });
        if (cancelled || !res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = url;
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.onplay = () => setSamSpeaking(true);
          audioRef.current.onended = () => setSamSpeaking(false);
          audioRef.current.onpause = () => setSamSpeaking(false);
        }
        audioRef.current.src = url;
        audioRef.current.play().then(() => setSamSpeaking(true)).catch(() => setSamSpeaking(false));
      } catch {
        /* silent */
      }
    })();
    return () => { cancelled = true; };
  }, [line, voiceOn]);

  useEffect(() => () => {
    audioRef.current?.pause();
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  // Stop audio if voice toggled off
  useEffect(() => {
    if (!voiceOn) audioRef.current?.pause();
  }, [voiceOn]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [typed, history, revealed]);

  const allLinesShown = current && lineIdx >= current.sam.length - 1;
  const isTypingDone = line ? typed.length >= line.length : true;
  const canShowChoices = allLinesShown && isTypingDone && current?.choices;

  const nextLine = useCallback(() => {
    if (!current) return;
    if (!isTypingDone) {
      setTyped(line || "");
      return;
    }
    if (lineIdx < current.sam.length - 1) {
      setHistory((h) => [...h, { from: "sam", text: line! }]);
      setLineIdx((i) => i + 1);
    }
  }, [current, isTypingDone, line, lineIdx]);

  const pick = useCallback((c: Choice) => {
    setHistory((h) => [...h, { from: "sam", text: line! }, { from: "you", text: c.label }]);
    setScores((prev) => {
      const next = { ...prev };
      (Object.keys(c.weight) as WorldId[]).forEach((k) => { next[k] = (next[k] || 0) + (c.weight[k] || 0); });
      return next;
    });
    if (beat < SCRIPT.length - 1) {
      setBeat((b) => b + 1);
      setLineIdx(0);
    } else {
      const finalScores: Record<WorldId, number> = { ...scores };
      (Object.keys(c.weight) as WorldId[]).forEach((k) => { finalScores[k] = (finalScores[k] || 0) + (c.weight[k] || 0); });
      const winner = (Object.entries(finalScores) as [WorldId, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
      try { localStorage.setItem("temple:recommended_world", winner); } catch { /* ignore */ }
      setRevealed(winner);
    }
  }, [beat, line, scores]);

  // Keep refs fresh
  useEffect(() => { choicesRef.current = canShowChoices ? current?.choices : undefined; }, [canShowChoices, current]);
  useEffect(() => { pickRef.current = pick; }, [pick]);
  useEffect(() => { nextLineRef.current = nextLine; }, [nextLine]);

  // Always-listening voice — browser SpeechRecognition maps speech to a choice or "continue"
  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !listening) {
      shouldListenRef.current = false;
      try { recognitionRef.current?.stop?.(); } catch { /* ignore */ }
      return;
    }
    shouldListenRef.current = true;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      const text = (last[0].transcript || "").trim().toLowerCase();
      setHeard(text);
      if (!last.isFinal) return;
      const choices = choicesRef.current;
      if (choices && choices.length) {
        const words = text.split(/\s+/).filter(Boolean);
        const numMap: Record<string, number> = { one: 0, two: 1, three: 2, four: 3, first: 0, second: 1, third: 2, fourth: 3 };
        let best: { c: Choice; score: number } | null = null;
        choices.forEach((c, idx) => {
          const lower = c.label.toLowerCase();
          let score = 0;
          for (const w of words) {
            if (w.length > 2 && lower.includes(w)) score += 1;
            if (w in numMap && numMap[w] === idx) score += 5;
          }
          if (!best || score > best.score) best = { c, score };
        });
        if (best && best.score > 0) pickRef.current(best.c);
      } else if (/\b(next|continue|go|okay|ok|yes)\b/.test(text)) {
        nextLineRef.current();
      }
    };
    rec.onend = () => {
      if (shouldListenRef.current) {
        try { rec.start(); } catch { /* ignore */ }
      }
    };
    rec.onerror = () => { /* no-speech etc */ };
    try { rec.start(); } catch { /* ignore */ }
    recognitionRef.current = rec;
    return () => {
      shouldListenRef.current = false;
      try { rec.stop(); } catch { /* ignore */ }
    };
  }, [listening]);

  // Force both videos to play once mounted (autoplay can be lazy)
  useEffect(() => {
    [idleVideoRef.current, talkVideoRef.current].forEach((v) => {
      if (!v) return;
      const tryPlay = () => v.play().catch(() => {});
      tryPlay();
      v.addEventListener("canplay", tryPlay);
      v.addEventListener("loadeddata", tryPlay);
    });
  }, []);

  return (
    <motion.section
      key="sam-branch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 md:px-6 py-16"
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute inset-0 bg-black" />
        {/* Idle (calm) — always rendered, fades out when speaking */}
        <video
          ref={idleVideoRef}
          src={samIdleVideo.url}
          poster={samPortrait}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute h-[100dvh] w-auto max-w-none object-contain transition-opacity duration-500"
          style={{
            filter: "drop-shadow(0 0 80px hsl(38 95% 50% / .35))",
            opacity: samSpeaking ? 0 : 0.95,
          }}
        />
        {/* Talking — fades in when Sam's TTS audio is playing */}
        <video
          ref={talkVideoRef}
          src={samTalkingVideo.url}
          poster={samPortrait}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute h-[100dvh] w-auto max-w-none object-contain transition-opacity duration-500"
          style={{
            filter: "drop-shadow(0 0 80px hsl(38 95% 50% / .35))",
            opacity: samSpeaking ? 0.95 : 0,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-black/85" />
      </motion.div>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="relative z-10 w-full max-w-xl ml-auto"
      >
        <div className="rounded-2xl border border-amber-200/15 bg-black/65 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_-15px_hsl(38_95%_50%/.4)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-amber-100/10 border border-amber-200/30 overflow-hidden">
              <img src={samPortrait} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-amber-50 font-medium">Sam</div>
              <div className="text-[11px] uppercase tracking-widest text-amber-200/60">Your guide</div>
            </div>
            <button
              onClick={() => setListening((v) => !v)}
              className={`ml-auto inline-flex items-center justify-center w-8 h-8 rounded-full border ${listening ? "border-amber-200/60 text-amber-100 bg-amber-100/10" : "border-amber-100/20 text-amber-100/50"} hover:bg-amber-100/10`}
              aria-label={listening ? "Stop listening" : "Start listening"}
              title={listening ? "Listening — speak your answer" : "Voice input off"}
            >
              {listening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setVoiceOn((v) => !v)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-amber-100/20 text-amber-100/70 hover:bg-amber-100/10"
              aria-label={voiceOn ? "Mute Sam" : "Unmute Sam"}
              title={voiceOn ? "Sam is speaking" : "Sam is silent"}
            >
              {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onSkip}
              className="text-[11px] uppercase tracking-widest text-amber-100/40 hover:text-amber-100/80"
            >
              Skip
            </button>
          </div>

          {listening && heard && (
            <div className="mb-3 text-[11px] uppercase tracking-widest text-amber-200/50 italic">
              heard: "{heard}"
            </div>
          )}

          <div
            ref={scrollRef}
            className="max-h-[42dvh] overflow-y-auto space-y-3 pr-1 mb-6 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {history.map((m, i) => (
              <div key={i} className={m.from === "sam" ? "text-amber-50/85 leading-relaxed" : "text-right"}>
                {m.from === "sam"
                  ? <p>{m.text}</p>
                  : <span className="inline-block rounded-2xl bg-amber-100 text-black px-3 py-1.5 text-sm">{m.text}</span>}
              </div>
            ))}
            {!revealed && (
              <p className="text-amber-50 leading-relaxed">
                {typed}
                <span className="inline-block w-2 h-4 bg-amber-200/80 align-middle ml-0.5 animate-pulse" />
              </p>
            )}
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="mt-4 rounded-xl border border-amber-200/30 bg-amber-100/5 p-4"
              >
                <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70 mb-2">
                  Sam's read on you
                </div>
                <div className="text-xl font-serif text-amber-50 mb-2">{REVEAL[revealed].title}</div>
                <p className="text-sm text-amber-100/80 leading-relaxed">{REVEAL[revealed].line}</p>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div
                key="reveal-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => onPick(revealed)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 text-black px-6 py-3 text-sm font-medium hover:bg-amber-200 transition"
                >
                  Open that door <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={onSkip}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-100/25 text-amber-100/80 px-5 py-3 text-sm hover:bg-amber-100/10 transition"
                >
                  Show me all four
                </button>
              </motion.div>
            ) : canShowChoices ? (
              <motion.div
                key={`choices-${beat}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-2"
              >
                {current!.choices!.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => pick(c)}
                    className="text-left rounded-xl border border-amber-100/15 bg-black/40 hover:bg-amber-100/10 hover:border-amber-200/40 text-amber-50/90 px-4 py-3 text-sm transition"
                  >
                    {c.label}
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.button
                key="next-line"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={nextLine}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-100 text-black px-6 py-3 text-sm font-medium hover:bg-amber-200 transition"
              >
                {isTypingDone ? "Continue" : "Skip"} <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.section>
  );
}
