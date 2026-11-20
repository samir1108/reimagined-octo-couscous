// ============================================================
// INGEST BIO SIGNALS — Wearable Data Ingestion
// ============================================================
// Receives HRV, EDA, skin temp, accelerometer, SpO2 from wearables
// Stores in bio_signals table, triggers instant-pulse-detector

import { createClient } from "npm:@supabase/supabase-js@2";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface BioSignalInput {
  hrv?: number;
  eda?: number;
  skinTemp?: number;
  accelerometer?: { x: number; y: number; z: number };
  spo2?: number;
  source?: string; // 'apple_watch', 'garmin', 'whoop', 'oura', 'manual'
  deviceId?: string;
}

Deno.serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;
  const body = await req.json().catch(() => ({} as BioSignalInput));
  
  const {
    hrv, eda, skinTemp, accelerometer, spo2,
    source = 'manual', deviceId,
  } = body;

  // Validate at least one signal
  if (hrv === undefined && eda === undefined && skinTemp === undefined && 
      !accelerometer && spo2 === undefined) {
    return successResponse({ ok: false, error: "At least one bio signal required" }, 400);
  }

  // Insert bio signal
  const { data, error } = await admin.from("bio_signals").insert({
    user_id: user.id,
    hrv: hrv ?? null,
    eda: eda ?? null,
    skin_temp: skinTemp ?? null,
    accelerometer: accelerometer ?? null,
    spo2: spo2 ?? null,
    source,
    device_id: deviceId ?? null,
  }).select("id, created_at").single();

  if (error) throw error;

  // Fire-and-forget: trigger instant pulse detector for acute detection
  // (e.g., HRV crash, EDA spike)
  if (hrv !== undefined && hrv < 30) {
    void fetch(`${SUPABASE_URL}/functions/v1/instant-pulse-detector`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization")!,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ userId: user.id, trigger: "hrv_crash", value: hrv }),
    }).catch(() => {});
  }

  if (eda !== undefined && eda > 5) { // High EDA spike
    void fetch(`${SUPABASE_URL}/functions/v1/instant-pulse-detector`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization")!,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ userId: user.id, trigger: "eda_spike", value: eda }),
    }).catch(() => {});
  }

  return successResponse({ ok: true, signalId: data.id });
}));