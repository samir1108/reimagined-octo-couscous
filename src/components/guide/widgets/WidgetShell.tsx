import { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  icon?: ReactNode;
  title?: string;
  prompt?: string;
  done?: boolean;
  children: ReactNode;
}

/** Shared shell for every inline widget so they share rhythm with chat bubbles. */
export function WidgetShell({ icon, title, prompt, done, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`my-3 rounded-2xl border ${done ? "border-primary/25 bg-card/85" : "border-primary/35 bg-card/90"} p-4 md:p-5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl`}
    >
      {(title || icon) && (
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider">
          {icon}
          {title && <span>{title}</span>}
          {done && <span className="ml-auto text-[10px] text-primary/70">complete</span>}
        </div>
      )}
      {prompt && <p className="mb-3 text-sm sm:text-[15px] text-foreground/95 leading-relaxed">{prompt}</p>}
      {children}
    </motion.div>
  );
}
