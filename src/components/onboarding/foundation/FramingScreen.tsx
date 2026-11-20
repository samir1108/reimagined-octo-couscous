import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Props {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  onNext: () => void;
  progressLabel?: string;
}

export default function FramingScreen({ eyebrow, title, body, cta, onNext, progressLabel }: Props) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-[100dvh] flex items-center justify-center px-6 py-10 bg-background"
    >
      <div className="w-full max-w-md text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-5">{eyebrow}</p>
        <h1 className="font-display text-2xl sm:text-3xl text-foreground leading-snug mb-6">{title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-10 whitespace-pre-line">{body}</p>
        {progressLabel && (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">{progressLabel}</p>
        )}
        {progressLabel && (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">{progressLabel}</p>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
        >
          {cta}
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
