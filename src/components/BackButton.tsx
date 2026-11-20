import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSound } from "@/contexts/SoundContext";

interface BackButtonProps {
  /** Where to go if there's no history. Defaults to "/app". */
  fallback?: string;
  /** Optional label. Defaults to "Back". */
  label?: string;
  /** Extra classes. */
  className?: string;
  /** Called instead of default navigation. */
  onClick?: () => void;
  /** Hide the label, icon only. */
  iconOnly?: boolean;
}

/**
 * Universal back button. Uses browser history when available, otherwise
 * falls back to a safe route. Drop it in the top-left of any screen.
 */
export function BackButton({
  fallback = "/app",
  label = "Back",
  className = "",
  onClick,
  iconOnly = false,
}: BackButtonProps) {
  const navigate = useNavigate();
  const { playSound } = useSound();

  const handleClick = () => {
    playSound?.("navigate");
    if (onClick) return onClick();
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      aria-label={label}
      className={
        "inline-flex items-center gap-1 rounded-lg px-2 py-1 -ml-1 " +
        "text-muted-foreground hover:text-foreground hover:bg-muted/30 " +
        "transition-colors glass-subtle " +
        className
      }
    >
      <ChevronLeft className="w-4 h-4" />
      {!iconOnly && <span className="text-xs font-display font-medium">{label}</span>}
    </motion.button>
  );
}

export default BackButton;
