// THE APOLOGY v2 — flagship #20, restorative practice + NVC.
//
// Driven by an XState v5 phase machine, mirrors #15/#16/#18/#19 pipeline.
// The text itself is NEVER persisted — only typing biometrics + spoken reflection.
//
// Senses used:
//   - Microphone envelope variance during write (somatic charge while typing)
//   - Typing biometrics (interkey latency, deletions, longest pause, char count)
//   - TTS (guru speaks each phase prompt aloud)
//   - STT (recipient name + final spoken reflection)
//   - Sound design (warm temple bed)
//   - Haptics (tap on commit, drop on reveal)
//
// Phases (XState):
//   1. settle    (TTS frames the practice)
//   2. recipient (STT — say the name out loud)
//   3. write     (typing biometrics, mic envelope sampled, max 4 min)
//   4. seal      (commit — text discarded, only signals retained)
//   5. reveal    (TTS reads back hesitation + somatic charge calibration)
//   6. reflect   (STT — what surfaced)
//   7. integrate (rest)

import { useEffect, useMemo, useRef, useState } from "react";
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
import TheApologyCanvas from "./TheApologyCanvas";

const MIN_CHARS = 30;
const WRITE_LIMIT_MS = 4 * 60_000;

type Ctx = { recipientGiven: boolean };

