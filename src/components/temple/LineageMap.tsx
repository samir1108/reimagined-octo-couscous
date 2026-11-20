/**
 * Lineage Map Component
 * Per temple.md Section 37: Visual family tree showing master lineage
 * "You're walking a path 5,000 years old."
 */
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface LineageMaster {
  id: string;
  name: string;
  image: string;
  era: string;
}

interface LineageMapProps {
  lineage: LineageMaster[];
  onClose: () => void;
}

export default function LineageMap({ lineage, onClose }: LineageMapProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-white/70 text-sm font-display tracking-wider">Your Lineage</h2>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-8">
        <div className="text-center mb-8">
          <p className="text-white/20 text-[10px] font-display tracking-[0.4em] uppercase mb-2">📿 Your Lineage</p>
          <h3 className="text-white/70 text-lg font-display mb-2">5,000 Years of Wisdom</h3>
          <p className="text-white/30 text-xs font-display italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            "You're walking a path thousands of masters walked before you."
          </p>
        </div>

        {/* Lineage Tree */}
        <div className="flex flex-col items-center max-w-sm mx-auto">
          {lineage.map((master, i) => (
            <motion.div
              key={master.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.2 }}
            >
              {/* Master card */}
              <div
                className={`p-3 rounded-xl border text-center w-48 ${
                  master.id === "you"
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-white/[0.03] border-white/[0.06]"
                }`}
              >
                {master.id !== "you" ? (
                  <img
                    src={master.image}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover object-top ring-1 ring-white/10 mx-auto mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center text-lg font-display text-amber-300/60 mx-auto mb-2">
                    Y
                  </div>
                )}
                <p
                  className={`text-xs font-display font-medium ${
                    master.id === "you" ? "text-amber-200/70" : "text-white/60"
                  }`}
                >
                  {master.name}
                </p>
                <p className="text-white/25 text-[10px] font-display mt-0.5">{master.era}</p>
              </div>

              {/* Connector line */}
              {i < lineage.length - 1 && (
                <motion.div
                  className="w-px h-6 bg-gradient-to-b from-white/15 to-white/5 my-1"
                  initial={{ height: 0 }}
                  animate={{ height: 24 }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer message */}
        <motion.div
          className="mt-8 text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + lineage.length * 0.2 }}
        >
          <p className="text-white/30 text-xs font-display italic">
            This lineage is not inherited by birth — but by practice.
            <br />
            Every day you sit, you honor these masters.
            <br />
            Every day you return, you continue their work.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
