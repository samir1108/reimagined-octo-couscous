import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, Zap, History, ArrowRight, Sparkles, FlaskConical } from "lucide-react";
import { Button } from "@/design-system";
import { useCredits, useCreditTransactions, useCreateOrder, useVerifyPayment } from "@/hooks/useCredits";
import { format } from "date-fns";
import { CREDIT_PACKS, getPaymentUI, isDev } from "@/lib/paymentConfig";
import CostLedger from "@/components/credits/CostLedger";
import UsageToday from "@/components/credits/UsageToday";
import AiModePicker from "@/components/settings/AiModePicker";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Credits() {
  const { data: credits, isLoading } = useCredits();
  const { data: transactions } = useCreditTransactions();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const paymentUI = getPaymentUI();

  const handlePurchase = async (amountPaise: number) => {
    setPurchasing(amountPaise);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment SDK");

      const orderData = await createOrder.mutateAsync(amountPaise);

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
              name: "ConsciousOS",
        description: "Credits Purchase",
        order_id: orderData.order_id,
        handler: async (response: any) => {
          await verifyPayment.mutateAsync({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount_paise: amountPaise,
          });
          setPurchasing(null);
        },
        prefill: paymentUI.prefill,
        theme: paymentUI.theme,
        modal: {
          ondismiss: () => setPurchasing(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => setPurchasing(null));
      rzp.open();
    } catch {
      setPurchasing(null);
    }
  };

  const balanceRupees = credits ? (credits.balance_paise / 100).toFixed(2) : "0.00";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Dev Mode Badge */}
      {isDev() && paymentUI.badgeVisible && (
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/30 border border-accent/50 text-xs font-body text-accent-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>{paymentUI.badgeText} — Use Razorpay test cards. No real charges.</span>
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight mb-1">Credits</h1>
        <p className="text-sm text-muted-foreground font-body">Power your consciousness journey with AI credits</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        className="glass-card rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">Available Credits</p>
            <p className="text-4xl font-display font-bold text-foreground">₹{balanceRupees}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              {credits ? `Total purchased: ₹${(((credits.total_purchased_paise ?? credits.lifetime_paise) || 0) / 100).toFixed(0)}` : "No purchases yet"}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Coins className="w-8 h-8 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* AI Mode Picker — choose Fast vs Premium */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <AiModePicker />
      </motion.div>

      {/* How it works */}
      <motion.div
        className="glass-card rounded-2xl p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">How Credits Work</h3>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground font-body">
          <p>• Purchase credits to unlock AI-powered features: Guide conversations, consciousness analysis, journaling insights</p>
          <p>• You receive <span className="text-primary font-semibold">75%</span> of your payment as usable credits (25% platform fee)</p>
          <p>• Credits never expire — use them at your own pace</p>
        </div>
      </motion.div>

      {/* Credit Packs */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-display font-semibold text-foreground text-sm px-1">Buy Credits</h3>
        <div className="grid grid-cols-2 gap-3">
          {CREDIT_PACKS.map((pack) => (
            <motion.button
              key={pack.id}
              onClick={() => handlePurchase(pack.amountPaise)}
              disabled={purchasing !== null}
              className={`glass-card rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${
                purchasing === pack.amountPaise ? "opacity-60" : ""
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {pack.tag && (
                <span className="absolute top-2 right-2 text-[9px] font-display font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {pack.tag}
                </span>
              )}
              <p className="font-display font-bold text-lg text-foreground">{pack.displayPrice}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowRight className="w-3 h-3 text-primary" />
                <p className="text-sm font-display text-primary font-semibold">{pack.credits} credits</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-body mt-1">{pack.label}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <motion.div
          className="glass-card rounded-2xl p-6 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-display font-semibold text-foreground text-sm">Transaction History</h3>
          </div>
          <div className="space-y-2">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-body text-foreground">{tx.description || tx.type}</p>
                  <p className="text-[10px] text-muted-foreground font-body">
                    {format(new Date(tx.created_at), "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-display font-bold ${tx.type === "purchase" ? "text-green-500" : "text-destructive"}`}>
                    {tx.type === "purchase" ? "+" : "-"}₹{(Math.abs(tx.credits_paise) / 100).toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Today's usage — live snapshot */}
      <UsageToday />

      {/* Where your credits go — per-feature breakdown */}
      <motion.div
        className="glass-card rounded-2xl p-6 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm">Where your credits go</h3>
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">
            Last 30 days · per AI feature
          </p>
        </div>
        <CostLedger />
      </motion.div>
    </div>
  );
}
