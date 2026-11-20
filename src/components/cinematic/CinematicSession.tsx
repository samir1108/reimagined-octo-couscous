/**
 * CinematicSession
 * ────────────────
 * Full-screen immersive surface that plays a CinematicScript:
 *   • Black or guru-bg surface with soft glow
 *   • Beats reveal one at a time with hold-times
 *   • Phase checkpoints surface [Yes] / [Not yet] taps → branch beats
 *   • Single subtle exit; no chat input
 *
 * Spec source: user-provided "AI Guru cinematic flow" prompt.
 * Used by Guide.tsx (directive handoff) AND can be mounted standalone.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import type {
  CinematicBeat,
  CinematicCheckpoint,
  CinematicScript,
} from "@/lib/cinematic/types";

export interface CinematicSessionProps {
  script: CinematicScript;
  layerIdx: number;
  guruImage?: string;
  guruName?: string;
  onComplete: () => void;
  onExit: () => void;
}

type Stage = "playing" | "checkpoint" | "branch" | "done";

export default function CinematicSession({
  script,
  layerIdx,
  guruImage,
  guruName,
  onComplete,
  onExit,
}: CinematicSessionProps) {
  const layer = script.layers[layerIdx] ?? script.layers[0];
  const phases = layer.phases;

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [beatIdx, setBeatIdx] = useState(0);
  const [stage, setStage] = useState<Stage>("playing");
  const [branchBeats, setBranchBeats] = useState<CinematicBeat[]>([]);
  const [branchIdx, setBranchIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  const phase = phases[phaseIdx];
  const isBranch = stage === "branch";
  const activeBeats = isBranch ? branchBeats : phase?.beats ?? [];
  const activeIdx = isBranch ? branchIdx : beatIdx;
  const beat: CinematicBeat | undefined = activeBeats[activeIdx];

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Drive beat timing
  useEffect(() => {
    if (stage === "checkpoint" || stage === "done") return;
    if (!beat) {
      // beats finished → checkpoint or next phase
      if (isBranch) {
        // branch finished → resume into next phase
        setBranchBeats([]);
        setBranchIdx(0);
        setStage("playing");
        const nextPhase = phaseIdx + 1;
        if (nextPhase >= phases.length) {
          setStage("done");
          window.setTimeout(() => onComplete(), 800);
        } else {
          setPhaseIdx(nextPhase);
          setBeatIdx(0);
        }
        return;
      }
      // main beats finished → checkpoint?
      if (phase?.checkpoint) {
        setStage("checkpoint");
        return;
      }
      const nextPhase = phaseIdx + 1;
      if (nextPhase >= phases.length) {
        setStage("done");
        window.setTimeout(() => onComplete(), 800);
      } else {
        setPhaseIdx(nextPhase);
        setBeatIdx(0);
      }
      return;
    }
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (isBranch) setBranchIdx((i) => i + 1);
      else setBeatIdx((i) => i + 1);
    }, beat.holdMs);
    return clearTimer;
  }, [stage, beatIdx, branchIdx, phaseIdx, isBranch, beat, phase, phases.length, onComplete]);

  const handleCheckpoint = useCallback(
    (cp: CinematicCheckpoint, response: "yes" | "not_yet") => {
      const branch = response === "yes" ? cp.onYes : cp.onNotYet;
      setBranchBeats(branch);
      setBranchIdx(0);
      setStage("branch");
    },
    [],
  );

  const totalBeats = useMemo(
    () => phases.reduce((sum, p) => sum + p.beats.length + (p.checkpoint ? 1 : 0), 0),
    [phases],
  );
  const completedBeats = useMemo(() => {
    let n = 0;
    for (let i = 0; i < phaseIdx; i++) {
      n += phases[i].beats.length + (phases[i].checkpoint ? 1 : 0);
    }
    n += beatIdx;
    return n;
  }, [phaseIdx, beatIdx, phases]);
  const progress = Math.min(1, completedBeats / Math.max(1, totalBeats));

  const surface = script.surface;

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          surface === "black"
            ? "radial-gradient(ellipse at center, hsl(0 0% 4%) 0%, hsl(0 0% 0%) 80%)"
            : surface === "starfield"
              ? "radial-gradient(ellipse at center, hsl(240 30% 8%) 0%, hsl(240 40% 2%) 80%)"
              : "radial-gradient(ellipse at center, hsl(var(--background) / 0.3) 0%, hsl(0 0% 2%) 80%)",
      }}
    >
      {/* Guru background, blurred + dimmed */}
      {guruImage && surface === "guru-bg" && (
        <motion.img
          src={guruImage}
          alt={guruName || "Guide"}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.18 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover blur-2xl"
          aria-hidden
        />
      )}

      {/* Soft ambient glow */}
      <motion.div
        className="absolute w-[60vmin] h-[60vmin] rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Exit */}
      <button
        onClick={() => {
          clearTimer();
          onExit();
        }}
        aria-label="Exit"
        className="absolute top-6 right-6 z-10 text-foreground/40 hover:text-foreground/80 transition"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Top: thin progress + script label */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 max-w-[60%]">
        <p className="text-foreground/40 text-[9px] uppercase tracking-[0.35em]">
          {script.label}
        </p>
        <div className="w-32 h-px bg-foreground/10 overflow-hidden">
          <motion.div
            className="h-full bg-foreground/40"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Center: paced text */}
      <div className="relative z-10 w-full max-w-xl px-8 min-h-[28vh] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {stage === "checkpoint" && phase?.checkpoint ? (
            <motion.div
              key={`cp-${phase.checkpoint.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col items-center gap-8"
            >
              <p className="font-display text-foreground/85 text-xl text-center leading-relaxed italic">
                {phase.checkpoint.question}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    phase.checkpoint && handleCheckpoint(phase.checkpoint, "yes")
                  }
                  className="px-7 py-2.5 rounded-full border border-foreground/25 text-foreground/85 text-sm tracking-wide hover:bg-foreground/5 hover:border-foreground/50 transition"
                >
                  Yes
                </button>
                <button
                  onClick={() =>
                    phase.checkpoint && handleCheckpoint(phase.checkpoint, "not_yet")
                  }
                  className="px-7 py-2.5 rounded-full border border-foreground/15 text-foreground/60 text-sm tracking-wide hover:bg-foreground/5 hover:border-foreground/35 transition"
                >
                  Not yet
                </button>
              </div>
            </motion.div>
          ) : beat && !beat.silent && beat.text ? (
            <motion.p
              key={`${stage}-${phaseIdx}-${activeIdx}`}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="font-display text-foreground/90 text-2xl md:text-3xl text-center leading-relaxed tracking-wide"
            >
              {beat.text}
            </motion.p>
          ) : (
            <motion.div
              key={`silence-${stage}-${phaseIdx}-${activeIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-foreground/30"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
