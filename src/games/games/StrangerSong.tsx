// THE STRANGER'S SONG v2 — flagship #25, pre-verbal empathy (Trevarthen).
//
// Three short stanzas in unknown tongues are sung by the guru voice.
// You cannot understand the words. You can only feel.
// After each stanza, you tap the emotion the body felt — without thinking.
// We track:
//   - response_ms per stanza (how fast emotion arrives — pre-cognitive)
//   - chosen_emotion per stanza
//   - mic envelope mean + variance during each stanza (sigh, hum, breath catch)
//   - one spoken line at the end ("what did the song say to you?")
//
// Senses used:
//   - TTS (the stranger's song itself + framing + calibration)
//   - Microphone envelope (somatic resonance signal)
//   - STT (final whispered translation)
//   - Sound design (warm bed)
//   - Haptics (tap feedback)
//
// XState phases:
//   1. settle    — opening line lands
//   2. stanza    — sing → choose emotion (loops 3 times)
//   3. reveal    — calibration line on speed + somatic charge
//   4. words     — STT, "what did the song say to you?"
//   5. integrate — closing line, then end

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
import StrangerSongCanvas from "./StrangerSongCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

// Three stanzas in different tongues. Meaning is hidden on purpose.
// (Sanskrit / Hindi-Urdu / Spanish-Portuguese fragments — phonetic warmth only.)
const STANZAS = [
  {
    text: "tvameva mata cha pita tvameva, tvameva bandhushcha sakha tvameva.",
    palette: 0,
    cue: "first song",
  },
  {
    text: "humara dil tere paas hai, jaane wale, kaha jaayein hum?",
    palette: 1,
    cue: "second song",
  },
  {
    text: "no me dejes, alma mia, la noche es larga sin tu voz.",
    palette: 2,
    cue: "third song",
  },
];

const EMOTIONS = [
  "joy", "tenderness", "longing",
  "loss", "hope", "ambivalence",
] as const;

type Emotion = typeof EMOTIONS[number];

interface StanzaData {
  envelope: number[];
  emotion: Emotion | null;
  responseMs: number;
}

const emptyStanza = (): StanzaData => ({ envelope: [], emotion: null, responseMs: 0 });

