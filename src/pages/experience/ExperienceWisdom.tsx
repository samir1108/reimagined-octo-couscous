import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { WISDOM_DECK } from "@/data/wisdomDeck";

const ExperienceWisdom = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const card = WISDOM_DECK[index];
  const next = () => { setDir(1); setIndex((i) => (i + 1) % WISDOM_DECK.length); };
  const prev = () => { setDir(-1); setIndex((i) => (i - 1 + WISDOM_DECK.length) % WISDOM_DECK.length); };
  const shuffle = () => { setDir(1); setIndex(Math.floor(Math.random() * WISDOM_DECK.length)); };

  return (
    <>
      <Seo
        title="50 Wisdom Cards — one-line teachings from every tradition"
        description="Fifty one-line teachings from Rumi, Buddha, Lao Tzu, Ramana, Krishnamurti, and more. Swipe through. Sit with one."
        canonicalPath="/experience/wisdom"
        keywords="wisdom cards, quotes, rumi, buddha, lao tzu, ramana maharshi, krishnamurti"
      />
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="max-w-3xl mx-auto px-4 pt-6 w-full">
          <button
            onClick={() => navigate("/experience")}
            className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <section className="flex-1 flex flex-col items-center justify-center px-4 py-10">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-300/80 mb-2">
            Card {index + 1} of {WISDOM_DECK.length}
          </div>

          <div className="relative w-full max-w-xl h-[420px] md:h-[460px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: dir * 60, rotate: dir * 3 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -dir * 60, rotate: -dir * 3 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) next();
                  else if (info.offset.x > 80) prev();
                }}
                className="absolute inset-0 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-card to-rose-950/30 p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-2xl cursor-grab active:cursor-grabbing"
              >
                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 mb-6">
                  {card.tradition}
                </div>
                <p className="text-2xl md:text-3xl font-light leading-relaxed text-foreground italic" style={{ fontFamily: "serif" }}>
                  &ldquo;{card.text}&rdquo;
                </p>
                <div className="mt-8 text-sm text-amber-200/80">— {card.source}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-border/60 bg-card/60 hover:bg-card flex items-center justify-center transition"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={shuffle}
              className="px-5 h-12 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 flex items-center gap-2 text-sm text-amber-100 transition"
            >
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-border/60 bg-card/60 hover:bg-card flex items-center justify-center transition"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">Swipe the card, or use the arrows.</p>
        </section>

        <section className="border-t border-border/40 py-10 text-center px-4">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-5">
            Inside the app, one card is selected for you each morning — based on what you're
            working through that week. Cards become contemplation seeds.
          </p>
          <Link
            to="/auth"
            className="inline-block px-7 py-3 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 hover:bg-amber-500/30 transition text-sm"
          >
            Get your daily card
          </Link>
        </section>
      </main>
    </>
  );
};

export default ExperienceWisdom;
