import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/design-system";

interface Props {
  onStart: () => void;
}

const MirrorIntro = ({ onStart }: Props) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    {/* Ambient glow */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>

    <motion.div
      className="relative z-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 mx-auto"
        animate={{ boxShadow: ["0 0 30px hsl(43 96% 56% / 0.1)", "0 0 60px hsl(43 96% 56% / 0.25)", "0 0 30px hsl(43 96% 56% / 0.1)"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="w-9 h-9 text-primary" />
      </motion.div>

      <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
        The Mirror
      </h3>

      <p className="font-body text-muted-foreground mb-2 max-w-sm mx-auto text-base leading-relaxed">
        3 questions. Your unconscious patterns revealed.
        <br />
        See what's running beneath the surface.
      </p>

      <p className="text-xs font-body text-muted-foreground/40 mb-10">
        Takes 2 minutes • Nothing is stored
      </p>

      <Button
        onClick={onStart}
        size="lg"
        className="px-10 py-7 text-base font-display font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-[var(--shadow-glow)] transition-all duration-500"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Begin Reading
      </Button>
    </motion.div>
  </div>
);

export default MirrorIntro;
