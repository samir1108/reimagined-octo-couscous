import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { playTempleBell } from "@/lib/templeSounds";
import templeEntranceImg from "@/assets/temple-entrance.jpg";
import { useState } from "react";

interface TempleEntranceProps {
  onEnter: () => void;
}

export default function TempleEntrance({ onEnter }: TempleEntranceProps) {
  const [bellRung, setBellRung] = useState(false);

  const handleBellTap = () => {
    playTempleBell();
    setBellRung(true);
    setTimeout(() => setBellRung(false), 2000);
  };
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Temple interior background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65)), url(${templeEntranceImg})`,
          }}
        />

        {/* Incense smoke effect */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-64"
          style={{
            background: "radial-gradient(ellipse at center, rgba(212,165,116,0.08) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{
            y: [-20, -60, -20],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Candle flames */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${30 + i * 10}%`,
              bottom: `${15 + (i % 2) * 10}%`,
              background: "radial-gradient(circle, rgba(255,183,77,0.9), rgba(255,152,0,0.3), transparent)",
              boxShadow: "0 0 20px rgba(255,152,0,0.5)",
            }}
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + (i * 0.3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Golden glow center */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(212,165,116,0.12) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.2 }}
      >
        {/* Sacred symbol / Bell */}
        <motion.div
          className="mb-8 cursor-pointer"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          onClick={handleBellTap}
        >
          {bellRung ? (
            <motion.div
              className="text-amber-300/60"
              animate={{ rotate: [0, 15, -12, 8, -5, 3, 0] }}
              transition={{ duration: 2 }}
            >
              <Bell className="w-16 h-16" />
            </motion.div>
          ) : (
            <Bell className="w-16 h-16 text-amber-300/60" />
          )}
        </motion.div>

        <motion.h1
          className="text-white/90 text-3xl md:text-5xl font-display tracking-wider mb-4"
          style={{ fontFamily: "'Cinzel', 'Space Grotesk', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Welcome to the Temple
        </motion.h1>

        <motion.p
          className="text-white/40 text-base md:text-lg font-display italic max-w-md"
          style={{ fontFamily: "'Cormorant Garamond', 'DM Sans', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          Where masters await and wisdom flows
        </motion.p>
      </motion.div>

      {/* Enter button */}
      <motion.div
        className="relative z-10 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.button
          onClick={onEnter}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/30 text-amber-200/90 text-sm font-display tracking-widest uppercase hover:from-amber-600/40 hover:to-orange-600/40 hover:border-amber-500/50 transition-all duration-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Enter Temple
        </motion.button>
      </motion.div>

      {/* Bottom text */}
      <motion.p
        className="absolute bottom-8 left-0 right-0 text-center text-white/15 text-[10px] font-display tracking-[0.3em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        breathe deeply · be still · witness
      </motion.p>
    </motion.div>
  );
}
