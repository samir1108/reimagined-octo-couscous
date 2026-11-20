/**
 * Collective Reading Component
 * Per temple.md Section 50: Shared annotations, "10k people reading together"
 * Anonymous shared understanding
 */
import { motion } from "framer-motion";
import { ArrowLeft, Users, Bookmark, MessageSquare } from "lucide-react";
import { useState } from "react";

interface CollectiveAnnotation {
  id: string;
  verseId: string;
  text: string;
  readerCount: number;
  isAnonymous: boolean;
}

interface CollectiveReadingProps {
  textTitle: string;
  verseText: string;
  verseRef: string;
  totalReaders: number;
  annotations: CollectiveAnnotation[];
  onClose: () => void;
  onAddAnnotation: (text: string) => void;
}

export default function CollectiveReading({
  textTitle,
  verseText,
  verseRef,
  totalReaders,
  annotations,
  onClose,
  onAddAnnotation,
}: CollectiveReadingProps) {
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      onAddAnnotation(input.trim());
      setInput("");
      setShowInput(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-white/70 text-xs font-display font-medium">{textTitle}</p>
            <p className="text-white/30 text-[10px] font-display">{verseRef}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-purple-300/50 text-[10px] font-display">
          <Users className="w-3.5 h-3.5" />
          {totalReaders.toLocaleString()} reading
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-16 py-8 max-w-2xl mx-auto">
        {/* Verse */}
        <motion.div
          className="mb-8 p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/70 text-base md:text-lg font-display leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {verseText}
          </p>
        </motion.div>

        {/* Shared annotation indicator */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase">
            Shared Understanding
          </h3>
          <button
            onClick={() => setShowInput(!showInput)}
            className="flex items-center gap-1 text-white/30 text-[10px] font-display hover:text-white/50 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            Add your insight
          </button>
        </div>

        {/* Input */}
        {showInput && (
          <motion.div
            className="mb-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What does this verse mean to you? (Anonymous)"
              rows={2}
              className="w-full bg-transparent text-white/70 text-xs font-display placeholder:text-white/20 outline-none resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowInput(false)}
                className="px-3 py-1 rounded-lg bg-white/[0.06] text-white/40 text-[10px] font-display hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-200/80 text-[10px] font-display hover:bg-amber-500/25 transition-all"
              >
                Share
              </button>
            </div>
          </motion.div>
        )}

        {/* Annotations */}
        <div className="space-y-3">
          {annotations.map((annotation, i) => (
            <motion.div
              key={annotation.id}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <p className="text-white/50 text-xs font-display leading-relaxed mb-2">"{annotation.text}"</p>
              <div className="flex items-center gap-2">
                <span className="text-white/20 text-[10px] font-display flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" />
                  {annotation.readerCount} others understood this deeply
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer message */}
        <motion.div
          className="mt-8 text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + annotations.length * 0.1 }}
        >
          <p className="text-white/20 text-[10px] font-display italic">
            You're not alone. {totalReaders.toLocaleString()} others are walking this path with you.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
