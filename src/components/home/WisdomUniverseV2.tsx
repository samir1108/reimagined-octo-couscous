"use client";

import { useMemo, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, Lock, Sparkles, AlertTriangle, Key, Moon, BookOpen, Compass, Brain, Heart, Eye, Zap, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/design-system";
import { Button } from "@/components/design-system";
import { Badge } from "@/components/design-system";
import { ScrollArea } from "@/design-system";
import { useAllWisdomCards, useTodaysTheme, useTodaysInquiry, useTodaysWhisper, useTodaysGuruInsight, useTodaysPotholes, useTodaysChallenges, useTodaysObservations, useTodaysShadowSignal, useTodaysIntegrationKey, useTodaysEveningMetabolization } from "@/hooks/useTodaysWisdom";
import { useNavigate } from "react-router-dom";
import { conscious } from "@/lib/consciousToast";

const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; borderColor: string; label: string }> = {
  theme: { icon: BookOpen, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", label: "Theme" },
  inquiry: { icon: Brain, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", label: "Inquiry" },
  whisper: { icon: Sparkles, color: "text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/20", label: "Whisper" },
  guru_insight: { icon: Compass, color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20", label: "Guru Insight" },
  potholes: { icon: Zap, color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20", label: "Potholes" },
  challenges: { icon: Heart, color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", label: "Challenges" },
  observations: { icon: Eye, color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/20", label: "Observations" },
  shadow_signal: { icon: AlertTriangle, color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/20", label: "Shadow Signal" },
  integration_key: { icon: Key, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", label: "Integration Key" },
  evening_metabolization: { icon: Moon, color: "text-indigo-400", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20", label: "Evening Metabolization" },
};

const PRIORITY_ORDER = [
  "shadow_signal",
  "evening_metabolization",
  "integration_key",
  "whisper",
  "theme",
  "inquiry",
  "guru_insight",
  "potholes",
  "challenges",
  "observations",
];

const WisdomCard = forwardRef<HTMLDivElement, { card: any; index: number }>(({ card, index }, ref) => {
  if (!card) return null;
  const config = CATEGORY_CONFIG[card.category] || CATEGORY_CONFIG.theme;
  const Icon = config.icon;
  
  const handleAction = () => {
    if (!card.action) return;
    conscious("noted", { kind: "subtle" });
  };

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className={`group relative overflow-hidden rounded-2xl border ${config.borderColor} ${config.bgColor} p-5 transition-all hover:border-primary/30 hover:shadow-[0_0_30px_rgba(198,161,91,0.08)]`}
      >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.bgColor} ${config.borderColor} flex items-center justify-center`}>
          <Icon className={`${config.color} w-5 h-5`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={config.bgColor + " " + config.borderColor + " " + config.color + " text-xs"}>
              {config.label}
            </Badge>
            {!card.unlocked && (
              <Lock className="w-3 h-3 text-muted-foreground/50" />
            )}
          </div>
          
          <h3 className="text-lg font-display font-light text-foreground mb-2">{card.title}</h3>
          
          {card.subtitle && (
            <p className="text-xs text-muted-foreground mb-3">{card.subtitle}</p>
          )}
          
          <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {card.content}
          </div>
          
          {card.unlockCondition && !card.unlocked && (
            <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {card.unlockCondition}
            </p>
          )}
          
          {card.action && card.unlocked && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-xs gap-1 hover:text-primary"
              onClick={handleAction}
            >
              {card.action.label}
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>
    </div>
  );
});

WisdomCard.displayName = "WisdomCard";

export default function WisdomUniverseV2() {
  const navigate = useNavigate();
  const allCards = useAllWisdomCards();
  const { card: themeCard, isLoading: themeLoading } = useTodaysTheme();
  const { card: inquiryCard } = useTodaysInquiry();
  const { card: whisperCard } = useTodaysWhisper();
  const { card: guruCard } = useTodaysGuruInsight();
  const { card: potholesCard } = useTodaysPotholes();
  const { card: challengesCard } = useTodaysChallenges();
  const { card: observationsCard } = useTodaysObservations();
  const { card: shadowCard } = useTodaysShadowSignal();
  const { card: integrationCard } = useTodaysIntegrationKey();
  const { card: eveningCard } = useTodaysEveningMetabolization();

  const isLoading = themeLoading;

  const orderedCards = useMemo(() => {
    const cards: any[] = [];
    if (themeCard) cards.push({ ...themeCard, category: "theme" });
    if (inquiryCard) cards.push({ ...inquiryCard, category: "inquiry" });
    if (whisperCard) cards.push({ ...whisperCard, category: "whisper" });
    if (guruCard) cards.push({ ...guruCard, category: "guru_insight" });
    if (potholesCard) cards.push({ ...potholesCard, category: "potholes" });
    if (challengesCard) cards.push({ ...challengesCard, category: "challenges" });
    if (observationsCard) cards.push({ ...observationsCard, category: "observations" });
    if (shadowCard) cards.push({ ...shadowCard, category: "shadow_signal" });
    if (integrationCard) cards.push({ ...integrationCard, category: "integration_key" });
    if (eveningCard) cards.push({ ...eveningCard, category: "evening_metabolization" });

    return cards.sort((a, b) => {
      const aIndex = PRIORITY_ORDER.indexOf(a.category);
      const bIndex = PRIORITY_ORDER.indexOf(b.category);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [themeCard, inquiryCard, whisperCard, guruCard, potholesCard, challengesCard, observationsCard, shadowCard, integrationCard, eveningCard]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-32 rounded-2xl border border-border/50 bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label="Wisdom Universe">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[24px] font-display font-light text-foreground">Wisdom Universe</h2>
          <p className="text-sm text-muted-foreground mt-1">Your daily consciousness compass — predictive, adaptive, personal</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {orderedCards.filter(c => c.unlocked !== false).length} / {orderedCards.length} unlocked
        </Badge>
      </div>

      <ScrollArea className="h-auto">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {orderedCards.map((card, index) => (
              <WisdomCard key={card.id} card={card} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </section>
  );
}