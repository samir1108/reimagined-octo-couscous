import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";
import {
  deriveSessionPersonalization,
  isPersonalized,
  type SessionPersonalization,
} from "@/supabase/_shared/sessionConfig";

export type OrbMoodHint = "calm" | "focus" | "fire";

const FAMILY_HUE: Record<string, number> = {
  observation: 210,
  self_inquiry: 265,
  jnana: 265,
  witnessing: 250,
  bhakti: 330,
  karma: 35,
  raja: 45,
  kriya: 8,
  tantra: 300,
  body_awareness: 160,
  breath_awareness: 190,
};

const FOCUS_HUE: Record<string, number> = {
  focus: 45,
  attention: 210,
  self_inquiry: 265,
  raja_yoga: 45,
  jnana: 265,
  bhakti: 330,
  karma: 35,
  tantra: 300,
  kundalini: 8,
  healing: 160,
  sleep: 235,
  energy: 190,
  relationship: 340,
  work: 40,
  creativity: 280,
};

export interface OrbPersonalization {
  personalization: SessionPersonalization | null;
  /** Accent hue for the orb palette. Null when the user is on defaults. */
  hue: number | null;
  /** Mood hint for the WebGL orb. Null when the user is on defaults. */
  mood: OrbMoodHint | null;
  focusFamily: string | null;
}

/**
 * Reads the saved Session Personalization and turns it into orb hints:
 * focus/practice → accent hue, energy preference → mood. Any user still on
 * engine defaults gets nulls, so the orb keeps its band/gate palette.
 */
export function useOrbPersonalization(): OrbPersonalization {
  const { user, isReady } = useAuthReady();

  const { data } = useQuery({
    queryKey: ["orb-personalization", user?.id],
    enabled: isReady && Boolean(user),
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_consciousness_profile")
        .select("session_config")
        .eq("user_id", user!.id)
        .maybeSingle();
      const derived = deriveSessionPersonalization(data?.session_config, "settings");
      return isPersonalized(derived) ? derived : null;
    },
  });

  return useMemo(() => {
    if (!data) return { personalization: null, hue: null, mood: null, focusFamily: null };
    const family = data.focusFamily ?? null;
    const hue =
      (family ? FAMILY_HUE[family] : undefined) ??
      (data.focusType ? FOCUS_HUE[data.focusType] : undefined) ??
      null;
    const mood: OrbMoodHint | null =
      data.energy === "high"
        ? "fire"
        : data.energy === "low"
          ? "calm"
          : family
            ? "focus"
            : data.energy === "medium"
              ? "focus"
              : null;
    return { personalization: data, hue, mood, focusFamily: family };
  }, [data]);
}
