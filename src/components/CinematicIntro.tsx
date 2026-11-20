import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cosmicNebula from "@/assets/cosmic-nebula.jpg";
import cosmicEye from "@/assets/cosmic-eye.jpg";
import cosmicAurora from "@/assets/cosmic-aurora.jpg";

interface StarProps {
  count: number;
}

const Stars = ({ count }: StarProps) => {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-foreground/80"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Screen 1: Cosmic Void
const CosmicVoid = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-void-deep"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <img
        src={cosmicNebula}
        alt=""
        loading="eager"
        decoding="async"
        width={1920}
        height={1080}
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <Stars count={80} />

      <div className="relative z-10 text-center max-w-2xl px-8">
        <motion.p
          className="text-xl md:text-2xl font-light tracking-widest text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        >
          Before the world…
        </motion.p>
        <motion.p
          className="text-xl md:text-2xl font-light tracking-widest text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1.5 }}
        >
          Before thought…
        </motion.p>
        <motion.p
          className="text-xl md:text-2xl font-light tracking-widest text-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 1.5 }}
        >
          Before identity…
        </motion.p>
        <motion.p
          className="text-2xl md:text-3xl font-display font-light tracking-wide text-gradient-sunrise"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 5.5, duration: 2 }}
        >
          There was only awareness.
        </motion.p>

        {/* Golden light at horizon */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, hsl(30 100% 55% / 0.15), transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 6, duration: 2 }}
        />
      </div>
    </motion.div>
  );
};

// Screen 2: Cosmic Sunrise
const CosmicSunrise = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 9000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-void-deep"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <motion.img
        src={cosmicAurora}
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />

      <div className="relative z-10 text-center max-w-2xl px-8">
        <motion.p
          className="text-lg md:text-xl font-light tracking-widest text-foreground mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.5 }}
        >
          For thousands of years
        </motion.p>
        <motion.p
          className="text-lg md:text-xl font-light tracking-widest text-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1.5 }}
        >
          humans searched the universe…
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1.5 }}
        >
          <p className="text-xl md:text-2xl font-light tracking-wide text-foreground mb-1">
            Looking for meaning.
          </p>
          <p className="text-xl md:text-2xl font-light tracking-wide text-foreground mb-1">
            Truth.
          </p>
          <p className="text-xl md:text-2xl font-light tracking-wide text-foreground">
            Freedom.
          </p>
        </motion.div>

        <motion.p
          className="text-2xl md:text-3xl font-display font-light tracking-wide text-glow-golden mt-10 text-gradient-sunrise"
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 6, duration: 2 }}
        >
          But the greatest mystery
          <br />
          was always within.
        </motion.p>
      </div>
    </motion.div>
  );
};

// Screen 3: The Observer
const TheObserver = ({ onComplete }: { onComplete: () => void }) => {
  const handleBegin = () => {
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-void-deep"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <motion.img
        src={cosmicEye}
        alt=""
        width={1024}
        height={1024}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2 }}
      />

      <div className="relative z-10 text-center max-w-2xl px-8">
        <motion.p
          className="text-xl md:text-2xl font-display font-light tracking-wide text-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.5 }}
        >
          The mind creates your reality.
        </motion.p>

        <motion.p
          className="text-xl md:text-2xl font-display font-light tracking-wide text-foreground mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1.5 }}
        >
          But who observes the mind?
        </motion.p>

        <motion.p
          className="text-2xl md:text-4xl font-display font-medium tracking-wide text-gradient-sunrise text-glow mb-12"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 5, duration: 2 }}
        >
          A new era of consciousness
          <br />
          has begun.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={handleBegin}
          className="relative px-10 py-4 rounded-full font-display text-lg tracking-wider
                     bg-gradient-sunrise text-primary-foreground
                     animate-pulse-glow cursor-pointer
                     transition-all duration-300 hover:scale-105"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 7, duration: 1.5 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.98 }}
        >
          Begin the Journey
        </motion.button>
      </div>
    </motion.div>
  );
};

type IntroScreen = "void" | "sunrise" | "observer" | "complete";

const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [screen, setScreen] = useState<IntroScreen>("void");

  const goToSunrise = useCallback(() => setScreen("sunrise"), []);
  const goToObserver = useCallback(() => setScreen("observer"), []);

  return (
    <div className="fixed inset-0 z-50 bg-void-deep">
      <AnimatePresence mode="wait">
        {screen === "void" && <CosmicVoid key="void" onComplete={goToSunrise} />}
        {screen === "sunrise" && (
          <CosmicSunrise key="sunrise" onComplete={goToObserver} />
        )}
        {screen === "observer" && (
          <TheObserver key="observer" onComplete={onComplete} />
        )}
      </AnimatePresence>

      {/* Skip button */}
      {screen !== "observer" && (
        <motion.button
          onClick={onComplete}
          className="fixed bottom-8 right-8 z-50 text-muted-foreground/50 text-sm font-body
                     tracking-wider hover:text-foreground/70 transition-colors cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Skip →
        </motion.button>
      )}
    </div>
  );
};

export default CinematicIntro;
