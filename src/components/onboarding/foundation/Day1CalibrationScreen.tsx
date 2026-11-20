import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { DAY_1_CALIBRATION } from "@/data/onboarding/day1Calibration";

interface Props {
  onNext: () => void;
  onSkip?: () => void;
}

export default function Day1CalibrationScreen({ onNext, onSkip }: Props) {
  return (
    <motion.div
      key={DAY_1_CALIBRATION.title}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-[100dvh] px-6 py-10 bg-background"
    >
      <div className="w-full max-w-2xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary/70 mb-4">
          {DAY_1_CALIBRATION.progressLabel}
        </p>
        <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-5">
          {DAY_1_CALIBRATION.eyebrow}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl text-foreground leading-snug mb-6">
          {DAY_1_CALIBRATION.title}
        </h1>
        <div className="text-left space-y-8 mb-10 text-sm sm:text-base text-muted-foreground leading-relaxed font-body">
          {DAY_1_CALIBRATION.sections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="space-y-3"
            >
              <h2 className="font-display text-lg text-foreground">{section.heading}</h2>
              <p className="whitespace-pre-line">{section.body}</p>
            </motion.div>
          ))}
        </div>
        <div className="sticky bottom-0 pb-10 bg-background/80 backdrop-blur-sm mt-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
          >
            {DAY_1_CALIBRATION.cta}
            <ChevronRight className="h-4 w-4" />
          </motion.button>
          {onSkip && (
            <button
              onClick={onSkip}
              className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition underline underline-offset-4"
            >
              {DAY_1_CALIBRATION.skipLabel}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}