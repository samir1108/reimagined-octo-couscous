import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye } from "lucide-react";
import { Button } from "@/design-system";
import MirrorSessionModal from "./MirrorSessionModal";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const DiscoverSection = () => {
  const [showMirror, setShowMirror] = useState(false);

  return (
    <>
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-body text-primary">Free • No Signup Required</span>
            </div>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-foreground leading-tight"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          >
            See What's Running{" "}
            <span className="text-gradient-sunrise">Beneath the Surface</span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl font-body font-light text-muted-foreground mb-4 max-w-2xl mx-auto"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
          >
            A 2-minute AI conversation that reveals unconscious patterns
            only trained yogis could traditionally identify.
          </motion.p>

          <motion.p
            className="text-sm font-body text-muted-foreground/60 mb-10"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
          >
            3 questions. 3 pattern reveals. Zero data stored.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}
          >
            <Button
              size="lg"
              onClick={() => setShowMirror(true)}
              className="group relative px-10 py-7 text-lg font-display font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-[var(--shadow-glow-strong)] transition-all duration-500"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Try Your Free Mirror Reading
            </Button>
          </motion.div>

        </div>
      </section>

      <MirrorSessionModal open={showMirror} onClose={() => setShowMirror(false)} />
    </>
  );
};

export default DiscoverSection;
