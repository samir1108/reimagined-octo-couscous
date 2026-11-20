import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BrandName } from "@/components/BrandName";
import BrandLotus from "@/components/BrandLotus";

const SPLASH_KEY = "satyug-app_splash_seen_v1";

const BrandSplash = () => {
  const [show, show_set] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(SPLASH_KEY);
    if (seen) return;
    show_set(true);
    sessionStorage.setItem(SPLASH_KEY, "1");
    const t = setTimeout(() => show_set(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <BrandLotus size={64} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandSplash;
