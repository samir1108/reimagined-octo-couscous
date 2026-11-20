import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Clock, ChevronRight, Dice5 } from "lucide-react";
import { useState } from "react";
import { ALL_SACRED_TEXTS } from "@/lib/sacred-texts";
import ReadingMode from "./ReadingMode";

const SACRED_VERSES = [
  { text: "You have a right to perform your duties, but you are not entitled to the fruits of your actions.", source: "Bhagavad Gita 2.47" },
  { text: "Mind is everything. What you think, you become.", source: "Dhammapada 1" },
  { text: "The Tao that can be told is not the eternal Tao.", source: "Tao Te Ching 1" },
  { text: "The wound is the place where the Light enters you.", source: "Rumi" },
  { text: "Between stimulus and response there is a space. In that space is our power to choose.", source: "Viktor Frankl" },
  { text: "Knowing yourself is the beginning of all wisdom.", source: "Aristotle" },
  { text: "Be here now.", source: "Ram Dass" },
  { text: "The only way out is in.", source: "Rumi" },
  { text: "Who looks outside, dreams. Who looks inside, awakes.", source: "Carl Jung" },
  { text: "When I let go of what I am, I become what I might be.", source: "Tao Te Ching" },
];

const TEXT_CATEGORIES = [
  { id: "vedas", label: "Vedas", count: 4, icon: "📜" },
  { id: "upanishads", label: "Upanishads", count: 108, icon: "📖" },
  { id: "shastras", label: "Shastras", count: 6, icon: "📿" },
  { id: "itihasas", label: "Itihasas", count: 2, icon: "⚔️" },
  { id: "puranas", label: "Puranas", count: 18, icon: "🕉️" },
  { id: "buddhist", label: "Buddhist Texts", count: 6, icon: "☸️" },
  { id: "taoist", label: "Taoist", count: 2, icon: "🌙" },
  { id: "christian", label: "Christian Mystical", count: 4, icon: "✝️" },
  { id: "sufi", label: "Sufi", count: 2, icon: "🕌" },
  { id: "modern", label: "Modern", count: 4, icon: "📚" },
];

const RECENTLY_READ = [
  { id: "gita", title: "Bhagavad Gita", chapter: "Chapter 2", verse: "Verse 47", lastRead: "2 hours ago" },
  { id: "dhammapada", title: "Dhammapada", chapter: "Chapter 1", verse: "Verses 1-5", lastRead: "Yesterday" },
  { id: "tao", title: "Tao Te Ching", chapter: "Chapter 1", verse: "Full chapter", lastRead: "3 days ago" },
];

export default function TempleLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [randomVerse, setRandomVerse] = useState<typeof SACRED_VERSES[0] | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);

  const cardClass =
    "rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all";
  const interactiveCardClass = `${cardClass} hover:border-primary/30 hover:bg-card hover:shadow-md`;
  const sectionLabelClass =
    "text-muted-foreground text-[10px] font-display tracking-[0.3em] uppercase";

  const openAnywhere = () => {
    const idx = Math.floor(Math.random() * SACRED_VERSES.length);
    setRandomVerse(SACRED_VERSES[idx]);
  };

  const filteredTexts = ALL_SACRED_TEXTS.filter(text =>
    !searchQuery ||
    text.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    text.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reading Mode
  if (selectedText) {
    const text = ALL_SACRED_TEXTS.find(t => t.id === selectedText);
    if (text && text.chapters.length > 0) {
      return (
        <ReadingMode
          textTitle={text.title}
          chapterTitle={text.chapters[currentChapterIdx]?.title || ""}
          verses={text.chapters[currentChapterIdx]?.verses || []}
          currentVerseIdx={currentVerseIdx}
          onClose={() => setSelectedText(null)}
          onNavigate={(verseIdx) => {
            setCurrentVerseIdx(verseIdx);
          }}
        />
      );
    }
  }

  return (
    <div className="pt-6 pb-8 px-4 md:px-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-muted-foreground/80 text-[10px] font-display tracking-[0.4em] uppercase mb-2">
          Sacred Library
        </p>
        <h2 className="text-foreground text-xl md:text-2xl font-display tracking-wide">
          Ancient Wisdom
        </h2>
        <p className="text-muted-foreground text-xs font-display mt-1">
          100+ texts · Vedas, Upanishads, Gita & more
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search texts, verses, topics..."
            className="w-full rounded-xl border border-border/60 bg-card/80 py-2.5 pl-10 pr-4 text-sm font-display text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/40 focus:bg-card"
            aria-label="Search sacred texts"
          />
        </div>
      </div>

      {/* Open Anywhere */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={openAnywhere}
          className="w-full rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-4 text-left transition-all hover:border-primary/35 hover:from-primary/15 hover:via-secondary/15 hover:to-accent/15"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <Dice5 className="w-5 h-5 text-primary/80" />
            <div className="flex-1">
              <p className="text-foreground text-sm font-display font-medium">Open Anywhere</p>
              <p className="text-muted-foreground text-xs font-display">Let chance reveal what you need</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary/70" />
          </div>
        </motion.button>

        {/* Random verse display */}
        <AnimatePresence>
          {randomVerse && (
            <motion.div
              className={`mt-3 p-4 ${cardClass}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-foreground/90 text-sm font-display italic leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                "{randomVerse.text}"
              </p>
              <p className="mt-2 text-right text-[10px] font-display text-muted-foreground">— {randomVerse.source}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recently Read */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className={sectionLabelClass}>Recently Read</h3>
        </div>
        <div className="space-y-2">
          {RECENTLY_READ.map((item, i) => (
            <motion.button
              key={item.id}
              className={`group w-full p-3 text-left ${interactiveCardClass}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-primary/75" />
                  <div>
                    <p className="text-foreground text-sm font-display">{item.title}</p>
                    <p className="text-muted-foreground text-[10px] font-display">{item.chapter} · {item.verse}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[10px] font-display">{item.lastRead}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Text Categories */}
      <div>
        <h3 className={`${sectionLabelClass} mb-3`}>
          Browse by Category
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TEXT_CATEGORIES.map((cat, i) => {
            const textsInCategory = filteredTexts.filter(t => t.category === cat.id);
            return (
              <motion.button
                key={cat.id}
                className={`group p-3 text-left ${interactiveCardClass}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-lg">{cat.icon}</span>
                <p className="mt-1 text-xs font-display font-medium text-foreground">{cat.label}</p>
                <p className="text-[10px] font-display text-muted-foreground">{textsInCategory.length > 0 ? `${textsInCategory.length} texts` : `${cat.count} texts`}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Available Texts */}
      {filteredTexts.length > 0 && (
        <div className="mt-8">
          <h3 className={`${sectionLabelClass} mb-3`}>
            Available Texts
          </h3>
          <div className="space-y-2">
            {filteredTexts.map((text, i) => (
              <motion.button
                key={text.id}
                onClick={() => {
                  setSelectedText(text.id);
                  setCurrentChapterIdx(0);
                  setCurrentVerseIdx(0);
                }}
                className={`w-full p-3 text-left ${interactiveCardClass}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-display font-medium text-foreground">{text.title}</p>
                    {text.subtitle && <p className="text-[10px] font-display text-muted-foreground">{text.subtitle}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-display text-muted-foreground">{text.chapters.length} chapters</span>
                    <ChevronRight className="w-3 h-3 text-primary/70" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
