/**
 * TypingDots — three soft bouncing dots inside a chat bubble.
 * Used to make the Guide feel like a real human typing in iMessage / WhatsApp.
 */
import { motion } from "framer-motion";

interface Props {
  /** When true, render bare dots (no bubble) — for inline use after content. */
  inline?: boolean;
}

export function TypingDots({ inline = false }: Props) {
  const dots = (
    <div className="flex items-end gap-[3px] h-[14px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-[5px] h-[5px] rounded-full bg-foreground/55"
          animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
          transition={{
            duration: 1.05,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.16,
          }}
        />
      ))}
    </div>
  );

  if (inline) return <span className="inline-flex align-middle ml-1">{dots}</span>;

  return (
    <div className="rounded-2xl px-4 py-3 bg-card/40 border border-border/40">
      {dots}
    </div>
  );
}
