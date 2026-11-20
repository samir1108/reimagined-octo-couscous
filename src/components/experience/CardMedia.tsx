/**
 * CardMedia — image with optional autoplay/loop 5-sec video overlay.
 * If videoUrl is provided, the video autoplays muted, loops seamlessly,
 * and gracefully falls back to the image on any load error. Uses
 * `poster` so first paint is immediate.
 */
import { useRef, useState } from "react";

interface Props {
  image: string;
  videoUrl?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function CardMedia({
  image, videoUrl, alt, className, width = 1536, height = 896,
}: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement | null>(null);

  if (!videoUrl || failed) {
    return (
      <img
        src={image}
        alt={alt}
        loading="lazy"
        width={width}
        height={height}
        className={className}
      />
    );
  }

  return (
    <video
      ref={ref}
      src={videoUrl}
      poster={image}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt}
      onError={() => setFailed(true)}
      className={className}
      width={width}
      height={height}
    />
  );
}
