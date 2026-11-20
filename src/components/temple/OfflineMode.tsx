/**
 * Offline Mode UI
 * Per temple.md Section 25: What works offline, download system
 */
import { motion } from "framer-motion";
import { WifiOff, Download, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

interface OfflineModeProps {
  onContinuePractice: () => void;
  onViewOfflineContent: () => void;
}

const DOWNLOADABLE_CONTENT = [
  { id: "journey-krishna", label: "100-Day Journey (Krishna)", size: "15MB", type: "journey" },
  { id: "library-gita", label: "Sacred Library (Bhagavad Gita)", size: "5MB", type: "text" },
  { id: "practices-all", label: "Practices (All Timer Modes)", size: "20MB", type: "practice" },
  { id: "program-llms", label: "Program: Decode Your Inner LLMs", size: "12MB", type: "program" },
];

export function OfflineBanner() {
  return (
    <motion.div
      className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400/60" />
      <p className="text-amber-200/60 text-[10px] font-display">Temple Offline Mode</p>
    </motion.div>
  );
}

export function OfflineModeScreen({ onContinuePractice, onViewOfflineContent }: OfflineModeProps) {
  const [downloads, setDownloads] = useState<Record<string, boolean>>({
    "journey-krishna": true,
    "library-gita": true,
  });
  const [showDownloads, setShowDownloads] = useState(false);

  if (showDownloads) {
    const totalSize = DOWNLOADABLE_CONTENT.filter((c) => downloads[c.id]).length * 13; // rough estimate

    return (
      <motion.div
        className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <button onClick={() => setShowDownloads(false)} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            ←
          </button>
          <h2 className="text-white/70 text-sm font-display tracking-wider">Offline Content</h2>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none p-4">
          <p className="text-white/30 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
            Downloadable Content
          </p>

          <div className="space-y-2 mb-6">
            {DOWNLOADABLE_CONTENT.map((content) => (
              <div
                key={content.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDownloads((prev) => ({ ...prev, [content.id]: !prev[content.id] }))}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      downloads[content.id]
                        ? "bg-amber-500/30 border-amber-500/50"
                        : "border-white/[0.15]"
                    }`}
                  >
                    {downloads[content.id] && <span className="text-[10px] text-amber-300/80">✓</span>}
                  </button>
                  <div>
                    <p className="text-white/60 text-xs font-display">{content.label}</p>
                    <p className="text-white/25 text-[10px] font-display">{content.size}</p>
                  </div>
                </div>
                {downloads[content.id] && (
                  <span className="text-emerald-400/40 text-[10px] font-display">Downloaded</span>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between mb-4">
            <p className="text-white/40 text-xs font-display">Total storage used</p>
            <p className="text-white/60 text-sm font-display font-bold">~{totalSize}MB</p>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/40 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-all flex items-center justify-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-200/80 text-xs font-display tracking-wider hover:bg-amber-500/25 transition-all flex items-center justify-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download All
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <WifiOff className="w-12 h-12 text-amber-400/40 mb-6" />
      <h3 className="text-white/70 text-lg font-display mb-2">📴 Temple Offline Mode</h3>
      <p className="text-white/30 text-sm font-display text-center max-w-sm mb-2">
        Timer practices, reading, and journaling work offline.
      </p>
      <p className="text-white/20 text-xs font-display text-center max-w-sm mb-8">
        Chat with masters requires internet. Your progress is saved locally and syncs when you're back.
      </p>

      <div className="w-full max-w-sm space-y-2">
        <button
          onClick={onContinuePractice}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/20 text-amber-200/70 text-sm font-display tracking-wider hover:from-amber-600/30 hover:to-orange-600/30 transition-all"
        >
          Continue Practice
        </button>
        <button
          onClick={onViewOfflineContent}
          className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/40 text-sm font-display tracking-wider hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
        >
          View Offline Content
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowDownloads(true)}
          className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 text-xs font-display tracking-wider hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          Manage Downloads
        </button>
      </div>
    </motion.div>
  );
}
