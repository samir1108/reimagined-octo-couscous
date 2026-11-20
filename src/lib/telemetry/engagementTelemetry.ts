import { supabase } from "@/lib/supabase";

/**
 * Engagement telemetry: what brought the user back and where the habit broke.
 * Fire-and-forget — nothing here may break a screen.
 */

export type EngagementEvent =
  | "app_open"
  | "home_view"
  | "card_tap"
  | "orb_activate"
  | "session_start"
  | "notification_open"
  | "streak_break"
  | "guide_open"
  | "upsell_shown"
  | "upsell_converted";

export type EngagementSurface =
  | "home" | "orb" | "guide" | "temple" | "practice" | "notification";

let cachedUserId: Promise<string | null> | null = null;

function currentUserId(): Promise<string | null> {
  if (!cachedUserId) {
    cachedUserId = supabase.auth
      .getUser()
      .then(({ data }) => data.user?.id ?? null)
      .catch(() => null);
  }
  return cachedUserId;
}

export interface EngagementInput {
  type: EngagementEvent;
  surface?: EngagementSurface;
  targetId?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
  userId?: string | null;
}

export async function logEngagement(input: EngagementInput): Promise<void> {
  try {
    const userId = input.userId ?? (await currentUserId());
    if (!userId) return;

    await supabase.from("engagement_events" as never).insert({
      user_id: userId,
      event_type: input.type,
      surface: input.surface ?? null,
      target_id: input.targetId ?? null,
      source: input.source ?? null,
      metadata: input.metadata ?? {},
    } as never);
  } catch {
    /* engagement telemetry must never break the UI */
  }
}
