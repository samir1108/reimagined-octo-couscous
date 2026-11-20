// ============================================================
// INGEST ENVIRONMENT SCAN — Ambient Consciousness Context
// ============================================================
// Receives light, sound, air quality, temperature, location, screen time, social proximity
// Stores in environment_scans table, feeds consciousness weather

import { createClient } from "npm:@supabase/supabase-js@2";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

interface EnvironmentScanInput {
  lightLevel?: number; // lux
  soundLevel?: number; // dB
  airQuality?: number; // AQI
  temperature?: number; // celsius
  locationPattern?: string; // 'office', 'home', 'transit', 'nature', 'gym'
  screenTime?: number; // minutes since last scan
  socialProximity?: number; // people detected nearby
  source?: string; // 'phone_sensors', 'dedicated_device', 'smart_home'
}

Deno.serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;
  const body = await req.json().catch(() => ({} as EnvironmentScanInput));
  
  const { data, error } = await admin.from("environment_scans").insert({
    user_id: user.id,
    light_level: body.lightLevel ?? null,
    sound_level: body.soundLevel ?? null,
    air_quality: body.airQuality ?? null,
    temperature: body.temperature ?? null,
    location_pattern: body.locationPattern ?? null,
    screen_time: body.screenTime ?? null,
    social_proximity: body.socialProximity ?? null,
    source: body.source ?? 'unknown',
  }).select("id, created_at").single();

  if (error) throw error;

  // Fire-and-forget: update consciousness weather
  void fetch(`${SUPABASE_URL}/functions/v1/consciousness-weather`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": req.headers.get("Authorization")!,
      "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
    },
    body: JSON.stringify({ 
      userId: user.id, 
      environment: body,
    }),
  }).catch(() => {});

  // Check for V-Level drop triggers
  if (body.locationPattern === 'office' && body.soundLevel && body.soundLevel > 65) {
    void fetch(`${SUPABASE_URL}/functions/v1/instant-pulse-detector`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization")!,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ 
        userId: user.id, 
        trigger: "environment_stress",
        value: { soundLevel: body.soundLevel, location: body.locationPattern },
      }),
    }).catch(() => {});
  }

  return successResponse({ ok: true, scanId: data.id });
}));