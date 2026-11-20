// ============================================================
// INGEST MICRO EXPRESSIONS — Facial Consciousness Detection
// ============================================================
// Receives micro-expressions, eye patterns, facial tension, breathing patterns
// Stores in micro_expressions table, triggers three-brain inference

import { createClient } from "npm:@supabase/supabase-js@2";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

interface MicroExpressionInput {
  contemptFlash?: boolean;
  fearFlash?: boolean;
  disgustFlash?: boolean;
  eyePatterns?: { 
    rapidMovement: boolean; 
    softGaze: boolean; 
    downwardGaze: boolean; 
    avoidance: boolean;
  };
  facialTension?: { 
    jawClenching: boolean; 
    foreheadTension: boolean; 
    eyeArea: boolean;
  };
  breathingPatterns?: { 
    shallow: boolean; 
    deep: boolean; 
    irregular: boolean;
  };
  stateClassification?: 'kshipta' | 'mudha' | 'vikshipta' | 'ekagra' | 'niruddha';
  source?: string; // 'mirror_camera', 'phone_camera', 'dedicated_device'
  sessionId?: string;
}

Deno.serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;
  const body = await req.json().catch(() => ({} as MicroExpressionInput));
  
  const { data, error } = await admin.from("micro_expressions").insert({
    user_id: user.id,
    contempt_flash: body.contemptFlash ?? null,
    fear_flash: body.fearFlash ?? null,
    disgust_flash: body.disgustFlash ?? null,
    eye_patterns: body.eyePatterns ?? null,
    facial_tension: body.facialTension ?? null,
    breathing_patterns: body.breathingPatterns ?? null,
    state_classification: body.stateClassification ?? null,
    source: body.source ?? 'unknown',
    session_id: body.sessionId ?? null,
  }).select("id, created_at").single();

  if (error) throw error;

  // Fire-and-forget: trigger three-brain inference
  if (body.stateClassification) {
    void fetch(`${SUPABASE_URL}/functions/v1/infer-three-brain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization")!,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ 
        userId: user.id, 
        state: body.stateClassification,
        source: "facial",
      }),
    }).catch(() => {});
  }

  // Trigger loop detection for specific micro-expressions
  if (body.contemptFlash || body.fearFlash || body.disgustFlash) {
    void fetch(`${SUPABASE_URL}/functions/v1/live-detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization")!,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ 
        userId: user.id, 
        source: "micro_expression",
        signals: {
          contempt: body.contemptFlash,
          fear: body.fearFlash,
          disgust: body.disgustFlash,
        },
      }),
    }).catch(() => {});
  }

  return successResponse({ ok: true, expressionId: data.id });
}));