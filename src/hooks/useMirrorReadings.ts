import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MIRROR_CHECKPOINTS, MIRROR_TOTAL } from "@/data/pre-journey/mirrors";

export interface MirrorReadingRow {
  mirror_number: number;
  mirror_slug: string;
  title: string;
  module: string;
  score: number;
  confidence: number;
  band: "preliminary" | "inferred" | "read" | "locked";
  evidence: string | null;
  reading_note: string | null;
  day_zero: boolean;
  updated_at: string;
}

export function useMirrorReadings() {
  return useQuery({
    queryKey: ["mirror-readings"],
    queryFn: async (): Promise<MirrorReadingRow[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return [];
      const { data, error } = await (supabase as any)
        .from("mirror_readings")
        .select("mirror_number,mirror_slug,title,module,score,confidence,band,evidence,reading_note,day_zero,updated_at")
        .eq("user_id", auth.user.id)
        .order("mirror_number", { ascending: true });
      if (error) throw error;
      const byN = new Map<number, MirrorReadingRow>();
      for (const row of (data as MirrorReadingRow[]) || []) byN.set(row.mirror_number, row);
      // Backfill locked placeholders for any mirror we don't yet have a row for.
      return MIRROR_CHECKPOINTS.map((m) => byN.get(m.number) || {
        mirror_number: m.number,
        mirror_slug: m.assessmentSlug,
        title: m.title,
        module: m.module,
        score: 0,
        confidence: 0,
        band: "locked" as const,
        evidence: null,
        reading_note: null,
        day_zero: false,
        updated_at: "",
      });
    },
    staleTime: 60_000,
  });
}

export { MIRROR_TOTAL };
