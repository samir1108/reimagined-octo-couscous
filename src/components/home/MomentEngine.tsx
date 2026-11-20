"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Eye, Brain, Heart, Compass, Sparkles, BookOpen, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MomentRecommendation {
  id: string;
  category: "observe" | "understand" | "practice" | "experience" | "reflect" | "discover";
  title: string;
  description: string;
  whyNow: string;
  destination: { route: string; params?: Record<string, string>; prompt?: string };
}

interface MomentEngineProps {
  recommendations: MomentRecommendation[];
}

const CATEGORY_ICONS: Record<MomentRecommendation["category"], React.ComponentType<{ className?: string }>> = {
  observe: Eye,
  understand: Brain,
  practice: Sparkles,
  experience: Sun,
  reflect: Moon,
  discover: Compass,
};

const CATEGORY_LABELS: Record<MomentRecommendation["category"], string> = {
  observe: "Notice",
  understand: "Understand",
  practice: "Practice",
  experience: "Experience",
  reflect: "Reflect",
  discover: "Discover",
};

const CATEGORY_COLORS: Record<MomentRecommendation["category"], string> = {
  observe: "#D6B36A",
  understand: "#8B9C80",
  practice: "#F4D99A",
  experience: "#D6B36A",
  reflect: "#98958B",
  discover: "#53634F",
};

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return /^(undefined|null|n\/?a|none|nan)$/i.test(text) ? "" : text;
}

function openContext(context: string, navigate: ReturnType<typeof useNavigate>) {
  try {
    sessionStorage.setItem("journeySession:aiContext", context);
    sessionStorage.setItem("journeySession:ts", String(Date.now()));
  } catch (error) {
    console.warn("[MomentEngine] Could not preserve context for the Guide.", error);
  }
  navigate("/app/guide?journey=1");
}

export default function MomentEngine({ recommendations }: MomentEngineProps) {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  if (!recommendations.length) return null;

  return (
    <section aria-labelledby="moments-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#D6B36A]/65">Your daily intelligence</p>
          <h2 id="moments-title" className="mt-1.5 text-2xl font-light tracking-wide text-[#E9E2D3] sm:text-3xl" style={{ fontFamily: "var(--font-editorial)" }}>A moment to explore</h2>
        </div>
        <span className="mb-5 hidden text-[10px] text-[#98958B]/55 sm:block">Choose what feels useful</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.slice(0, 3).map((rec, index) => {
          const Icon = CATEGORY_ICONS[rec.category];
          const color = CATEGORY_COLORS[rec.category];
          return (
            <motion.button
              key={rec.id}
              type="button"
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: reducedMotion ? 0 : index * 0.08 }}
              onClick={() => {
                if (rec.destination.prompt) {
                  openContext(rec.destination.prompt, navigate);
                } else if (rec.destination.route) {
                  const params = new URLSearchParams(rec.destination.params);
                  navigate(`${rec.destination.route}?${params.toString()}`);
                }
              }}
              className="group min-h-40 rounded-2xl border border-white/[0.06] bg-[#0D100E]/55 p-5 text-left transition hover:border-[#D6B36A]/20 hover:bg-[#141714]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B36A]"
              style={{ borderLeftColor: color, borderLeftWidth: 3 }}
            >
              <span className="text-[9px] uppercase tracking-[0.21em]" style={{ color: `${color}/60` }}>
                {CATEGORY_LABELS[rec.category]}
              </span>
              <div className="mt-3 flex items-center justify-between gap-3 text-lg font-light text-[#E9E2D3]" style={{ fontFamily: "var(--font-editorial)" }}>
                {rec.title}
                <ArrowUpRight className="h-4 w-4 shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-200" style={{ color: `${color}/50` }} aria-hidden="true" />
              </div>
              {cleanText(rec.description) && (
                <span className="mt-2 block text-xs leading-relaxed text-[#98958B]">{rec.description}</span>
              )}
              <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ color: `${color}/70` }}>
                <span className="flex items-center gap-1">
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  Why now
                </span>
                <span className="text-[#98958B]/40">·</span>
                <span className="max-w-[180px] truncate">{rec.whyNow}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}