/**
 * SensorialPracticeSession — the cinematic, multimodal player that runs any
 * SensorialManifest. Handles TTS narration, STT voice replies, front-camera
 * presence (soft glow ring), mic-driven breathing orb, ambient backdrop, and
 * graceful fallbacks at every layer.
 *
 * Design rules:
 *   • Never crash on permission denial — degrade silently.
 *   • Never upload camera frames; analysis is purely on-device.
 *   • Stop all sensors on unmount and on tab hide.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, MicOff, ChevronRight, Loader2, X } from "lucide-react";
import type { Guru } from "@/lib/guru-data";
import type { SensorialManifest, SensorialStep } from "@/data/sensorialPractices/types";
import { useFaceCam } from "@/games/shell/useFaceCam";
import { useMicLevel } from "@/games/shell/useMicLevel";
import { supabase } from "@/lib/supabase";
import {
  AskMasterOverlay,
  SoulsPresence,
  InsightWall,
} from "./PracticeInteractiveLayer";
import { usePracticeAmbience, breathHaptic } from "./practiceAmbience";
import { PracticeBloom } from "./PracticeBloom";
import { PracticeSettle } from "./PracticeSettle";
import HomeOrb from "@/components/orb/HomeOrb";

type Props = {
  manifest: SensorialManifest;
  guru: Guru;
  onBack: () => void;
};

type Phase = "preflight" | "settle" | "playing" | "complete";

/* ─── Voice mapping (guruId → tts-speak voice key) ─── */
const GURU_VOICE: Record<string, "guru" | "guru_male" | "elder" | "child"> = {
  ramana: "guru_male", buddha: "guru_male", krishnamurti: "elder",
  sadhguru: "guru_male", vivekananda: "guru_male", babaji: "guru_male",
  osho: "guru_male", rumi: "guru_male", frankl: "elder",
  patanjali: "guru_male", "lao-tzu": "elder", dogen: "guru_male",
  tilopa: "guru_male", padmasambhava: "guru_male",
  "thich-nhat-hanh": "elder", shankara: "guru_male",
  krishna: "guru_male", yogananda: "guru_male",
};

/* ─── TTS helper: Deepgram (tts-speak) → browser fallback ─── */
async function speak(
  text: string,
  guruId: string | undefined,
  audioElRef: React.MutableRefObject<HTMLAudioElement | null>
): Promise<void> {
  const voice = (guruId && GURU_VOICE[guruId]) || "guru";
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts-speak`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ text, voice }),
    });
    const ct = resp.headers.get("content-type") || "";
    if (resp.ok && ct.startsWith("audio/")) {
      const blob = await resp.blob();
      if (blob.size > 200) {
        const objUrl = URL.createObjectURL(blob);
        const audio = new Audio(objUrl);
        audio.volume = 0.95;
        audioElRef.current = audio;
        await new Promise<void>((resolve) => {
          audio.onended = () => { URL.revokeObjectURL(objUrl); resolve(); };
          audio.onerror = () => { URL.revokeObjectURL(objUrl); resolve(); };
          audio.play().catch(() => resolve());
        });
        return;
      }
    }
  } catch { /* fall through */ }

  // Browser SpeechSynthesis fallback.
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    await new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95; u.pitch = 1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }
}

/* ─── STT helper: record → stt-listen (Deepgram → ElevenLabs fallback)
       Also persists the audio blob to Storage and the transcript to
       `practice_voice_recordings` so users can revisit their own voice. ─── */
type SaveCtx = { practiceId: string; guruId?: string; stepIdx: number };
async function recordAndTranscribe(maxMs: number, save?: SaveCtx): Promise<string> {
  let stream: MediaStream | null = null;
  const startedAt = Date.now();
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    mr.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    const stopped = new Promise<void>((res) => (mr.onstop = () => res()));
    mr.start();
    await new Promise((r) => setTimeout(r, maxMs));
    mr.stop();
    await stopped;
    stream.getTracks().forEach((t) => t.stop());
    const audioBlob = new Blob(chunks, { type: "audio/webm" });
    const durationMs = Date.now() - startedAt;

    const fd = new FormData();
    fd.append("audio", audioBlob, "reply.webm");
    const { data: { session } } = await supabase.auth.getSession();
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stt-listen`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: fd,
    });
    let transcript = "";
    if (resp.ok) {
      const json = await resp.json().catch(() => ({}));
      transcript = (json as any)?.transcript ?? (json as any)?.text ?? "";
    }

    // Persist (best-effort, never blocks UX)
    const uid = session?.user?.id;
    if (uid && save && audioBlob.size > 0) {
      const path = `${uid}/${save.practiceId}/${Date.now()}-step${save.stepIdx}.webm`;
      try {
        const up = await supabase.storage
          .from("practice-recordings")
          .upload(path, audioBlob, { contentType: "audio/webm", upsert: false });
        if (!up.error) {
          await supabase.from("practice_voice_recordings").insert({
            user_id: uid,
            practice_id: save.practiceId,
            guru_id: save.guruId ?? null,
            step_idx: save.stepIdx,
            transcript: transcript || null,
            audio_path: path,
            duration_ms: durationMs,
            provider: "deepgram",
          });
        }
      } catch { /* silent */ }
    }

    return transcript;
  } catch {
    stream?.getTracks().forEach((t) => t.stop());
    return "";
  }
}

