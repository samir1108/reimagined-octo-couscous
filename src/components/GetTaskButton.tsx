import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";

interface GetTaskButtonProps {
  delay?: number;
  className?: string;
}

export default function GetTaskButton({ delay = 0.05, className = "" }: GetTaskButtonProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/app/guide?mode=task_giver")}
      className={`w-full flex items-center gap-3 glass-card rounded-2xl px-4 py-3 border border-primary/10 hover:bg-primary/5 transition-all group ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Zap className="w-4 h-4 text-primary" />
      </div>
      <div className="text-left min-w-0">
        <p className="text-sm font-display font-semibold text-foreground">Get a Task</p>
        <p className="text-[11px] text-muted-foreground font-body">Real-world awareness challenge for right now</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto shrink-0" />
    </motion.button>
  );
}
