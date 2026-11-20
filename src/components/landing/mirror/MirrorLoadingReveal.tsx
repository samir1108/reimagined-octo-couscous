import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const MirrorLoadingReveal = () => (
  <div className="flex flex-col items-center justify-center h-full relative">
    {/* Multi-layer ambient glow */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--secondary) / 0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </div>

    <motion.div
      className="relative z-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 mx-auto"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-7 h-7 text-primary" />
      </motion.div>

      <motion.p
        className="text-lg font-display font-medium text-foreground mb-2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Reading your patterns...
      </motion.p>
      <p className="text-xs font-body text-muted-foreground/40">
        Analyzing across 300+ consciousness loops
      </p>
    </motion.div>
  </div>
);

export default MirrorLoadingReveal;
