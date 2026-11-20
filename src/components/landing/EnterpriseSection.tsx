import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Building2, ArrowRight, Sparkles, Phone, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/design-system";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0, 0, 0.2, 1] as const },
  }),
};

const stats = [
  { value: "47%", label: "Productivity Increase" },
  { value: "62%", label: "Less Burnout" },
  { value: "3.2x", label: "Better Retention" },
  { value: "89%", label: "Team Satisfaction" },
];

const EnterpriseSection = () => {
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleTryDemo = async () => {
    setDemoLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.info("Sign in first to spin up your demo workspace.");
        navigate("/enterprise/auth?redirect=/enterprise/contact?type=demo");
        return;
      }
      const { data, error } = await supabase.functions.invoke("seed-demo-org");
      if (error) throw error;
      toast.success("Demo organization ready!");
      navigate("/enterprise");
    } catch (err: any) {
      toast.error(err.message || "Could not create demo org");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <section id="enterprise" className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="text-center">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Enterprise & Corporate</span>
          </motion.div>

          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 font-display">
            Consciousness is the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Ultimate Competitive Advantage
            </span>
          </motion.h2>

          <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Reduce burnout, build team coherence, and measure organizational consciousness — with AI-powered coaching, weekly mood pulses, and aggregated insights that respect employee privacy.
          </motion.p>

          {/* Stats */}
          <motion.div variants={fadeUp} custom={3} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-5">
                <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Three CTAs */}
          <motion.div variants={fadeUp} custom={4} className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-6">
            <Link to="/enterprise/contact?type=pilot">
              <Button size="lg" className="w-full gap-2 h-14 text-sm font-semibold">
                <Sparkles className="w-4 h-4" /> Start Free Pilot
              </Button>
            </Link>
            <Button
              size="lg" variant="outline"
              className="w-full gap-2 h-14 text-sm font-semibold border-primary/40 hover:bg-primary/5"
              onClick={handleTryDemo}
              disabled={demoLoading}
            >
              {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              {demoLoading ? "Creating..." : "Try Live Demo"}
            </Button>
            <Link to="/enterprise/contact?type=sales">
              <Button size="lg" variant="ghost" className="w-full gap-2 h-14 text-sm font-semibold hover:bg-muted/50">
                <Phone className="w-4 h-4" /> Talk to Sales
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} custom={5} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <Link to="/enterprise/privacy" className="hover:text-foreground transition-colors">
                Aggregated-only · GDPR · Employee opt-out
              </Link>
            </span>
            <span>•</span>
            <span>30-day free pilot · No credit card</span>
            <span>•</span>
            <span>Setup in under 5 minutes</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default EnterpriseSection;
