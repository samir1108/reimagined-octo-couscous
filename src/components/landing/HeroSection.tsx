import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useLandingVideoPlaylist } from "@/hooks/useLandingVideoPlaylist";

const HeroSection = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { src: videoSrc, handleEnded } = useLandingVideoPlaylist();

  const enableSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    v.play().catch(() => {});
  }, []);

  // Try unmuted playback first; browsers require a gesture, so fall back to
  // muted autoplay and lift the mute on the first user interaction.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        v.muted = true;
        v.play().catch(() => {});
        window.addEventListener("pointerdown", enableSound, { once: true });
        window.addEventListener("touchstart", enableSound, { once: true });
        window.addEventListener("keydown", enableSound, { once: true });
      });
    }
  }, [videoSrc, enableSound]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 z-0 w-full h-full object-cover"
        autoPlay
        playsInline
        preload="auto"
        onEnded={handleEnded}
      />

      <div className="absolute inset-0 bg-black/45" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 30%, transparent 55%, hsl(var(--background)) 100%)",
        }}
      />

      <div className="relative z-10 text-center max-w-4xl px-6 pt-20">
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.95] mb-4 text-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="text-white">Consciousness Operation System</span>
        </motion.h1>

        <motion.p
          className="text-sm md:text-base font-body tracking-[0.3em] uppercase text-primary/80 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          The Yogic Companion
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <button
            onClick={() => navigate("/app")}
            className="group px-8 py-4 rounded-full border border-white/25 text-white font-display font-medium text-lg tracking-wide hover:bg-white/10 transition-all flex items-center gap-2"
          >
            Go to App
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#cos-how"
            className="px-6 py-3 rounded-full text-sm font-body text-white/70 hover:text-white border border-transparent hover:border-white/20 transition-all"
          >
            See how it works
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
