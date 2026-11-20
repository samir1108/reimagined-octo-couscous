// Unified Session System - public API barrel.

export { getSessionInvocation, type InvocationInput, type SessionInvocation } from './naming';

export { getUserJourney } from './journey';
export type { UserJourney } from './types';

export { evaluateMoments, getMomentByType, type MomentContext, type TriggeredMoment } from './moments';

export { updateSessionThread, getSessionThread, type ArcInput } from './thread';

export { fireEvent, getRecentEvents, getEventsByType, type EventType, type EventPayload } from './events';

export { completeSession, type CompleteSessionInput, type CompleteSessionResult } from './completion';

export { migrateLocalStorageToPostgres, type MigrationResult } from './migrate';

export type {
  SessionSystem,
  SessionStatus,
  StepKind,
  SessionMood,
  GateId,
  SessionStep,
  SessionContext,
  SessionPlan,
  SessionCompletion,
  SessionMoment,
  SessionThread,
  SessionEvent,
} from './types';