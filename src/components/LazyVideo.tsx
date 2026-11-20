import { useEffect, useRef, useState } from "react";
import SafeVideo from "@/components/SafeVideo";

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
}

/**
 * Only loads/plays the video once it scrolls into view.
 * Uses SafeVideo internally so broken URLs fall back to an animated gradient
 * instead of a blank/black screen.
 */
const LazyVideo = ({ src, poster, className, ...rest }: LazyVideoProps) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!visible) {
    return (
      <div className={`${className || ""}`}>
        <img src={poster} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }

  return <SafeVideo src={src} poster={poster} className={className} {...rest} />;
};

export default LazyVideo;
