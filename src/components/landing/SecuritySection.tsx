import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, Fingerprint, KeyRound } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Your journal entries, conversations, and personal data are encrypted in transit and at rest. No one — not even our team — can read your private reflections.",
  },
  {
    icon: Shield,
    title: "Zero-Knowledge Architecture",
    description: "Your consciousness data belongs to you. We use privacy-first design where your most sensitive insights are processed securely and never shared.",
  },
  {
    icon: Eye,
    title: "No Data Selling. Ever.",
    description: "We will never sell, share, or monetize your personal data. Your inner world is sacred — our business model is subscriptions, not surveillance.",
  },
  {
    icon: Server,
    title: "SOC 2 Compliant Infrastructure",
    description: "Built on enterprise-grade cloud infrastructure with SOC 2 compliance, automatic backups, and 99.9% uptime guarantee.",
  },
  {
    icon: Fingerprint,
    title: "Biometric & 2FA Authentication",
    description: "Secure your account with multi-factor authentication. Your consciousness journey is protected by the same security used by banks.",
  },
  {
    icon: KeyRound,
    title: "Right to Deletion",
    description: "Delete all your data at any time with one click. Complete data export available. You own your journey — always.",
  },
];

export default function SecuritySection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-sm font-display tracking-[0.3em] uppercase text-primary font-semibold">
              Your Inner World is Sacred
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
            Bank-Grade Security for Your <span className="text-gradient-sunrise">Consciousness</span>
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
            We treat your inner journey with the same protection as financial data. 
            Because your thoughts, patterns, and breakthroughs are more valuable than money.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-card rounded-2xl p-6 border border-border/10 hover:border-primary/20 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-subtle border border-primary/20">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-display text-foreground/80">
              256-bit AES encryption • GDPR compliant • ISO 27001 aligned
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
