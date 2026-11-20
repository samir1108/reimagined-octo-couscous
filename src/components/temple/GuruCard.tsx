import { motion } from "framer-motion";
import type { Guru } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";

type Props = {
  guru: Guru;
  index: number;
  onSelect?: (guru: Guru) => void;
  onTalk?: (guru: Guru) => void;
  onPractice?: (guru: Guru) => void;
  onPrograms?: (guru: Guru) => void;
  onLongPress?: (guru: Guru) => void;
};

export default function GuruCard({ guru, index, onSelect }: Props) {
  const imageSource = MASTER_IMAGES[guru.id] || guru.image;
  const shortTitle = guru.title?.split("·")[0]?.trim() || guru.title;

  return (
    <motion.div
      className="group relative flex flex-col items-center cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
      onClick={() => onSelect?.(guru)}
      role="button"
      tabIndex={0}
      aria-label={`Master ${guru.name}. ${shortTitle}.`}
    >
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-border/40 group-hover:ring-border group-hover:shadow-lg transition-all duration-500">
        <img
          src={imageSource}
          alt={guru.name}
          loading="lazy"
          className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-foreground/95 text-sm font-display font-semibold tracking-wide leading-tight">
            {guru.name}
          </h3>
          <p className="text-muted-foreground text-[10px] font-display tracking-wider mt-0.5 line-clamp-2">
            {shortTitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
