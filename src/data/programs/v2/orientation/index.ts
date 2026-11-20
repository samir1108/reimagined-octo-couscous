/**
 * Orientation Path — public entry point.
 * Re-exports the assembled 30-session curriculum and act metadata.
 */
import { act1Sessions } from "./sessions/act1-worldview";
import { act2Sessions } from "./sessions/act2-awareness";
import { act3Sessions } from "./sessions/act3-intelligence";
import { act4Sessions } from "./sessions/act4-patterns";
import { act5Sessions } from "./sessions/act5-living";
import type { OrientationSession } from "./types";

export const ORIENTATION_SESSIONS: OrientationSession[] = [
  ...act1Sessions,
  ...act2Sessions,
  ...act3Sessions,
  ...act4Sessions,
  ...act5Sessions,
];

export const ORIENTATION_TOTAL = ORIENTATION_SESSIONS.length; // 30

export function getOrientationSession(index: number): OrientationSession | undefined {
  return ORIENTATION_SESSIONS.find((s) => s.index === index);
}

export { ORIENTATION_ACTS, getActForSession } from "./acts";
export type { OrientationSession, OrientationAct, OrientationActId, OrientationFrameworkId } from "./types";
