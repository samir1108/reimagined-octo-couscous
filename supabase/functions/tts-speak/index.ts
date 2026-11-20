// Unified TTS: Deepgram Aura-2 (primary) -> ElevenLabs (fallback) -> client browser fallback
// Returns raw audio/mpeg bytes. If both providers fail, returns 502 with { fallback: 'browser' }
// so the client can speak via SpeechSynthesis without breaking the meditative flow.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DG_VOICES: Record<string, string> = {
  // Curated calm voices for guru/contemplative narration
  guru: "aura-2-thalia-en",      // warm female, very calm
  guru_male: "aura-2-orion-en",  // grounded male
  child: "aura-2-luna-en",
  elder: "aura-2-zeus-en",
};

const EL_VOICES: Record<string, string> = {
  guru: "EXAVITQu4vr4xnSDxMaL",   // Sarah
  guru_male: "JBFqnCBsd6RMkjVDRZzb", // George
  child: "XrExE9yKIg1WjnnlVkGX",  // Matilda
  elder: "onwK4e9ZLuTAKqWW03F9",  // Daniel
};

async function tryDeepgram(text: string, voiceKey: string): Promise<ArrayBuffer | null> {
  const key = Deno.env.get("DEEPGRAM_API_KEY");
  if (!key) return null;
  try {
    const model = DG_VOICES[voiceKey] ?? DG_VOICES.guru;
    const res = await fetch(
      `https://api.deepgram.com/v1/speak?model=${model}&encoding=mp3`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );
    if (!res.ok) {
      console.warn("Deepgram TTS failed", res.status, await res.text());
      return null;
    }
    return await res.arrayBuffer();
  } catch (e) {
    console.warn("Deepgram TTS exception", e);
    return null;
  }
}

async function tryElevenLabs(text: string, voiceKey: string): Promise<ArrayBuffer | null> {
  const key =
    Deno.env.get("ELEVENLABS_CUSTOM_KEY") ||
    Deno.env.get("ELEVENLABS_API_KEY_1") ||
    Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) return null;
  try {
    const voice = EL_VOICES[voiceKey] ?? EL_VOICES.guru;
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.75,
            style: 0.25,
            use_speaker_boost: true,
            speed: 0.95,
          },
        }),
      }
    );
    if (!res.ok) {
      console.warn("ElevenLabs TTS failed", res.status, await res.text());
      return null;
    }
    return await res.arrayBuffer();
  } catch (e) {
    console.warn("ElevenLabs TTS exception", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { text, voice = "guru" } = await req.json();
    if (!text || typeof text !== "string" || text.length > 4000) {
      return new Response(JSON.stringify({ error: "Invalid text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try Deepgram first
    let audio = await tryDeepgram(text, voice);
    let provider = "deepgram";
    if (!audio) {
      audio = await tryElevenLabs(text, voice);
      provider = "elevenlabs";
    }

    if (!audio) {
      // Signal client to use browser SpeechSynthesis fallback
      return new Response(JSON.stringify({ fallback: "browser", text, voice }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(audio, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "X-Tts-Provider": provider,
      },
    });
  } catch (e: any) {
    console.error("tts-speak error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