const machine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "ADVANCE" }
      | { type: "RECIPIENT_DONE" }
      | { type: "SEAL" }
      | { type: "FINALIZE" };
  },
  actions: {
    markRecipient: assign({ recipientGiven: () => true }),
  },
}).createMachine({
  id: "theApology",
  initial: "settle",
  context: { recipientGiven: false },
  states: {
    settle:    { on: { ADVANCE: "recipient" } },
    recipient: { on: { RECIPIENT_DONE: { target: "write", actions: "markRecipient" } } },
    write:     { on: { SEAL: "reveal" } },
    reveal:    { on: { ADVANCE: "reflect" } },
    reflect:   { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as
    | "settle" | "recipient" | "write" | "reveal" | "reflect" | "integrate" | "done";

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [recipient, setRecipient] = useState("");
  const [reflection, setReflection] = useState("");
  const [revealLine, setRevealLine] = useState("");
  const [flickerPulse, setFlickerPulse] = useState(0);
  const [writeRemaining, setWriteRemaining] = useState(WRITE_LIMIT_MS);

  const sessionStartRef = useRef<number>(Date.now());
  const writeStartRef = useRef<number>(0);
  const lastKeyRef = useRef<number | null>(null);
  const intervalsRef = useRef<number[]>([]);
  const deletionsRef = useRef(0);
  const charsTypedRef = useRef(0);
  const longestPauseRef = useRef(0);
  const envBufferRef = useRef<number[]>([]);
  const endedRef = useRef(false);

  // Warm temple bed
  useEffect(() => {
    sd.bed("temple", 0.1);
    return () => sd.stopBed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive each phase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.12);
        await say("one apology you owe. it will never be sent. only sealed in you.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 1000);
      } else if (phase === "recipient") {
        sd.chime("drop", 0.1);
        await say("say their name out loud. just the name.", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "write") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setRecipient(r.transcript.trim().slice(0, 80));
        }
        sd.chime("drop", 0.1);
        await say("now write what you couldn't say. the fire holds it.", "guru");
        if (cancelled) return;
        writeStartRef.current = Date.now();
        intervalsRef.current = [];
        envBufferRef.current = [];
        lastKeyRef.current = null;
        deletionsRef.current = 0;
        charsTypedRef.current = 0;
        longestPauseRef.current = 0;
      } else if (phase === "reveal") {
        sd.chime("drop", 0.14);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.12);
        await say("what surfaced as you wrote?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListening(true); } catch {}
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("the words leave you, even if they never reach them. that is the whole practice.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Sample mic envelope while in the write phase
  useEffect(() => {
    if (phase !== "write") return;
    envBufferRef.current.push(breath.envelope);
    if (envBufferRef.current.length > 4000) envBufferRef.current.shift();
  }, [breath.envelope, phase]);

  // Write-phase countdown / auto-seal
  useEffect(() => {
    if (phase !== "write") return;
    const i = setInterval(() => {
      const elapsed = Date.now() - writeStartRef.current;
      const left = Math.max(0, WRITE_LIMIT_MS - elapsed);
      setWriteRemaining(left);
      if (left <= 0) send({ type: "SEAL" });
    }, 250);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reveal → reflect
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-advance reflect → integrate
  useEffect(() => {
    if (phase !== "reflect") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 14_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Integrate → done
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 7_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Recipient mic auto-cap at 12s
  useEffect(() => {
    if (phase !== "recipient") return;
    const t = setTimeout(async () => {
      if (listening) {
        setListening(false);
        const r = await transcribe.stop().catch(() => null);
        if (r?.transcript) setRecipient(r.transcript.trim().slice(0, 80));
      }
      send({ type: "RECIPIENT_DONE" });
    }, 12_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, listening]);

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const now = performance.now();
    const v = e.target.value;
    if (v.length < text.length) {
      deletionsRef.current += text.length - v.length;
      setFlickerPulse((n) => n + 1);
    } else {
      charsTypedRef.current += v.length - text.length;
    }
    if (lastKeyRef.current !== null) {
      const dt = now - lastKeyRef.current;
      intervalsRef.current.push(dt);
      if (dt > longestPauseRef.current) longestPauseRef.current = dt;
    }
    lastKeyRef.current = now;
    setText(v);
  };

  const sealNow = () => {
    if (text.length < MIN_CHARS) return;
    buzz("tap");
    send({ type: "SEAL" });
  };

  const skipRecipient = () => {
    if (listening) { setListening(false); transcribe.cancel(); }
    send({ type: "RECIPIENT_DONE" });
  };

  const metrics = useMemo(() => {
    const intervals = intervalsRef.current;
    const avg = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const env = envBufferRef.current;
    const meanEnv = env.length ? env.reduce((a, b) => a + b, 0) / env.length : 0;
    const varEnv = env.length
      ? env.reduce((a, b) => a + (b - meanEnv) ** 2, 0) / env.length
      : 0;
    return {
      chars_typed: charsTypedRef.current,
      deletions: deletionsRef.current,
      avg_interkey_ms: +avg.toFixed(1),
      longest_pause_ms: +longestPauseRef.current.toFixed(0),
      final_length: text.length,
      env_variance: +varEnv.toFixed(4),
      somatic_charge: +Math.sqrt(varEnv).toFixed(3),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, text]);

  const buildRevealLine = () => {
    const ratio = metrics.chars_typed > 0
      ? metrics.deletions / metrics.chars_typed
      : 0;
    const longPause = metrics.longest_pause_ms;
    const charge = metrics.somatic_charge;
    let line: string;
    if (metrics.final_length < MIN_CHARS) {
      line = "the words wouldn't come. that's also an answer. notice it.";
    } else if (ratio > 0.4 && longPause > 6000) {
      line = "you erased almost as much as you wrote. the apology is fighting itself.";
    } else if (longPause > 8000 && charge > 0.04) {
      line = "long pauses. body loud. something deeper than the words wanted out.";
    } else if (ratio < 0.05 && metrics.avg_interkey_ms < 220) {
      line = "it came out clean and fast. either you've already forgiven yourself — or you skipped the wound.";
    } else if (charge > 0.06) {
      line = "the body trembled the whole time. the apology landed in you, even if it never reaches them.";
    } else {
      line = "honest, slow, and finite. let it be enough for today.";
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        recipient_named: !!recipient,
        ...metrics,
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
        // text is intentionally NOT persisted
      },
    });
  };

  const stepIndex =
    phase === "settle" ? 0 :
    phase === "recipient" ? 1 :
    phase === "write" ? 2 :
    phase === "reveal" ? 3 :
    phase === "reflect" ? 4 :
    phase === "integrate" ? 5 : -1;

  const intensity = phase === "write"
    ? Math.min(1, charsTypedRef.current / 400)
    : phase === "reveal" || phase === "reflect" || phase === "integrate" ? 0.6 : 0.2;

  const fmtRemaining = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-950/30 via-black to-red-950/25 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 32%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.94) 100%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <TheApologyCanvas envelope={breath.envelope} intensity={intensity} flickerPulse={flickerPulse} />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase)}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-200/75"
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-amber-200/85"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {phase === "settle" && "the apology"}
          {phase === "recipient" && "name them"}
          {phase === "write" && "write"}
          {phase === "reveal" && "calibration"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-200/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "write" && (
          <p className="text-[10px] uppercase tracking-widest text-amber-200/60">{fmtRemaining(writeRemaining)}</p>
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
            <p
              className="text-4xl sm:text-5xl italic text-amber-50/90 tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              the apology
            </p>
            <div className="mt-5 h-px w-16 bg-amber-100/25 mx-auto" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-amber-100/55 max-w-xs mx-auto">one you owe · never sent · only sealed in you</p>
          </motion.div>
        )}

        {phase === "recipient" && (
          <motion.div
            key="recipient"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p
              className="text-2xl sm:text-3xl italic text-amber-50/95 leading-relaxed max-w-sm tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(255,190,120,0.3)" }}
            >
              say their name out loud
            </p>
            {listening ? (
              <button
                onClick={skipRecipient}
                className="px-7 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm hover:bg-amber-500/20 transition"
                style={{ boxShadow: "0 0 30px rgba(251,191,36,0.2)" }}
              >
                ● listening · tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}
            <button
              onClick={skipRecipient}
              className="text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition"
            >
              keep it inside · continue
            </button>
          </motion.div>
        )}

        {phase === "write" && (
          <motion.div
            key="write"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex flex-col items-center justify-end z-20 px-6 pb-12 max-w-xl mx-auto gap-4"
          >
            <textarea
              autoFocus
              value={text}
              onChange={onTextChange}
              placeholder={recipient ? `dear ${recipient.toLowerCase()}…` : "dear…"}
              className="w-full h-44 sm:h-56 bg-black/40 border border-amber-200/20 rounded-2xl p-4 text-amber-50/90 text-sm leading-relaxed focus:outline-none focus:border-amber-200/50 resize-none placeholder:text-amber-200/30 backdrop-blur-sm"
            />
            <div className="flex items-center gap-3">
              <motion.button
                onClick={sealNow}
                disabled={text.length < MIN_CHARS}
                whileTap={{ scale: 0.96 }}
                className={`px-6 py-2 rounded-full text-xs tracking-wider border transition ${
                  text.length < MIN_CHARS
                    ? "border-white/10 text-white/30"
                    : "border-amber-200/40 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20"
                }`}
              >
                seal · release
              </motion.button>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                {text.length < MIN_CHARS ? `${MIN_CHARS - text.length} more` : "ready"}
              </span>
            </div>
            <p className="text-[10px] text-amber-200/40 max-w-sm text-center">
              the words are never saved — only how you wrote them.
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
            <p
              className="text-2xl sm:text-3xl italic text-amber-50/95 leading-relaxed max-w-md"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, textShadow: "0 0 30px rgba(255,190,120,0.32)" }}
            >
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
            <p className="text-base sm:text-lg font-light text-amber-50/90 leading-relaxed max-w-sm">
              what surfaced as you wrote?
            </p>
            {listening ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-5 py-2 rounded-full border border-amber-200/40 text-amber-100 text-sm bg-amber-500/10 backdrop-blur-sm animate-pulse"
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

      {/* Step dots */}
      <div className="absolute bottom-8 inset-x-0 z-30 flex justify-center gap-2 pointer-events-none">
        {Array.from({ length: 6 }).map((_, k) => (
          <div
            key={k}
            className={`h-[2px] w-6 rounded-full transition-all ${k <= stepIndex ? "bg-amber-200/70" : "bg-white/10"}`}
          />
        ))}
      </div>

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function TheApology() {
  const g = getLabGame("the-apology")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
