/**
 * TEMPLE - Program Activation with Temple Vows
 * Per temple.md Sections 30, 31, 33
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Bell, ArrowLeft, Shield } from "lucide-react";
import { useState } from "react";

interface ProgramActivationProps {
  programTitle: string;
  programDescription: string;
  masterName: string;
  masterImage: string;
  durationDays: number;
  dailyTimeMinutes: number;
  hasLegalDisclaimer: boolean;
  legalDisclaimerText?: string;
  onActivate: () => void;
  onClose: () => void;
}

type Step = "details" | "vows" | "disclaimer" | "confirmation" | "ceremony";

export default function ProgramActivation({
  programTitle,
  programDescription,
  masterName,
  masterImage,
  durationDays,
  dailyTimeMinutes,
  hasLegalDisclaimer,
  legalDisclaimerText,
  onActivate,
  onClose,
}: ProgramActivationProps) {
  const [step, setStep] = useState<Step>("details");
  const [vows, setVows] = useState({
    dailyPractice: false,
    honesty: false,
    noJudgment: false,
    returnWhenFall: false,
    respectTradition: false,
    stayOpen: false,
  });

  const allVowsTaken = Object.values(vows).every(Boolean);

  const handleVowToggle = (key: keyof typeof vows) => {
    setVows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      className="fixed inset-0 z-[75] flex flex-col bg-black/95 backdrop-blur-xl"
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
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          {step !== "details" && step !== "ceremony" && (
            <button
              onClick={() => {
                const steps: Step[] = ["details", "vows", "disclaimer", "confirmation", "ceremony"];
                const idx = steps.indexOf(step);
                if (idx > 0) setStep(steps[idx - 1]);
              }}
              className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Bell className="w-4 h-4 text-amber-400/60" />
          <h2 className="text-white/70 text-sm font-display tracking-wider">Program Activation</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Program Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <img
                  src={masterImage}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover object-top ring-2 ring-white/10 mx-auto mb-4"
                />
                <h3 className="text-white/80 text-lg font-display mb-1">{programTitle}</h3>
                <p className="text-white/40 text-sm font-display">with {masterName}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <p className="text-white/30 text-[10px] font-display tracking-[0.3em] uppercase mb-1">Duration</p>
                  <p className="text-white/70 text-sm font-display">{durationDays} days</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <p className="text-white/30 text-[10px] font-display tracking-[0.3em] uppercase mb-1">Daily Time</p>
                  <p className="text-white/70 text-sm font-display">{dailyTimeMinutes} minutes</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <p className="text-white/30 text-[10px] font-display tracking-[0.3em] uppercase mb-1">About</p>
                  <p className="text-white/50 text-xs font-display leading-relaxed">{programDescription}</p>
                </div>
              </div>

              <p className="text-white/25 text-[10px] font-display text-center mb-4 italic">
                "This program exists only within these sacred walls."
              </p>

              <motion.button
                onClick={() => setStep("vows")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to Temple Vows
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Temple Vows */}
          {step === "vows" && (
            <motion.div
              key="vows"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <p className="text-white/20 text-[10px] font-display tracking-[0.4em] uppercase mb-2">🕯️ Temple Vows</p>
                <h3 className="text-white/80 text-lg font-display mb-1">Before You Begin</h3>
                <p className="text-white/30 text-xs font-display">Make these commitments to yourself</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { key: "dailyPractice" as const, text: "I vow to practice daily, even if only 5 minutes" },
                  { key: "honesty" as const, text: "I vow to be honest with myself about my struggles" },
                  { key: "noJudgment" as const, text: "I vow not to judge my progress or compare with others" },
                  { key: "returnWhenFall" as const, text: "I vow to return when I fall off, without guilt or shame" },
                  { key: "respectTradition" as const, text: "I vow to respect the tradition and use these teachings wisely" },
                  { key: "stayOpen" as const, text: "I vow to stay open to transformation, even when it's uncomfortable" },
                ].map((vow, i) => (
                  <motion.button
                    key={vow.key}
                    onClick={() => handleVowToggle(vow.key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      vows[vow.key]
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          vows[vow.key]
                            ? "bg-emerald-500/30 border-emerald-500/50"
                            : "border-white/[0.15]"
                        }`}
                      >
                        {vows[vow.key] && <Check className="w-3 h-3 text-emerald-400/80" />}
                      </div>
                      <p className="text-white/60 text-xs font-display leading-relaxed">{vow.text}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <p className="text-white/25 text-[10px] font-display text-center mb-4 italic">
                "These vows are between you and yourself. No one judges. No one tracks. Just intention."
              </p>

              <motion.button
                onClick={() => setStep(hasLegalDisclaimer ? "disclaimer" : "confirmation")}
                disabled={!allVowsTaken}
                className={`w-full py-3 rounded-xl text-sm font-display tracking-wider transition-all ${
                  allVowsTaken
                    ? "bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 hover:from-amber-600/40 hover:to-orange-600/40"
                    : "bg-white/[0.06] border border-white/[0.08] text-white/30 cursor-not-allowed"
                }`}
                whileHover={allVowsTaken ? { scale: 1.01 } : {}}
                whileTap={allVowsTaken ? { scale: 0.98 } : {}}
              >
                {allVowsTaken ? "Continue" : "Make Your Vows"}
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Legal Disclaimer */}
          {step === "disclaimer" && (
            <motion.div
              key="disclaimer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-red-400/60 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200/80 text-sm font-display font-medium mb-2">Important Notice</p>
                    <p className="text-red-200/50 text-xs font-display leading-relaxed">
                      {legalDisclaimerText ||
                        "This program provides spiritual support and practices. It does NOT replace professional medical or psychological treatment. If you are experiencing severe issues, please contact a qualified professional."}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-white/25 text-[10px] font-display text-center mb-4 italic">
                "This Temple walks WITH you. Therapists treat. Both can serve you at the same time."
              </p>

              <motion.button
                onClick={() => setStep("confirmation")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                I Understand
              </motion.button>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <h3 className="text-white/80 text-lg font-display mb-2">Ready to Begin?</h3>
                <p className="text-white/30 text-sm font-display">
                  Lives within Temple walls. Commit to {durationDays} days with {masterName}?
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                  <p className="text-white/50 text-xs font-display">{durationDays} days</p>
                  <p className="text-white/30 text-[10px] font-display">{dailyTimeMinutes} min/day</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-colors"
                >
                  Not Yet
                </button>
                <motion.button
                  onClick={() => setStep("ceremony")}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-xs font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Begin Journey
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Bell Ceremony */}
          {step === "ceremony" && (
            <motion.div
              key="ceremony"
              className="flex flex-col items-center justify-center h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="text-6xl mb-6"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{ duration: 2, repeat: 3 }}
              >
                🔔
              </motion.div>
              <motion.h3
                className="text-white/80 text-xl font-display text-center mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                The Temple witnesses your commitment.
              </motion.h3>
              <motion.p
                className="text-white/40 text-sm font-display text-center italic max-w-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                "{programTitle}" begins now. {masterName} walks with you.
              </motion.p>
              <motion.button
                onClick={onActivate}
                className="mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-sm font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Enter the Journey
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
