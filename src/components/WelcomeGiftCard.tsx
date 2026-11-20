import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

const GIFT_DISMISSED_KEY = "hope-app_gift_dismissed";
const GIFT_SEEN_KEY = "hope-app_gift_seen";

// Confetti particle component
function ConfettiParticle({ index, total }: { index: number; total: number }) {
  const angle = (index / total) * 360;
  const distance = 60 + Math.random() * 80;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const colors = [
    "hsl(var(--primary))",
    "hsl(45 100% 60%)",
    "hsl(280 80% 65%)",
    "hsl(160 70% 50%)",
    "hsl(10 90% 60%)",
  ];
  const color = colors[index % colors.length];
  const size = 4 + Math.random() * 6;
  const shape = index % 3; // 0=circle, 1=square, 2=star

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: shape !== 2 ? color : "transparent",
        borderRadius: shape === 0 ? "50%" : shape === 1 ? "2px" : "0",
        border: shape === 2 ? `2px solid ${color}` : "none",
        left: "50%",
        top: "50%",
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x: [0, x * 0.5, x],
        y: [0, y * 0.3 - 30, y + 40],
        opacity: [1, 1, 0],
        scale: [0, 1.5, 0.5],
        rotate: [0, 180 + Math.random() * 360, 360 + Math.random() * 180],
      }}
      transition={{
        duration: 1.5 + Math.random() * 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.random() * 0.3,
      }}
    />
  );
}

export default function WelcomeGiftCard() {
  const { data: credits } = useCredits();
  const [dismissed, setDismissed] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(GIFT_DISMISSED_KEY) === "true";
    const wasSeen = localStorage.getItem(GIFT_SEEN_KEY) === "true";
    setDismissed(wasDismissed);

    // Show confetti only on first view
    if (!wasDismissed && !wasSeen && credits) {
      setShowConfetti(true);
      localStorage.setItem(GIFT_SEEN_KEY, "true");
      // Stop confetti after animation completes
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [credits]);

  const handleDismiss = () => {
    localStorage.setItem(GIFT_DISMISSED_KEY, "true");
    setDismissed(true);
  };

  if (dismissed || !credits) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="relative glass-card rounded-2xl p-5 border border-primary/30 overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Confetti explosion */}
        {showConfetti && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
            {Array.from({ length: 30 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} total={30} />
            ))}
          </div>
        )}

        {/* Animated glow background */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.15), transparent 60%)",
              "radial-gradient(circle at 70% 50%, hsl(var(--primary) / 0.2), transparent 60%)",
              "radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.15), transparent 60%)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating sparkles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/30"
            style={{
              top: `${15 + i * 20}%`,
              left: `${10 + i * 25}%`,
            }}
            animate={{
              y: [-3, 3, -3],
              rotate: [0, 15, -10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>
        ))}

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/30 transition-colors z-10"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground/50" />
        </button>

        <div className="relative flex items-center gap-4 z-10">
          {/* Gift icon with breathing pulse */}
          <motion.div
            className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/25 to-amber-500/15 flex items-center justify-center shadow-lg shadow-primary/10"
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                "0 4px 14px hsl(var(--primary) / 0.1)",
                "0 8px 28px hsl(var(--primary) / 0.25)",
                "0 4px 14px hsl(var(--primary) / 0.1)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Gift className="w-7 h-7 text-primary" />
          </motion.div>

          <div className="min-w-0">
            <motion.p
              className="text-sm font-display font-bold text-foreground mb-0.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              🎁 You've been gifted{" "}
              <motion.span
                className="text-primary"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ₹11 free credits!
              </motion.span>
            </motion.p>
            <motion.p
              className="text-xs font-body text-muted-foreground leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Use them to talk to your AI Guide, reflect on journals, and explore your consciousness map.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
