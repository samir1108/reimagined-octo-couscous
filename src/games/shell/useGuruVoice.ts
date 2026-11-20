// useGuruVoice — single hook every game uses to speak.
// Path: tts-speak edge fn (Deepgram → ElevenLabs) → browser SpeechSynthesis fallback.
// Silent failure: never blocks meditative flow.
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type GuruVoiceKey = "guru" | "guru_male" | "child" | "elder";

interface QueueItem {
  text: string;
  voice: GuruVoiceKey;
  resolve: () => void;
}

export function useGuruVoice() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const playingRef = useRef(false);
  const cacheRef = useRef<Map<string, string>>(new Map()); // text→objectUrl

  const browserFallback = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const synth = window.speechSynthesis;
        if (!synth) return resolve();
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.92;
        utter.pitch = 1.0;
        utter.volume = 1.0;
        const voices = synth.getVoices();
        const calm =
          voices.find((v) => /samantha|karen|moira|google.*female/i.test(v.name)) ||
          voices.find((v) => v.lang?.startsWith("en"));
        if (calm) utter.voice = calm;
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        synth.speak(utter);
      } catch {
        resolve();
      }
    });
  }, []);

  const playNext = useCallback(async () => {
    if (playingRef.current) return;
    const item = queueRef.current.shift();
    if (!item) {
      setSpeaking(false);
      return;
    }
    playingRef.current = true;
    setSpeaking(true);

    const cacheKey = `${item.voice}:${item.text}`;
    let url = cacheRef.current.get(cacheKey);

    if (!url) {
      try {
        const { data, error } = await supabase.functions.invoke("tts-speak", {
          body: { text: item.text, voice: item.voice },
        });
        // Edge fn returns raw mp3 bytes on success, or {fallback:'browser'} JSON on failure
        if (error || (data && typeof data === "object" && (data as any).fallback === "browser")) {
          await browserFallback(item.text);
          playingRef.current = false;
          item.resolve();
          playNext();
          return;
        }
        // supabase-js returns Blob for binary
        const blob = data instanceof Blob ? data : new Blob([data as any], { type: "audio/mpeg" });
        url = URL.createObjectURL(blob);
        cacheRef.current.set(cacheKey, url);
      } catch {
        await browserFallback(item.text);
        playingRef.current = false;
        item.resolve();
        playNext();
        return;
      }
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      playingRef.current = false;
      item.resolve();
      playNext();
    };
    audio.onerror = async () => {
      await browserFallback(item.text);
      playingRef.current = false;
      item.resolve();
      playNext();
    };
    try {
      await audio.play();
    } catch {
      await browserFallback(item.text);
      playingRef.current = false;
      item.resolve();
      playNext();
    }
  }, [browserFallback]);

  const say = useCallback(
    (text: string, voice: GuruVoiceKey = "guru"): Promise<void> => {
      return new Promise((resolve) => {
        queueRef.current.push({ text, voice, resolve });
        playNext();
      });
    },
    [playNext]
  );

  const stop = useCallback(() => {
    queueRef.current.forEach((q) => q.resolve());
    queueRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    playingRef.current = false;
    setSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      stop();
      cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      cacheRef.current.clear();
    };
  }, [stop]);

  return { say, stop, speaking };
}
