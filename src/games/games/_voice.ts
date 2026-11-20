// Thin wrapper: exposes a `transcript` string updated when stop() resolves.
// Convenience for games that want a single hook returning live-ish text.
import { useCallback, useState } from "react";
import { useTranscribe } from "../shell/useTranscribe";

export function useVoiceText() {
  const t = useTranscribe();
  const [transcript, setTranscript] = useState("");

  const start = useCallback(async () => {
    setTranscript("");
    await t.start();
  }, [t]);

  const stop = useCallback(async () => {
    const r = await t.stop();
    if (r?.transcript) setTranscript(r.transcript);
    return r;
  }, [t]);

  return { start, stop, transcript, recording: t.recording, transcribing: t.transcribing };
}
