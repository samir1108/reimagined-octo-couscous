/**
 * Apple HealthKit + Android Health Connect bridge via the `capacitor-health`
 * Capacitor plugin. In the web preview this is a graceful no-op so we don't
 * break the UI.
 *
 * To enable on a native build:
 *   git pull
 *   npm install
 *   npx cap add ios       # or: npx cap add android
 *   npx cap sync
 *   npx cap run ios       # requires Xcode on macOS
 *
 * iOS also needs `NSHealthShareUsageDescription` in Info.plist (Capacitor will
 * pick it up automatically on first sync).
 */
import { supabase } from "@/lib/supabase";

type HealthSample = {
  metric: "hrv_rmssd" | "rhr" | "sleep_score" | "spo2" | "stress" | "readiness";
  value: number;
  unit?: string;
  recorded_at?: string;
};

export async function isHealthBridgeAvailable(): Promise<boolean> {
  try {
    const cap = (window as any).Capacitor;
    return !!(cap && cap.isNativePlatform?.());
  } catch {
    return false;
  }
}

const PLUGIN_NAME = ["capacitor", "health"].join("-");

async function loadHealthPlugin(): Promise<any | null> {
  try {
    const mod: any = await import(/* @vite-ignore */ PLUGIN_NAME).catch(() => null);
    return mod?.CapacitorHealth ?? mod?.Health ?? mod?.default ?? null;
  } catch {
    return null;
  }
}

/**
 * Pulls today's samples from HealthKit / Health Connect and ingests them.
 * If the plugin isn't installed yet (web preview), this is a no-op.
 */
export async function syncHealthBridge(source: "healthkit" | "google_fit"): Promise<number> {
  try {
    if (!(await isHealthBridgeAvailable())) return 0;
    const Health = await loadHealthPlugin();
    if (!Health) return 0;

    const readPerms = ["HEART_RATE_VARIABILITY", "RESTING_HEART_RATE", "SLEEP"];
    try {
      await Health.requestHealthPermissions?.({ permissions: readPerms });
    } catch (_) {
      // some plugin versions auto-prompt on first query
    }

    const end = new Date();
    const start = new Date(end.getTime() - 24 * 3600 * 1000);
    const samples: HealthSample[] = [];

    const queries: Array<{ key: string; metric: HealthSample["metric"]; unit: string }> = [
      { key: "HEART_RATE_VARIABILITY", metric: "hrv_rmssd", unit: "ms" },
      { key: "RESTING_HEART_RATE", metric: "rhr", unit: "bpm" },
      { key: "SLEEP", metric: "sleep_score", unit: "score" },
    ];

    for (const q of queries) {
      try {
        const res = await Health.queryAggregated?.({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          dataType: q.key,
          bucket: "day",
        });
        const v = res?.aggregatedData?.[0]?.value ?? res?.value;
        if (typeof v === "number" && Number.isFinite(v)) {
          samples.push({ metric: q.metric, value: v, unit: q.unit });
        }
      } catch (e) {
        console.warn("health query failed", q.key, e);
      }
    }

    if (!samples.length) return 0;

    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return 0;

    await supabase.functions.invoke("ingest-signal", {
      body: {
        points: samples.map((s) => ({
          layer: "bio",
          source,
          metric: s.metric,
          value: s.value,
          unit: s.unit,
          recorded_at: s.recorded_at,
        })),
      },
    });
    return samples.length;
  } catch (e) {
    console.warn("syncHealthBridge error", e);
    return 0;
  }
}
