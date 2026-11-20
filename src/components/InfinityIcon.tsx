import { motion, type SVGMotionProps } from "framer-motion";

interface InfinityIconProps extends Omit<SVGMotionProps<SVGSVGElement>, "children"> {
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Custom smooth infinity symbol — replaces the angular Lucide version.
 * Uses a single elegant cubic-bezier path for a true ∞ look.
 */
const InfinityIcon = ({ size = 24, className = "", animate = false, ...props }: InfinityIconProps) => {
  return (
    <motion.svg
      viewBox="0 0 100 50"
      width={size}
      height={size * 0.5}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <motion.path
        d="M50 25
           C50 11, 65 2, 78 8
           C91 14, 95 25, 85 33
           C75 41, 58 35, 50 25
           C42 15, 25 9, 15 17
           C5 25, 9 36, 22 42
           C35 48, 50 39, 50 25Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        {...(animate
          ? {
              initial: { pathLength: 0, opacity: 0 },
              animate: { pathLength: 1, opacity: 1 },
              transition: { duration: 2, ease: "easeInOut" },
            }
          : {})}
      />
    </motion.svg>
  );
};

export default InfinityIcon;
