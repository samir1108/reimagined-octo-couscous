import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Shield, Users, Zap, Sparkles } from "lucide-react";
import { Button, Card, CardContent, Text, Badge } from "@/components/design-system";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const joinReasons = [
  {
    icon: Zap,
    title: "Start in 60 seconds",
    desc: "Six light questions. No onboarding marathon. Your first session is composed instantly.",
  },
  {
    icon: Shield,
    title: "Privacy by default",
    desc: "Your data stays on your device. No tracking, no ads, no selling. You own your practice.",
  },
  {
    icon: Users,
    title: "Built for the long arc",
    desc: "500-day master journey, 11 bands, 600+ loops. A system that grows with you, not past you.",
  },
  {
    icon: Sparkles,
    title: "Free to begin",
    desc: "₹11 credits on signup. No card required. Cancel anytime. Credits never expire.",
  },
];

const trustSignals = [
  "600+ validated mental loops",
  "11 bands × 33 developmental stages",
  "89 guides & masters across 18 categories",
  "4 classical yoga paths unified in one system",
  "Three LLMs + The Witness arbitration layer",
  "Designed to eventually be needed less",
];

const JoinSection = () => {
  const navigate = useNavigate();
  return (
    <section id="join" className="py-20 md:py-28 bg-gradient-midday/30 scroll-mt-28" aria-labelledby="join-heading">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
        >
          <Badge variant="gold" size="md" className="mb-4">Join the Beta</Badge>
          <Text variant="display-sm" color="primary" weight="medium" className="mb-6">
            The teacher in your pocket. Ready when you are.
          </Text>
          <Text variant="body-lg" color="secondary">
            No credit card. No commitment. Just six questions and your first session.
          </Text>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {joinReasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1}
            >
              <Card variant="featured" hover padding="lg" className="h-full">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-400">
                    <reason.icon className="w-6 h-6" />
                  </div>
                  <Text variant="h4" color="primary">{reason.title}</Text>
                  <Text variant="body" color="secondary">{reason.desc}</Text>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-primary/20 p-8 md:p-12 text-center"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5}
        >
          <Text variant="display-sm" color="primary" weight="medium" className="mb-4">
            Trusted by seekers, builders, and leaders
          </Text>
          <Text variant="body-lg" color="secondary" className="mb-8 max-w-2xl mx-auto">
            Join thousands who have started their daily practice with ConsciousOS.
          </Text>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {trustSignals.map((signal, i) => (
              <Badge key={signal} variant="outline" size="sm" className="gap-2">
                <Check className="w-3.5 h-3.5 text-gold-400" />
                {signal}
              </Badge>
            ))}
          </div>
          <Button
            variant="primary"
            size="xl"
            className="w-full sm:w-auto gap-2"
            onClick={() => navigate("/auth")}
          >
            Start Free — Get ₹11 Credits
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Text variant="micro" color="muted" className="mt-4 block">
            ₹11 free credits on signup · No credit card required · Credits never expire
          </Text>
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6}
        >
          <Text variant="body" color="muted">
            Questions? <a href="/faq" className="text-primary hover:underline">Read the FAQ</a> or{" "}
            <a href="/contact" className="text-primary hover:underline">contact us</a>
          </Text>
        </motion.div>
      </div>
    </section>
  );
};

export default JoinSection;