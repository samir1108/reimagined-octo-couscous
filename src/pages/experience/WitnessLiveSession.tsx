/**
 * Deprecated entry point.
 *
 * The observation session is now seed-driven and lives in
 * `ObservationLiveSession.tsx`. This file re-exports it so old imports and
 * deep links keep working without carrying a second hardcoded script.
 */
export { default } from "./ObservationLiveSession";
