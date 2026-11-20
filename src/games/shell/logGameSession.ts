import { supabase } from "@/lib/supabase";

export interface GameSessionPayload {
  gameId: string;
  durationMs: number;
  outcome: "completed" | "abandoned" | "interrupted";
  signals: Record<string, unknown>;
}

/**
 * Log a finished game session to consciousness_signals.
 * Always silent on failure — games must never block the meditative exit on a network error.
 */
export async function logGameSession(payload: GameSessionPayload): Promise<void> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    await supabase.from("consciousness_signals").insert({
      user_id: user.id,
      source_type: "game",
      game_id: payload.gameId,
      game_signals: payload.signals as any,
      witness_signals: { game: payload.gameId, outcome: payload.outcome, duration_ms: payload.durationMs } as any,
      confidence: 0.6,
    });

    // Karma: award for finishing a game (throttled server-side to 3 min).
    // Only count real completions — abandoned/interrupted don't earn karma.
    if (payload.outcome === "completed") {
      try {
        await (supabase.rpc as any)("award_karma_event", {
          p_source: "game_complete",
          p_base: 8,
          p_weight: 1.0,
          p_metadata: { game_id: payload.gameId, duration_ms: payload.durationMs },
        });
      } catch (e) {
        // silent
      }
    }
  } catch (err) {
    console.warn("[logGameSession] silent fail:", err);
  }
}
