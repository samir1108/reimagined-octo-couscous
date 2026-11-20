import { motion } from "framer-motion";
import { ArrowLeft, Phone, Shield, HeartPulse, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { Guru } from "@/lib/guru-data";
import { GURUS as MASTERS } from "@/lib/guru-data";
import { getCrisisResources } from "@/lib/safety/crisisResources";
import { track } from "@/lib/observability";

interface EmergencySanctuaryProps {
  onClose: () => void;
  onSitWithMaster: (guru: Guru) => void;
}

type EmergencyMode = "select" | "dark-thoughts" | "overwhelmed" | "listener" | null;

export default function EmergencySanctuary({ onClose, onSitWithMaster }: EmergencySanctuaryProps) {
  const [mode, setMode] = useState<EmergencyMode>(null);
  const crisis = getCrisisResources();
  const localLines = [...crisis.resources, ...crisis.global];

  useEffect(() => {
    track("crisis_resources_opened", { region: crisis.region?.id ?? "global" });
  }, [crisis.region?.id]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/80" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Shield className="w-5 h-5 text-amber-400/60" />
          <h2 className="text-white/70 text-sm font-display tracking-wider">Emergency Sanctuary</h2>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6">
        {/* Crisis Disclaimer */}
        <motion.div
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-2">
            <HeartPulse className="w-5 h-5 text-red-400/60 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200/80 text-sm font-display font-medium mb-1">Important Notice</p>
              <p className="text-red-200/50 text-xs font-display leading-relaxed">
                This Temple provides spiritual support and practices. It does NOT replace professional
                medical or psychological treatment. If you are in crisis, please reach out to the
                resources below.
              </p>
            </div>
          </div>
        </motion.div>

        {!mode ? (
          <>
            <div className="text-center mb-6">
              <p className="text-white/20 text-[10px] font-display tracking-[0.4em] uppercase mb-2">
                You are safe here
              </p>
              <h3 className="text-white/80 text-lg font-display tracking-wide">
                What do you need right now?
              </h3>
            </div>

            <div className="space-y-3">
              {/* Dark Thoughts */}
              <motion.button
                onClick={() => setMode("dark-thoughts")}
                className="w-full text-left p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                    <span className="text-lg">🌑</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm font-display font-medium">Dark Thoughts</p>
                    <p className="text-white/30 text-xs font-display">Resources for suicidal thoughts or deep despair</p>
                  </div>
                </div>
              </motion.button>

              {/* Overwhelmed */}
              <motion.button
                onClick={() => setMode("overwhelmed")}
                className="w-full text-left p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                    <span className="text-lg">🌊</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm font-display font-medium">Overwhelmed</p>
                    <p className="text-white/30 text-xs font-display">5-minute grounding practice</p>
                  </div>
                </div>
              </motion.button>

              {/* Need Listener */}
              <motion.button
                onClick={() => setMode("listener")}
                className="w-full text-left p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                    <span className="text-lg">🙏</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm font-display font-medium">Need a Listener</p>
                    <p className="text-white/30 text-xs font-display">Sit with a master in silence</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </>
        ) : mode === "dark-thoughts" ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setMode(null)}
              className="text-white/40 text-xs font-display mb-4 hover:text-white/60 transition-colors"
            >
              ← Back
            </button>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
              <p className="text-purple-200/80 text-sm font-display leading-relaxed">
                Having dark thoughts doesn't make you bad. It makes you human.
                Please reach out to one of these resources — they are free, confidential, and available 24/7.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
              <p className="text-red-200/70 text-xs font-display leading-relaxed">
                If you are in immediate danger, call your local emergency number
                {crisis.region ? ` (${crisis.emergency} in ${crisis.region.label})` : " (112 in most countries)"}.
              </p>
            </div>

            {localLines.map((resource) => (
              <div
                key={resource.name}
                className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]"
              >
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-400/60 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white/80 text-sm font-display font-medium">{resource.name}</p>
                    <p className="text-amber-300/80 text-lg font-display font-bold mt-1">{resource.contact}</p>
                    <p className="text-white/30 text-xs font-display mt-1">{resource.description}</p>
                    {resource.href && (
                      <a
                        href={resource.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-amber-400/50 text-xs font-display mt-2 hover:text-amber-400/70 transition-colors"
                      >
                        Visit website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : mode === "overwhelmed" ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setMode(null)}
              className="text-white/40 text-xs font-display mb-4 hover:text-white/60 transition-colors"
            >
              ← Back
            </button>

            <div className="text-center">
              <h3 className="text-white/70 text-lg font-display mb-2">5-Minute Grounding</h3>
              <p className="text-white/30 text-xs font-display mb-6">Let's calm the nervous system together</p>
            </div>

            <div className="space-y-3">
              {[
                { step: "1", title: "Breathe", instruction: "4 counts in, hold 4, out 4" },
                { step: "2", title: "Feel Your Feet", instruction: "Press them into the ground. You are here." },
                { step: "3", title: "Name 5 Things", instruction: "5 things you can see, 4 you can touch, 3 you can hear" },
                { step: "4", title: "Place Hand on Heart", instruction: "Feel the beat. You are alive. You are here." },
                { step: "5", title: "Whisper", instruction: "'This too shall pass. I am safe right now.'" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-300/70 text-xs font-display font-bold">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-display font-medium">{item.title}</p>
                      <p className="text-white/30 text-xs font-display">{item.instruction}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setMode(null)}
              className="text-white/40 text-xs font-display mb-4 hover:text-white/60 transition-colors"
            >
              ← Back
            </button>

            <div className="text-center mb-4">
              <h3 className="text-white/70 text-lg font-display mb-2">Sit with a Master</h3>
              <p className="text-white/30 text-xs font-display">No words needed. Just presence.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "siddh", label: "Siddh", sub: "Stillness & Peace" },
                { id: "tara", label: "Tara", sub: "Compassion & Healing" },
                { id: "meera", label: "Meera", sub: "Love & Devotion" },
                { id: "aarav", label: "Aarav", sub: "Observation & Clarity" },
              ].map((guide, i) => {
                const guru = MASTERS.find(g => g.id === guide.id);
                if (!guru) return null;
                return (
                  <motion.button
                    key={i}
                    onClick={() => onSitWithMaster(guru)}
                    className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-lg font-display text-white/40 mx-auto mb-2">
                      {guide.label.charAt(0)}
                    </div>
                    <p className="text-white/60 text-xs font-display">{guide.label}</p>
                    <p className="text-white/25 text-[10px] font-display mt-1">{guide.sub}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