type Ctx = { idx: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "ADVANCE" }
      | { type: "COMMIT_STANZA" }
      | { type: "FINALIZE" };
  },
  actions: {
    nextIdx: assign({ idx: ({ context }) => context.idx + 1 }),
  },
  guards: {
    moreStanzas: ({ context }) => context.idx + 1 < STANZAS.length,
  },
}).createMachine({
  id: "strangerSong",
  initial: "settle",
  context: { idx: 0 },
  states: {
    settle: { on: { ADVANCE: "stanza" } },
    stanza: {
      on: {
        COMMIT_STANZA: [
          { target: "stanza", guard: "moreStanzas", actions: "nextIdx", reenter: true },
          { target: "reveal" },
        ],
      },
    },
    reveal: { on: { ADVANCE: "words" } },
    words: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as "settle" | "stanza" | "reveal" | "words" | "integrate" | "done";
  const idx = state.context.idx;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listening, setListening] = useState(false);
  const [singing, setSinging] = useState(false);
  const [songEnded, setSongEnded] = useState(false);

  const stanzaEndedAtRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const dataRef = useRef<StanzaData[]>(STANZAS.map(() => emptyStanza()));
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);

  // Bed
  useEffect(() => {
    sd.bed("temple", 0.06);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Sample mic envelope only during the song itself
  useEffect(() => {
    if (phase !== "stanza" || !singing) return;
    dataRef.current[idx].envelope.push(breath.envelope);
  }, [breath.envelope, phase, idx, singing]);

  // Reset per-stanza UI on entry
  useEffect(() => {
    if (phase !== "stanza") return;
    setSongEnded(false);
    setSinging(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("you will hear three songs. you will not understand the words. only feel.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 700);
      } else if (phase === "stanza") {
        sd.chime("drop", 0.05);
        // Brief cue, then sing the stanza
        await say(STANZAS[idx].cue, "guru");
        if (cancelled) return;
        setSinging(true);
        await say(STANZAS[idx].text, "guru");
        if (cancelled) return;
        setSinging(false);
        setSongEnded(true);
        stanzaEndedAtRef.current = performance.now();
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("now — what did the songs say to you? speak it in your own tongue.", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the meaning was never in the words. the body knew. that is empathy before language.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reveal → words
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 10_500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cap whispered words at 22s
  useEffect(() => {
    if (phase !== "words") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 22_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Integrate → done
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 8_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const chooseEmotion = (e: Emotion) => {
    if (phaseRef.current !== "stanza" || !songEnded) return;
    const d = dataRef.current[idx];
    if (d.emotion) return;
    d.emotion = e;
    d.responseMs = Math.round(performance.now() - stanzaEndedAtRef.current);
    buzz("tap");
    setTimeout(() => send({ type: "COMMIT_STANZA" }), 350);
  };

  const buildRevealLine = (): string => {
    const ds = dataRef.current;
    const responses = ds.map((d) => d.responseMs).filter((n) => n > 0);
    const avgMs = responses.length ? responses.reduce((a, b) => a + b, 0) / responses.length : 0;
    const allEnv = ds.flatMap((d) => d.envelope);
    const meanEnv = allEnv.length ? allEnv.reduce((a, b) => a + b, 0) / allEnv.length : 0;
    const varEnv = allEnv.length
      ? allEnv.reduce((a, b) => a + (b - meanEnv) ** 2, 0) / allEnv.length
      : 0;
    const distinct = new Set(ds.map((d) => d.emotion).filter(Boolean)).size;

    let line: string;
    if (avgMs > 0 && avgMs < 1200) {
      line = `the body answered before the mind could. that quickness is pre-verbal empathy — older than language.`;
    } else if (varEnv > 0.012) {
      line = `you sighed, hummed, breathed with the songs. resonance happened in the chest, not the dictionary.`;
    } else if (distinct >= 3) {
      line = `each song moved you to a different place. the body is fluent in tongues it has never heard.`;
    } else if (distinct === 1) {
      line = `every song landed in the same color. notice — what state is asking to be heard, no matter who is singing?`;
    } else if (avgMs > 4000) {
      line = `you paused before naming it. the mind tried to translate. notice the gap between feeling and word.`;
    } else {
      line = `meaning arrived without translation. that is the whole teaching of song.`;
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();

    const ds = dataRef.current;
    const charge = (arr: number[]) => {
      if (!arr.length) return 0;
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
    };
    const allEnv = ds.flatMap((d) => d.envelope);
    const meanEnv = allEnv.length ? allEnv.reduce((a, b) => a + b, 0) / allEnv.length : 0;
    const responses = ds.map((d) => d.responseMs).filter((n) => n > 0);
    const avgMs = responses.length ? responses.reduce((a, b) => a + b, 0) / responses.length : 0;

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        avg_response_ms: Math.round(avgMs),
        env_mean: +meanEnv.toFixed(4),
        env_var: +charge(allEnv).toFixed(5),
        stanzas: ds.map((d, i) => ({
          cue: STANZAS[i].cue,
          chosen_emotion: d.emotion,
          response_ms: d.responseMs,
          env_var: +charge(d.envelope).toFixed(5),
        })),
        chosen_emotions: ds.map((d) => d.emotion),
        distinct_emotions: new Set(ds.map((d) => d.emotion).filter(Boolean)).size,
        reveal_line: revealLine,
        whispered_translation: whispered || null,
        mic_ready: breath.ready,
      },
    });
  };

  // Intensity rises with cumulative envelope charge
  const allEnvSoFar = dataRef.current.flatMap((d) => d.envelope);
  const liveMean = allEnvSoFar.length ? allEnvSoFar.reduce((a, b) => a + b, 0) / allEnvSoFar.length : 0;
  const intensity = Math.min(1, liveMean * 4 + (idx + (songEnded ? 1 : 0)) / (STANZAS.length * 1.5));

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <StrangerSongCanvas envelope={breath.envelope} stanza={idx} intensity={intensity} />
      <CinematicOverlay tint="amber" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase) + idx}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.85, x: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-100/70"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          <span className="w-1 h-1 rounded-full bg-amber-200/85 animate-pulse" />
          {phase === "settle" && "the stranger's song"}
          {phase === "stanza" && `${STANZAS[idx].cue} · ${idx + 1} / ${STANZAS.length}`}
          {phase === "reveal" && "calibration"}
          {phase === "words" && "your translation"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-100/60" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "stanza" && singing && (
          <p className="text-[10px] uppercase tracking-widest text-amber-100/60 animate-pulse">singing…</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p className="text-base font-light text-white/70">the stranger's song</p>
            <p className="mt-3 text-xs text-white/45 max-w-xs leading-relaxed">three songs. unknown words. only feeling.</p>
          </motion.div>
        )}

        {phase === "stanza" && (
          <motion.div
            key={`stanza-${idx}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0 flex flex-col items-center justify-end z-20 px-8 pb-24 text-center"
          >
            <AnimatePresence mode="wait">
              {!songEnded ? (
                <motion.p
                  key="listening"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[10px] uppercase tracking-[0.4em] text-amber-100/55"
                >
                  listen
                </motion.p>
              ) : (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.4em] text-amber-100/55">
                    what did your body feel?
                  </p>
                  <div className="grid grid-cols-3 gap-2 max-w-md">
                    {EMOTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => chooseEmotion(e)}
                        className="px-3 py-2 rounded-full border border-white/15 text-white/75 hover:bg-white/10 hover:border-amber-100/30 text-xs tracking-wide transition"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-100/60 mb-6">calibration</p>
            <p className="text-base sm:text-lg font-light text-amber-50/85 italic leading-relaxed max-w-md">
              "{revealLine || "…"}"
            </p>
          </motion.div>
        )}

        {phase === "words" && (
          <motion.div
            key="words"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p className="text-base sm:text-lg font-light text-amber-50/85 leading-relaxed max-w-sm">
              what did the songs say to you?
            </p>
            {listening ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-5 py-2 rounded-full border border-amber-100/30 text-amber-50/85 text-sm bg-amber-500/5 backdrop-blur-sm animate-pulse"
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
            transition={{ duration: 1.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-sm font-light text-white/65 tracking-[0.3em] uppercase">rest</p>
            {whispered && <p className="mt-4 text-xs italic text-white/45 max-w-sm">"{whispered}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/25 hover:text-white/65 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function StrangerSong() {
  const g = getLabGame("stranger-song")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
