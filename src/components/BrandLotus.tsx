import { motion } from "framer-motion";

interface BrandLotusProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Brand logo component — uses the brand logo image.
 * Supports optional bloom/reveal animation via `animate` prop.
 */
const BrandLotus = ({ size = 24, className = "", animate = false }: BrandLotusProps) => {
  const logoImg = (
    <img
      src="/brand-logo.png"
      alt="ConsciousOS"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      aria-hidden="true"
      style={{ width: size, height: size }}
    />
  );

  if (animate) {
    return (
      <motion.div
        className="inline-flex items-center justify-center"
        style={{ width: size, height: size }}
        initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          duration: 1.8,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 1 },
        }}
      >
        <motion.div
          initial={{ filter: "blur(8px) brightness(1.5)" }}
          animate={{ filter: "blur(0px) brightness(1)" }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          {logoImg}
        </motion.div>
        {/* Glow ring behind */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(43 96% 56% / 0.3), transparent 70%)",
          }}
          initial={{ scale: 1.5, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
      </motion.div>
    );
  }

  return logoImg;
};

export default BrandLotus;
