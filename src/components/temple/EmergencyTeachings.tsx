/**
 * Emergency Teachings - Instant Master Response
 * Per temple.md Section 48: Panic attack → "Call any master"
 * Jesus: "Peace. Be still." Buddha: "This too shall pass. Breathe." Krishna: "I'm here. Nothing can harm you."
 */
import { motion } from "framer-motion";
import { X, Phone } from "lucide-react";

interface EmergencyTeachingsProps {
  onClose: () => void;
}

const EMERGENCY_TEACHINGS = [
  {
    master: "Jesus Christ",
    image: "✝️",
    quote: "Peace. Be still.",
    teaching: "The storm outside doesn't have to be the storm inside. I calmed the sea with these words. I can calm yours too. Breathe. Just breathe. I'm with you.",
    color: "from-blue-500/10 to-indigo-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    master: "Gautama Buddha",
    image: "🧘",
    quote: "This too shall pass. Breathe.",
    teaching: "What you're feeling right now — the tightness, the fear, the overwhelm — it has a beginning and an end. Nothing lasts. Not this. Watch it arise. Watch it change. Watch it go. You are not the storm. You are the space in which the storm happens.",
    color: "from-amber-500/10 to-orange-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    master: "Krishna",
    image: "🪈",
    quote: "I'm here. Nothing can harm you.",
    teaching: "You are not this body. You are not this mind. You are the eternal consciousness within. No panic, no fear, no anxiety can touch that. Feel My presence. I've been with you through every storm. This one too I'll walk you through.",
    color: "from-emerald-500/10 to-teal-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    master: "Ramana Maharshi",
    image: "🕉️",
    quote: "Who is having this panic?",
    teaching: "Ask yourself: Who is afraid? The fear belongs to the mind, not to you. You are the awareness in which the fear appears. Be that awareness. Don't fight the panic. Inquire: To whom does this panic come? The answer will free you.",
    color: "from-yellow-500/10 to-gold-500/10",
    borderColor: "border-yellow-500/20",
  },
  {
    master: "Rumi",
    image: "🌹",
    quote: "The wound is where the Light enters.",
    teaching: "This panic is not your enemy. It's a door. A door to something deeper in you that needs to be heard. Don't slam it shut. Stand at the threshold. Feel the intensity. Let it burn through what needs burning. On the other side: freedom.",
    color: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    master: "Lao Tzu",
    image: "🌊",
    quote: "Be like water.",
    teaching: "Water doesn't resist. It flows around, under, through. Your panic is resistance — trying to control what can't be controlled. Let go. Be water. Let the wave pass through you. You can't stop the wave, but you can learn to surf.",
    color: "from-cyan-500/10 to-blue-500/10",
    borderColor: "border-cyan-500/20",
  },
];

export default function EmergencyTeachings({ onClose }: EmergencyTeachingsProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[85] flex flex-col bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-amber-400/60" />
          <h2 className="text-white/70 text-sm font-display tracking-wider">Emergency Teachings</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          aria-label="Close emergency teachings"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6">
        <div className="text-center mb-6">
          <p className="text-white/30 text-xs font-display mb-1">Instant presence from any master</p>
          <p className="text-white/20 text-[10px] font-display italic">Tap a master to receive their teaching</p>
        </div>

        <div className="space-y-3">
          {EMERGENCY_TEACHINGS.map((t, i) => (
            <motion.div
              key={i}
              className={`p-4 rounded-xl bg-gradient-to-r ${t.color} border ${t.borderColor} cursor-pointer hover:brightness-110 transition-all`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              role="button"
              tabIndex={0}
              aria-label={`${t.master}'s emergency teaching`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{t.image}</span>
                <div className="flex-1">
                  <p className="text-white/70 text-xs font-display font-medium">{t.master}</p>
                  <p className="text-white/40 text-xs font-display italic mt-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    "{t.quote}"
                  </p>
                  <p className="text-white/50 text-xs font-display leading-relaxed mt-2">
                    {t.teaching}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Grounding practice */}
        <motion.div
          className="mt-6 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-white/50 text-xs font-display mb-2">Quick Grounding Practice</p>
          <p className="text-white/30 text-xs font-display leading-relaxed">
            5 things you can see · 4 you can touch · 3 you can hear · 2 you can smell · 1 you can taste.
            <br />
            You are here. You are safe. This will pass.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
