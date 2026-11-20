import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/seo/Seo";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background ambient-bg">
      <Seo
        title="Page not found — ConsciousOS"
        description="This path doesn't exist. Return to ConsciousOS to continue your journey."
        noindex
      />
      <motion.div
        className="text-center relative z-10 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className="text-8xl font-display font-bold text-gradient-sunrise block mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          404
        </motion.span>
        <h1 className="text-2xl font-display font-bold text-foreground mb-3 tracking-tight">Lost in the void</h1>
        <p className="text-muted-foreground font-body mb-8 max-w-sm mx-auto leading-relaxed">
          This path doesn't exist yet. Return to your journey.
        </p>
        <motion.button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full glass-card font-display text-sm
                     text-foreground hover:border-primary/20 transition-all"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
