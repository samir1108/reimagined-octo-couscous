import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

/**
 * ConsciousNav — the landing page's top navigation.
 *
 * Uses the app's own design tokens (no bespoke hex), the same as every
 * screen in the product, so the page reads as part of ConsciousOS rather
 * than a separate marketing skin.
 */

const TABS = [
  { label: "Experience", href: "/experience" },
  { label: "Loops", href: "/loops" },
  { label: "Knowledge", href: "/knowledge" },
  { label: "Handbook", href: "/handbook" },
  { label: "Pricing", href: "#pricing" },
];

export default function ConsciousNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "border-b border-border/40 bg-background/80 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link to="/" className="group flex items-center gap-3" aria-label="ConsciousOS home">
            <span className="relative flex h-7 w-7 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.5),transparent_70%)] transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_rgba(251,191,36,0.85)]" />
            </span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-foreground/85">
              ConsciousOS
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {TABS.map((tab) =>
              tab.href.startsWith("#") ? (
                <a
                  key={tab.label}
                  href={tab.href}
                  className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {tab.label}
                </a>
              ) : (
                <Link
                  key={tab.label}
                  to={tab.href}
                  className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {tab.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="rounded-full bg-gradient-sunrise px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Open the app
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-full p-2 text-foreground/80 transition-colors hover:text-foreground lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-[65px] z-40 border-b border-border/40 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col px-6 py-2">
              {TABS.map((tab) =>
                tab.href.startsWith("#") ? (
                  <a
                    key={tab.label}
                    href={tab.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-border/20 py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-foreground/80"
                  >
                    {tab.label}
                  </a>
                ) : (
                  <Link
                    key={tab.label}
                    to={tab.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-border/20 py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-foreground/80"
                  >
                    {tab.label}
                  </Link>
                ),
              )}
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="py-3.5 text-[0.72rem] uppercase tracking-[0.18em] text-foreground/80"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