export default function SensorialPracticeSession({ manifest, guru, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("preflight");
  const [stepIdx, setStepIdx] = useState(0);
  const [permsAsked, setPermsAsked] = useState(false);
  const [listening, setListening] = useState(false);
  const [reply, setReply] = useState<string>("");
  const [narrating, setNarrating] = useState(false);
  const [, setPaused] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const ambience = usePracticeAmbience();

  const step: SensorialStep | undefined = manifest.steps[stepIdx];
  const voiceKey = (guru.id && GURU_VOICE[guru.id]) || "guru";

  // Sensor activation rules — widened so silence/gaze can also adapt timing.
  const wantCam =
    phase === "playing" &&
    (step?.modality === "gaze" || step?.modality === "silence") &&
    !!manifest.sensors.camera;
  const wantMic =
    phase === "playing" &&
    (step?.modality === "breath" ||
      step?.modality === "mantra" ||
      step?.modality === "silence") &&
    !!manifest.sensors.mic;

  const cam = useFaceCam(!!wantCam);
  const mic = useMicLevel(!!wantMic);

  // Live refs so the step runner can read sensor state without re-firing.
  const camRef = useRef({ motion: 0, faceLikely: 0 });
  const micRef = useRef({ level: 0 });
  useEffect(() => { camRef.current = { motion: cam.motion, faceLikely: cam.faceLikely }; }, [cam.motion, cam.faceLikely]);
  useEffect(() => { micRef.current = { level: mic.level }; }, [mic.level]);

  /* ─── Preflight: ask for needed permissions in one tap ─── */
  const askPermissions = useCallback(async () => {
    setPermsAsked(true);
    try {
      if (manifest.sensors.mic) {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach((t) => t.stop());
      }
    } catch {
      /* ignore */
    }
    try {
      if (manifest.sensors.camera) {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        s.getTracks().forEach((t) => t.stop());
      }
    } catch {
      /* ignore */
    }
    setPhase("settle");
  }, [manifest.sensors.mic, manifest.sensors.camera]);

  /* ─── Step runner ─── */
  useEffect(() => {
    if (phase !== "playing" || !step) return;
    cancelledRef.current = false;
    let advanceTimer: ReturnType<typeof setTimeout> | null = null;
    let adaptiveInterval: ReturnType<typeof setInterval> | null = null;

    /**
     * Adaptive hold:
     *   • silence/gaze — if user is very still (low cam motion AND low mic), keep extending
     *     in 5 s chunks up to +30 s beyond base holdMs.
     *   • breath — if breath is shallow/erratic (mic level very low or jumping), extend up
     *     to +20 s so the master "waits" until breathing settles.
     */
    const adaptiveAdvance = (baseMs: number) => {
      const start = Date.now();
      const maxExtra =
        step.modality === "silence" || step.modality === "gaze" ? 30000 :
        step.modality === "breath" ? 20000 : 0;

      const tick = () => {
        if (cancelledRef.current) return;
        const elapsed = Date.now() - start;
        if (elapsed < baseMs) return; // still in base window

        // After base, decide whether to extend.
        const extra = elapsed - baseMs;
        if (extra >= maxExtra) {
          if (adaptiveInterval) clearInterval(adaptiveInterval);
          goNext();
          return;
        }

        const stillCam = wantCam ? camRef.current.motion < 0.05 : true;
        const quietMic = wantMic ? micRef.current.level < 0.04 : true;
        const shallowBreath = wantMic && step.modality === "breath" && micRef.current.level < 0.025;

        const shouldHold =
          (step.modality === "silence" && stillCam && quietMic) ||
          (step.modality === "gaze" && stillCam) ||
          (step.modality === "breath" && shallowBreath);

        if (!shouldHold) {
          if (adaptiveInterval) clearInterval(adaptiveInterval);
          goNext();
        }
      };
      adaptiveInterval = setInterval(tick, 1000);
    };

    (async () => {
      setReply("");
      setNarrating(true);
      ambience.duck();
      await speak(step.narration, guru.id, audioRef);
      if (cancelledRef.current) return;
      setNarrating(false);
      ambience.swell();

      if (step.modality === "voice_reply") {
        setListening(true);
        const text = await recordAndTranscribe(step.maxListenMs ?? 20000, {
          practiceId: manifest.key,
          guruId: guru.id,
          stepIdx,
        });
        if (cancelledRef.current) return;
        setListening(false);
        setReply(text || "(silence)");
        advanceTimer = setTimeout(() => goNext(), 2500);
      } else if (step.holdMs) {
        // Adaptive for sensor-eligible modalities; fixed timeout otherwise.
        const adaptive =
          (step.modality === "silence" || step.modality === "gaze" || step.modality === "breath") &&
          (wantCam || wantMic);
        if (adaptive) {
          adaptiveAdvance(step.holdMs);
        } else {
          advanceTimer = setTimeout(() => goNext(), step.holdMs);
        }
      }
    })();

    return () => {
      cancelledRef.current = true;
      if (advanceTimer) clearTimeout(advanceTimer);
      if (adaptiveInterval) clearInterval(adaptiveInterval);
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stepIdx]);

  const goNext = useCallback(() => {
    setStepIdx((i) => {
      if (i + 1 >= manifest.steps.length) {
        setPhase("complete");
        return i;
      }
      return i + 1;
    });
  }, [manifest.steps.length]);

  /* ─── Stop everything when component unmounts ─── */
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      audioRef.current?.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      ambience.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Stop ambience on completion ─── */
  useEffect(() => {
    if (phase === "complete") ambience.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ─── Breath haptic pacing — gentle ~6s in/out cycle on breath steps ─── */
  useEffect(() => {
    if (phase !== "playing" || step?.modality !== "breath") return;
    let i = 0;
    breathHaptic("in");
    const t = setInterval(() => {
      i += 1;
      breathHaptic(i % 2 === 0 ? "in" : "out");
    }, 3000);
    return () => clearInterval(t);
  }, [phase, step?.modality, step?.id]);

  /* ─── Camera <video> mounting (live preview + soft glow) ─── */
  const videoHostRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const host = videoHostRef.current;
    const v = cam.videoEl;
    if (host && v && !host.contains(v)) {
      v.style.width = "100%";
      v.style.height = "100%";
      v.style.objectFit = "cover";
      v.style.transform = "scaleX(-1)";
      host.appendChild(v);
    }
  }, [cam.videoEl, wantCam]);

  /* ─── Render ─── */
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black px-4 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(7.25rem+env(safe-area-inset-bottom))] md:px-6 md:py-[calc(5rem+env(safe-area-inset-top))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        key={`bg-${stepIdx}`}
        className="absolute inset-0"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {manifest.videoUrl ? (
          <video
            src={manifest.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={manifest.backdropImage}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        {/* Per-step overlay image — fades in/out over the ambient backdrop */}
        <AnimatePresence>
          {step?.imageUrl && (
            <motion.img
              key={`step-img-${stepIdx}`}
              src={step.imageUrl}
              alt=""
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60" />
      </motion.div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="fixed left-[calc(1.25rem+env(safe-area-inset-left))] top-[calc(1.25rem+env(safe-area-inset-top))] z-30 w-9 h-9 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90"
        aria-label="Exit practice"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Close button */}
      <button
        onClick={onBack}
        className="fixed right-[calc(1.25rem+env(safe-area-inset-right))] top-[calc(1.25rem+env(safe-area-inset-top))] z-40 w-10 h-10 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.12] transition"
        aria-label="Close practice"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Tiny camera tile (only when active) */}
      <AnimatePresence>
        {wantCam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed right-[calc(1.25rem+env(safe-area-inset-right))] top-[calc(4.25rem+env(safe-area-inset-top))] z-30 w-20 h-20 rounded-full overflow-hidden border-2"
            style={{
              borderColor: `rgba(245, 197, 102, ${0.15 + cam.faceLikely * 0.6})`,
              boxShadow: `0 0 ${10 + cam.faceLikely * 30}px rgba(245,197,102,${cam.faceLikely * 0.5})`,
            }}
          >
            <div ref={videoHostRef} className="w-full h-full bg-black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PREFLIGHT ─── */}
      {phase === "preflight" && (
        <motion.div
          className="relative z-20 my-auto w-full max-w-md px-4 text-center sm:px-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-3">prepare</p>
          <h2 className="text-2xl font-display text-white/90 mb-2">{manifest.title}</h2>
          <p className="text-sm text-white/55 mb-1">with {guru.name}</p>
          <p className="text-xs text-white/35 mb-8">~{manifest.totalMinutes} min</p>

          <div className="space-y-2.5 mb-8 text-left">
            {manifest.sensors.mic && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03]">
                <Mic className="w-4 h-4 text-amber-200/70 mt-0.5" />
                <div>
                  <p className="text-sm text-white/85">Microphone</p>
                  <p className="text-[11px] text-white/40">
                    so you can answer aloud and the master can sense your breath
                  </p>
                </div>
              </div>
            )}
            {manifest.sensors.camera && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03]">
                <Eye className="w-4 h-4 text-amber-200/70 mt-0.5" />
                <div>
                  <p className="text-sm text-white/85">Camera</p>
                  <p className="text-[11px] text-white/40">
                    a soft eye-presence — frames never leave your device
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={askPermissions}
            disabled={permsAsked}
            className="w-full px-6 py-4 rounded-2xl bg-amber-200/10 border border-amber-200/30 text-amber-100 font-display tracking-wide hover:bg-amber-200/15 transition-all disabled:opacity-50"
          >
            {permsAsked ? "Beginning…" : "Begin"}
          </button>
          <button
            onClick={onBack}
            className="mt-4 text-xs text-white/35 hover:text-white/60 transition"
          >
            Not now
          </button>
        </motion.div>
      )}

      {/* ─── SETTLE — 10s pre-roll, ambience starts here ─── */}
      {phase === "settle" && (
        <PracticeSettle
          practiceKey={manifest.key}
          guruName={guru.name}
          onDone={() => {
            ambience.start();
            startedAtRef.current = Date.now();
            setPhase("playing");
          }}
        />
      )}

      {/* ─── PLAYING ─── */}
      {phase === "playing" && step && (
        <div className="relative z-20 my-auto flex w-full max-w-2xl flex-col items-center px-2 text-center sm:px-6 md:px-10">
          {/* Step counter */}
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/35 mb-6">
            {stepIdx + 1} / {manifest.steps.length}
          </p>

          {/* Visual anchor by modality */}
          {step.modality === "breath" && (
            <BreathOrb level={mic.level} />
          )}
          {step.modality === "gaze" && (
            <GazeAnchor faceLikely={cam.faceLikely} />
          )}
          {step.modality === "silence" && <SilenceAnchor />}

          {/* Caption */}
          {step.caption && (
            <motion.p
              key={`cap-${step.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base md:text-lg text-white/75 font-display italic mt-8 mb-3"
            >
              {step.caption}
            </motion.p>
          )}

          {/* Live narration line */}
          <motion.p
            key={`nar-${step.id}-${narrating}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: narrating ? 0.65 : 0.4 }}
            className="text-sm text-white/60 max-w-xl leading-relaxed"
          >
            {step.narration}
          </motion.p>

          {/* Voice reply UI */}
          {step.modality === "voice_reply" && (
            <div className="mt-8 w-full max-w-md">
              {step.prompt && (
                <p className="text-amber-100/80 font-display text-base mb-4">{step.prompt}</p>
              )}
              <div className="flex items-center justify-center gap-3 mb-3">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border ${
                    listening
                      ? "border-amber-200/60 bg-amber-200/10 animate-pulse"
                      : "border-white/15 bg-white/5"
                  }`}
                >
                  {listening ? (
                    <Mic className="w-5 h-5 text-amber-100" />
                  ) : reply ? (
                    <MicOff className="w-5 h-5 text-white/40" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                  )}
                </div>
              </div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">
                {listening ? "listening…" : reply ? "heard you" : "preparing…"}
              </p>
              {reply && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-white/85 italic font-display"
                >
                  "{reply}"
                </motion.p>
              )}
            </div>
          )}

          {/* Manual advance — always available so users aren't stuck */}
          {!narrating && step.modality !== "voice_reply" && (
            <button
              onClick={goNext}
              className="mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-white/70 text-xs hover:bg-white/[0.1] transition"
            >
              Continue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>
      )}

      {/* Souls presence — live count via Supabase Realtime */}
      {phase === "playing" && <SoulsPresence practiceKey={manifest.key} />}

      {/* Floating "Ask the master" — universal interactive layer */}
      {phase === "playing" && step && (
        <AskMasterOverlay
          guruId={guru.id}
          guruName={guru.name}
          practiceTitle={manifest.title}
          currentStepNarration={step.narration}
          voiceKey={voiceKey}
          onPauseRequest={() => {
            setPaused(true);
            audioRef.current?.pause();
            if ("speechSynthesis" in window) window.speechSynthesis.cancel();
          }}
          onResumeRequest={() => {
            setPaused(false);
            audioRef.current?.play().catch(() => {});
          }}
        />
      )}

      {/* ─── COMPLETE ─── */}
      {phase === "complete" && (
        <motion.div
          className="relative z-20 my-auto w-full max-w-lg px-4 text-center sm:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/50 mb-4">
            ◇ complete ◇
          </p>

          <PracticeBloom
            minutes={Math.max(
              1,
              Math.round(
                ((startedAtRef.current ? Date.now() - startedAtRef.current : 0) /
                  60000)
              )
            )}
          />

          <h2 className="text-2xl font-display text-white/90 mb-4">{manifest.title}</h2>
          <p className="text-white/65 italic font-display leading-relaxed mb-8">
            "{manifest.closing}"
          </p>

          <InsightWall practiceKey={manifest.key} />

          <button
            onClick={onBack}
            className="mt-8 px-8 py-3 rounded-full bg-amber-200/10 border border-amber-200/30 text-amber-100 font-display tracking-wide"
          >
            Return to {guru.name}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Visual anchors ─── */

function BreathOrb({ level }: { level: number }) {
  const scale = 1 + level * 0.6;
  return (
    <motion.div
      animate={{ scale }}
      transition={{ type: "spring", damping: 15 }}
      className="relative h-32 w-32"
    >
      <HomeOrb className="absolute inset-0" />
    </motion.div>
  );
}

function GazeAnchor({ faceLikely }: { faceLikely: number }) {
  return (
    <div
      className="w-28 h-28 rounded-full border"
      style={{
        borderColor: `rgba(245,197,102,${0.2 + faceLikely * 0.6})`,
        boxShadow: `inset 0 0 ${20 + faceLikely * 40}px rgba(245,197,102,${faceLikely * 0.3})`,
      }}
    />
  );
}

function SilenceAnchor() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="w-24 h-24 rounded-full bg-white/10 border border-white/20"
    />
  );
}

/* tiny inline icon used above (avoid extra import) */
function Eye(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
