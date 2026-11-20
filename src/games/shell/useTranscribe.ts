// useTranscribe — record mic → POST to stt-listen → returns transcript.
// Falls back to Web Speech API if both Deepgram and ElevenLabs fail.
import { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface TranscribeResult {
  transcript: string;
  confidence?: number | null;
  language?: string | null;
  provider: "deepgram" | "elevenlabs" | "browser";
  durationMs: number;
}

export function useTranscribe() {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    if (recRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recRef.current = rec;
    startedAtRef.current = performance.now();
    rec.start(250);
    setRecording(true);
  }, []);

  const stop = useCallback(async (): Promise<TranscribeResult | null> => {
    const rec = recRef.current;
    if (!rec) return null;
    setRecording(false);
    setTranscribing(true);
    const result = await new Promise<TranscribeResult | null>((resolve) => {
      rec.onstop = async () => {
        try {
          const durationMs = performance.now() - startedAtRef.current;
          const blob = new Blob(chunksRef.current, { type: rec.mimeType });
          chunksRef.current = [];
          streamRef.current?.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          recRef.current = null;

          const fd = new FormData();
          fd.append("audio", blob, "rec.webm");
          const { data, error } = await supabase.functions.invoke("stt-listen", {
            body: fd,
          });
          if (error || (data as any)?.fallback === "browser" || !data) {
            resolve({
              transcript: "",
              provider: "browser",
              durationMs,
            });
            return;
          }
          const d = data as any;
          resolve({
            transcript: d.transcript ?? "",
            confidence: d.confidence ?? null,
            language: d.language ?? null,
            provider: d.provider ?? "deepgram",
            durationMs,
          });
        } catch (e) {
          resolve(null);
        }
      };
      rec.stop();
    });
    setTranscribing(false);
    return result;
  }, []);

  const cancel = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recRef.current = null;
    chunksRef.current = [];
    setRecording(false);
    setTranscribing(false);
  }, []);

  return { start, stop, cancel, recording, transcribing };
}
