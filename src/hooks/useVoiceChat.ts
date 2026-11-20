import { useCallback, useRef } from "react";
import { useMachine } from "@xstate/react";
import { toast } from "@/hooks/use-toast";
import { conscious } from "@/lib/consciousToast";
import { voiceMachine } from "@/machines/voiceMachine";

export function useVoiceChat() {
  const [state, send] = useMachine(voiceMachine);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported in this browser");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;

      recognition.start();
      send({ type: "START_RECORDING" });
    } catch (err: any) {
      send({ type: "MIC_ERROR", error: err.message || "Microphone access denied" });
      conscious("voiceUnheard", { kind: "error", detail: err?.message });
    }
  }, [send]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const recognition = recognitionRef.current;
      if (!recognition) {
        send({ type: "TRANSCRIPTION_DONE" });
        resolve(null);
        return;
      }

      recognition.onresult = (event: any) => {
        const text = event.results[0]?.[0]?.transcript || null;
        send({ type: "TRANSCRIPTION_DONE" });
        recognitionRef.current = null;
        resolve(text);
      };

      recognition.onerror = (event: any) => {
        send({ type: "TRANSCRIPTION_ERROR", error: event.error || "Recognition failed" });
        conscious("voiceUnheard", { kind: "error" });
        recognitionRef.current = null;
        resolve(null);
      };

      recognition.onend = () => {
        // If no result came, resolve null
        if (recognitionRef.current) {
          recognitionRef.current = null;
          send({ type: "TRANSCRIPTION_DONE" });
          resolve(null);
        }
      };

      send({ type: "STOP_RECORDING" });
      recognition.stop();
    });
  }, [send]);

  const speakText = useCallback(async (text: string) => {
    if (!state.context.voiceEnabled) return;
    if (!window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    send({ type: "SPEAK" });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to pick a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Female"))
    ) || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    currentUtteranceRef.current = utterance;

    utterance.onend = () => {
      send({ type: "SPEAK_DONE" });
      currentUtteranceRef.current = null;
    };

    utterance.onerror = () => {
      send({ type: "SPEAK_ERROR" });
      currentUtteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, [state.context.voiceEnabled, send]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    currentUtteranceRef.current = null;
    send({ type: "STOP_SPEAKING" });
  }, [send]);

  const toggleVoice = useCallback(() => {
    if (state.context.voiceEnabled) stopSpeaking();
    send({ type: "TOGGLE_VOICE" });
  }, [state.context.voiceEnabled, stopSpeaking, send]);

  return {
    isRecording: state.matches("recording"),
    isTranscribing: state.matches("transcribing"),
    isSpeaking: state.matches("speaking"),
    voiceEnabled: state.context.voiceEnabled,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
    toggleVoice,
  };
}
