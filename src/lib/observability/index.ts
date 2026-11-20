/**
 * Observability — dependency-free error + product event capture.
 *
 * Ships with a local ring buffer so nothing is lost silently, and exposes a
 * pluggable sink. Wire a real backend (Sentry, PostHog, a Supabase edge
 * function) by calling `configureObservability({ sink })` once at boot.
 *
 * Deliberately no network default: telemetry must be opted into per environment
 * rather than leaking user data from a wellness app.
 *
 * Console visibility:
 * - Every captured error/warning is always echoed to the browser console, in
 *   dev and in production, with a `[satyug:*]` prefix.
 * - `console.error` / `console.warn` calls from anywhere in the app are also
 *   relayed into the buffer (and the global handle below) once
 *   `initObservability()` has run.
 * - Append `?debug=1` (or run `localStorage.setItem("satyug.debug", "1")` and
 *   reload) to also echo info-level product events.
 * - In the console: `__satyug.logs()`, `__satyug.errors()`, `__satyug.dump()`,
 *   `__satyug.clear()`, `__satyug.debug(true|false)`.
 */

export type ObservabilityLevel = "info" | "warn" | "error";

export type ProductEvent =
  | "app_open"
  | "onboarding_started"
  | "onboarding_completed"
  | "first_session_started"
  | "first_session_completed"
  | "session_started"
  | "session_completed"
  | "session_abandoned"
  | "practice_selected"
  | "practice_completed"
  | "journal_saved"
  | "theme_opened"
  | "paywall_seen"
  | "checkout_started"
  | "checkout_completed"
  | "crisis_resources_opened"
  | "notifications_enabled"
  | "share_completed"
  | "error_boundary_shown";

export interface ObservedEvent {
  id: string;
  type: "event" | "error" | "message";
  name: string;
  level: ObservabilityLevel;
  timestamp: string;
  sessionId: string;
  userId?: string;
  url?: string;
  props?: Record<string, unknown>;
  message?: string;
  stack?: string;
}

export interface ObservabilitySink {
  capture(event: ObservedEvent): void;
}

interface ObservabilityConfig {
  release?: string;
  sink?: ObservabilitySink;
  maxBuffer?: number;
  debug?: boolean;
}

const MAX_BUFFER = 200;
const DEBUG_STORAGE_KEY = "satyug.debug";
const DEBUG_QUERY_KEY = "debug";

const originalConsole = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

let config: ObservabilityConfig = {
  debug: Boolean(import.meta.env?.DEV),
  maxBuffer: MAX_BUFFER,
};
let buffer: ObservedEvent[] = [];
let currentUserId: string | undefined;
let installed = false;
let consolePatched = false;
let seq = 0;

const SESSION_KEY = "satyug.session.id";
const PII_KEYS = /(email|phone|token|password|secret|authorization|cookie|otp|address|card)/i;

