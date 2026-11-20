// Unified STT (batch / short utterances):
// Deepgram Nova-3 (primary) -> ElevenLabs Scribe (fallback) -> instructs client to use Web Speech API.
// Accepts multipart/form-data with field "audio" OR JSON { audioBase64, mimeType }.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function readAudio(req: Request): Promise<{ bytes: Uint8Array; mime: string } | null> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.startsWith("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) return null;
    const buf = new Uint8Array(await file.arrayBuffer());
    return { bytes: buf, mime: file.type || "audio/webm" };
  }
  if (ct.includes("application/json")) {
    const { audioBase64, mimeType } = await req.json();
    if (!audioBase64) return null;
    const bin = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
    return { bytes: bin, mime: mimeType || "audio/webm" };
  }
  // Raw body
  const buf = new Uint8Array(await req.arrayBuffer());
  if (buf.length === 0) return null;
  return { bytes: buf, mime: ct || "audio/webm" };
}

async function tryDeepgram(bytes: Uint8Array, mime: string): Promise<any | null> {
  const key = Deno.env.get("DEEPGRAM_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&detect_language=true&utterances=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${key}`,
          "Content-Type": mime,
        },
        body: bytes,
      }
    );
    if (!res.ok) {
      console.warn("Deepgram STT failed", res.status, await res.text());
      return null;
    }
    const j = await res.json();
    const alt = j?.results?.channels?.[0]?.alternatives?.[0];
    if (!alt) return null;
    return {
      provider: "deepgram",
      transcript: alt.transcript ?? "",
      confidence: alt.confidence ?? null,
      words: alt.words ?? [],
      language: j?.results?.channels?.[0]?.detected_language ?? null,
    };
  } catch (e) {
    console.warn("Deepgram STT exception", e);
    return null;
  }
}

async function tryElevenLabs(bytes: Uint8Array, mime: string): Promise<any | null> {
  const key =
    Deno.env.get("ELEVENLABS_CUSTOM_KEY") ||
    Deno.env.get("ELEVENLABS_API_KEY_1") ||
    Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) return null;
  try {
    const fd = new FormData();
    fd.append("file", new Blob([bytes], { type: mime }), "audio.webm");
    fd.append("model_id", "scribe_v2");
    fd.append("tag_audio_events", "true");
    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": key },
      body: fd,
    });
    if (!res.ok) {
      console.warn("ElevenLabs STT failed", res.status, await res.text());
      return null;
    }
    const j = await res.json();
    return {
      provider: "elevenlabs",
      transcript: j.text ?? "",
      words: j.words ?? [],
      language: j.language_code ?? null,
    };
  } catch (e) {
    console.warn("ElevenLabs STT exception", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const audio = await readAudio(req);
    if (!audio) {
      return new Response(JSON.stringify({ error: "No audio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let result = await tryDeepgram(audio.bytes, audio.mime);
    if (!result) result = await tryElevenLabs(audio.bytes, audio.mime);
    if (!result) {
      return new Response(JSON.stringify({ fallback: "browser" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("stt-listen error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
