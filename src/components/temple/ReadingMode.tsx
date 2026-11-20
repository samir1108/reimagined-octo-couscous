/**
 * TEMPLE - Reading Mode for Sacred Texts
 * Per temple.md Screen 8: Verse text, master commentary, cross-references, bookmark, annotate
 */
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  BookOpen,
  Languages,
} from "lucide-react";
import { useState } from "react";

interface SacredVerse {
  id: string;
  number: string;
  sanskrit?: string;
  translation: string;
  commentary?: string;
}

interface ReadingModeProps {
  textTitle: string;
  chapterTitle: string;
  verses: SacredVerse[];
  currentVerseIdx: number;
  onClose: () => void;
  onNavigate: (verseIdx: number) => void;
}

export default function ReadingMode({
  textTitle,
  chapterTitle,
  verses,
  currentVerseIdx,
  onClose,
  onNavigate,
}: ReadingModeProps) {
  const [showSanskrit, setShowSanskrit] = useState(false);
  const [showCommentary, setShowCommentary] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);

  const currentVerse = verses[currentVerseIdx];
  const isBookmarked = bookmarks.has(currentVerse.id);

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(currentVerse.id)) {
        next.delete(currentVerse.id);
      } else {
        next.add(currentVerse.id);
      }
      return next;
    });
  };

  const saveAnnotation = (verseId: string, text: string) => {
    setAnnotations((prev) => ({ ...prev, [verseId]: text }));
    setEditingAnnotation(null);
  };

  const goNext = () => {
    if (currentVerseIdx < verses.length - 1) {
      onNavigate(currentVerseIdx + 1);
    }
  };

  const goPrev = () => {
    if (currentVerseIdx > 0) {
      onNavigate(currentVerseIdx - 1);
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
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-white/70 text-xs font-display font-medium">{textTitle}</p>
            <p className="text-white/30 text-[10px] font-display">{chapterTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSanskrit(!showSanskrit)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              showSanskrit
                ? "bg-amber-500/15 text-amber-300/70"
                : "bg-white/[0.06] text-white/40 hover:text-white/70"
            }`}
            title="Toggle Sanskrit"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            onClick={toggleBookmark}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isBookmarked
                ? "bg-amber-500/15 text-amber-300/70"
                : "bg-white/[0.06] text-white/40 hover:text-white/70"
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowCommentary(!showCommentary)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              showCommentary
                ? "bg-amber-500/15 text-amber-300/70"
                : "bg-white/[0.06] text-white/40 hover:text-white/70"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] scrollbar-none">
        {/* Verse Navigation */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
          <button
            onClick={goPrev}
            disabled={currentVerseIdx === 0}
            className="flex items-center gap-1 text-white/30 text-xs font-display disabled:opacity-20 hover:text-white/50 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Previous
          </button>
          <span className="text-white/40 text-[10px] font-display tracking-wider">
            Verse {currentVerse.number} · {currentVerseIdx + 1} of {verses.length}
          </span>
          <button
            onClick={goNext}
            disabled={currentVerseIdx === verses.length - 1}
            className="flex items-center gap-1 text-white/30 text-xs font-display disabled:opacity-20 hover:text-white/50 transition-colors"
          >
            Next
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Verse Content */}
        <div className="px-4 md:px-16 py-8 max-w-2xl mx-auto">
          {/* Sanskrit (if toggled) */}
          <AnimatePresence>
            {showSanskrit && currentVerse.sanskrit && (
              <motion.div
                className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white/30 text-sm font-devanagari leading-relaxed text-center">
                  {currentVerse.sanskrit}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Translation */}
          <motion.div
            key={currentVerse.id}
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/80 text-lg md:text-xl font-display leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {currentVerse.translation}
            </p>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-8" />

          {/* Commentary */}
          <AnimatePresence>
            {showCommentary && currentVerse.commentary && (
              <motion.div
                className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400/50" />
                  <p className="text-amber-200/50 text-[10px] font-display tracking-[0.3em] uppercase">
                    Master Commentary
                  </p>
                </div>
                <p className="text-white/50 text-sm font-display leading-relaxed">{currentVerse.commentary}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Annotation */}
          <div className="mb-6">
            {editingAnnotation === currentVerse.id ? (
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <textarea
                  autoFocus
                  defaultValue={annotations[currentVerse.id] || ""}
                  placeholder="Your notes..."
                  rows={3}
                  className="w-full bg-transparent text-white/70 text-xs font-display placeholder:text-white/20 outline-none resize-none"
                  onBlur={(e) => saveAnnotation(currentVerse.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveAnnotation(currentVerse.id, (e.target as HTMLTextAreaElement).value);
                    }
                  }}
                />
              </div>
            ) : annotations[currentVerse.id] ? (
              <div
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-colors"
                onClick={() => setEditingAnnotation(currentVerse.id)}
              >
                <p className="text-white/40 text-xs font-display italic">
                  "{annotations[currentVerse.id]}"
                </p>
              </div>
            ) : (
              <button
                onClick={() => setEditingAnnotation(currentVerse.id)}
                className="w-full p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-white/20 text-xs font-display hover:bg-white/[0.04] transition-colors text-center"
              >
                Add annotation...
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
