// Graph module barrel.
export { GraphEngine, getEngine } from "./engine";

export {
  buildGraphContextForQuery,
  buildAnatomyReport,
  getLoopAnatomy,
  graphContextToPrompt,
  type GraphContext,
  type GraphAnatomyReport,
  type ServerGraphContext,
} from "./contextBuilder";

export {
  buildEnrichedAIPrompt,
  analyzeLoopWithGraph,
  analyzeBandProgression,
  suggestCrossPollination,
  getGraphStatsForUI,
  type AIPracticeRecommendation,
  type AILoopAnalysis,
  type AIBandProgression,
  type AICrossPollination,
} from "./aiContext";
