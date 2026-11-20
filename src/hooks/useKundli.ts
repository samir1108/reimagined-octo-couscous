import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Kundli {
  rashi?: string;
  rashi_lord?: string;
  nakshatra?: string;
  nakshatra_lord?: string;
  pada?: number;
  yoni?: string;
  gana?: string;
  nadi?: string;
  varna?: string;
  vashya?: string;
  tithi?: string;
  karana?: string;
  nitya_yoga?: string;
  current_mahadasha?: string;
  current_mahadasha_end?: string;
  planets?: Record<string, { longitude: number; sign: string; signLord: string }>;
  houses?: Record<string, string[]>;
  numerology?: { life_path?: number; birth_day?: number };
  insights?: { summary?: string; strengths?: string[]; practice_recommendations?: string[] };
  confidence?: number;
}

export function useKundli(userId: string | undefined) {
  const [kundli, setKundli] = useState<Kundli | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from("user_kundli")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => { if (!cancelled) { setKundli((data as unknown as Kundli) || null); setLoading(false); } });
    return () => { cancelled = true; };
  }, [userId]);

  return { kundli, loading };
}

export async function triggerKundliCompute(args: {
  date_of_birth: string;
  time_of_birth?: string;
  time_unknown?: boolean;
  place_of_birth?: string;
}): Promise<Kundli | null> {
  try {
    const { data, error } = await supabase.functions.invoke("compute-kundli", { body: args });
    if (error) throw error;
    return (data as { kundli?: Kundli })?.kundli || null;
  } catch (e) {
    console.warn("Kundli compute failed", e);
    return null;
  }
}
