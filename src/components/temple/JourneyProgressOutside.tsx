/**
 * Screen 14: Journey Progress (Outside Temple)
 * Light info only - "Deep work only inside Temple"
 * Per temple.md Section 6, Screen 14
 */
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Map, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";

export default function JourneyProgressOutside() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Seo
        title="The 500-Day Journey — ConsciousOS"
        description="A spiral journey from conditioning to consciousness across 500 days, organized in Foundation, Deepening and Integration phases."
        canonicalPath="/journey"
      />
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-white/70 text-sm font-display tracking-wider">Your Journey</h2>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6">
        {/* Sacred boundary message */}
        <motion.div
          className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-amber-200/60 text-xs font-display leading-relaxed italic">
            "Deep work only inside Temple walls. Enter the Temple for your daily practice."
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Time", value: "42h 15m", icon: <Clock className="w-4 h-4" /> },
            { label: "Days", value: "79", icon: <Sparkles className="w-4 h-4" /> },
            { label: "Journeys", value: "1", icon: <Map className="w-4 h-4" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="flex justify-center mb-1 text-white/30">{stat.icon}</div>
              <p className="text-white/70 text-sm font-display font-semibold">{stat.value}</p>
              <p className="text-white/30 text-[9px] font-display tracking-wider mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Streak with Master's Wisdom */}
        <motion.div
          className="mb-6 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400/50" />
            <p className="text-white/50 text-xs font-display">Current Streak</p>
          </div>
          <p className="text-white/80 text-2xl font-display font-bold mb-2">12 days</p>
          <p className="text-white/30 text-xs font-display italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            "12 days. Krishna has been with you through joy and resistance. Continue."
          </p>
        </motion.div>

        {/* Active Journeys */}
        <div className="mb-6">
          <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
            Active Journeys
          </h3>
          <div className="space-y-2">
            {[
              { master: "Krishna", day: 67, total: 100, program: "100-Day Journey" },
              { master: "Modern Sage", day: 12, total: 21, program: "Decode Your Inner LLMs" },
            ].map((j, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white/60 text-xs font-display font-medium">{j.master}</p>
                    <p className="text-white/30 text-[10px] font-display">{j.program}</p>
                  </div>
                  <p className="text-white/40 text-xs font-display">Day {j.day}/{j.total}</p>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500/40 to-orange-500/40 rounded-full"
                    style={{ width: `${(j.day / j.total) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Completed Journeys */}
        <div className="mb-6">
          <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
            Completed Journeys
          </h3>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100/60 text-xs font-display font-medium">Buddha</p>
                <p className="text-emerald-100/30 text-[10px] font-display">100-Day Journey · Completed Dec 20, 2025</p>
              </div>
              <p className="text-emerald-400/40 text-[10px] font-display italic">
                "The path is now in you."
              </p>
            </div>
          </div>
        </div>

        {/* Active Programs */}
        <div className="mb-6">
          <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
            Active Programs
          </h3>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-display font-medium">Decode Your Inner LLMs</p>
                <p className="text-white/30 text-[10px] font-display">Day 12/21 · Modern Sage</p>
              </div>
              <span className="text-amber-400/40 text-[10px] font-display">In Progress</span>
            </div>
          </div>
        </div>

        {/* CTA - Enter Temple */}
        <motion.button
          onClick={() => navigate("/app/temple")}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/20 text-amber-200/70 text-sm font-display tracking-wider hover:from-amber-600/30 hover:to-orange-600/30 transition-all flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          Enter Temple for Practice
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
