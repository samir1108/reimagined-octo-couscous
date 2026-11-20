/**
 * Initiation Ceremony - Before 100-Day Journey
 * Per temple.md Section 31
 */
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useState } from "react";

interface InitiationCeremonyProps {
  masterName: string;
  masterImage: string;
  totalDays: number;
  onBegin: () => void;
  onNotReady: () => void;
}

export default function InitiationCeremony({
  masterName,
  masterImage,
  totalDays,
  onBegin,
  onNotReady,
}: InitiationCeremonyProps) {
  const [step, setStep] = useState(0);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(212,165,116,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-md">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={masterImage}
              alt=""
              className="w-20 h-20 rounded-full object-cover object-top ring-2 ring-white/10 mx-auto mb-6"
            />
            <motion.p
              className="text-white/20 text-[10px] font-display tracking-[0.4em] uppercase mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Initiation Ceremony
            </motion.p>
            <motion.h2
              className="text-white/80 text-2xl font-display tracking-wide mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {totalDays} Days with {masterName}
            </motion.h2>
            <motion.p
              className="text-white/30 text-sm font-display mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              I, the seeker, commit to this path. I understand there will be days of clarity and confusion.
            </motion.p>
            <motion.p
              className="text-white/25 text-xs font-display italic mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              "I vow to return when I fall off, without guilt or shame."
            </motion.p>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                I Commit
              </motion.button>
              <motion.button
                onClick={onNotReady}
                className="flex-1 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/40 text-sm font-display tracking-wider hover:bg-white/[0.1] transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Not Yet Ready
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Bell animation */}
            <motion.div
              className="text-6xl mb-6"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.9, 1.1, 0.9],
                rotate: [0, 15, -12, 8, -5, 3, 0],
              }}
              transition={{ duration: 3, ease: "easeInOut" }}
            >
              🔔
            </motion.div>

            <motion.p
              className="text-white/80 text-lg font-display mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              The Temple witnesses your commitment.
            </motion.p>

            <motion.p
              className="text-white/30 text-sm font-display italic mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              {masterName} walks with you for {totalDays} days.
            </motion.p>

            <motion.button
              onClick={onBegin}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Begin the Journey
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
