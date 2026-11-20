import { motion, useReducedMotion } from "framer-motion";

export function ProgressRing({ value, max, size = 80, strokeWidth = 6, color = "hsl(var(--primary))", children }: {
  value: number; max: number; size?: number; strokeWidth?: number; color?: string; children?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const radius = Math.max(0, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.max(0, Math.min(1, value / max)) * circumference : 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: "easeOut" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
