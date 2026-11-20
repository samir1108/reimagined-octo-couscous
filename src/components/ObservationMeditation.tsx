import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Eye, Volume2, X, RotateCcw } from "lucide-react";
import meditationBg from "@/assets/meditation-observation.jpg";

const SCRIPT_SECTIONS = [
  { title: "Settling In", text: "Close your eyes gently. Take a deep breath in... and slowly release.\n\nYou are not here to do anything. You are here simply to observe." },
  { title: "Body Awareness", text: "Become aware of your body sitting here. Feel the weight of your body pressing down. Feel the contact points — your legs on the surface, your hands resting." },
  { title: "Breath Observation", text: "Now, without changing anything, notice your breath. Don't control it. Just watch it. Air flowing in... air flowing out. Like watching waves on a shore. You are the shore. The breath comes and goes on its own." },
  { title: "Watching Thoughts", text: "Now shift your attention inward. Thoughts are arising. You can see them. A thought appears — observe it like a cloud passing through an empty sky. You are the sky. The thought is just a cloud. It will pass." },
  { title: "Self-Inquiry", text: "Ask yourself silently: Who is watching these thoughts? Who is aware right now?\n\nDon't search for an answer with the mind. Simply rest in the question. Let the question dissolve into silence." },
  { title: "The Witness", text: "Notice — there is something here that is always aware. Before every thought, between every thought, after every thought — awareness remains. Still. Untouched.\n\nThis is you. Not the thoughts. Not the emotions. Not the body sensations. You are the witness — the unchanging observer." },
  { title: "Resting in Awareness", text: "Rest here. In this spacious awareness. There is nothing to achieve. Nothing to fix. Just pure observation. Pure being.\n\nStay with this silence for a moment..." },
  { title: "Return", text: "When you feel ready, slowly bring your awareness back to the room. Feel your body. Hear the sounds around you. Gently open your eyes.\n\nYou have touched something ancient. Something that was always here. Carry this witness awareness with you — into every moment of your day." },
];

function getPreferredVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v =>
    v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Female"))
  ) || voices.find(v => v.lang.startsWith("en")) || null;
}

export default function ObservationMeditation({ onClose }: { onClose: () => void }) {
  const [activeSection, setActiveSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Ensure voices are loaded
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handler = () => {};
    window.speechSynthesis?.addEventListener?.("voiceschanged", handler);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", handler);
  }, []);

  const playSection = useCallback((sectionIndex: number) => {
    window.speechSynthesis?.cancel();
    setActiveSection(sectionIndex);
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(SCRIPT_SECTIONS[sectionIndex].text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getPreferredVoice();
    if (voice) utterance.voice = voice;

    utteranceRef.current = utterance;

    utterance.onend = () => {
      setIsPlaying(false);
      // Auto-advance
      if (sectionIndex < SCRIPT_SECTIONS.length - 1) {
        setTimeout(() => playSection(sectionIndex + 1), 1500);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    } else {
      playSection(activeSection);
    }
  }, [isPlaying, activeSection, playSection]);

  const restart = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setActiveSection(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={meditationBg} alt="Observation meditation" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--void))] via-[hsl(var(--void))/0.6] to-transparent" />
        <div className="absolute inset-0 bg-[hsl(var(--void))/0.35]" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <span className="font-display text-sm tracking-[0.15em] uppercase text-primary/80">
            Observation Meditation
          </span>
        </div>
        <button
          onClick={() => { window.speechSynthesis?.cancel(); onClose(); }}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-muted/50 transition-colors"
        >
          <X className="w-5 h-5 text-foreground/70" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-y-auto">
        {/* Section Progress */}
        <div className="flex gap-1.5 mb-8">
          {SCRIPT_SECTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => playSection(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeSection
                  ? "w-8 bg-primary"
                  : i < activeSection
                  ? "w-4 bg-primary/40"
                  : "w-4 bg-foreground/15"
              }`}
            />
          ))}
        </div>

        {/* Active Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg text-center space-y-4"
          >
            <p className="text-xs font-display tracking-[0.2em] uppercase text-primary/60">
              {SCRIPT_SECTIONS[activeSection].title}
            </p>
            <p className="text-lg md:text-xl font-body text-foreground/90 leading-relaxed whitespace-pre-line">
              {SCRIPT_SECTIONS[activeSection].text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Breathing Pulse */}
        {isPlaying && (
          <motion.div
            className="mt-10 w-20 h-20 rounded-full border border-primary/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-center gap-4 pb-8 md:pb-12">
        <button
          onClick={restart}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:bg-muted/50 transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-foreground/60" />
        </button>

        <button
          onClick={togglePlayPause}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center
                     hover:brightness-110 transition-all active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-0.5" />
          )}
        </button>

        <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-foreground/60" />
        </div>
      </div>
    </motion.div>
  );
}
