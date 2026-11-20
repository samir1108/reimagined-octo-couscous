// ============================================================
// INGEST VOICE PATTERNS — Audio Consciousness Detection
// ============================================================
// Receives prosody, word patterns, speech/silence ratio, vocal biomarkers
// Stores in voice_patterns table, triggers loop detection

import { createClient } from "npm:@supabase/supabase-js@2";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

interface VoicePatternInput {
  prosody?: { pitch: number; speed: number; variability: number };
  wordPatterns?: { 
    shouldCount: number; 
    cantCount: number; 
    theyAlwaysCount: number; 
    itsFineCount: number; 
    noticeCount: number;
  };
  speechSilenceRatio?: number;
  vocalBiomarkers?: { 
    cortisol: number; 
    microTremors: number; 
    breathPatterns: number;
  };
  conversationDynamics?: {
    dominance: number;
    topicAvoidance: number;
    emotionalContagion: number;
    agreementPatterns: number;
  };
  source?: string; // 'listening_device', 'phone_call', 'voice_memo'
  durationSec?: number;
}

Deno.serve(withMiddleware(async (req, context) => {
  const { user, admin } = context;
  const body = await req.json().catch(() => ({} as VoicePatternInput));
  
  const { data, error } = await admin.from("voice_patterns").insert({
    user_id: user.id,
    prosody: body.prosody ?? null,
    word_patterns: body.wordPatterns ?? null,
    speech_silence_ratio: body.speechSilenceRatio ?? null,
    vocal_biomarkers: body.vocalBiomarkers ?? null,
    conversation_dynamics: body.conversationDynamics ?? null,
    source: body.source ?? 'unknown',
    duration_sec: body.durationSec ?? null,
  }).select("id, created_at").single();

  if (error) throw error;

  // Fire-and-forget: trigger loop detection for voice patterns
  // e.g., "I should" → Control Loop, "I can't" → Worth Loop
  const wp = body.wordPatterns;
  if (wp && (wp.shouldCount > 3 || wp.cantCount > 2 || wp.theyAlwaysCount > 2)) {
    void fetch(`${SUPABASE_URL}/functions/v1/live-detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization")!,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ 
        userId: user.id, 
        source: "voice_pattern",
        messages: [`should:${wp.shouldCount}`, `can't:${wp.cantCount}`, `they_always:${wp.theyAlwaysCount}`],
      }),
    }).catch(() => {});
  }

  return successResponse({ ok: true, patternId: data.id });
}));