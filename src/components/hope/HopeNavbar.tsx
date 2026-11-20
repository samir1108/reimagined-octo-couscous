import { Link } from "react-router-dom";
import hopeWordmark from "@/assets/hope-wordmark.png";
import LanguageMenuButton from "@/components/language/LanguageMenuButton";

export const HopeNavbar = () => {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
      <Link to="/hope-preview" className="flex items-center gap-2" aria-label="ConsciousOS — home">
        <img
          src={hopeWordmark}
          alt="ConsciousOS"
          width={120}
          height={40}
          className="h-8 w-auto md:h-9"
        />
      </Link>

      <div className="flex items-center gap-6 text-[13px] tracking-[0.18em] text-[hsl(38_40%_75%)] md:gap-10 md:text-sm">
        <LanguageMenuButton
          className="border-[hsl(38_45%_55%/0.4)] bg-transparent text-[hsl(38_80%_82%)] uppercase tracking-[0.14em] hover:border-[hsl(38_85%_70%)] hover:bg-[hsl(38_85%_60%/0.08)]"
          labelClassName="tracking-[0.14em]"
        />
        <a
          href="#offering"
          className="hidden uppercase transition-colors duration-300 hover:text-[hsl(38_85%_70%)] md:inline-block"
        >
          Offering
        </a>
        <a
          href="#organizations"
          className="hidden uppercase transition-colors duration-300 hover:text-[hsl(38_85%_70%)] md:inline-block"
        >
          For Organizations
        </a>
        <Link
          to="/auth"
          className="rounded-full border border-[hsl(38_45%_55%/0.4)] px-5 py-2 uppercase text-[hsl(38_85%_80%)] transition-all duration-300 hover:border-[hsl(38_85%_70%)] hover:bg-[hsl(38_85%_60%/0.08)]"
        >
          Enter
        </Link>
      </div>
    </nav>
  );
};
