/**
 * useActiveGuru — single source of truth for "who is guiding me right now".
 *
 * Resolves the active guru by checking, in order:
 *   1. Most recent row in `guru_rotations` (rotation engine output)
 *   2. Active enrolled program (`enrolled_programs.guru_id`)
 *   3. Fallback: Krishna
 *
 * Returns the full GURU object plus a ready-to-use portrait image URL so
 * any session surface (Guide chat, Practice runner, NextSessionReady, etc.)
 * can render the same companion visual.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { GURUS } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";

const FALLBACK_ID = "krishna";

export function useActiveGuru() {
  return useQuery({
    queryKey: ["active-guru"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const guru = GURUS.find((g) => g.id === FALLBACK_ID) || GURUS[0];
        return { guru, image: MASTER_IMAGES[guru.id] || guru.image };
      }

      // 1. Latest rotation
      const { data: rot } = await supabase
        .from("guru_rotations" as any)
        .select("to_guru_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let guruId: string | null = (rot as any)?.to_guru_id ?? null;

      // 2. Active enrolled program
      if (!guruId) {
        const { data: prog } = await supabase
          .from("enrolled_programs" as any)
          .select("guru_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        guruId = (prog as any)?.guru_id ?? null;
      }

      const guru =
        GURUS.find((g) => g.id === (guruId || FALLBACK_ID)) ||
        GURUS.find((g) => g.id === FALLBACK_ID) ||
        GURUS[0];

      return {
        guru,
        image: MASTER_IMAGES[guru.id] || guru.image,
      };
    },
  });
}
