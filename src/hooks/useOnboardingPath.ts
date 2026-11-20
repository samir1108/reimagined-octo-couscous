/**
 * useOnboardingPath
 * ─────────────────
 * Reads `profiles.onboarding_path` ("quick" | "deep" | null) for the current
 * user and caches it for 5 minutes. Used to:
 *
 *   • route deep-path users to /app/before until they graduate
 *   • surface the Mirror button on Home for quick-path users
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";

export type OnboardingPath = "quick" | "deep" | null;

export function useOnboardingPath() {
  const { user } = useAuthReady();
  return useQuery({
    queryKey: ["onboarding-path", user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<OnboardingPath> => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_path" as any)
        .eq("user_id", user!.id)
        .maybeSingle();
      const v = (data as any)?.onboarding_path;
      return v === "quick" || v === "deep" ? v : null;
    },
  });
}
