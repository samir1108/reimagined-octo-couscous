/**
 * HomeSideRail — Two floating icon buttons on the right edge of the Home screen.
 *
 *  1. Compass  → opens "Explore / Always-Open Doors" modal (AlwaysAvailableActions cards)
 *  2. Scroll   → opens "Today's Wisdom" modal (KnowledgeCardWidget + Elder chat opener)
 *
 * Each opens a full-screen scrollable card-modal that matches the Reveal modal
 * pattern used in ThemeReasoning.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Compass, ScrollText, MessageCircle, Sparkles, Brain, X } from "lucide-react";
import AlwaysAvailableActions from "@/components/home/AlwaysAvailableActions";
import WisdomCard from "@/components/home/WisdomCard";

type Panel = null | "explore" | "wisdom";

interface HomeSideRailProps {
  journeyDay?: number;
  todayCount?: number;
  themeTitle?: string;
  themeDescription?: string;
  themeWisdom?: string;
  themeReasoning?: string;
  themeExplore?: Array<{ label?: string; prompt?: string }> | null;
  vLevel?: number;
  activeLoops?: string[];
  isThinking?: boolean;
}

function RailButton({
  icon,
  label,
  hint,
  onClick,
  delay = 0,
  thinking = false,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
  delay?: number;
  thinking?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={thinking}
      initial={{ opacity: 0, x: 20 }}
      animate={{
        opacity: thinking ? 0.7 : 1,
        x: 0,
      }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={thinking ? undefined : { scale: 1.04 }}
      whileTap={thinking ? undefined : { scale: 0.96 }}
      className="group flex items-center gap-2.5 pl-2.5 pr-3 py-2 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/40 hover:border-primary/40 hover:bg-card/70 shadow-lg shadow-black/10 transition-all disabled:cursor-wait"
    >
      <motion.span
        className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors"
        animate={thinking ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
        transition={thinking ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        {icon}
      </motion.span>
      <span className="text-left">
        <span className="block text-[10px] font-display tracking-[0.18em] uppercase text-foreground/90 leading-tight">
          {label}
        </span>
        {thinking ? (
          <span className="block text-[9px] font-body italic text-primary/70 leading-tight">
            weaving…
          </span>
        ) : hint ? (
          <span className="block text-[9px] font-body text-muted-foreground/70 leading-tight">
            {hint}
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}

function Modal({
  open,
  onClose,
  title,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center bg-background/85 backdrop-blur-md p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-lg sm:rounded-3xl bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-2xl border border-border/50 shadow-2xl overflow-y-auto max-h-screen sm:max-h-[90vh]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-xl border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="text-primary">{icon}</span>
                <h2 className="text-sm font-display tracking-[0.2em] uppercase text-foreground font-semibold">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomeSideRail({
  journeyDay = 1,
  todayCount = 0,
  themeTitle,
  themeDescription,
  themeWisdom,
  themeReasoning,
  themeExplore,
  vLevel,
  activeLoops,
  isThinking = false,
}: HomeSideRailProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const navigate = useNavigate();

  return (
    <>
      {/* Horizontal rail — three matching pills (Explore · Wisdom · Reasoning) */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 mt-6 mb-2 flex-wrap">
        <RailButton
          icon={<Compass className="w-4 h-4" />}
          label="Explore"
          hint={`${todayCount} today · Day ${journeyDay}`}
          onClick={() => setPanel("explore")}
          delay={0.6}
          thinking={isThinking}
        />
        <RailButton
          icon={<ScrollText className="w-4 h-4" />}
          label="Wisdom"
          hint="Today's teaching"
          onClick={() => setPanel("wisdom")}
          delay={0.7}
          thinking={isThinking}
        />
        <RailButton
          icon={<Brain className="w-4 h-4" />}
          label="Reasoning"
          hint="Why this theme"
          onClick={() => window.dispatchEvent(new Event("home:open-reasoning"))}
          delay={0.8}
          thinking={isThinking}
        />
      </div>

      {/* Explore panel */}
      <Modal
        open={panel === "explore"}
        onClose={() => setPanel(null)}
        title="Explore"
        icon={<Compass className="w-4 h-4" />}
      >
        <div className="space-y-4">
          {themeExplore && themeExplore.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-body text-muted-foreground/80 leading-relaxed">
                Fresh prompts from your just-completed session.
              </p>
              <div className="space-y-2">
                {themeExplore.slice(0, 3).map((item, index) => (
                  <div
                    key={`${item.prompt}-${index}`}
                    className="rounded-2xl border border-border/40 bg-card/40 px-4 py-3"
                  >
                    <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/70 mb-1">
                      Explore {index + 1}
                    </p>
                    <p className="text-sm font-body text-foreground/90 leading-relaxed">
                      {item.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-body text-muted-foreground/80 leading-relaxed">
                Always-open doors based on what's been alive in you recently. Pick one — there's no wrong choice.
              </p>
              <AlwaysAvailableActions heading="Begin gently" />
            </>
          )}
          <div className="pt-2 flex items-center justify-between text-[10px] font-display tracking-wider uppercase text-muted-foreground/60">
            <span>{todayCount} today</span>
            <span>Day {journeyDay}</span>
          </div>
        </div>
      </Modal>

      {/* Wisdom panel */}
      <Modal
        open={panel === "wisdom"}
        onClose={() => setPanel(null)}
        title="Today's Wisdom"
        icon={<ScrollText className="w-4 h-4" />}
      >
        <WisdomCard
          journeyDay={journeyDay}
          themeTitle={themeTitle}
          themeDescription={themeDescription}
          initialWisdom={themeWisdom}
          vLevel={vLevel}
          activeLoops={activeLoops}
          onClose={() => setPanel(null)}
        />
      </Modal>
    </>
  );
}
