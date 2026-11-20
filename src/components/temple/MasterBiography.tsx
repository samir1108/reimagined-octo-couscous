/**
 * TEMPLE - Biography & Stories Component
 * Per temple.md Section 25: Master biographies, life stories, recommendations
 */
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, ChevronRight, Play } from "lucide-react";
import { useState } from "react";

interface BiographyChapter {
  id: string;
  title: string;
  content: string;
  order: number;
  readTimeMinutes: number;
}

interface MasterStory {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  readTimeMinutes: number;
  themes: string[];
  moral: string;
}

interface BiographyProps {
  masterName: string;
  masterImage: string;
  chapters: BiographyChapter[];
  stories: MasterStory[];
  onBack: () => void;
}

export default function MasterBiography({
  masterName,
  masterImage,
  chapters,
  stories,
  onBack,
}: BiographyProps) {
  const [view, setView] = useState<"overview" | "chapter" | "story">("overview");
  const [selectedChapter, setSelectedChapter] = useState<BiographyChapter | null>(null);
  const [selectedStory, setSelectedStory] = useState<MasterStory | null>(null);

  const recommendations = [
    { label: "Start Here", text: "Bhagavad Gita Ch. 2" },
    { label: "For Beginners", text: "Introduction to the Teachings" },
    { label: "Most Powerful Story", text: "The Meeting on the Battlefield" },
    { label: "If You Read One Thing", text: "Chapter 2, Verse 47" },
  ];

  if (view === "chapter" && selectedChapter) {
    return (
      <motion.div
        className="fixed inset-0 z-[65] flex flex-col bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => setView("overview")}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-display font-medium">{masterName}</p>
            <p className="text-white/30 text-[10px] font-display tracking-wider">{selectedChapter.title}</p>
          </div>
          <span className="flex items-center gap-1 text-white/25 text-[10px] font-display">
            <Clock className="w-3 h-3" />
            {selectedChapter.readTimeMinutes} min
          </span>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-16 py-8 max-w-2xl mx-auto">
          <motion.div
            key={selectedChapter.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/70 text-sm md:text-base font-display leading-relaxed whitespace-pre-wrap">
              {selectedChapter.content}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (view === "story" && selectedStory) {
    return (
      <motion.div
        className="fixed inset-0 z-[65] flex flex-col bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => setView("overview")}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-display font-medium">{selectedStory.title}</p>
            <p className="text-white/30 text-[10px] font-display tracking-wider">{selectedStory.subtitle}</p>
          </div>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-16 py-8 max-w-2xl mx-auto">
          <motion.div
            key={selectedStory.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/70 text-sm md:text-base font-display leading-relaxed whitespace-pre-wrap mb-8">
              {selectedStory.content}
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-6" />
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-amber-200/60 text-[10px] font-display tracking-[0.3em] uppercase mb-1">
                Teaching
              </p>
              <p className="text-white/50 text-sm font-display italic">{selectedStory.moral}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[65] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img src={masterImage} alt="" className="w-full h-full object-cover object-top opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-white/80 text-sm font-display font-medium">📖 The Life of {masterName}</h2>
          <p className="text-white/30 text-[10px] font-display tracking-wider">Interactive Biography</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6">
        {/* Chapters */}
        <div className="mb-8">
          <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
            Chapters
          </h3>
          <div className="space-y-2">
            {chapters.map((chapter, i) => (
              <motion.button
                key={chapter.id}
                onClick={() => {
                  setSelectedChapter(chapter);
                  setView("chapter");
                }}
                className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs font-display font-medium">
                      {chapter.order}. {chapter.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/20 text-[10px] font-display">
                      {chapter.readTimeMinutes} min
                    </span>
                    <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stories */}
        {stories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
              Stories of {masterName}
            </h3>
            <div className="space-y-2">
              {stories.map((story, i) => (
                <motion.button
                  key={story.id}
                  onClick={() => {
                    setSelectedStory(story);
                    setView("story");
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-white/60 text-xs font-display font-medium">{story.title}</p>
                      <p className="text-white/30 text-[10px] font-display mt-0.5">{story.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-white/20 text-[9px] font-display flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {story.readTimeMinutes} min read
                        </span>
                        {story.themes.slice(0, 2).map((theme, j) => (
                          <span key={j} className="text-white/15 text-[9px] font-display">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mb-6">
          <h3 className="text-white/40 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
            Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
              >
                <p className="text-white/25 text-[10px] font-display tracking-wider mb-0.5">{rec.label}</p>
                <p className="text-white/50 text-xs font-display">{rec.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
