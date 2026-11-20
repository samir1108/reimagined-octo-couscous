import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward } from "lucide-react";
import overture from "@/assets/films/overture.mp4.asset.json";
import loops from "@/assets/films/loops.mp4.asset.json";
import session from "@/assets/films/session.mp4.asset.json";
import masters from "@/assets/films/masters.mp4.asset.json";
import flow from "@/assets/films/flow.mp4.asset.json";
import tenx from "@/assets/films/tenx.mp4.asset.json";
import rareBirth from "@/assets/films/rare-birth.mp4.asset.json";

import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const INTRO_MS = 6000;

const POOL = [overture, loops, session, masters, flow, tenx, rareBirth];

const ExperienceIntro = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [exiting, setExiting] = useState(false);

  const video = useMemo(() => POOL[Math.floor(Math.random() * POOL.length)], []);

  const goNext = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => navigate("/experience", { replace: true }), 500);
  };

  useEffect(() => {
    const t = setTimeout(goNext, INTRO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          <video
            ref={videoRef}
            src={video.url}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

          {/* Skip */}
          <button
            onClick={goNext}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-sm hover:bg-white/20 transition"
          >
            Skip <SkipForward className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExperienceIntro;
