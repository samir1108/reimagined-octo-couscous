import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import type { Guru, GuruPractice } from "@/lib/guru-data";
import InteractivePracticeSession from "./InteractivePracticeSession";
import SensorialPracticeSession from "./sensorial/SensorialPracticeSession";
import { findSensorialManifest } from "@/data/sensorialPractices";

type Props = {
  guru: Guru | null;
  onClose: () => void;
};

/* ─── Practice list sheet ─── */
export default function GuruPracticeSheet({ guru, onClose }: Props) {
  const [activePractice, setActivePractice] = useState<GuruPractice | null>(null);

  const handleClose = () => {
    setActivePractice(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {guru && (
        <>
          {/* Practice list view */}
          {!activePractice && (
            <motion.div
              key="practice-list"
              className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Background */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <img src={guru.bgImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
              </motion.div>

              {/* Back + Breadcrumbs */}
              <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                <motion.button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.button>
                <motion.div
                  className="flex items-center gap-1.5 text-white/25 text-[10px] font-display tracking-wider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="hover:text-white/50 cursor-pointer transition-colors" onClick={handleClose}>Temple</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-white/50">{guru.name}</span>
                </motion.div>
              </div>

              {/* Content */}
              <motion.div
                className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto px-5 md:px-8 pb-8 pt-16 md:pt-8"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: "spring", damping: 25, delay: 0.1 }}
              >
                {/* Header */}
                <motion.div
                  className="flex items-center gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <img
                    src={guru.image}
                    alt={guru.name}
                    className="w-16 h-16 rounded-2xl object-cover object-top ring-1 ring-white/20 shadow-2xl"
                  />
                  <div>
                    <h2 className="text-white text-xl font-display font-semibold tracking-tight">{guru.name}</h2>
                    <p className="text-white/35 text-[11px] font-display tracking-[0.2em] uppercase mt-0.5">{guru.title}</p>
                  </div>
                </motion.div>

                {/* Quote */}
                <motion.div
                  className="mb-8 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <p className="text-white/30 text-xs italic font-display leading-relaxed text-center">
                    "{guru.quote}"
                  </p>
                </motion.div>

                {/* Section label */}
                <motion.p
                  className="text-white/25 text-[10px] font-display tracking-[0.3em] uppercase mb-4 px-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Sacred Practices
                </motion.p>

                {/* Practice cards — tap to enter cinematic mode */}
                <div className="space-y-3">
                  {guru.practices.map((practice, i) => (
                    <motion.button
                      key={practice.name}
                      onClick={() => setActivePractice(practice)}
                      className="w-full text-left p-4 md:p-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.1] transition-all duration-300 group"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.1, type: "spring", damping: 20 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white/90 text-sm md:text-base font-display font-medium leading-tight">
                            {practice.name}
                          </h3>
                          <p className="text-white/35 text-xs leading-relaxed mt-1 line-clamp-2">
                            {practice.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 text-white/25 text-[10px] font-display">
                            <Clock className="w-3 h-3" />
                            {practice.duration}
                          </span>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Cinematic practice experience — uses Sensorial player if a
              manifest exists for this guru+practice, else legacy chat flow. */}
          <AnimatePresence>
            {activePractice && (() => {
              const manifest = findSensorialManifest(guru.id, activePractice.name);
              return manifest ? (
                <SensorialPracticeSession
                  manifest={manifest}
                  guru={guru}
                  onBack={() => setActivePractice(null)}
                />
              ) : (
                <InteractivePracticeSession
                  practice={activePractice}
                  guru={guru}
                  onBack={() => setActivePractice(null)}
                />
              );
            })()}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
