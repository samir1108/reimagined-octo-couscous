"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "@/design-system";

interface ArrivalExperienceProps {
  userName: string;
  theme?: { title?: string; description?: string } | null;
  themeLoading: boolean;
}

function getGreeting(hour: number): string {
  if (hour < 5) return "A quieter hour";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Take a moment";
  if (hour < 21) return "Let the day settle";
  return "Return to stillness";
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  return /^(undefined|null|n\/?a|none|nan)$/i.test(text) ? "" : text;
}

export default function ArrivalExperience({
  userName,
  theme,
  themeLoading,
}: ArrivalExperienceProps) {
  const reducedMotion = useReducedMotion();
  const [now, setNow] = useState(() => new Date());
  const name = cleanText(userName);
  const firstName = name && name.toLowerCase() !== "friend" ? name.split(/\s+/)[0] : "";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section aria-label="Arrival" className="relative z-10">
      <div className="text-center lg:text-left">
        <p className="text-[9px] uppercase tracking-[0.3em] text-gold-primary/75">
          {getGreeting(now.getHours())}
        </p>
        <motion.h1
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-3 max-w-2xl text-[38px] font-light leading-[0.98] tracking-[-0.025em] text-foreground sm:text-6xl lg:mx-0"
          style={{ fontFamily: "var(--font-editorial)" }}
        >
          {firstName
            ? <>Welcome back,<br className="hidden sm:block" /> {firstName}.</>
            : <>Return to<br className="hidden sm:block" /> yourself.</>}
        </motion.h1>
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground lg:mx-0"
        >
          {themeLoading
            ? "A moment to meet the day as it is."
            : theme?.title
              ? <>Today, make room for <span className="text-foreground text-gold-leaf">{theme.title.toLowerCase()}</span>.</>
              : "The world outside is moving. Here, you have a moment to notice what is within."}
        </motion.p>
      </div>
    </section>
  );
}