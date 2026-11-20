import { Globe } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/design-system";
import LanguageList from "@/components/language/LanguageList";
import { useLanguage } from "@/contexts/LanguageContext";
import { preloadLanguage } from "@/lib/i18n";
import { persistLanguageToProfile } from "@/lib/languageProfile";
import { detectBrowserLanguage, getLanguageMeta, setStoredLanguage } from "@/lib/languagePreference";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal language switcher that can be used anywhere inside LanguageProvider. */
export default function LanguageDialog({ open, onOpenChange }: Props) {
  const { language } = useLanguage();
  const current = getLanguageMeta(language);

  const handleSelect = (code: string) => {
    setStoredLanguage(code);
    void preloadLanguage(code);
    void persistLanguageToProfile(code);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/30 p-5 pb-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-4 w-4 text-primary" />
            Choose your language
          </DialogTitle>
          <DialogDescription>
            The whole experience — including this page — will switch to your language.
            {current.code !== "en" ? ` Currently: ${current.nativeLabel}.` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <LanguageList
            value={language}
            suggested={detectBrowserLanguage()}
            onSelect={handleSelect}
            autoFocus
            listClassName="max-h-[50vh]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
