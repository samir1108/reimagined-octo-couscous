/**
 * BreathingBackground
 * A subtle, app-wide ambient layer that gently expands and contracts
 * like a slow breath (~7s in, ~7s out). Sits behind all content.
 * Honors prefers-reduced-motion.
 */
const BreathingBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Primary breath orb */}
      <div
        className="absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 motion-safe:animate-app-breathe"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.18) 0%, hsl(var(--primary) / 0.08) 35%, transparent 70%)",
          filter: "blur(60px)",
          willChange: "transform, opacity",
        }}
      />
      {/* Secondary counter-breath glow (slower, offset) */}
      <div
        className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 motion-safe:animate-app-breathe-slow"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.20) 0%, transparent 65%)",
          filter: "blur(80px)",
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
};

export default BreathingBackground;
