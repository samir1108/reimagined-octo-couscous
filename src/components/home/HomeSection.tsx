import { motion } from "framer-motion";
import { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface HomeSectionProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  accentColor?: string;
  delay?: number;
  className?: string;
  divider?: boolean;
}

export default function HomeSection({
  children,
  title,
  icon,
  accentColor,
  delay = 0,
  className = "",
  divider = true,
}: HomeSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.1 + delay * 0.05 }}
      className={`${className} ${divider ? "relative" : ""}`}
    >
      {divider && (
        <div
          aria-hidden
          className="absolute -top-3 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          style={accentColor ? { background: `linear-gradient(90deg, transparent, hsl(${accentColor} / 0.2), transparent)` } : {}}
        />
      )}

      {(title || icon) && (
        <div className="mb-4 flex items-center gap-2.5 px-1">
          {icon && (
            <span className="flex-shrink-0 text-primary/80" aria-hidden>{icon}</span>
          )}
          {title && (
            <h2 className="text-xs font-display font-medium tracking-[0.16em] uppercase text-muted-foreground/80">
              {title}
            </h2>
          )}
        </div>
      )}

      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}

interface HomeCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function HomeCard({ children, className = "", hover = false, padding = "md" }: HomeCardProps) {
  const pad = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  }[padding];

  return (
    <div
      className={`
        rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm
        ${pad}
        ${hover ? "transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function HomeCardHeader({
  title,
  subtitle,
  icon,
  action,
  accentColor,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  accentColor?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <span
            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-[11px] font-display"
            style={accentColor ? { color: `hsl(${accentColor})`, backgroundColor: `hsl(${accentColor} / 0.1)` } : {}}
            aria-hidden
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-[11px] font-display font-medium tracking-[0.18em] uppercase text-foreground/80 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}