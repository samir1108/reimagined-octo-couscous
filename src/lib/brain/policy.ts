/**
 * The version of every scoring table, weight and rule the brain uses.
 * A decision row stores this so an old plan can be reproduced exactly.
 * Bump it whenever composer weights, master rules or penalties change.
 */
export const DECISION_POLICY_VERSION = "2026.11.1";

export const ENGINE_LOCAL = "consciousness-orchestrator";
export const ENGINE_EDGE = "compose-session-v3";
