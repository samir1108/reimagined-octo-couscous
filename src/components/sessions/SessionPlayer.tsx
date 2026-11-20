/**
 * ConsciousOS Session Player
 * ──────────────────────
 * Renders the current session phase with phase-specific UI.
 */

"use client";

import { useMachine } from "@xstate/react";
import { sessionPlayerMachine, type SessionPlayerEvent } from "@/machines/sessionPlayerMachine";
import { useState, useEffect, useCallback } from "react";
import { getGame } from "@/lib/games/games";
import { getProgramBySlug } from "@/lib/programs/programs";
import { buildSessionForDay, type SessionDefinition } from "@/lib/sessions/sessionEngine";

// ─── Props ───────────────────────────────────────────────────────────────────

interface SessionPlayerProps {
  programSlug: string;
  day: number;
  onComplete?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SessionPlayer({ programSlug, day, onComplete }: SessionPlayerProps) {
  const program = getProgramBySlug(programSlug);
  const [session, setSession] = useState<SessionDefinition | null>(null);

  const [{ context: playerCtx }, send] = useMachine(sessionPlayerMachine);

  const currentPhaseIndex = playerCtx.currentPhaseIndex;
  const phase = session?.phases[currentPhaseIndex];

  useEffect(() => {
    if (!program) return;
    try {
      const built = buildSessionForDay(program, day, []);
      setSession(built);
      send({ type: "START_SESSION", session: built } as SessionPlayerEvent);
    } catch (e) {
      console.error("Failed to build session:", e);
    }
  }, [program, day]);

  const handleNext = useCallback(() => {
    if (!session) return;
    if (currentPhaseIndex < session.phases.length - 1) {
      send({ type: "NEXT_PHASE" } as SessionPlayerEvent);
    } else {
      send({ type: "END_SESSION" } as SessionPlayerEvent);
      onComplete?.();
    }
  }, [session, currentPhaseIndex, send, onComplete]);

  if (!program || !session || !phase) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  const phaseNumber = currentPhaseIndex + 1;
  const totalPhases = session.phases.length;
  const progressPct = ((phaseNumber) / totalPhases) * 100;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{program.icon}</span>
          <div>
            <h1 className="text-sm font-medium text-white/80">{program.label}</h1>
            <p className="text-xs text-white/40">Day {day} · Phase {phaseNumber}/{totalPhases}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">Session XP</div>
          <div className="text-lg font-medium text-amber-400">+{session.xpReward}</div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Phase label */}
      <div className="px-6 pt-6 pb-2">
        <div className="text-xs uppercase tracking-widest text-white/40 mb-1">
          {phase.label}
        </div>
        <h2 className="text-2xl font-medium">{phase.description}</h2>
      </div>

