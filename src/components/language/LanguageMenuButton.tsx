import { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLanguageMeta } from "@/lib/languagePreference";
import LanguageDialog from "@/components/language/LanguageDialog";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  labelClassName?: string;
}

/**
 * Compact globe control that opens the language dialog. Safe to use on public
 * landing pages because it only depends on LanguageProvider.
 */
export default function LanguageMenuButton({ className, labelClassName }: Props) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = getLanguageMeta(language);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Change language (current: ${current.label})`}
        title="Change language"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/30 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10",
          className,
        )}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className={cn("hidden sm:inline", labelClassName)}>{current.nativeLabel}</span>
      </button>
      <LanguageDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
