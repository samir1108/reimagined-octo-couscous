/**
 * Voice bridge for orb sessions.
 *
 * Two engines, one contract:
 *   1. Deepgram via the `stt-listen` edge function (Nova-3, primary).
 *      Records a short utterance with MediaRecorder and posts it.
 *   2. Browser SpeechRecognition (fallback, no upload).
 *
 * `listenOnce` decides which to use; if cloud capture cannot start (mic denied,
 * unsupported recorder) it falls back to the browser recogniser. It never
 * throws: unsupported browsers resolve null and the text prompt still works.
 */
import { supabase } from "@/lib/supabase";

interface SpeechAlternative {
  transcript?: string;
}

interface SpeechResult {
  [index: number]: SpeechAlternative;
  length: number;
}

interface SpeechResultList {
  [index: number]: SpeechResult;
  length: number;
}

interface SpeechResultEvent {
  results: SpeechResultList;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as WindowWithSpeech;
  const candidate = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  return typeof candidate === "function" ? candidate : null;
}

export function isSttSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/** True when the device can record a clip for the Deepgram edge function. */
export function isDeepgramSttSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

export type ListenEngine = "deepgram" | "browser" | "auto";

export interface ListenOptions {
  lang?: string;
  timeoutMs?: number;
  /** Keep listening through pauses until timeout/stop. */
  continuous?: boolean;
  engine?: ListenEngine;
}

export interface ListenHandle {
  result: Promise<string | null>;
  stop(): void;
  cancel(): void;
}

function emptyHandle(): ListenHandle {
  return {
    result: Promise.resolve(null),
    stop: () => undefined,
    cancel: () => undefined,
  };
}

function listenBrowser(options: ListenOptions): ListenHandle {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return emptyHandle();

  const recognition = new Ctor();
  recognition.lang = options.lang ?? "en-US";
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let settled = false;
  let timer: number | null = null;
  let resolveResult: (value: string | null) => void = () => undefined;
  const result = new Promise<string | null>((resolve) => {
    resolveResult = resolve;
  });

  const settle = (value: string | null) => {
    if (settled) return;
    settled = true;
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
    resolveResult(value);
  };

  recognition.onresult = (event) => {
    const results = event?.results;
    const first = results?.[0]?.[0]?.transcript;
    const lastIndex = results ? Math.max(0, results.length - 1) : 0;
    const last = results?.[lastIndex]?.[0]?.transcript;
    const transcript = first ?? last ?? null;
    settle(typeof transcript === "string" ? transcript.trim() : null);
  };
  recognition.onerror = () => settle(null);
  recognition.onend = () => settle(null);

  try {
    recognition.start();
  } catch {
    settle(null);
  }

  const timeoutMs = options.timeoutMs ?? 45000;
  if (timeoutMs > 0) {
    timer = window.setTimeout(() => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
      settle(null);
    }, timeoutMs);
  }

  return {
    result,
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    },
    cancel: () => {
      try {
        recognition.abort();
      } catch {
        /* already aborted */
      }
      settle(null);
    },
  };
}

function pickRecorderMime(): string | undefined {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  });
}

function listenDeepgram(options: ListenOptions): ListenHandle {
  let cancelled = false;
  let settled = false;
  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let timer: number | null = null;
  let browser: ListenHandle | null = null;
  let resolveResult: (value: string | null) => void = () => undefined;
  const result = new Promise<string | null>((resolve) => {
    resolveResult = resolve;
  });

  const stopTracks = () => {
    stream?.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        /* already stopped */
      }
    });
    stream = null;
  };

  const settle = (value: string | null) => {
    if (settled) return;
    settled = true;
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
    stopTracks();
    resolveResult(value);
  };

  const runBrowserFallback = () => {
    if (cancelled || settled) return;
    browser = listenBrowser(options);
    browser.result.then(settle).catch(() => settle(null));
  };

  const stop = () => {
    if (cancelled || settled) return;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        runBrowserFallback();
      }
    } else if (!stream) {
      runBrowserFallback();
    }
  };

  const start = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (cancelled) {
        stopTracks();
        return;
      }
      const mime = pickRecorderMime();
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder?.mimeType || mime || "audio/webm" });
        stopTracks();
        if (cancelled || settled) return;
        if (blob.size < 800) {
          runBrowserFallback();
          return;
        }
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stt-listen`;
          const form = new FormData();
          form.append("audio", blob, "voice.webm");
          const response = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
            body: form,
          });
          if (!response.ok) {
            runBrowserFallback();
            return;
          }
          const payload = (await response.json()) as { transcript?: string };
          const text = typeof payload.transcript === "string" ? payload.transcript.trim() : "";
          if (text) settle(text);
          else runBrowserFallback();
        } catch {
          runBrowserFallback();
        }
      };
      recorder.start(250);
      const timeoutMs = options.timeoutMs ?? 45000;
      timer = window.setTimeout(stop, timeoutMs);
    } catch {
      runBrowserFallback();
    }
  };

  void start();

  return {
    result,
    stop,
    cancel: () => {
      cancelled = true;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          /* already stopped */
        }
      }
      browser?.cancel();
      settle(null);
    },
  };
}

export function listenOnce(options: ListenOptions = {}): ListenHandle {
  const engine = options.engine ?? "auto";
  if ((engine === "deepgram" || engine === "auto") && isDeepgramSttSupported()) {
    return listenDeepgram(options);
  }
  return listenBrowser(options);
}
