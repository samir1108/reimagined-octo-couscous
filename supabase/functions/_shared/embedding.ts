// Shared Gemini text-embedding helper.
//
// The store column is vector(768), so every caller must produce exactly
// 768 dimensions. Google's embedding lineup changes over time:
//   - gemini-embedding-001 (current) returns 3072 by default and must be
//     asked for 768 via outputDimensionality.
//   - text-embedding-004 (older) returns 768 natively but has been retired
//     in some API versions.
// Try the current model first, fall back to the older one, and always
// validate the dimension count so a model change never poisons the store.

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

export const EMBEDDING_DIMENSIONS = 768;

const CANDIDATES: Array<{ model: string; extra?: Record<string, unknown> }> = [
  { model: "gemini-embedding-001", extra: { outputDimensionality: EMBEDDING_DIMENSIONS } },
  { model: "text-embedding-004" },
];

export async function embedText(text: string): Promise<number[] | null> {
  if (!GEMINI_API_KEY || !text || !text.trim()) return null;
  const input = text.slice(0, 8000);

  for (const candidate of CANDIDATES) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${candidate.model}:embedContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: `models/${candidate.model}`,
            content: { parts: [{ text: input }] },
            ...(candidate.extra ?? {}),
          }),
        },
      );
      if (!r.ok) {
        const detail = await r.text().catch(() => "");
        console.warn(`[embedding] ${candidate.model} HTTP ${r.status}: ${detail.slice(0, 200)}`);
        continue;
      }
      const j = await r.json();
      const values = j?.embedding?.values ?? null;
      if (Array.isArray(values) && values.length === EMBEDDING_DIMENSIONS) return values;
      console.warn(`[embedding] ${candidate.model} returned ${values?.length ?? 0} dims, expected ${EMBEDDING_DIMENSIONS}`);
    } catch (e) {
      console.warn(`[embedding] ${candidate.model} failed: ${(e as Error).message}`);
    }
  }
  return null;
}
