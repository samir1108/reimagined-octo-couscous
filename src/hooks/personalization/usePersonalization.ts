import { useQuery } from "@tanstack/react-query";
import { getUserContext } from "@/lib/supabase-functions";

export function usePersonalization() {
  return useQuery({
    queryKey: ["personalization"],
    queryFn: async () => {
      const res = await getUserContext();
      return res?.personalization;
    },
    staleTime: 30_000,
  });
}