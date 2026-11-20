import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearThemeCache } from "@/hooks/useThemeOfDay";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";

export function useCredits() {
  return useQuery({
    queryKey: ["user-credits"],
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("user_credits" as any)
        .select("*")
        .eq("user_id", user.id)
        .single();

      return data as any;
    },
  });
}

export function useCreditTransactions() {
  return useQuery({
    queryKey: ["credit-transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("credit_transactions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      return (data || []) as any[];
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (amountPaise: number) => {
      const { data, error } = await supabase.functions.invoke("razorpay-order", {
        body: { amount: amountPaise },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      amount_paise: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("razorpay-verify", {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
      // Clear all AI-dependent caches so they re-fetch with new credits
      clearThemeCache();
      queryClient.invalidateQueries({ queryKey: ["theme-of-day"] });
      queryClient.invalidateQueries({ queryKey: ["consciousness-engine"] });
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["companion-engine"] });
      queryClient.invalidateQueries({ queryKey: ["presence-card"] });
      toast({
        title: "Payment Successful! 🎉",
        description: `₹${((data as any).credits_added / 100).toFixed(0)} credits added. AI features are now active!`,
      });
    },
    onError: (err) => {
      consciousFromError(err, "actionMissed");
    },
  });
}

export function hasEnoughCredits(credits: any, requiredPaise: number = 100): boolean {
  if (!credits) return false;
  return credits.balance_paise >= requiredPaise;
}
