import HomeOrb from "@/components/orb/HomeOrb";

interface DisplayOrbProps {
  size?: number;
  breathing?: boolean;
  className?: string;
}

/**
 * Legacy-sized orb surface. Delegates to the shared Home orb so every
 * decorative orb in the app is the same living orb as Home.
 */
export default function DisplayOrb({ size = 200, className = "" }: DisplayOrbProps) {
  return <HomeOrb size={size} className={className} />;
}