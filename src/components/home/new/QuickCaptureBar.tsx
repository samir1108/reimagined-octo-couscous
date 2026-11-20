"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Mic, Pen, Camera, X, Send, Sparkles, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface QuickCaptureBarProps {
  onCapture: (type: "voice" | "text" | "photo", content: string) => void;
  className?: string;
}

export function QuickCaptureBar({
  onCapture,
  className = "",
}: QuickCaptureBarProps) {
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<"idle" | "voice" | "text" | "photo">("idle");
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      setAudioChunks([]);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) setAudioChunks(prev => [...prev, e.data]);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          onCapture("voice", reader.result as string);
          setMode("idle");
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      setMode("voice");
    } catch (e) {
      console.error("Recording failed:", e);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture("photo", reader.result as string);
        setMode("idle");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto ${className}`}
    >
      {mode === "idle" ? (
        <div className="p-4 bg-background/40 border border-border/30 rounded-2xl">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Quick Capture</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={startRecording}
              className="p-3 bg-background/40 border border-border/30 rounded-xl flex flex-col items-center gap-1 hover:border-primary/50 transition-colors"
            >
              <Mic className="w-5 h-5 text-primary" />
              <span className="text-xs text-foreground">Voice</span>
            </button>
            <button
              onClick={() => setMode("text")}
              className="p-3 bg-background/40 border border-border/30 rounded-xl flex flex-col items-center gap-1 hover:border-primary/50 transition-colors"
            >
              <Pen className="w-5 h-5 text-primary" />
              <span className="text-xs text-foreground">Text</span>
            </button>
            <button
              onClick={handlePhotoCapture}
              className="p-3 bg-background/40 border border-border/30 rounded-xl flex flex-col items-center gap-1 hover:border-primary/50 transition-colors"
            >
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-xs text-foreground">Photo</span>
            </button>
          </div>
        </div>
      ) : mode === "voice" ? (
        <div className="p-4 bg-background/40 border border-border/30 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recording...</p>
            <button onClick={() => setMode("idle")} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: recording ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center"
            >
              <Mic className="w-8 h-8 text-destructive" />
            </motion.div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={stopRecording}
              className="flex-1 py-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl hover:bg-destructive/20 transition-colors"
            >
              Stop & Save
            </button>
            <button
              onClick={() => { stopRecording(); setMode("idle"); }}
              className="flex-1 py-2 bg-muted/50 border border-border/30 rounded-xl hover:bg-muted/70 transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      ) : mode === "text" ? (
        <div className="p-4 bg-background/40 border border-border/30 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Text Note</p>
            <button onClick={() => setMode("idle")} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you notice? What shifted?"
            className="w-full min-h-[80px] p-3 bg-background border border-border/30 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { onCapture("text", text); setText(""); setMode("idle"); }}
              disabled={!text.trim()}
              className="flex-1 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => { setText(""); setMode("idle"); }}
              className="flex-1 py-2 bg-muted/50 border border-border/30 rounded-xl hover:bg-muted/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : mode === "photo" ? (
        <div className="p-4 bg-background/40 border border-border/30 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Photo Moment</p>
            <button onClick={() => setMode("idle")} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center py-6">
            <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Tap to capture a moment</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={handlePhotoCapture}
              className="px-6 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-colors"
            >
              Take Photo
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setMode("idle")}
              className="flex-1 py-2 bg-muted/50 border border-border/30 rounded-xl hover:bg-muted/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}