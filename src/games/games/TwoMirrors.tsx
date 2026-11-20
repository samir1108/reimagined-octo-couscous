// TWO MIRRORS v2 — flagship #14, fully sensorial.
//
// Senses used:
//   - Front camera (face-presence, motion = fidget)
//   - Microphone (envelope = inner loudness while gazing)
//   - TTS (guru voice opens, reveals, closes)
//   - STT (closing reflection)
//   - Sound design (soft bed)
//   - Haptics (gentle buzz on each look-away)
//
// Phases:
//   1. SETTLE   (5s) — TTS frames Ramakrishna's mirror sadhana
//   2. GAZE     (120s) — user holds their own gaze; we track presence + motion + mic
//   3. REVEAL   (10s) — TTS names the relationship pattern
//   4. REFLECT  (≤14s) — STT
//   5. INTEGRATE(7s)

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Eye, EyeOff } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useFaceCam } from "../shell/useFaceCam";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import TwoMirrorsCanvas from "./TwoMirrorsCanvas";
import CinematicOverlay from "../shell/CinematicOverlay";

type Phase = "settle" | "gaze" | "reveal" | "reflect" | "integrate";

const GAZE_MS = 120_000;

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [phase, setPhase] = useState<Phase>("settle");
  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);
  const [revealLine, setRevealLine] = useState("");
  const [awayPulse, setAwayPulse] = useState(0);
  const [progress, setProgress] = useState(0);

  const cam = useFaceCam(true);
  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const sessionStartRef = useRef<number>(Date.now());
  const gazeStartRef = useRef(0);
  const lookAwaysRef = useRef(0);
  const presenceSamplesRef = useRef<number[]>([]); // 1 if face present
  const motionSamplesRef = useRef<number[]>([]);
  const envSamplesRef = useRef<number[]>([]);
  const lastFaceRef = useRef(true);
  const sighsAtStartRef = useRef(0);
  const endedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Soft bed
  useEffect(() => { sd.bed("temple", 0.12); return () => sd.stopBed(); /* eslint-disable-next-line */ }, []);

  // Bind live video element
  useEffect(() => {
    if (!cam.videoEl || !videoRef.current) return;
    if (videoRef.current.srcObject !== cam.videoEl.srcObject) {
      videoRef.current.srcObject = cam.videoEl.srcObject;
      videoRef.current.play().catch(() => {});
    }
  }, [cam.videoEl]);

  // Phase narration
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.12);
        await say("look at the one looking. don't perform. don't fix. just stay.", "guru");
        if (cancelled) return;
        setTimeout(() => {
          if (cancelled) return;
          setPhase("gaze");
          gazeStartRef.current = Date.now();
          sighsAtStartRef.current = breath.sighs;
        }, 1400);
      } else if (phase === "reveal") {
        sd.chime("drop", 0.16);
        const presenceRatio = presenceSamplesRef.current.length
          ? presenceSamplesRef.current.reduce((a, b) => a + b, 0) / presenceSamplesRef.current.length : 0;
        const avgMotion = motionSamplesRef.current.length
          ? motionSamplesRef.current.reduce((a, b) => a + b, 0) / motionSamplesRef.current.length : 0;
        const avgEnv = envSamplesRef.current.length
          ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;
        const aways = lookAwaysRef.current;

        let line = "you stayed with the one in the glass.";
        if (!cam.ready) line = "the camera was closed. but the inner mirror was still watching.";
        else if (aways >= 8) line = "the eyes kept escaping. that's where the discomfort lived. notice what you didn't want to see.";
        else if (avgMotion > 0.18) line = "the body kept adjusting. the face was hard to settle into.";
        else if (avgEnv > 0.18 && aways <= 2) line = "the eyes held. the inside still spoke loudly. that's honest meeting.";
        else if (presenceRatio > 0.85 && aways <= 1) line = "you held the gaze. ramakrishna would smile. this is the sadhana.";
        else line = `${aways} look-aways. each one is a doorway. notice which thought turned you.`;
        setRevealLine(line);
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.14);
        await say("what did the face in the glass want to say?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setReflectionListening(true); } catch {}
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("the witness is the same in every mirror. carry that.", "guru");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // GAZE sampling + look-away detection
  useEffect(() => {
    if (phase !== "gaze") return;
    const id = setInterval(() => {
      const present = cam.faceLikely > 0.25;
      presenceSamplesRef.current.push(present ? 1 : 0);
      motionSamplesRef.current.push(cam.motion);
      if (lastFaceRef.current && !present) {
        lookAwaysRef.current += 1;
        setAwayPulse((n) => n + 1);
        buzz("tap");
      }
      lastFaceRef.current = present;
    }, 300);

    const tick = setInterval(() => {
      const elapsed = Date.now() - gazeStartRef.current;
      const p = Math.min(1, elapsed / GAZE_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(tick);
        clearInterval(id);
        setPhase("reveal");
        sd.chime("rise", 0.24);
      }
    }, 200);

    return () => { clearInterval(id); clearInterval(tick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cam.faceLikely, cam.motion]);

  // Sample mic envelope while gazing
  useEffect(() => {
    if (phase !== "gaze") return;
    envSamplesRef.current.push(breath.envelope);
    if (envSamplesRef.current.length > 1500) envSamplesRef.current.shift();
  }, [breath.envelope, phase]);

  // Auto reveal → reflect
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => setPhase("reflect"), 10_000);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto reflect → integrate
  useEffect(() => {
    if (phase !== "reflect") return;
    const t = setTimeout(() => setPhase("integrate"), 14_000);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto end after integrate
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => finish(), 7_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const presenceRatio = presenceSamplesRef.current.length
      ? presenceSamplesRef.current.reduce((a, b) => a + b, 0) / presenceSamplesRef.current.length : 0;
    const avgMotion = motionSamplesRef.current.length
      ? motionSamplesRef.current.reduce((a, b) => a + b, 0) / motionSamplesRef.current.length : 0;
    const avgEnv = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length : 0;
    const sighs = Math.max(0, breath.sighs - sighsAtStartRef.current);
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        gaze_ms: gazeStartRef.current ? Date.now() - gazeStartRef.current : 0,
        progress: +progress.toFixed(3),
        look_aways: lookAwaysRef.current,
        face_presence_ratio: +presenceRatio.toFixed(3),
        avg_face_motion: +avgMotion.toFixed(3),
        avg_mic_envelope: +avgEnv.toFixed(3),
        sighs_during_gaze: sighs,
        cam_ready: cam.ready,
        mic_ready: breath.ready,
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
      },
    });
  };

  const finalizeReflection = async () => {
    if (!reflectionListening) return;
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
    if (phase === "reflect") setPhase("integrate");
  };

  const remaining = phase === "gaze" ? Math.max(0, GAZE_MS - (Date.now() - gazeStartRef.current)) : 0;
  const presenceRatio = presenceSamplesRef.current.length
    ? presenceSamplesRef.current.reduce((a, b) => a + b, 0) / presenceSamplesRef.current.length : 0;

  const showVideo = phase === "gaze" || phase === "reveal";

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <CinematicOverlay tint="amber" />

      {/* Live mirror — center */}
      {showVideo && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative w-[min(72vw,420px)] aspect-[3/4] rounded-[2rem] overflow-hidden ring-1 ring-amber-100/20 shadow-[0_0_80px_rgba(255,200,150,0.22),inset_0_0_60px_rgba(0,0,0,0.55)]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* soft inner vignette on the mirror itself */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)" }} />
            {!cam.ready && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white/50 text-xs uppercase tracking-[0.3em] gap-2">
                <EyeOff className="w-5 h-5" />
                camera unavailable
              </div>
            )}
          </div>
        </div>
      )}

      <TwoMirrorsCanvas envelope={breath.envelope} awayPulse={awayPulse} steady={presenceRatio} />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div key={phase} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.85, x: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-amber-100/70">
          <span className="w-1 h-1 rounded-full bg-amber-200/80 animate-pulse" />
          {phase === "settle" && "the mirror"}
          {phase === "gaze" && "gazing"}
          {phase === "reveal" && "what was met"}
          {phase === "reflect" && "speak"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right signals */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {cam.ready ? <Eye className="w-3 h-3 text-amber-100/70" /> : <EyeOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{cam.ready ? "cam" : "no cam"}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-amber-100/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
        {phase === "gaze" && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-amber-100/70">{Math.ceil(remaining / 1000)}s</p>
            {lookAwaysRef.current > 0 && (
              <p className="text-[10px] uppercase tracking-widest text-rose-200/80">{lookAwaysRef.current} look-away{lookAwaysRef.current !== 1 ? "s" : ""}</p>
            )}
          </>
        )}
      </div>

      {/* Phase content overlays */}
      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div key="settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center">
            <p className="text-4xl sm:text-5xl italic text-amber-50/90" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.02em", textShadow: "0 0 40px rgba(255,200,160,0.35)" }}>two mirrors</p>
            <p className="mt-6 text-sm text-white/55 max-w-xs leading-relaxed tracking-wide">look at yourself. don't look away. two minutes.</p>
          </motion.div>
        )}

        {phase === "gaze" && (
          <motion.div key="gaze-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute bottom-12 inset-x-0 z-20 text-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-100/40">stay with the eyes in the glass</p>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-x-0 bottom-10 z-30 px-8 text-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-100/70 mb-4">what was met</p>
            <p className="text-2xl sm:text-3xl italic text-amber-50/95 leading-relaxed max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{revealLine || "…"}"</p>
          </motion.div>
        )}

        {phase === "reflect" && (
          <motion.div key="reflect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center">
            <p className="text-2xl sm:text-3xl italic text-amber-50/90 mb-8 leading-relaxed max-w-md" style={{ fontFamily: "'Cormorant Garamond', serif" }}>what did the face in the glass want to say?</p>
            {reflection ? (
              <p className="text-lg italic text-amber-100/80 max-w-md leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{reflection}"</p>
            ) : reflectionListening ? (
              <button onClick={finalizeReflection} className="px-6 py-2.5 rounded-full border border-amber-200/40 text-amber-100 text-[11px] uppercase tracking-[0.3em] bg-amber-500/10 backdrop-blur-sm animate-pulse" style={{ boxShadow: "0 0 30px rgba(251,191,36,0.18)" }}>
                ● listening · tap when done
              </button>
            ) : (
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div key="integrate" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.42em] text-amber-100/60">met</p>
            {reflection && <p className="mt-5 text-lg italic text-amber-100/60 max-w-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{reflection}"</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {phase === "gaze" && (
        <div className="absolute bottom-4 left-0 right-0 h-[2px] z-30 bg-white/5">
          <div className="h-full bg-gradient-to-r from-amber-200/40 via-amber-100/80 to-amber-200/40 transition-all" style={{ width: `${progress * 100}%`, boxShadow: "0 0 12px rgba(251,191,36,0.4)" }} />
        </div>
      )}

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-amber-100/70 transition"
      >
        end · save
      </button>
    </div>
  );
}

export default function TwoMirrors() {
  const g = getLabGame("two-mirrors")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
