/**
 * CinematicProcessing — animated processing screen shown while the
 * engine computes metrics from the 75 answers.
 */

import { motion } from "framer-motion";
import { Brain, Zap, Shield, Heart } from "lucide-react";

const STAGES = [
  { icon: Brain, label: "Reading patterns", sub: "Mapping your answers to consciousness dimensions" },
  { icon: Zap, label: "Computing V-Level", sub: "Assessing emergent freedom across all faculties" },
  { icon: Shield, label: "Tracing loops", sub: "Identifying active samskara patterns and their families" },
  { icon: Heart, label: "Weaving metrics", sub: "Synthesising integration, witness, and path scores" },
];

export default function CinematicProcessing() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900" />

      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full border border-white/5"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-8 max-w-lg">
        {/* Title */}
        <motion.h2
          className="text-2xl font-display font-bold text-white/90 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          The engine is working
        </motion.h2>
        <motion.p
          className="text-white/40 font-body text-sm mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Reading 75 answers across 25 dimensions
        </motion.p>

        {/* Stages */}
        <div className="space-y-4">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.label}
              className="flex items-center gap-4 px-4 py-3 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.6 }}
            >
              <motion.div
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0"
                animate={{
                  borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0.1)"],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              >
                <stage.icon className="w-4 h-4 text-white/60" />
              </motion.div>
              <div className="text-left">
                <p className="text-white/70 text-sm font-body">{stage.label}</p>
                <p className="text-white/30 text-[11px] font-body">{stage.sub}</p>
              </div>
              <motion.div
                className="ml-auto w-2 h-2 rounded-full bg-white/40"
                animate={{ scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
