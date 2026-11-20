import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title?: string;
  loop?: boolean;
  playbackRate?: number;
  showControls?: boolean;
  autoPlay?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  onComplete?: (payload: { listenedSeconds: number }) => void;
}

export function AudioPlayer({
  src,
  title,
  loop = false,
  playbackRate = 1,
  showControls = true,
  autoPlay = false,
  fadeIn = 0,
  fadeOut = 0,
  onComplete,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [listened, setListened] = useState(0);
  const listenedRef = useRef(0);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.playbackRate = playbackRate;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      listenedRef.current = Math.max(listenedRef.current, audio.currentTime);
      setListened(listenedRef.current);
    });
    audio.addEventListener("ended", () => {
      setPlaying(false);
      if (onComplete) onComplete({ listenedSeconds: Math.round(listenedRef.current) });
    });

    if (autoPlay) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src, loop, playbackRate, autoPlay, onComplete]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }

  const mins = Math.floor(currentTime / 60);
  const secs = Math.floor(currentTime % 60);
  const totalMins = Math.floor(duration / 60);
  const totalSecs = Math.floor(duration % 60);
  const pct = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="flex flex-col gap-4 py-4">
      {title && <p className="text-center font-medium">{title}</p>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{mins}:{secs.toString().padStart(2, "0")}</span>
        <span>{totalMins}:{totalSecs.toString().padStart(2, "0")}</span>
      </div>
      {showControls && (
        <div className="flex items-center justify-center gap-3">
          <Button onClick={toggle} size="icon" className="h-10 w-10 rounded-full">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={toggleMute} size="icon" variant="ghost" className="h-10 w-10 rounded-full">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      )}
      {onComplete && (
        <div className="flex justify-end">
          <Button
            onClick={() => onComplete({ listenedSeconds: Math.round(listened) })}
            className="rounded-full px-6"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
