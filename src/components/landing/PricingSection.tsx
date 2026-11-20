import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Infinity as InfinityIcon, Crown, Coins, Sparkles, Brain } from "lucide-react";
import { CREDIT_PACKS } from "@/lib/paymentConfig";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const CREDIT_SHARE = 75;

const packStyle: Record<string, { icon: typeof Zap; color: string }> = {
  starter: { icon: Zap, color: "from-blue-500/20 to-cyan-500/10" },
  growth: { icon: Sparkles, color: "from-primary/20 to-amber-500/10" },
  pro: { icon: Crown, color: "from-violet-500/20 to-purple-500/10" },
  enterprise: { icon: InfinityIcon, color: "from-emerald-500/20 to-teal-500/10" },
};

const features = [
  { tier: "Free", items: ["₹11 free credits on signup", "Daily observations & journaling", "Basic loop identification", "Band 0–2 tracking", "Community access"] },
  { tier: "With Credits", items: ["Unlimited AI Guide conversations", "Full 150+ loop library", "All 8 consciousness bands", "Three-brain intelligence mapping", "Advanced analytics & pattern insights", "Consciousness engine analysis", "Journal AI reflections", "Priority support"] },
];

const usageCosts = [
  { action: "AI Guide Chat", cost: "~₹1" },
  { action: "Journal Reflection", cost: "~₹1" },
  { action: "Consciousness Analysis", cost: "~₹0.50" },
  { action: "Task Completion AI", cost: "~₹0.50" },
  { action: "Pattern Detection", cost: "~₹0.50" },
];

const PricingSection = () => {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-32 px-6 relative scroll-mt-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm font-body text-primary">Pay As You Grow</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
            Credits That Fuel Your <span className="text-gradient-sunrise">Awakening</span>
          </h2>
          <p className="text-lg font-body font-light text-muted-foreground max-w-2xl mx-auto mb-4">
            Start with <span className="text-primary font-semibold">₹11 free credits</span> on signup — no card needed.
            Top up whenever you need more — you get <span className="text-primary font-semibold">75%</span> of what you pay as credits.
          </p>
          <p className="text-base font-body text-muted-foreground/80 max-w-xl mx-auto">
            <span className="text-primary font-semibold">Browsing programs is free.</span> AI-guided sessions run on credits — top up when you need more.
          </p>
        </motion.div>

        {/* Credit Packs */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
        >
          {CREDIT_PACKS.map((pack, i) => {
            const style = packStyle[pack.id];
            const Icon = style.icon;
            const popular = pack.tag === "Popular";
            return (
              <motion.div
                key={pack.id}
                className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col ${
                  popular
                    ? "border-primary/40 bg-primary/5 shadow-[0_0_60px_hsl(30_100%_55%/0.08)] scale-[1.03]"
                    : "border-border/40 bg-card/30 hover:border-primary/30"
                }`}
                variants={fadeUp} custom={i + 1}
                whileHover={{ y: -4 }}
                onClick={() => navigate("/auth")}
              >
                {pack.tag && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-display font-medium tracking-wide ${
                    popular ? "bg-gradient-sunrise text-primary-foreground" : "bg-accent text-accent-foreground"
                  }`}>
                    {pack.tag}
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">{pack.label}</p>
                <p className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">{pack.displayPrice}</p>
                <p className="text-lg font-display font-semibold text-primary tabular-nums">{pack.credits} credits</p>
                <p className="mt-auto pt-3 text-[10px] uppercase tracking-wider font-body text-muted-foreground/70">
                  {CREDIT_SHARE}% as credits
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Two Column: What's Free + What Credits Unlock */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((tier, idx) => (
            <motion.div
              key={tier.tier}
              className={`p-7 rounded-2xl border ${
                idx === 1 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-border/40 bg-card/30"
              }`}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={idx + 2}
            >
              <h3 className="text-lg font-display font-bold text-foreground mb-1">
                {idx === 0 ? "🆓 Always Free" : "⚡ With Credits"}
              </h3>
              <p className="text-xs text-muted-foreground font-body mb-5">
                {idx === 0 ? "Start observing yourself — no payment needed" : "Unlock the full power of AI-guided consciousness"}
              </p>
              <ul className="space-y-3">
                {tier.items.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground font-body font-light">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${idx === 1 ? "text-primary" : "text-muted-foreground/60"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* AI Modes — Fast vs Premium */}
        <motion.div
          className="rounded-2xl border border-border/40 bg-card/30 p-7 mb-8"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}
        >
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-bold text-foreground">Two AI Brains, One Wallet</h3>
          </div>
          <p className="text-xs text-muted-foreground font-body mb-5">
            Choose your AI mode anytime in Settings or Credits. Both modes draw from the same credits — Premium just spends faster for sharper insight.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/40 bg-background/40 p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="w-4 h-4 text-primary" />
                <p className="font-display font-semibold text-foreground">Fast Mode</p>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-primary/80">Default</span>
              </div>
              <p className="text-sm font-display font-bold text-primary tabular-nums mb-2">≈ ₹0.50 / message</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground font-body">
                <li>• Llama 3.3 70B — replies in 1–3s</li>
                <li>• Perfect for daily check-ins & reflections</li>
                <li>• Gentle on credits, light & quick</li>
              </ul>
            </div>
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="font-display font-semibold text-foreground">Premium Mode</p>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-primary">GPT-5.5</span>
              </div>
              <p className="text-sm font-display font-bold text-primary tabular-nums mb-2">≈ ₹4–8 / message</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground font-body">
                <li>• Latest OpenAI GPT-5.5 — deepest reasoning</li>
                <li>• Best for Elder readings & master sessions</li>
                <li>• 5–15s replies, much higher nuance</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Usage Costs Ticker */}
        <motion.div
          className="rounded-2xl border border-border/40 bg-card/30 p-7 mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5}
        >
          <h3 className="text-lg font-display font-bold text-foreground mb-1">💡 Transparent Usage</h3>
          <p className="text-xs text-muted-foreground font-body mb-5">Fast Mode pricing shown — Premium costs more per call. You always know where your credits go.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {usageCosts.map((u) => (
              <div key={u.action} className="glass-subtle rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground font-body mb-1">{u.action}</p>
                <p className="text-lg font-display font-bold text-primary">{u.cost}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5}
        >
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 rounded-full bg-gradient-sunrise text-primary-foreground font-display font-semibold text-base tracking-wide hover:scale-105 transition-transform glow-sunrise"
          >
            Start Free — Get ₹11 Credits Instantly
          </button>
          <p className="text-xs text-muted-foreground font-body mt-3">₹11 free credits on signup · No credit card required · Credits never expire</p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
