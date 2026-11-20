// EMOTIONAL RESONANCE v2 — flagship #22, Porges social engagement.
//
// XState v5 phase machine, mirrors #15/#16/#18/#19/#20/#21 pipeline.
// A storyteller speaks 4 charged lines. The user listens without interrupting.
// We sample mic envelope continuously: any onset above threshold while the
// storyteller is speaking counts as an interruption. Quiet listening windows
// are scored as "held silence." Calibration reveal compares the two.
//
// Senses used:
//   - Microphone envelope (interruption detection + listening stillness)
//   - TTS (storyteller voice)
//   - STT (final spoken reflection)
//   - Sound design (warm temple bed)
//   - Haptics (interruption flicker)
//
// Phases (XState):
//   1. settle  (TTS frames the practice)
//   2. listen  (4 story lines back-to-back, with breath-pauses between)
//   3. reveal  (TTS calibration line)
//   4. reflect (STT — what landed)
//   5. integrate (rest)

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import EmotionalResonanceCanvas from "./EmotionalResonanceCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };

const STORY = [
  "i lost my father last spring. it's still strange to type that.",
  "the hardest part wasn't the funeral. it was the morning after.",
  "people stopped asking how i was doing around month three.",
  "i still pick up the phone to call him sometimes.",
];

const INTERRUPT_THRESHOLD = 0.22;
const PAUSE_BETWEEN_MS = 2400;

