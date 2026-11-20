import { useEffect, useRef, useState } from "react";
import SafeVideo from "@/components/SafeVideo";
import { getVideoUrl, getImageUrl } from "@/lib/media";

interface LazyVideoCDNProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'poster'> {
  videoKey: string;
  posterKey?: string;
  posterOptions?: { width?: number; height?: number; quality?: number };
}

const LazyVideoCDN = ({
  videoKey,
  posterKey,
  posterOptions,
  className,
  ...rest
}: LazyVideoCDNProps) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string>('');
  const [poster, setPoster] = useState<string>('');

  useEffect(() => {
    setSrc(getVideoUrl(videoKey));
    if (posterKey) setPoster(getImageUrl(posterKey, posterOptions));
  }, [videoKey, posterKey, posterOptions]);

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
        {poster && (
          <img src={poster} alt="" className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>
    );
  }

  return <SafeVideo src={src} poster={poster} className={className} {...rest} />;
};

export default LazyVideoCDN;