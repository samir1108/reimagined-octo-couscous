import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type SignalSource =
  | "healthkit"
  | "google_fit"
  | "oura"
  | "fitbit"
  | "garmin"
  | "whoop"
  | "polar_ble"
  | "muse"
  | "webcam_rppg"
  | "camera_posture"
  | "mic_meeting_tone"
  | "google_calendar"
  | "outlook"
  | "slack"
  | "teams"
  | "gmail"
  | "linear"
  | "github"
  | "ios_screentime"
  | "android_usage"
  | "chrome_ext"
  | "desktop_sentinel"
  | "keyboard_cadence";

export interface SignalConsent {
  source: SignalSource;
  enabled: boolean;
  mode: "strict" | "balanced" | "off";
  meta?: Record<string, any> | null;
}

export function useSignalConsents() {
  const [consents, setConsents] = useState<Record<string, SignalConsent>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("signal_consents")
        .select("source, enabled, mode, meta")
        .eq("user_id", u.user.id);
      const map: Record<string, SignalConsent> = {};
      (data ?? []).forEach((c: any) => {
        map[c.source] = c as SignalConsent;
      });
      setConsents(map);
    } catch (e) {
      console.warn("[useSignalConsents] load failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setConsent = useCallback(
    async (source: SignalSource, enabled: boolean, mode: SignalConsent["mode"] = "balanced") => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u?.user) return;
        const payload = {
          user_id: u.user.id,
          source,
          enabled,
          mode: enabled ? mode : "off",
          granted_at: enabled ? new Date().toISOString() : null,
          revoked_at: enabled ? null : new Date().toISOString(),
        };
        const { error } = await supabase.from("signal_consents").upsert(payload, { onConflict: "user_id,source" });
        if (error) throw error;
        setConsents((prev) => ({
          ...prev,
          [source]: { ...(prev[source] ?? { meta: null }), source, enabled, mode: enabled ? mode : "off" },
        }));
      } catch (e) {
        console.warn("[useSignalConsents] setConsent failed:", e);
      }
    },
    [],
  );

  const setMeta = useCallback(async (source: SignalSource, meta: Record<string, any>) => {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      const existing = (await supabase
        .from("signal_consents")
        .select("meta")
        .eq("user_id", u.user.id)
        .eq("source", source)
        .maybeSingle()).data?.meta as Record<string, any> | null;
      const merged = { ...(existing ?? {}), ...meta };
      const { error } = await supabase
        .from("signal_consents")
        .upsert(
          { user_id: u.user.id, source, meta: merged, enabled: true, mode: "balanced" },
          { onConflict: "user_id,source" },
        );
      if (error) throw error;
      setConsents((prev) => ({
        ...prev,
        [source]: { ...(prev[source] ?? { source, enabled: true, mode: "balanced" }), meta: merged },
      }));
    } catch (e) {
      console.warn("[useSignalConsents] setMeta failed:", e);
    }
  }, []);

  const purgeSource = useCallback(async (source: SignalSource) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    await Promise.all([
      supabase.from("bio_signals").delete().eq("user_id", u.user.id).eq("source", source),
      supabase.from("work_signals").delete().eq("user_id", u.user.id).eq("source", source),
      supabase.from("device_signals").delete().eq("user_id", u.user.id).eq("source", source),
    ]);
  }, []);

  return { consents, loading, setConsent, setMeta, purgeSource, reload: load };
}
