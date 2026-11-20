/**
 * ConsciousOS Games Library
 * ────────────────────
 * A training game is a structured cognitive exercise with:
 *   - objective, mechanics, difficulty scaling
 *   - input/output contracts for the engine
 *   - session IDs that use this game
 */

import type { SessionDefinition, SessionPhase } from "../sessions/sessionEngine";

export type GameId =
  | "game_signal"
  | "game_deep_focus"
  | "game_distraction"
  | "game_impulse_stop"
  | "game_breath_sync"
  | "game_breath_hold"
  | "game_body_scan"
  | "game_sensation_map"
  | "game_emotion_tracker"
  | "game_tension_find"
  | "game_thought_watch"
  | "game_thought_label"
  | "game_observation_walk"
  | "game_pattern_hunt"
  | "game_sequence_find"
  | "game_logic_grid"
  | "game_argument_map"
  | "game_decision_tree"
  | "game_prob_calc"
  | "game_problem_solve"
  | "game_delayed_gratification"
  | "game_discomfort_hold"
  | "game_streak_builder"
  | "game_frustration_tolerance"
  | "game_task_finish"
  | "game_emotion_granularity"
  | "game_emotion_regulate"
  | "game_stress_sim"
  | "game_emotion_read"
  | "game_empathy_map";

export interface GameDefinition {
  id: GameId;
  label: string;
  description: string;
  icon: string;
  category: "attention" | "body" | "emotion" | "thought" | "decision" | "will";
  difficulty: 1 | 2 | 3 | 4 | 5;
  durationSec: number;
  mechanics: string[];
  inputType: "tap" | "hold" | "drag" | "swipe" | "voice" | "choice" | "mixed";
  outputMetrics: string[];
}

export interface GameResult {
  gameId: GameId;
  score: number;            // 0–100
  durationSec: number;
  metrics: Record<string, number>;
  events: GameEvent[];
}

export interface GameEvent {
  timestamp: number;
  type: "action" | "distraction" | "success" | "fail" | "resume";
  data?: Record<string, unknown>;
}

// ─── Game registry ───────────────────────────────────────────────────────────

