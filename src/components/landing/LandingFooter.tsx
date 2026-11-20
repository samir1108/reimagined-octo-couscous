import { Link } from "react-router-dom";
import BrandLotus from "@/components/BrandLotus";
import { BrandName } from "@/components/BrandName";

const LandingFooter = () => (
  <footer className="py-12 px-6 border-t border-border/30">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <BrandLotus size={22} className="opacity-60" />
        <span className="font-display text-sm font-medium text-foreground/60">
          <BrandName />
        </span>
      </div>
      <nav className="flex items-center gap-5 text-sm text-muted-foreground">
        <Link to="/blog" className="hover:text-foreground transition">Blog</Link>
        <Link to="/handbook" className="hover:text-foreground transition">Handbook</Link>
        <Link to="/auth" className="hover:text-foreground transition">Sign in</Link>
      </nav>
      <p className="text-sm text-muted-foreground font-body">
        © 2026 <BrandName />. The journey inward begins here.
      </p>
    </div>
  </footer>
);

export default LandingFooter;