      {/* Phase content */}
      <div className="flex-1 flex items-center justify-center px-6">
        {renderPhaseContent(phase, send, handleNext, () => {})}
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 flex items-center justify-between border-t border-white/10">
        <div className="text-xs text-white/40">
          {phase.type === "game" && getGame(phase.gameId!)?.label}
        </div>
        <div className="flex gap-3">
          {currentPhaseIndex > 0 && (
            <button
              onClick={() => send({ type: "PREV_PHASE" } as SessionPlayerEvent)}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-colors"
          >
            {currentPhaseIndex === totalPhases - 1 ? "Complete Session" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Phase renderer ──────────────────────────────────────────────────────────

function renderPhaseContent(
  phase: import("@/lib/sessions/sessionEngine").SessionPhase,
  send: (event: SessionPlayerEvent) => void,
  onNext: () => void,
  onSkip: () => void
) {
  switch (phase.type) {
    case "practice":
      return <PracticePhase phase={phase} onNext={onNext} />;
    case "game":
      return <GamePhase phase={phase} send={send} onNext={onNext} />;
    case "challenge":
      return <ChallengePhase phase={phase} onNext={onNext} />;
    case "reflection":
      return <ReflectionPhase phase={phase} onNext={onNext} />;
    case "integration":
      return <IntegrationPhase phase={phase} onNext={onNext} />;
    case "checkin":
      return <CheckinPhase phase={phase} send={send} onNext={onNext} />;
    case "progress":
      return <ProgressPhase onNext={onNext} />;
    default:
      return <DefaultPhase phase={phase} onNext={onNext} />;
  }
}

// ─── Practice phase ──────────────────────────────────────────────────────────

function PracticePhase({
  phase,
  onNext,
}: {
  phase: { instructions: string[]; durationSec: number };
  onNext: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(phase.durationSec);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [started, timeLeft]);

  if (!started) {
    return (
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">🧘</div>
        <h3 className="text-xl font-medium mb-4">Ready to begin?</h3>
        <p className="text-white/60 mb-8 text-sm leading-relaxed">
          Follow the instructions below. Take your time.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
        >
          Begin Practice
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md text-center">
      <div className="text-6xl mb-6">🧘</div>
      <div className="text-4xl font-light text-white/40 mb-8">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </div>
      <ul className="text-left space-y-3 text-white/70 text-sm">
        {phase.instructions.map((inst, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-amber-500/60 mt-0.5">·</span>
            <span>{inst}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onNext}
        className="mt-8 px-6 py-3 bg-white/10 text-white text-sm rounded-full hover:bg-white/20 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

// ─── Game phase ──────────────────────────────────────────────────────────────

function GamePhase({
  phase,
  send,
  onNext,
}: {
  phase: { gameId?: string; durationSec: number };
  send: (event: SessionPlayerEvent) => void;
  onNext: () => void;
}) {
  const game = phase.gameId ? getGame(phase.gameId) : null;
  const [score, setScore] = useState(0);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(phase.durationSec);

  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [active, timeLeft]);

  const handleComplete = () => {
    setActive(false);
    send({
      type: "PHASE_COMPLETE",
      result: {
        gameId: phase.gameId ?? "game_signal",
        score,
        durationSec: phase.durationSec - timeLeft,
        metrics: { score },
        events: [],
      },
    });
    onNext();
  };

  if (!game) return <div className="text-white/40">Loading game...</div>;

  return (
    <div className="max-w-md text-center">
      <div className="text-6xl mb-4">{game.icon}</div>
      <h3 className="text-2xl font-medium mb-2">{game.label}</h3>
      <p className="text-white/60 text-sm mb-8">{game.description}</p>

      {!active ? (
        <button
          onClick={() => setActive(true)}
          className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
        >
          Start Game
        </button>
      ) : (
        <>
          <div className="text-4xl font-light text-white/40 mb-4">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
          <div className="mb-8">
            <div className="text-5xl font-light text-amber-400">{score}</div>
            <div className="text-xs text-white/40 mt-1">Score</div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setScore((s) => Math.max(0, s - 10))}
              className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-2xl hover:bg-white/5 transition-colors"
            >
              −
            </button>
            <button
              onClick={() => setScore((s) => s + 10)}
              className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-2xl hover:bg-white/5 transition-colors"
            >
              +
            </button>
          </div>
          {timeLeft <= 0 && (
            <button
              onClick={handleComplete}
              className="mt-6 px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
            >
              Complete Game
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Challenge phase ─────────────────────────────────────────────────────────

function ChallengePhase({
  phase,
  onNext,
}: {
  phase: { experimentId?: string; instructions: string[] };
  onNext: () => void;
}) {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="max-w-md text-center">
      <div className="text-6xl mb-4">🏔</div>
      <h3 className="text-xl font-medium mb-4">Real-World Challenge</h3>
      <div className="text-left space-y-3 text-white/70 text-sm mb-8">
        {phase.instructions.map((inst, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-amber-500/60 mt-0.5">·</span>
            <span>{inst}</span>
          </li>
        ))}
      </div>
      {!completed ? (
        <button
          onClick={() => setCompleted(true)}
          className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
        >
          Mark Complete
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
        >
          Continue →
        </button>
      )}
    </div>
  );
}

// ─── Reflection phase ────────────────────────────────────────────────────────

function ReflectionPhase({
  phase,
  onNext,
}: {
  phase: { prompt?: string; instructions: string[] };
  onNext: () => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="max-w-lg w-full">
      <div className="text-6xl mb-4 text-center">💭</div>
      <h3 className="text-xl font-medium mb-2 text-center">Reflection</h3>
      {phase.prompt && (
        <p className="text-amber-400 text-sm mb-6 text-center">{phase.prompt}</p>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you notice during this session?"
        className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 text-sm leading-relaxed"
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-3 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-colors disabled:opacity-30"
          disabled={!text.trim()}
        >
          Save & Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Integration phase ───────────────────────────────────────────────────────

function IntegrationPhase({
  phase,
  onNext,
}: {
  phase: { instructions: string[] };
  onNext: () => void;
}) {
  return (
    <div className="max-w-md text-center">
      <div className="text-6xl mb-4">🌱</div>
      <h3 className="text-xl font-medium mb-6">Integration</h3>
      <ul className="text-left space-y-3 text-white/70 text-sm mb-8">
        {phase.instructions.map((inst, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-amber-500/60 mt-0.5">·</span>
            <span>{inst}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onNext}
        className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Checkin phase ───────────────────────────────────────────────────────────

function CheckinPhase({
  phase,
  send,
  onNext,
}: {
  phase: { durationSec: number };
  send: (event: SessionPlayerEvent) => void;
  onNext: () => void;
}) {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [focus, setFocus] = useState(3);

  const handleSubmit = () => {
    send({ type: "CHECKIN", mood, energy, focus } as SessionPlayerEvent);
    onNext();
  };

  return (
    <div className="max-w-md w-full">
      <div className="text-6xl mb-4 text-center">📊</div>
      <h3 className="text-xl font-medium mb-6 text-center">How are you feeling now?</h3>
      <div className="space-y-6">
        {[
          { label: "Mood", value: mood, set: setMood, icon: "😊" },
          { label: "Energy", value: energy, set: setEnergy, icon: "⚡" },
          { label: "Focus", value: focus, set: setFocus, icon: "🎯" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <span className="text-2xl w-8">{item.icon}</span>
            <span className="text-sm text-white/60 w-16">{item.label}</span>
            <input
              type="range"
              min="1"
              max="5"
              value={item.value}
              onChange={(e) => item.set(Number(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-sm text-white/40 w-8 text-right">{item.value}/5</span>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-8 w-full py-3 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-colors"
      >
        Save Check-in
      </button>
    </div>
  );
}

// ─── Progress phase ──────────────────────────────────────────────────────────

function ProgressPhase({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-md text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-medium mb-2">Session Complete!</h3>
      <p className="text-white/60 text-sm mb-8">Great work. See you tomorrow.</p>
      <button
        onClick={onNext}
        className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
      >
        Finish
      </button>
    </div>
  );
}

// ─── Default phase ───────────────────────────────────────────────────────────

function DefaultPhase({
  phase,
  onNext,
}: {
  phase: { instructions: string[] };
  onNext: () => void;
}) {
  return (
    <div className="max-w-md text-center">
      <ul className="text-left space-y-3 text-white/70 text-sm mb-8">
        {phase.instructions.map((inst, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-amber-500/60 mt-0.5">·</span>
            <span>{inst}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onNext}
        className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}
