/**
 * BandGuidebookModal — Full-screen explainer for any of the 11 V-Bands.
 * Opens when user taps the Current Band card in Analytics.
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Sparkles, ArrowRight, BookOpen, Target, Quote } from "lucide-react";
import { getBandGuide, BAND_GUIDEBOOK } from "@/data/bandGuidebook";

interface Props {
  open: boolean;
  band: number;
  onClose: () => void;
  onSelectBand?: (b: number) => void;
}

const ICONS = ["🌑","🌒","🌓","🌔","🌕","🌌","🌈","✦","☀️","🌟","◯"];

export default function BandGuidebookModal({ open, band, onClose, onSelectBand }: Props) {
  const guide = getBandGuide(band);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="min-h-full max-w-2xl mx-auto px-5 py-8 pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/70">
                Band Guidebook
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-foreground/5 hover:bg-foreground/10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hero */}
            <div className="text-center mb-8">
              <div className="text-7xl mb-3">{ICONS[guide.band]}</div>
              <p className="text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground/70 mb-2">
                Band {guide.band} of 10
              </p>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                {guide.title}
              </h2>
              <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
                {guide.oneLiner}
              </p>
            </div>

            {/* Quote */}
            {guide.quote && (
              <div className="rounded-2xl p-5 bg-gradient-to-br from-primary/10 to-amber-500/10 border border-primary/20 mb-6">
                <Quote className="w-4 h-4 text-primary/70 mb-2" />
                <p className="text-base font-display italic text-foreground/90 leading-relaxed">
                  "{guide.quote}"
                </p>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-5">
              <Section icon={<Users className="w-4 h-4" />} label="Who lives here">
                <p>{guide.whoLivesHere}</p>
              </Section>

              <Section icon={<Sparkles className="w-4 h-4" />} label="Signature inner state">
                <p className="italic">{guide.signatureState}</p>
              </Section>

              <Section icon={<BookOpen className="w-4 h-4" />} label="Real anchors at this band">
                <ul className="space-y-1">
                  {guide.masters.map((m) => (
                    <li key={m} className="text-foreground/85">• {m}</li>
                  ))}
                </ul>
              </Section>

              {guide.commonLoops.length > 0 && (
                <Section icon={<Target className="w-4 h-4" />} label="Common loops running">
                  <div className="flex flex-wrap gap-2">
                    {guide.commonLoops.map((id) => (
                      <span key={id} className="text-[11px] px-2 py-1 rounded-full bg-foreground/5 border border-border/50 font-mono">
                        {id}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              <Section icon={<Target className="w-4 h-4" />} label="Practices that move you up">
                <ul className="space-y-1.5">
                  {guide.practicesToAdvance.map((p) => (
                    <li key={p} className="text-foreground/85">→ {p}</li>
                  ))}
                </ul>
              </Section>

              <Section icon={<ArrowRight className="w-4 h-4" />} label="What's next">
                <p>{guide.whatsNext}</p>
              </Section>
            </div>

            {/* Band navigator */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="text-[10px] font-display tracking-[0.22em] uppercase text-muted-foreground/70 mb-3 text-center">
                Explore other bands
              </p>
              <div className="grid grid-cols-11 gap-1">
                {BAND_GUIDEBOOK.map((b) => (
                  <button
                    key={b.band}
                    onClick={() => onSelectBand?.(b.band)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all ${
                      b.band === guide.band
                        ? "bg-primary/20 border border-primary/40 scale-110"
                        : "bg-foreground/5 hover:bg-foreground/10"
                    }`}
                    title={b.title}
                  >
                    {ICONS[b.band]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 bg-foreground/[0.03] border border-border/40">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-display tracking-[0.22em] uppercase">{label}</span>
      </div>
      <div className="text-sm font-body text-foreground/85 leading-relaxed">{children}</div>
    </div>
  );
}
