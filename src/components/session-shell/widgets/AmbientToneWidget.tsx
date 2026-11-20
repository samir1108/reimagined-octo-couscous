import { useEffect, useRef, useState } from "react";
import { Button, Slider } from "@/design-system";
import { Play, Square } from "lucide-react";

type ToneKind = "bowl" | "drone" | "binaural" | "noise" | "rain";

interface AmbientToneWidgetProps {
  tone?: ToneKind;
  durationSeconds?: number;
  volume?: number;
  carrierHz?: number;
  beatHz?: number;
  onComplete?: (payload: { tone: ToneKind; listenedSeconds: number }) => void;
}

export function AmbientToneWidget({
  tone = "bowl",
  durationSeconds = 300,
  volume = 0.3,
  carrierHz = 200,
  beatHz = 10,
  onComplete,
}: AmbientToneWidgetProps) {
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState(volume);
  const [elapsed, setElapsed] = useState(0);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioScheduledSourceNode[]>([]);
  const timerRef = useRef<number | null>(null);
  const completeRef = useRef(false);

  function stopNodes() {
    for (const node of nodesRef.current) {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    }
    nodesRef.current = [];
  }

  function stop() {
    stopNodes();
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
  }

  function start() {
    stopNodes();
    let context = contextRef.current;
    if (!context) {
      context = new AudioContext();
      contextRef.current = context;
    }
    void context.resume();

    const master = context.createGain();
    master.gain.value = level;
    master.connect(context.destination);
    masterRef.current = master;

    if (tone === "binaural") {
      const left = context.createOscillator();
      const right = context.createOscillator();
      const leftPan = context.createStereoPanner();
      const rightPan = context.createStereoPanner();
      left.type = "sine";
      right.type = "sine";
      left.frequency.value = carrierHz;
      right.frequency.value = carrierHz + beatHz;
      leftPan.pan.value = -1;
      rightPan.pan.value = 1;
      left.connect(leftPan).connect(master);
      right.connect(rightPan).connect(master);
      left.start();
      right.start();
      nodesRef.current = [left, right];
    } else if (tone === "noise" || tone === "rain") {
      const length = context.sampleRate * 2;
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = tone === "rain" ? "lowpass" : "bandpass";
      filter.frequency.value = tone === "rain" ? 1400 : 900;
      filter.Q.value = tone === "rain" ? 0.6 : 0.9;
      source.connect(filter).connect(master);
      source.start();
      nodesRef.current = [source];
    } else {
      const frequencies = tone === "bowl" ? [136.1, 210.4, 341.3] : [110, 164.8, 220];
      for (const frequency of frequencies) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        oscillator.detune.value = Math.random() * 6 - 3;
        gain.gain.value = tone === "bowl" ? 0.16 : 0.1;
        oscillator.connect(gain).connect(master);
        oscillator.start();
        nodesRef.current.push(oscillator);
      }
    }

    setPlaying(true);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);
  }

  useEffect(() => {
    if (!playing || completeRef.current || elapsed < durationSeconds) return;
    completeRef.current = true;
    stop();
    onComplete?.({ tone, listenedSeconds: durationSeconds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, playing, durationSeconds, tone]);

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.gain.value = level;
    }
  }, [level]);

  useEffect(() => {
    return () => {
      stop();
      if (contextRef.current && contextRef.current.state !== "closed") {
        void contextRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = Math.max(0, durationSeconds - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="flex h-32 w-32 items-center justify-center rounded-full border border-border/40 bg-gradient-to-br from-fuchsia-500/20 via-violet-400/10 to-transparent">
        <span className="text-3xl font-extralight tabular-nums tracking-tight">{mm}:{ss}</span>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {playing ? "Let the sound hold the room." : "Headphones recommended. Press play when ready."}
      </p>

      <div className="flex w-full max-w-xs items-center gap-3">
        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60">Vol</span>
        <Slider value={[Math.round(level * 100)]} min={0} max={100} step={1} onValueChange={(value) => setLevel((value[0] ?? 0) / 100)} />
      </div>

      <Button
        onClick={() => (playing ? stop() : start())}
        className="rounded-full px-6"
        variant={playing ? "ghost" : "default"}
      >
        {playing ? <Square className="mr-1 h-3.5 w-3.5" /> : <Play className="mr-1 h-3.5 w-3.5" />}
        {playing ? "Stop" : "Begin"}
      </Button>
    </div>
  );
}
