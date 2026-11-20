import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const FinalCTASection = () => {
  const navigate = useNavigate();
  return (
    <section id="cta" className="py-32 px-6 relative">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, hsl(30 100% 55% / 0.08), transparent 60%)",
        }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-display font-bold mb-6 text-foreground"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
        >
          The Journey Inward{" "}
          <span className="text-gradient-sunrise text-glow">Begins Now</span>
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl font-body font-light text-muted-foreground mb-10 leading-relaxed"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
        >
          You've been running unconscious loops your entire life. 
          Today, you can choose to observe them. One observation changes everything.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
        >
          <button
            onClick={() => navigate("/auth")}
            className="group px-10 py-5 rounded-full bg-gradient-sunrise text-primary-foreground font-display font-medium text-xl tracking-wide hover:scale-105 transition-all glow-sunrise flex items-center gap-3"
          >
            Start Observing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
        <motion.p
          className="text-sm text-muted-foreground/50 font-body mt-6"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
        >
          Free to start · No credit card required · ₹11 free credits on signup
        </motion.p>
      </div>
    </section>
  );
};

export default FinalCTASection;
