import { forwardRef, useState, useEffect, useRef } from "react";

interface SafeVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  fallback?: React.ReactNode;
}

function AnimatedGradientFallback({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className || ""}`}>
      {/* Deep cosmic base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.18) 0%, transparent 55%), " +
            "radial-gradient(ellipse at 70% 60%, hsl(var(--accent) / 0.12) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 50% 80%, hsl(var(--secondary) / 0.10) 0%, transparent 55%), " +
            "linear-gradient(to bottom, hsl(var(--background) / 0.9), hsl(var(--background) / 0.95))",
        }}
      />
      {/* Floating orbs */}
      <div
        className="absolute left-1/4 top-1/3 w-[40vmin] h-[40vmin] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "safe-video-float-1 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-1/4 bottom-1/3 w-[35vmin] h-[35vmin] rounded-full opacity-35"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent) / 0.22) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "safe-video-float-2 15s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 w-[25vmin] h-[25vmin] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary) / 0.20) 0%, transparent 70%)",
          filter: "blur(35px)",
          animation: "safe-video-float-3 10s ease-in-out infinite",
        }}
      />
      {/* Subtle star dust */}
      <div className="absolute inset-0 opacity-60">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-foreground/40"
            style={{
              top: `${((i * 47) % 100)}%`,
              left: `${((i * 73) % 100)}%`,
              width: (i % 3) + 1,
              height: (i % 3) + 1,
              animation: `safe-video-twinkle ${2 + (i % 5)}s ${i * 0.2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes safe-video-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(3vw, -2vh) scale(1.08); }
          66% { transform: translate(-2vw, 1.5vh) scale(0.94); }
        }
        @keyframes safe-video-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-2.5vw, 2vh) scale(1.06); }
          66% { transform: translate(2vw, -1.5vh) scale(0.95); }
        }
        @keyframes safe-video-float-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes safe-video-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.6); }
        }
      `}</style>
    </div>
  );
}

const SafeVideo = forwardRef<HTMLVideoElement, SafeVideoProps>(({ src, poster, fallback, className, ...rest }, ref) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  if (error || !src) {
    return <>{fallback || <AnimatedGradientFallback className={className} />}</>;
  }

  return (
    <>
      <video
        ref={ref}
        poster={poster}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setError(true)}
        onCanPlay={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          loaded ? "opacity-80" : "opacity-0"
        } ${className || ""}`}
        {...rest}
      />
      {!loaded && !error && (
        <div className="absolute inset-0 bg-background/40">
          <AnimatedGradientFallback />
        </div>
      )}
    </>
  );
});
SafeVideo.displayName = "SafeVideo";

export default SafeVideo;