function makeId(prefix: string): string {
  seq += 1;
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${seq}_${rand}`;
}

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = makeId("ses");
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return "ses_memory";
  }
}

const sessionId = getSessionId();

/** True when info-level chatter should be echoed to the console. */
function isDebugEnabled(): boolean {
  if (config.debug) return true;
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(DEBUG_STORAGE_KEY) === "1") return true;
    const params = new URLSearchParams(window.location.search);
    return params.get(DEBUG_QUERY_KEY) === "1";
  } catch {
    return false;
  }
}

/** Removes nested PII before anything is buffered or forwarded. */
export function scrubProps(
  props?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!props) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (PII_KEYS.test(key)) {
      clean[key] = "[redacted]";
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      clean[key] = scrubProps(value as Record<string, unknown>);
      continue;
    }
    if (typeof value === "string" && value.length > 500) {
      clean[key] = `${value.slice(0, 500)}…`;
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

function formatConsoleArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return arg.stack || `${arg.name}: ${arg.message}`;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" ");
}

/**
 * Echoes a captured event to the browser console.
 *
 * Errors and warnings are always printed so a failure is never invisible, even
 * in a production build. Info events only print in debug mode.
 */
function echoToConsole(event: ObservedEvent): void {
  const prefix = event.message ? `${event.name}: ${event.message}` : event.name;

  if (event.level === "error") {
    originalConsole.error(
      `[satyug:error] ${prefix}`,
      event.props ?? "",
      event.stack ?? "",
    );
    return;
  }

  if (event.level === "warn") {
    originalConsole.warn(`[satyug:warn] ${prefix}`, event.props ?? "");
    return;
  }

  if (isDebugEnabled()) {
    originalConsole.debug(`[satyug:${event.type}] ${prefix}`, event.props ?? "");
  }
}

function push(event: ObservedEvent, options: { echo?: boolean } = {}): void {
  buffer.push(event);
  const limit = config.maxBuffer ?? MAX_BUFFER;
  if (buffer.length > limit) buffer = buffer.slice(buffer.length - limit);

  try {
    config.sink?.capture(event);
  } catch {
    // A broken sink must never break the app.
  }

  if (options.echo !== false) echoToConsole(event);
}

/**
 * Relays a raw console call into the buffer without echoing it back (the
 * original console method already printed it).
 */
function relayConsoleCall(level: ObservabilityLevel, args: unknown[]): void {
  try {
    push(
      {
        ...baseEvent(),
        type: level === "error" ? "error" : "message",
        name: `console.${level}`,
        level,
        message: formatConsoleArgs(args),
      },
      { echo: false },
    );
  } catch {
    // Never let telemetry break logging.
  }
}

function patchConsole(): void {
  if (consolePatched) return;
  consolePatched = true;

  console.error = (...args: unknown[]) => {
    originalConsole.error(...args);
    relayConsoleCall("error", args);
  };
  console.warn = (...args: unknown[]) => {
    originalConsole.warn(...args);
    relayConsoleCall("warn", args);
  };
}

function restoreConsole(): void {
  if (!consolePatched) return;
  consolePatched = false;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
}

function baseEvent(): Pick<ObservedEvent, "id" | "timestamp" | "sessionId" | "userId" | "url"> {
  return {
    id: makeId("evt"),
    timestamp: new Date().toISOString(),
    sessionId,
    userId: currentUserId,
    url: typeof window !== "undefined" ? window.location.pathname : undefined,
  };
}

export function track(name: ProductEvent, props?: Record<string, unknown>): void {
  push({
    ...baseEvent(),
    type: "event",
    name,
    level: "info",
    props: scrubProps(props),
  });
}

export function captureMessage(
  message: string,
  level: ObservabilityLevel = "info",
  props?: Record<string, unknown>,
): void {
  push({
    ...baseEvent(),
    type: "message",
    name: "message",
    level,
    message,
    props: scrubProps(props),
  });
}

export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const err = error instanceof Error ? error : new Error(String(error));
  push({
    ...baseEvent(),
    type: "error",
    name: err.name || "Error",
    level: "error",
    message: err.message,
    stack: err.stack,
    props: scrubProps(context),
  });
}

export function setUser(userId?: string | null): void {
  currentUserId = userId ?? undefined;
}

export function getBufferedEvents(): ObservedEvent[] {
  return [...buffer];
}

export function clearBufferedEvents(): void {
  buffer = [];
}

export function configureObservability(next: ObservabilityConfig): void {
  config = { ...config, ...next };
}

interface EarlyHandlers {
  relayError: (event: Event) => void;
  relayRejection: (event: PromiseRejectionEvent) => void;
}

/** Removes the inline pre-boot listeners installed in index.html. */
function removeEarlyHandlers(): void {
  if (typeof window === "undefined") return;
  const holder = window as Window & { __satyugEarlyHandlers?: EarlyHandlers };
  const early = holder.__satyugEarlyHandlers;
  if (!early) return;
  window.removeEventListener("error", early.relayError, true);
  window.removeEventListener("unhandledrejection", early.relayRejection);
  delete holder.__satyugEarlyHandlers;
}

interface ObservabilityDebugHandle {
  logs(): ObservedEvent[];
  errors(): ObservedEvent[];
  clear(): void;
  dump(): void;
  debug(enabled?: boolean): boolean;
}

function exposeDebugHandle(): void {
  if (typeof window === "undefined") return;
  const handle: ObservabilityDebugHandle = {
    logs: () => getBufferedEvents(),
    errors: () => getBufferedEvents().filter((event) => event.level === "error"),
    clear: () => clearBufferedEvents(),
    dump: () => {
      const events = getBufferedEvents().map((event) => ({
        time: event.timestamp,
        level: event.level,
        type: event.type,
        name: event.name,
        message: event.message,
        url: event.url,
        props: event.props,
      }));
      originalConsole.info(`[satyug] ${events.length} buffered event(s)`);
      originalConsole.table(events);
    },
    debug: (enabled = true) => {
      configureObservability({ debug: enabled });
      return enabled;
    },
  };

  (window as Window & { __satyug?: ObservabilityDebugHandle }).__satyug = handle;
}

/** Installs global listeners exactly once. Returns a cleanup function. */
export function initObservability(next?: ObservabilityConfig): () => void {
  if (next) configureObservability(next);
  if (installed || typeof window === "undefined") return () => {};
  installed = true;

  const onError = (event: ErrorEvent) => {
    captureError(event.error ?? event.message, {
      source: "window.error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    captureError(event.reason, { source: "unhandledrejection" });
  };

  // Runtime errors are handled above; this capture-phase listener exists to
  // surface failed images / scripts / stylesheets, which never bubble to
  // window but are a common cause of "nothing works" bugs.
  const onResourceError = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target || target === (window as unknown as HTMLElement)) return;
    const tag = target.tagName?.toLowerCase() ?? "unknown";
    const src =
      (target as HTMLImageElement).src ||
      (target as HTMLScriptElement).src ||
      (target as HTMLLinkElement).href ||
      "";
    captureError(new Error(`Resource failed to load: <${tag}>`), {
      source: "resource",
      tag,
      url: src,
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  window.addEventListener("error", onResourceError, true);
  removeEarlyHandlers();
  patchConsole();
  exposeDebugHandle();

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    window.removeEventListener("error", onResourceError, true);
    restoreConsole();
    if (typeof window !== "undefined") {
      delete (window as Window & { __satyug?: ObservabilityDebugHandle }).__satyug;
    }
    installed = false;
  };
}
