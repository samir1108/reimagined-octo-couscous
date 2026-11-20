import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GameMeta } from "./gameRegistry";
import { logGameSession } from "./logGameSession";
import { reflectGame } from "./reflectGame";
import { getHeroImage } from "./heroImages";
import { useGuruVoice } from "./useGuruVoice";
import { faceToTone } from "./GameAmbientBackdrop";
import GameAmbientBackdrop from "./GameAmbientBackdrop";
import PermissionsGate, { SensorNeeds } from "./PermissionsGate";
import { Pause, Play, X, RotateCcw, ArrowRight, Trophy, Sparkles, Volume2, VolumeX, Mic, Camera } from "lucide-react";
import { Button } from "@/design-system";
import { toast } from "sonner";

type Phase = "permissions" | "intro" | "play" | "reflect" | "complete";

export interface GameEndPayload {
  outcome: "completed" | "abandoned" | "interrupted";
  signals: Record<string, unknown>;
}

interface Props {
  game: GameMeta & {
    needs?: SensorNeeds;
    tone?: string;
    durationMinutes?: number;
  };
  children: (api: { onEnd: (p: GameEndPayload) => void; isPaused: boolean; pause: () => void; resume: () => void }) => ReactNode;
}

export default function ConsciousGameShell({ game, children }: Props) {
  const navigate = useNavigate();
  const initialPhase: Phase =
    game.needs && (game.needs.mic || game.needs.camera) ? "permissions" : "intro";
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [reflection, setReflection] = useState<string>("");
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [nextGameId, setNextGameId] = useState<string | null>(null);
  const startRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef<number>(0);
  const { say, stop: stopVoice } = useGuruVoice();
  const tone = faceToTone(game.tone);
  const durationMs = (game.durationMinutes ?? 3) * 60 * 1000;

  useEffect(() => () => stopVoice(), [stopVoice]);

  const begin = useCallback(() => {
    startRef.current = Date.now();
    setPhase("play");
  }, []);

  const pause = useCallback(() => {
    if (phase !== "play") return;
    setIsPaused(true);
    setShowPauseMenu(true);
    pausedAtRef.current = Date.now();
  }, [phase]);

  const resume = useCallback(() => {
    if (pausedAtRef.current) {
      totalPausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setIsPaused(false);
    setShowPauseMenu(false);
  }, []);

  const handleEnd = useCallback(async (p: GameEndPayload) => {
    const durationMs = Date.now() - startRef.current - totalPausedMsRef.current;
    setPhase("reflect");
    setReflection("");
    logGameSession({ gameId: game.id, durationMs, outcome: p.outcome, signals: p.signals });
    
    // Award karma toast
    if (p.outcome === "completed") {
      toast.success("Practice complete", {
        description: `+8 karma · ${Math.round(durationMs / 1000)}s`,
        duration: 3000,
      });
    }
    
    const line = await reflectGame({
      gameId: game.id,
      signals: p.signals,
      durationMs,
      outcome: p.outcome,
    });
    setReflection(line);
    if (line && !isMuted) {
      try { say(line, "guru"); } catch {}
    }
  }, [game.id, isMuted, say]);

  // Timer
  useEffect(() => {
    if (phase !== "play" || isPaused) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current - totalPausedMsRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [phase, isPaused]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phase === "play") {
          if (isPaused) resume();
          else pause();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, isPaused, pause, resume]);

  const handlePlayAgain = () => {
    startRef.current = Date.now();
    totalPausedMsRef.current = 0;
    setElapsedMs(0);
    setReflection("");
    setPhase("intro");
  };

  const handleNextGame = () => {
    if (nextGameId) {
      navigate(`/app/games/${nextGameId}`);
    } else {
      navigate("/app/explore");
    }
  };

  const progressPercent = Math.min(100, (elapsedMs / durationMs) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden">
      {phase !== "play" && <GameAmbientBackdrop tone={tone} intensity="med" />}

      {/* Pause Menu Overlay */}
      <AnimatePresence>
        {showPauseMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4"
            >
              <h2 className="text-xl font-display font-bold text-foreground">Paused</h2>
              <p className="text-sm text-muted-foreground">{game.name}</p>
              <div className="space-y-2 pt-2">
                <Button onClick={resume} className="w-full gap-2">
                  <Play className="w-4 h-4" /> Resume
                </Button>
                <Button variant="outline" onClick={() => { stopVoice(); navigate("/app/explore"); }} className="w-full gap-2">
                  <X className="w-4 h-4" /> Exit to Explore
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/60">Press ESC to resume</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === "permissions" && (
          <PermissionsGate
            key="perm"
            needs={game.needs!}
            gameName={game.name}
            onReady={() => setPhase("intro")}
          />
        )}

        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          >
            {getHeroImage(game.id) && (
              <>
                <motion.img
                  src={getHeroImage(game.id)!}
                  alt=""
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 0.55, scale: 1 }}
                  transition={{ duration: 2.4, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/90" />
              </>
            )}
            <div className="relative z-10 flex flex-col items-center max-w-md">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">{game.category}</p>
              <h1 className="text-3xl font-light mb-6">{game.name}</h1>
              <p className="max-w-md text-base text-white/75 mb-8">{game.oneLine}</p>
              
              {/* Duration & Sensors */}
              <div className="flex items-center gap-4 mb-8 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {game.durationMinutes ?? 3} min
                </span>
                {game.needs?.mic && <span className="flex items-center gap-1"><Mic className="w-4 h-4" /> Mic</span>}
                {game.needs?.camera && <span className="flex items-center gap-1"><Camera className="w-4 h-4" /> Cam</span>}
              </div>
              
              <Button onClick={begin} size="lg" className="gap-2 rounded-full px-8">
                <Play className="w-5 h-5" /> Begin
              </Button>
              <button
                onClick={() => navigate("/app/explore")}
                className="mt-6 text-xs text-white/40 hover:text-white/70 transition"
              >
                return
              </button>
            </div>
          </motion.div>
        )}

        {phase === "play" && (
          <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/10">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            {/* Top Controls */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/60 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={pause}
                className="text-white/60 hover:text-white"
              >
                <Pause className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Timer */}
            <div className="absolute top-4 left-4 z-30 text-xs text-white/50 font-mono">
              {Math.floor(elapsedMs / 1000)}s / {Math.floor(durationMs / 1000)}s
            </div>
            
            <div className="absolute inset-0">{children({ onEnd: handleEnd, isPaused, pause, resume })}</div>
          </motion.div>
        )}

        {phase === "reflect" && (
          <motion.div
            key="reflect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          >
            <AnimatePresence>
              {reflection ? (
                <motion.p
                  key="line"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4 }}
                  className="relative z-10 max-w-md text-xl font-light text-white/90 leading-relaxed"
                >
                  {reflection}
                </motion.p>
              ) : (
                <motion.div
                  key="dot"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10 w-2 h-2 rounded-full bg-white/60"
                />
              )}
            </AnimatePresence>
            
            {reflection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative z-10 mt-12 flex flex-col sm:flex-row gap-3"
              >
                <Button onClick={handlePlayAgain} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
                <Button onClick={handleNextGame} className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Next Game
                </Button>
                <Button variant="ghost" onClick={() => { stopVoice(); navigate("/app/explore"); }} className="gap-2">
                  <X className="w-4 h-4" /> Explore
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// All imports above