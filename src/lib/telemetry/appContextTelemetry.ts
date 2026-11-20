import { supabase } from "@/lib/supabase";

/**
 * One row per app open: version, timezone, network and device class. This is
 * what lets a funnel gap be attributed to a bad connection or a stale build
 * instead of being blamed on the brain.
 */

export interface AppContextInput {
  surface?: "app" | "home" | "session" | "guide";
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

type ConnectionLike = { effectiveType?: string };

function deviceClass(width: number): "phone" | "tablet" | "desktop" {
  if (width < 640) return "phone";
  if (width < 1024) return "tablet";
  return "desktop";
}

export async function logAppContext(input: AppContextInput = {}): Promise<void> {
  try {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    const connection = (nav as unknown as { connection?: ConnectionLike } | undefined)?.connection;
    const width = typeof window !== "undefined" ? window.innerWidth : 0;

    let timezone: string | null = null;
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
      timezone = null;
    }

    let userId = input.userId ?? null;
    if (userId === null) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    }

    await supabase.from("app_context_events" as never).insert({
      user_id: userId,
      surface: input.surface ?? "app",
      app_version: String(import.meta.env.VITE_APP_VERSION ?? "dev"),
      timezone,
      language: nav?.language ?? null,
      online: nav ? nav.onLine !== false : true,
      connection: connection?.effectiveType ?? "unknown",
      device_class: deviceClass(width),
      viewport_w: width || null,
      metadata: input.metadata ?? {},
    } as never);
  } catch {
    /* context telemetry must never break a screen */
  }
}
