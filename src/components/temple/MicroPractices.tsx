/**
 * Micro-Practices - Weaved throughout the day
 * Per temple.md Section 30: 30s-2min practices triggered by daily moments
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface MicroPractice {
  id: string;
  trigger: string;
  title: string;
  duration: string;
  practice: string;
  master: string;
  instruction: string;
}

const MICRO_PRACTICES: MicroPractice[] = [
  {
    id: "brushing",
    trigger: "Brushing teeth",
    title: "Mindfulness with Buddha",
    duration: "30s",
    practice: "Brush mindfully",
    master: "Buddha",
    instruction: "Feel the brush. Taste the paste. Notice the motion. This is meditation. Nothing else needed.",
  },
  {
    id: "traffic",
    trigger: "Stuck in traffic",
    title: "Naam Jap with Kabir",
    duration: "2 min",
    practice: "Chant silently",
    master: "Kabir",
    instruction: "Close your eyes at the next red light. Silently repeat any name of the divine. Let the traffic be your mala.",
  },
  {
    id: "meeting",
    trigger: "Before meeting",
    title: "Heart Coherence",
    duration: "1 min",
    practice: "Open your heart",
    master: "Rumi",
    instruction: "Hand on heart. One deep breath. Enter this meeting not as a task — as an encounter with the divine in another.",
  },
  {
    id: "lunch",
    trigger: "After lunch",
    title: "Body Scan",
    duration: "3 min",
    practice: "Feel your body",
    master: "Buddha",
    instruction: "Close your eyes. Scan from head to toe. Where is there tension? Don't fix it. Just know it's there. That knowing is healing.",
  },
  {
    id: "elevator",
    trigger: "Waiting for elevator",
    title: "Three Conscious Breaths",
    duration: "30s",
    practice: "Just three breaths",
    master: "Lao Tzu",
    instruction: "Three breaths. That's all. In — the whole universe breathes in you. Out — the whole universe breathes out through you.",
  },
  {
    id: "shower",
    trigger: "In the shower",
    title: "Water Purification",
    duration: "1 min",
    practice: "Let water cleanse",
    master: "Krishna",
    instruction: "Feel the water. Imagine it washing away not just dirt, but every worry, every fear, every identity. Step out as pure consciousness.",
  },
  {
    id: "phone",
    trigger: "Reaching for phone",
    title: "The Pause",
    duration: "10s",
    practice: "Pause before scrolling",
    master: "Ramana Maharshi",
    instruction: "Before you unlock your phone, ask: 'What am I looking for?' Pause. Breathe. Then choose consciously.",
  },
  {
    id: "angry",
    trigger: "Feeling angry",
    title: "The Gap",
    duration: "30s",
    practice: "Find the space between trigger and response",
    master: "Buddha",
    instruction: "Feel the anger rising. Don't act. Don't suppress. Just feel it in your body. The gap between feeling and reaction — that's where freedom lives.",
  },
  {
    id: "worried",
    trigger: "Worrying about future",
    title: "Present Moment Anchor",
    duration: "1 min",
    practice: "Return to now",
    master: "Eckhart Tolle's Student",
    instruction: "Right now, in this exact moment, are you okay? Not tomorrow. Not yesterday. Right now. Feel your feet on the ground. You are here. You are safe.",
  },
  {
    id: "grateful",
    trigger: "Something good happened",
    title: "Gratitude Pause",
    duration: "15s",
    practice: "Acknowledge the gift",
    master: "Krishna",
    instruction: "Don't rush past the good moment. Pause. Feel it fully. Say silently: 'This is grace. This was never guaranteed.' Let gratitude fill you.",
  },
];

interface MicroPracticesProps {
  onClose: () => void;
  onSelect: (practice: MicroPractice) => void;
}

export default function MicroPractices({ onClose, onSelect }: MicroPracticesProps) {
  const [selected, setSelected] = useState<MicroPractice | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, secondsLeft]);

  const startPractice = (practice: MicroPractice) => {
    setSelected(practice);
    const match = practice.duration.match(/(\d+)/);
    const duration = match ? parseInt(match[1]) : 1;
    setSecondsLeft(duration * 60);
    setIsRunning(true);
  };

  if (selected && isRunning) {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
      <motion.div
        className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center px-6">
          <p className="text-white/30 text-xs font-display mb-1">{selected.master}</p>
          <h3 className="text-white/70 text-lg font-display mb-6">{selected.title}</h3>

          <div className="text-6xl font-display text-white/80 tabular-nums mb-4">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>

          <p className="text-white/40 text-sm font-display leading-relaxed max-w-sm mx-auto mb-8">
            {selected.instruction}
          </p>

          <button
            onClick={() => { setIsRunning(false); setSelected(null); }}
            className="px-6 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/40 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-all"
          >
            End Practice
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[75] flex flex-col bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-white/70 text-sm font-display tracking-wider">Micro-Practices</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors" aria-label="Close micro-practices">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4">
        <p className="text-white/25 text-xs font-display text-center mb-4">
          30s-2min practices woven through your day
        </p>

        <div className="space-y-2">
          {MICRO_PRACTICES.map((practice, i) => (
            <motion.button
              key={practice.id}
              onClick={() => startPractice(practice)}
              className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs font-display font-medium">{practice.trigger}</p>
                  <p className="text-white/30 text-[10px] font-display mt-0.5">{practice.practice} · {practice.master}</p>
                </div>
                <span className="flex items-center gap-1 text-white/20 text-[10px] font-display">
                  <Clock className="w-3 h-3" />
                  {practice.duration}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
