import { useNavigate } from "react-router-dom";
import { useCredits } from "@/hooks/useCredits";
import { conscious } from "@/lib/consciousToast";
import { useCallback } from "react";

/**
 * Hook that checks credits before AI operations.
 * Returns a function that returns true if user has enough credits,
 * or redirects to credits page if not.
 */
export function useCreditGate() {
  const navigate = useNavigate();
  const { data: credits, refetch } = useCredits();

  const checkCredits = useCallback((costDescription?: string): boolean => {
    // Allow if credits haven't loaded yet (first-time user) — edge function will do final check
    if (credits === undefined) return true;
    if (credits === null || credits.balance_paise < 50) {
      conscious("noCredits", { kind: "info" });
      navigate("/app/credits");
      return false;
    }
    return true;
  }, [credits, navigate]);

  const handleInsufficientCredits = useCallback(() => {
    refetch();
    conscious("noCredits", { kind: "info" });
    navigate("/app/credits");
  }, [navigate, refetch]);

  return { 
    checkCredits, 
    handleInsufficientCredits,
    hasCredits: !!credits && credits.balance_paise >= 50,
    balance: credits?.balance_paise || 0,
  };
}