type Ctx = { interruptions: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    bumpInterrupt: assign({ interruptions: ({ context }) => context.interruptions + 1 }),
  },
}).createMachine({
  id: "emotionalResonance",
  initial: "settle",
  context: { interruptions: 0 },
  states: {
    settle:    { on: { ADVANCE: "listen" } },
    listen:    { on: { ADVANCE: "reveal" } },
    reveal:    { on: { ADVANCE: "reflect" } },
    reflect:   { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as "settle" | "listen" | "reveal" | "reflect" | "integrate" | "done";

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [activeLine, setActiveLine] = useState(-1);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [reflection, setReflection] = useState("");
  const [revealLine, setRevealLine] = useState("");
  const [interruptPulse, setInterruptPulse] = useState(0);

  const sessionStartRef = useRef<number>(Date.now());
  const interruptCountRef = useRef(0);
  const interruptByLineRef = useRef<number[]>([0, 0, 0, 0]);
  const aboveThresholdRef = useRef(false);
  const envSamplesWhileSpeakingRef = useRef<number[]>([]);
  const speakingRef = useRef(false);
  const activeLineRef = useRef(-1);
  const endedRef = useRef(false);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.12);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sample mic envelope — detect onsets only while storyteller is speaking
  useEffect(() => {
    const env = breath.envelope;
    if (speakingRef.current) {
      envSamplesWhileSpeakingRef.current.push(env);
      if (envSamplesWhileSpeakingRef.current.length > 6000) envSamplesWhileSpeakingRef.current.shift();
      const above = env > INTERRUPT_THRESHOLD;
      if (above && !aboveThresholdRef.current) {
        interruptCountRef.current += 1;
        const idx = activeLineRef.current;
        if (idx >= 0 && idx < interruptByLineRef.current.length) {
          interruptByLineRef.current[idx] += 1;
        }
        setInterruptPulse((n) => n + 1);
        buzz("tap");
      }
      aboveThresholdRef.current = above;
    } else {
      aboveThresholdRef.current = env > INTERRUPT_THRESHOLD;
    }
  }, [breath.envelope, buzz]);

  // Drive each phase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.12);
        await say("someone is about to speak. your only practice is to stay.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 700);
      } else if (phase === "listen") {
        for (let i = 0; i < STORY.length; i++) {
          if (cancelled) return;
          activeLineRef.current = i;
          setActiveLine(i);
          speakingRef.current = true;
          setSpeaking(true);
          await say(STORY[i], "guru");
          speakingRef.current = false;
          setSpeaking(false);
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_MS));
        }
        activeLineRef.current = -1;
        setActiveLine(-1);
        if (!cancelled) send({ type: "ADVANCE" });
      } else if (phase === "reveal") {
        sd.chime("drop", 0.14);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.1);
        await say("what is one word for what you heard?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 200));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("staying is the practice. you stayed.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reveal → reflect
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 9_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-cap reflect at 14s
  useEffect(() => {
    if (phase !== "reflect") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 14_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Integrate → done
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 6_500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const buildRevealLine = (): string => {
    const env = envSamplesWhileSpeakingRef.current;
    const meanEnv = env.length ? env.reduce((a, b) => a + b, 0) / env.length : 0;
    const interruptions = interruptCountRef.current;
    let line: string;
    if (interruptions === 0 && meanEnv < 0.06) {
      line = "you held the silence completely. the body learned how to receive.";
    } else if (interruptions === 0) {
      line = "no interruptions, but the body shifted. listening is more than not speaking.";
    } else if (interruptions <= 2) {
      line = "small breaks in the silence. notice what wanted to be said.";
    } else {
      line = "the silence broke many times. the urge to fix is loud. notice it.";
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const env = envSamplesWhileSpeakingRef.current;
    const meanEnv = env.length ? env.reduce((a, b) => a + b, 0) / env.length : 0;
    const varEnv = env.length
      ? env.reduce((a, b) => a + (b - meanEnv) ** 2, 0) / env.length
      : 0;
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        interruption_count: interruptCountRef.current,
        interrupts_by_line: [...interruptByLineRef.current],
        listening_env_mean: +meanEnv.toFixed(4),
        listening_env_var: +varEnv.toFixed(5),
        held_silence: interruptCountRef.current === 0,
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
      },
    });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <EmotionalResonanceCanvas envelope={breath.envelope} interruptPulse={interruptPulse} speaking={speaking} />
      <CinematicOverlay tint="amber" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase)}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-100/75"
        >
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          <span>{phase === "settle" && "emotional resonance"}
          {phase === "listen" && "listen"}
          {phase === "reveal" && "calibration"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}</span>
        </motion.div>
      </div>

      {/* Top-right mic + interruption count */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "listen" && (
          <p className="text-[10px] uppercase tracking-widest text-amber-200/60">
            interruptions · {interruptCountRef.current}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p style={SERIF} className="text-3xl italic font-light text-amber-50/90">emotional resonance</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-white/45 max-w-sm">listen without interrupting · don't fix · just stay</p>
          </motion.div>
        )}

        {phase === "listen" && (
          <motion.div
            key={`listen-${activeLine}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p style={SERIF} className="text-xl sm:text-2xl font-light italic text-amber-50/95 leading-relaxed max-w-md drop-shadow-[0_0_20px_rgba(255,190,120,0.12)]">
              {activeLine >= 0 ? `"${STORY[activeLine]}"` : "…"}
            </p>
            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/40">
              {speaking ? "they are speaking" : "breathing"}
            </p>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-200/75 mb-6">calibration</p>
            <p style={SERIF} className="text-xl sm:text-2xl font-light text-amber-50/95 italic leading-relaxed max-w-md">
              "{revealLine || "…"}"
            </p>
          </motion.div>
        )}

        {phase === "reflect" && (
          <motion.div
            key="reflect"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p style={SERIF} className="text-xl sm:text-2xl italic font-light text-amber-50/95 leading-relaxed max-w-sm">
              one word for what you heard.
            </p>
            {listening ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-6 py-2.5 rounded-full border border-amber-200/45 text-amber-100 text-sm bg-amber-500/10 backdrop-blur-sm animate-pulse shadow-[0_0_28px_rgba(255,190,120,0.18)]"
              >
                ● listening — tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div
            key="integrate"
            initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-sm font-light text-white/65 tracking-[0.3em] uppercase">rest</p>
            {reflection && <p className="mt-4 text-xs italic text-white/45 max-w-sm">"{reflection}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function EmotionalResonance() {
  const g = getLabGame("emotional-resonance")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
