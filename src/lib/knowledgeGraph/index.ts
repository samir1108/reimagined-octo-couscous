export { KnowledgeGraphEngine, getKnowledgeEngine } from './engine';
export {
  loadBatchManifest,
  loadBatch,
  loadAllBatches,
  clearBatchCache,
  mergeBatches,
  buildKnowledgeGraphFromBatches,
  searchBatches,
  getBatchStats,
} from './batchLoader';
export type { BatchSearchHit } from './batchLoader';
export { PersonalKnowledgeGraphService } from './personalGraph';
export { suggestNextDevelopmentalStep, buildPersonalContextSummary, buildKnowledgeContextForSession } from './intelligence';
export { KnowledgeGraphPersistence } from './persistence';
export * from './ingestion';
export * from './admin';
