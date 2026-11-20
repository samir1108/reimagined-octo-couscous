import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp, Sparkles, Brain, Heart, Eye, Target, Flame, Leaf, Crown, Award, Zap, Moon, Sun, Compass, BookOpen, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppIntroSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  highlights?: string[];
  gradient?: string;
}

export interface AppScrollIntroProps {
  sections: AppIntroSection[];
  headerTitle?: string;
  headerSubtitle?: string;
  onEnter: () => void;
  onExplore: () => void;
  exploreLabel?: string;
  enterLabel?: string;
}

function SectionCard({ section, index, isActive, onClick }: { 
  section: AppIntroSection; 
  index: number; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const gradient = section.gradient || "from-primary/20 to-primary/5";
  
  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer rounded-3xl p-6 md:p-8",
        "bg-gradient-to-br bg-white/5 border border-white/10",
        "transition-all duration-500",
        "hover:border-primary/30 hover:shadow-[0_0_40px_rgba(232,189,112,0.15)]",
        isActive && "ring-2 ring-primary/50 scale-[1.02] z-10",
        "touch-manipulation"
      )}
      style={{ background: `linear-gradient(135deg, ${gradient.replace("from-", "").replace("to-", "")})` }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
          "bg-gradient-to-br " + gradient + "/30",
          isActive && "ring-2 ring-primary/50"
        )}>
          <span className="text-3xl">{section.icon}</span>
        </div>
        
        <h3 className={cn(
          "text-2xl md:text-3xl font-bold text-white mb-4",
          isActive && "text-primary"
        )}>
          {section.title}
        </h3>
        
        <p className={cn(
          "text-white/70 text-lg leading-relaxed mb-6 flex-1",
          isActive && "text-white/90"
        )}>
          {section.description}
        </p>
        
        {section.highlights && section.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {section.highlights.map((highlight, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="px-3 py-1.5 rounded-full text-sm bg-white/10 text-white/60 border border-white/10 hover:border-primary/30 hover:text-white transition-colors"
              >
                {highlight}
              </motion.span>
            ))}
          </div>
        )}
        
        <div className={cn(
          "mt-6 flex items-center gap-2 text-primary font-medium",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <span>Explore</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AppScrollIntro({
  sections,
  headerTitle = "How HOPE Works",
  headerSubtitle = "A living practice space — not another meditation app",
  onEnter,
  onExplore,
  exploreLabel = "Look around first",
  enterLabel = "Begin your journey",
}: AppScrollIntroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, clientWidth, scrollWidth } = container;
      const progress = scrollLeft / (scrollWidth - clientWidth);
      setScrollProgress(progress);

      // Find closest section to center
      const centerX = scrollLeft + clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;

      sectionRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const sectionCenter = rect.left + rect.width / 2 - containerRect.left;
        const distance = Math.abs(sectionCenter - centerX);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const ref = sectionRefs.current[index];
    const container = containerRef.current;
    if (ref && container) {
      container.scrollTo({
        left: ref.offsetLeft - (container.clientWidth - ref.offsetWidth) / 2,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,189,112,0.08)_0%,transparent_70%)]" />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-8 md:py-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Scroll to explore
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
            {headerTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            {headerSubtitle}
          </p>
        </motion.div>

        {/* Scroll progress indicator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative h-1 bg-white/10 rounded-full overflow-hidden max-w-3xl mx-auto"
        >
          <motion.div
            animate={{ scaleX: scrollProgress }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transform-origin-left"
          />
        </motion.div>
      </header>

      {/* Sections scroll */}
      <div
        ref={containerRef}
        className="relative z-10 px-6 pb-20 md:pb-32"
        style={{ 
          scrollSnapType: "x mandatory",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex gap-6 md:gap-8 min-w-max" style={{ scrollSnapAlign: "center" }}>
          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => { sectionRefs.current[index] = el; }}
              className="w-[320px] md:w-[380px] lg:w-[420px] flex-shrink-0"
              style={{ scrollSnapAlign: "center" }}
            >
              <SectionCard
                section={section}
                index={index}
                isActive={activeIndex === index}
                onClick={() => scrollToSection(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/50 text-sm px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur"
      >
        <ChevronDown className="w-4 h-4 animate-bounce" />
        <span>Scroll horizontally to explore</span>
        <ChevronDown className="w-4 h-4 animate-bounce" style={{ transform: "rotate(180deg)" }} />
      </motion.div>

      {/* CTA Buttons */}
      <div className="relative z-10 px-6 pb-12 md:pb-20">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className={cn(
              "w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-lg",
              "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
              "shadow-lg shadow-primary/25 hover:shadow-primary/40",
              "transition-all duration-300"
            )}
          >
            {enterLabel}
            <ArrowRight className="w-5 h-5 ml-2 inline-block" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExplore}
            className={cn(
              "w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-lg",
              "bg-white/5 text-white border border-white/10 hover:border-primary/30 hover:bg-white/10",
              "transition-all duration-300 backdrop-blur"
            )}
          >
            {exploreLabel}
          </motion.button>
        </div>
      </div>
    </div>
  );
}