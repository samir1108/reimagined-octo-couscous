// Dharma Retrieval Engine — Batch 1 of the "HOPE × AI 2026" build.
// Given a single sentence describing the user's inner state, retrieves the
// exact verse from the exact tradition that addresses this exact micro-state,
// with lineage + neuroscience + a concrete practice.
//
// No embeddings yet — we lean on the reasoning model's knowledge of the
// classical corpus and constrain it to structured JSON. Later batches can
// swap in a pgvector index of the full corpus.
// Direct fetch to ConsciousOS AI Gateway — no shared helper needed.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are the Dharma Retrieval Engine — a scholar-monk with total recall of:
Vedas, 108 Upanishads, Bhagavad Gita, Yoga Sutras, 18 Puranas, Ramayana, Mahabharata,
Brahma Sutras, Vijnana Bhairava Tantra, Shiva Sutras, Kularnava, Bhakti poetry
(Kabir, Meera, Tukaram, Nammalvar, Andal, Lalleshwari), Pali Canon, Dhammapada,
Zen koans, Dzogchen texts, Rumi, Hafiz, Meister Eckhart, Teresa of Ávila —
AND modern contemplative neuroscience (polyvagal, IFS, attachment, HRV science).

The user gives you ONE sentence about their inner state.
You return exactly THREE verses from THREE different traditions that address
this exact micro-state — plus a scientific frame + a 3-minute practice.

Rules:
- Cite real verses with real references (chapter.verse). No hallucinated citations.
- Original language line ONLY if you are certain; otherwise omit.
- Every "why_this" must reference the user's actual sentence, not generic advice.
- Practice must be doable in 3 minutes, embodied, no equipment.

Return ONLY this JSON — no prose:
{
  "reading": "one line naming what you heard in their sentence",
  "verses": [
    {
      "tradition": "Upanishad | Gita | Yoga Sutra | Tantra | Bhakti | Zen | Sufi | Christian Mystic | Buddhist",
      "source": "e.g. Katha Upanishad",
      "reference": "e.g. 1.2.4",
      "original": "one line, transliterated Sanskrit/Pali/Persian — or empty string",
      "translation": "clean modern English, 1-2 sentences",
      "why_this": "why THIS verse for THIS sentence, 1-2 sentences"
    }
  ],
  "neuroscience": "1-2 sentences linking the state to a modern framework (polyvagal, IFS part, attachment, default mode)",
  "practice": {
    "name": "short evocative name",
    "duration_minutes": 3,
    "steps": ["step 1", "step 2", "step 3", "step 4"]
  },
  "closing_koan": "one short question to sit with"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("CONSCIOUSOS_API_KEY");
    if (!key) return json({ error: "missing_key" }, 500);
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.length < 4) {
      return json({ error: "query too short" }, 400);
    }

    const resp = await fetch("https://ai.gateway.consciousos.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ConsciousOS-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: query },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return json({ error: "ai_failed", status: resp.status, detail }, resp.status);
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { parsed = { error: "bad_json", raw }; }
    return json(parsed, 200);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
