import { supabase } from "@/lib/supabase";

export async function reflectGame(input: {
  gameId: string;
  signals: Record<string, unknown>;
  durationMs: number;
  outcome: string;
}): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("reflect-game", {
      body: input,
    });
    if (error) throw error;
    const line = (data as any)?.reflection;
    if (typeof line === "string" && line.trim()) return line.trim();
  } catch (e) {
    console.warn("[reflectGame] fallback:", e);
  }
  return "Notice what you noticed.";
}
