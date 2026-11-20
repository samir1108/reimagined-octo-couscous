/**
 * KUNDLI CONTEXT — Compact astro/numerology background for AI system prompts.
 *
 * Reads the `user_kundli` row (if the user filled birth data in onboarding or
 * Settings) and renders a tight context block any guru or session can use:
 * yoni, gana, nadi, varna, rashi, nakshatra, current mahadasha, life-path
 * number, etc.
 *
 * Used by guide-chat and temple-chat so e.g. when a Vedic master speaks to a
 * user with Rakshasa yoni, the AI naturally adapts tone and metaphor.
 *
 * Returns null when no kundli exists (most users early on). Tolerates errors
 * silently — astrology context is enrichment, never required.
 */
import type { SupabaseClient } from "./supabase-client.ts";

export interface KundliContextRow {
  rashi?: string | null;
  rashi_lord?: string | null;
  nakshatra?: string | null;
  nakshatra_lord?: string | null;
  pada?: number | null;
  yoni?: string | null;
  gana?: string | null;
  nadi?: string | null;
  varna?: string | null;
  vashya?: string | null;
  tithi?: string | null;
  karana?: string | null;
  nitya_yoga?: string | null;
  current_mahadasha?: string | null;
  current_mahadasha_end?: string | null;
  numerology?: { life_path?: number; birth_day?: number } | null;
  insights?: {
    summary?: string;
    strengths?: string[];
    practice_recommendations?: string[];
  } | null;
}

export async function fetchKundliRow(
  admin: SupabaseClient,
  userId: string,
): Promise<KundliContextRow | null> {
  try {
    const { data } = await admin
      .from("user_kundli")
      .select(
        "rashi, rashi_lord, nakshatra, nakshatra_lord, pada, yoni, gana, nadi, varna, vashya, tithi, karana, nitya_yoga, current_mahadasha, current_mahadasha_end, numerology, insights",
      )
      .eq("user_id", userId)
      .maybeSingle();
    return (data as KundliContextRow) || null;
  } catch {
    return null;
  }
}

/**
 * Render a compact, prompt-ready block. Returns "" when nothing useful exists
 * so callers can safely string-concat.
 */
export function renderKundliBlock(k: KundliContextRow | null): string {
  if (!k) return "";

  const v = (x: unknown) => (x === null || x === undefined || x === "" ? null : String(x));
  const lines: string[] = [];

  // Vedic identity
  const rashi = v(k.rashi);
  const nak = v(k.nakshatra);
  if (rashi || nak) {
    const parts = [
      rashi && `Rashi: ${rashi}${k.rashi_lord ? ` (lord: ${k.rashi_lord})` : ""}`,
      nak && `Nakshatra: ${nak}${k.pada ? ` (pada ${k.pada})` : ""}${k.nakshatra_lord ? ` (lord: ${k.nakshatra_lord})` : ""}`,
    ].filter(Boolean);
    lines.push(...(parts as string[]));
  }

  // Temperament gunas (yoni / gana / nadi / varna / vashya)
  const gunas = [
    k.yoni && `Yoni: ${k.yoni}`,
    k.gana && `Gana: ${k.gana}`,
    k.nadi && `Nadi: ${k.nadi}`,
    k.varna && `Varna: ${k.varna}`,
    k.vashya && `Vashya: ${k.vashya}`,
  ].filter(Boolean) as string[];
  if (gunas.length) lines.push(gunas.join(" · "));

  // Panchanga
  const panchanga = [
    k.tithi && `Tithi: ${k.tithi}`,
    k.karana && `Karana: ${k.karana}`,
    k.nitya_yoga && `Yoga: ${k.nitya_yoga}`,
  ].filter(Boolean) as string[];
  if (panchanga.length) lines.push(panchanga.join(" · "));

  // Dasha
  if (k.current_mahadasha) {
    const end = k.current_mahadasha_end
      ? ` (ends ${new Date(k.current_mahadasha_end).toLocaleDateString()})`
      : "";
    lines.push(`Current Mahadasha: ${k.current_mahadasha}${end}`);
  }

  // Numerology
  if (k.numerology?.life_path) {
    lines.push(
      `Life Path: ${k.numerology.life_path}${k.numerology.birth_day ? ` · Birth-day: ${k.numerology.birth_day}` : ""}`,
    );
  }

  // Optional one-liner summary
  if (k.insights?.summary) {
    lines.push(`Pattern: ${String(k.insights.summary).slice(0, 200)}`);
  }

  if (!lines.length) return "";

  return `\n\n## SEEKER'S VEDIC / NUMEROLOGY CONTEXT (background — use naturally, NEVER recite)
${lines.map((l) => `- ${l}`).join("\n")}
- This is BACKGROUND COLOR for your tone, metaphor, and timing — not a prediction tool.
- Adapt subtly to their temperament (e.g. fiery yoni → ground them; soft nadi → embolden).
- If they ask about astrology specifically, you may reference these gently.
- NEVER read the chart back to them verbatim. NEVER use this to predict fate.`;
}

/** Convenience: fetch + render in one call. Returns "" when no kundli. */
export async function buildKundliPromptBlock(
  admin: SupabaseClient,
  userId: string,
): Promise<string> {
  const row = await fetchKundliRow(admin, userId);
  return renderKundliBlock(row);
}
