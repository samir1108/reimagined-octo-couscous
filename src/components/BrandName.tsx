import { cn } from "@/lib/utils";

interface BrandNameProps {
  className?: string;
  /** Class applied only to the "OS" accent. Defaults to text-primary. */
  accentClassName?: string;
}

/**
 * Renders the product name "ConsciousOS"
 */
export const BrandName = ({ className, accentClassName }: BrandNameProps) => {
  return (
    <span className={cn(className)}>
      ConsciousOS
    </span>
  );
};

export default BrandName;