export const GAMES: Record<GameId, GameDefinition> = {
  game_signal: {
    id: "game_signal",
    label: "Signal",
    description: "Tap when you see a signal. Ignore noise.",
    icon: "🎯",
    category: "attention",
    difficulty: 1,
    durationSec: 60,
    mechanics: ["reaction_time", "selective_attention"],
    inputType: "tap",
    outputMetrics: ["reaction_ms", "accuracy", "distractions"],
  },
  game_deep_focus: {
    id: "game_deep_focus",
    label: "Deep Focus",
    description: "Sustain attention on a single point for as long as possible.",
    icon: "🔮",
    category: "attention",
    difficulty: 2,
    durationSec: 180,
    mechanics: ["sustained_attention", "distraction_resistance"],
    inputType: "hold",
    outputMetrics: ["hold_duration_sec", "distraction_count", "resume_count"],
  },
  game_distraction: {
    id: "game_distraction",
    label: "Distraction",
    description: "Resist pull-away cues. Stay on task.",
    icon: "🚫",
    category: "attention",
    difficulty: 3,
    durationSec: 120,
    mechanics: ["distraction_resistance", "impulse_control"],
    inputType: "mixed",
    outputMetrics: ["resistance_time_sec", "yield_count", "recovery_time"],
  },
  game_impulse_stop: {
    id: "game_impulse_stop",
    label: "Stop",
    description: "Feel the impulse. Choose not to act.",
    icon: "✋",
    category: "will",
    difficulty: 2,
    durationSec: 90,
    mechanics: ["impulse_control", "response_inhibition"],
    inputType: "tap",
    outputMetrics: ["pause_duration_sec", "impulses_noticed", "actions_suppressed"],
  },
  game_breath_sync: {
    id: "game_breath_sync",
    label: "Breath Sync",
    description: "Sync your breathing with the visual guide.",
    icon: "🌊",
    category: "body",
    difficulty: 1,
    durationSec: 120,
    mechanics: ["breath_awareness", "body_awareness"],
    inputType: "hold",
    outputMetrics: ["sync_accuracy_pct", "breath_variability", "coherence"],
  },
  game_breath_hold: {
    id: "game_breath_hold",
    label: "Breath Hold",
    description: "Hold your breath after a full exhale. Track the urge.",
    icon: "⏸",
    category: "body",
    difficulty: 3,
    durationSec: 120,
    mechanics: ["discomfort_tolerance", "breath_awareness"],
    inputType: "hold",
    outputMetrics: ["hold_duration_sec", "urge_intensity", "recovery_breaths"],
  },
  game_body_scan: {
    id: "game_body_scan",
    label: "Body Scan",
    description: "Guide attention through each body part.",
    icon: "🧘",
    category: "body",
    difficulty: 1,
    durationSec: 300,
    mechanics: ["body_awareness", "tension_release"],
    inputType: "tap",
    outputMetrics: ["coverage_pct", "tension_found", "sensitivity"],
  },
  game_sensation_map: {
    id: "game_sensation_map",
    label: "Sensation Map",
    description: "Map sensations on a body outline.",
    icon: "🗺",
    category: "body",
    difficulty: 2,
    durationSec: 180,
    mechanics: ["body_awareness", "posture_awareness"],
    inputType: "tap",
    outputMetrics: ["sensations_noted", "coverage_pct", "accuracy"],
  },
  game_emotion_tracker: {
    id: "game_emotion_tracker",
    label: "Emotion Tracker",
    description: "Track your emotional state in real time.",
    icon: "📊",
    category: "emotion",
    difficulty: 1,
    durationSec: 120,
    mechanics: ["emotional_awareness", "emotional_recognition"],
    inputType: "choice",
    outputMetrics: ["granularity_score", "label_accuracy", "transitions"],
  },
  game_tension_find: {
    id: "game_tension_find",
    label: "Tension Hunt",
    description: "Find and release tension in your body.",
    icon: "🔍",
    category: "body",
    difficulty: 2,
    durationSec: 180,
    mechanics: ["tension_release", "body_awareness"],
    inputType: "tap",
    outputMetrics: ["tensions_found", "release_success_pct", "duration"],
  },
  game_thought_watch: {
    id: "game_thought_watch",
    label: "Thought Watch",
    description: "Watch thoughts without engaging. Like watching clouds.",
    icon: "☁",
    category: "thought",
    difficulty: 2,
    durationSec: 180,
    mechanics: ["thought_awareness", "witnessing_thoughts"],
    inputType: "hold",
    outputMetrics: ["engagement_count", "witness_duration_sec", "return_speed"],
  },
  game_thought_label: {
    id: "game_thought_label",
    label: "Thought Label",
    description: "Categorize each thought as it arises.",
    icon: "🏷",
    category: "thought",
    difficulty: 3,
    durationSec: 180,
    mechanics: ["thought_awareness", "self_awareness", "pattern_recognition"],
    inputType: "choice",
    outputMetrics: ["label_speed_ms", "pattern_count", "categories"],
  },
  game_observation_walk: {
    id: "game_observation_walk",
    label: "Observation Walk",
    description: "Walk and notice 5 new things you've never seen.",
    icon: "🚶",
    category: "thought",
    difficulty: 1,
    durationSec: 600,
    mechanics: ["observation", "awareness", "curiosity"],
    inputType: "voice",
    outputMetrics: ["novel_observations", "depth_score", "attention_quality"],
  },
  game_pattern_hunt: {
    id: "game_pattern_hunt",
    label: "Pattern Hunt",
    description: "Find patterns in sequences of shapes, numbers, or words.",
    icon: "🔗",
    category: "thought",
    difficulty: 2,
    durationSec: 120,
    mechanics: ["pattern_recognition", "abstraction", "mental_flexibility"],
    inputType: "choice",
    outputMetrics: ["patterns_found", "accuracy", "speed"],
  },
  game_sequence_find: {
    id: "game_sequence_find",
    label: "Sequence Find",
    description: "Identify the rule governing a sequence.",
    icon: "📐",
    category: "thought",
    difficulty: 3,
    durationSec: 150,
    mechanics: ["logical_reasoning", "pattern_recognition"],
    inputType: "choice",
    outputMetrics: ["accuracy", "rule_inference_score", "speed"],
  },
  game_logic_grid: {
    id: "game_logic_grid",
    label: "Logic Grid",
    description: "Solve logic puzzles using deduction.",
    icon: "🕸",
    category: "thought",
    difficulty: 3,
    durationSec: 300,
    mechanics: ["logical_reasoning", "critical_thinking"],
    inputType: "choice",
    outputMetrics: ["accuracy", "deductions", "speed"],
  },
  game_argument_map: {
    id: "game_argument_map",
    label: "Argument Map",
    description: "Break an argument into premises and conclusions.",
    icon: "🗺",
    category: "thought",
    difficulty: 4,
    durationSec: 240,
    mechanics: ["critical_thinking", "logical_reasoning"],
    inputType: "choice",
    outputMetrics: ["structure_accuracy", "fallacy_detection", "clarity"],
  },
  game_decision_tree: {
    id: "game_decision_tree",
    label: "Decision Tree",
    description: "Map a decision and its possible outcomes.",
    icon: "🌳",
    category: "decision",
    difficulty: 3,
    durationSec: 180,
    mechanics: ["decision_making", "probabilistic_thinking"],
    inputType: "choice",
    outputMetrics: ["branch_coverage", "probability_accuracy", "outcome_quality"],
  },
  game_prob_calc: {
    id: "game_prob_calc",
    label: "Prob Calc",
    description: "Estimate probabilities in uncertain scenarios.",
    icon: "🎲",
    category: "decision",
    difficulty: 4,
    durationSec: 150,
    mechanics: ["probabilistic_thinking", "mental_flexibility"],
    inputType: "choice",
    outputMetrics: ["calibration_score", "confidence_accuracy", "bias_count"],
  },
  game_problem_solve: {
    id: "game_problem_solve",
    label: "Problem Solve",
    description: "Solve multi-step real-world problems.",
    icon: "🧩",
    category: "decision",
    difficulty: 4,
    durationSec: 300,
    mechanics: ["decision_making", "pattern_recognition", "critical_thinking"],
    inputType: "choice",
    outputMetrics: ["solution_quality", "steps_taken", "creativity"],
  },
  game_delayed_gratification: {
    id: "game_delayed_gratification",
    label: "Wait For It",
    description: "Wait for a larger reward. Resist the small one.",
    icon: "⏳",
    category: "will",
    difficulty: 2,
    durationSec: 120,
    mechanics: ["delayed_gratification", "impulse_control"],
    inputType: "hold",
    outputMetrics: ["wait_duration_sec", "yield_count", "reward_choice"],
  },
  game_discomfort_hold: {
    id: "game_discomfort_hold",
    description: "Hold a mildly uncomfortable posture or sensation.",
    label: "Hold",
    icon: "🧊",
    category: "will",
    difficulty: 3,
    durationSec: 120,
    mechanics: ["discomfort_tolerance", "consistency"],
    inputType: "hold",
    outputMetrics: ["hold_duration_sec", "discomfort_rating", "quit_time"],
  },
  game_streak_builder: {
    id: "game_streak_builder",
    label: "Streak",
    description: "Build a chain of correct responses. Don't break it.",
    icon: "⛓",
    category: "will",
    difficulty: 2,
    durationSec: 120,
    mechanics: ["consistency", "task_completion"],
    inputType: "tap",
    outputMetrics: ["streak_length", "accuracy", "recovery_rate"],
  },
  game_frustration_tolerance: {
    id: "game_frustration_tolerance",
    label: "Frustration",
    description: "Continue through deliberate failure. Build tolerance.",
    icon: "😤",
    category: "will",
    difficulty: 4,
    durationSec: 180,
    mechanics: ["frustration_tolerance", "discomfort_tolerance"],
    inputType: "mixed",
    outputMetrics: ["persistence_score", "quit_time", "recovery_count"],
  },
  game_task_finish: {
    id: "game_task_finish",
    label: "Finish",
    description: "Complete a multi-step task without abandoning.",
    icon: "✅",
    category: "will",
    difficulty: 2,
    durationSec: 180,
    mechanics: ["task_completion", "sustained_attention"],
    inputType: "mixed",
    outputMetrics: ["completion_rate", "step_completion", "abandonment_points"],
  },
  game_emotion_granularity: {
    id: "game_emotion_granularity",
    label: "Emotion Granularity",
    description: "Distinguish between closely related emotions.",
    icon: "🎨",
    category: "emotion",
    difficulty: 2,
    durationSec: 120,
    mechanics: ["emotional_recognition", "emotional_awareness"],
    inputType: "choice",
    outputMetrics: ["granularity_score", "accuracy", "response_time"],
  },
  game_emotion_regulate: {
    id: "game_emotion_regulate",
    label: "Regulate",
    description: "Bring an activated emotion back to baseline.",
    icon: "🧘",
    category: "emotion",
    difficulty: 3,
    durationSec: 180,
    mechanics: ["emotional_regulation", "discomfort_tolerance"],
    inputType: "hold",
    outputMetrics: ["regulation_time_sec", "peak_intensity", "baseline_return"],
  },
  game_stress_sim: {
    id: "game_stress_sim",
    label: "Stress Sim",
    description: "Simulate stressors and practice responding calmly.",
    icon: "🌪",
    category: "emotion",
    difficulty: 4,
    durationSec: 180,
    mechanics: ["emotional_regulation", "frustration_tolerance", "impulse_control"],
    inputType: "mixed",
    outputMetrics: ["stress_response_score", "recovery_time", "regulation_count"],
  },
  game_emotion_read: {
    id: "game_emotion_read",
    label: "Emotion Read",
    description: "Identify emotions from facial expressions and tone.",
    icon: "🎭",
    category: "emotion",
    difficulty: 3,
    durationSec: 120,
    mechanics: ["emotional_recognition", "empathy"],
    inputType: "choice",
    outputMetrics: ["accuracy", "granularity", "speed"],
  },
  game_empathy_map: {
    id: "game_empathy_map",
    label: "Empathy Map",
    description: "Map another person's emotional experience.",
    icon: "💭",
    category: "emotion",
    difficulty: 4,
    durationSec: 180,
    mechanics: ["empathy", "emotional_awareness"],
    inputType: "choice",
    outputMetrics: ["accuracy", "depth", "perspective_taking"],
  },
};

export function getGame(id: string): GameDefinition | undefined {
  return GAMES[id as GameId];
}

export function getGamesByCategory(category: string): GameDefinition[] {
  return Object.values(GAMES).filter((g) => g.category === category);
}

export const TOTAL_GAMES = Object.keys(GAMES).length;

console.log(`[games] Loaded ${TOTAL_GAMES} games`);
