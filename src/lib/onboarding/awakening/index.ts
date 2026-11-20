/**
 * THE AWAKENING JOURNEY — barrel export.
 * Eleven sessions from automatic living to conscious action.
 */
export * from "./types";
export {
  AWAKENING_SESSIONS,
  AWAKENING_TOTAL,
  AWAKENING_SESSION_BY_ID,
  AWAKENING_SESSION_BY_N,
  AWAKENING_CANONICAL_ORDER,
} from "./sessions";
export {
  AWAKENING_QUESTIONS,
  AWAKENING_QUESTIONS_BY_SESSION,
  AWAKENING_QUESTION_COUNT,
} from "./questions";
export {
  planSession,
  analyzeCapabilities,
  recommendNext,
  recommendPaths,
  personalOrder,
  buildReport,
  loopsFromAnswers,
  questionCapabilities,
  signalsFor,
  loopsFor,
  answerFromQuestion,
  emptyProgress,
  loopName,
  loopHint,
  PATHS,
  CAPABILITY_LABEL,
  CAPABILITY_QUESTION,
  CAPABILITY_IDS,
  type AwakeningPath,
  type PlanContext,
} from "./engine";
