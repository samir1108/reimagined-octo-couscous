/**
 * POST-WITNESS REFLECTION
 * After each Witness session, user notes what they observed
 * This data becomes the foundation for AI mind mapping
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Heart, Wind, Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { playGentleChime } from "@/lib/templeSounds";

interface WitnessReflectionProps {
  sessionDuration: number;
  sessionId: string;
  onSave: (data: WitnessSessionData) => void;
  onClose: () => void;
}

export interface WitnessSessionData {
  sessionId: string;
  date: string;
  durationMinutes: number;
  thoughtsObserved: string;
  emotionsFelt: string;
  bodySensations: string;
  headNotes: string;
  heartNotes: string;
  gutNotes: string;
  overallRating: number;
  anythingStandOut: string;
}

const EMOTION_TAGS = ["Calm", "Restless", "Anxious", "Peaceful", "Focused", "Scattered", "Heavy", "Light", "Tense", "Relaxed", "Angry", "Sad", "Joyful", "Numb", "Alert"];
const BODY_TAGS = ["Chest tightness", "Stomach churning", "Head pressure", "Shoulder tension", "Jaw clenching", "Hand tingling", "Leg restlessness", "Throat tight", "Back ache", "Nothing specific"];
const THOUGHT_TAGS = ["Work stress", "Relationship worry", "Money anxiety", "Future fear", "Past regret", "Self-criticism", "Planning", "Random noise", "Nothing specific", "Deep insight"];

export default function WitnessReflection({ sessionDuration, sessionId, onSave, onClose }: WitnessReflectionProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<WitnessSessionData>>({
    sessionId,
    date: new Date().toISOString(),
    durationMinutes: sessionDuration,
    thoughtsObserved: "",
    emotionsFelt: "",
    bodySensations: "",
    headNotes: "",
    heartNotes: "",
    gutNotes: "",
    overallRating: 3,
    anythingStandOut: "",
  });
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedBody, setSelectedBody] = useState<string[]>([]);
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>([]);

  const toggleTag = (list: string[], setList: (l: string[]) => void, tag: string) => {
    if (list.includes(tag)) setList(list.filter(t => t !== tag));
    else setList([...list, tag]);
  };

  const save = () => {
    playGentleChime();
    onSave({
      ...data,
      emotionsFelt: selectedEmotions.join(", "),
      bodySensations: selectedBody.join(", "),
      thoughtsObserved: selectedThoughts.join(", "),
    } as WitnessSessionData);
  };

  const steps = [
    // Step 0: Emotions
    <div key="emotions" className="space-y-4">
      <h3 className="text-white/70 text-sm font-display font-medium text-center">What emotions surfaced up?</h3>
      <p className="text-white/30 text-xs font-display text-center mb-4">Tap all that apply. Add your own below.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {EMOTION_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(selectedEmotions, setSelectedEmotions, tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-display transition-all ${
              selectedEmotions.includes(tag)
                ? "bg-amber-500/20 border border-amber-500/30 text-amber-200/80"
                : "bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <textarea
        value={data.emotionsFelt || ""}
        onChange={(e) => setData(prev => ({ ...prev, emotionsFelt: e.target.value }))}
        placeholder="Anything else you felt..."
        rows={2}
        className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-display placeholder:text-white/20 outline-none resize-none"
      />
    </div>,

    // Step 1: Body
    <div key="body" className="space-y-4">
      <h3 className="text-white/70 text-sm font-display font-medium text-center">What did you feel in the body?</h3>
      <p className="text-white/30 text-xs font-display text-center mb-4">Tap all that apply.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {BODY_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(selectedBody, setSelectedBody, tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-display transition-all ${
              selectedBody.includes(tag)
                ? "bg-rose-500/20 border border-rose-500/30 text-rose-200/80"
                : "bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <textarea
        value={data.bodySensations || ""}
        onChange={(e) => setData(prev => ({ ...prev, bodySensations: e.target.value }))}
        placeholder="Any other body sensations..."
        rows={2}
        className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-display placeholder:text-white/20 outline-none resize-none"
      />
    </div>,

    // Step 2: Thoughts
    <div key="thoughts" className="space-y-4">
      <h3 className="text-white/70 text-sm font-display font-medium text-center">What thoughts kept arising?</h3>
      <p className="text-white/30 text-xs font-display text-center mb-4">Tap all that apply.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {THOUGHT_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(selectedThoughts, setSelectedThoughts, tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-display transition-all ${
              selectedThoughts.includes(tag)
                ? "bg-blue-500/20 border border-blue-500/30 text-blue-200/80"
                : "bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <textarea
        value={data.thoughtsObserved || ""}
        onChange={(e) => setData(prev => ({ ...prev, thoughtsObserved: e.target.value }))}
        placeholder="Any other thoughts you noticed..."
        rows={2}
        className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-display placeholder:text-white/20 outline-none resize-none"
      />
    </div>,

    // Step 3: 3 Brains detail
    <div key="brains" className="space-y-3">
      <h3 className="text-white/70 text-sm font-display font-medium text-center">Deeper observation of the 3 brains</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-300/50" />
          <span className="text-white/50 text-xs font-display">Head:</span>
        </div>
        <textarea
          value={data.headNotes || ""}
          onChange={(e) => setData(prev => ({ ...prev, headNotes: e.target.value }))}
          placeholder="What was the mind doing? Thoughts? Stories? Planning?"
          rows={2}
          className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-display placeholder:text-white/20 outline-none resize-none"
        />
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-300/50" />
          <span className="text-white/50 text-xs font-display">Heart:</span>
        </div>
        <textarea
          value={data.heartNotes || ""}
          onChange={(e) => setData(prev => ({ ...prev, heartNotes: e.target.value }))}
          placeholder="What was the heart feeling? Expansion? Contraction?"
          rows={2}
          className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-display placeholder:text-white/20 outline-none resize-none"
        />
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-emerald-300/50" />
          <span className="text-white/50 text-xs font-display">Gut:</span>
        </div>
        <textarea
          value={data.gutNotes || ""}
          onChange={(e) => setData(prev => ({ ...prev, gutNotes: e.target.value }))}
          placeholder="What was the gut sensing? Tightness? Intuition? Fear?"
          rows={2}
          className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-display placeholder:text-white/20 outline-none resize-none"
        />
      </div>
    </div>,

    // Step 4: Overall + standout
    <div key="overall" className="space-y-4">
      <h3 className="text-white/70 text-sm font-display font-medium text-center">How was this session?</h3>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map(r => (
          <button
            key={r}
            onClick={() => setData(prev => ({ ...prev, overallRating: r }))}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-display transition-all ${
              (data.overallRating || 3) >= r
                ? "bg-amber-500/30 border border-amber-500/40 text-amber-200/80"
                : "bg-white/[0.06] border border-white/[0.1] text-white/30"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <textarea
        value={data.anythingStandOut || ""}
        onChange={(e) => setData(prev => ({ ...prev, anythingStandOut: e.target.value }))}
        placeholder="Anything that stood out? A moment of clarity? A recurring thought? Write it here."
        rows={3}
        className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-display placeholder:text-white/20 outline-none resize-none"
      />
    </div>,
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex flex-col bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300/50" />
          <span className="text-white/60 text-xs font-display">Session Reflection</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/25 text-[10px] font-display">{step + 1} / {steps.length}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === step ? "bg-amber-400/60 w-4" : i < step ? "bg-amber-400/30" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex gap-2">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/40 text-xs font-display tracking-wider hover:bg-white/[0.1] transition-colors"
          >
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/20 text-amber-200/70 text-xs font-display tracking-wider hover:from-amber-600/30 hover:to-orange-600/30 transition-all"
          >
            Next
          </button>
        ) : (
          <button
            onClick={save}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/25 text-amber-200/80 text-xs font-display tracking-wider hover:from-amber-600/40 hover:to-orange-600/40 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Save Reflection
          </button>
        )}
      </div>
    </motion.div>
  );
}
