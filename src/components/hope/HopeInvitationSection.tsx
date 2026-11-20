import { Link } from "react-router-dom";

/**
 * SECTION 9 — THE INVITATION
 * The closing flame. Mission, threshold, footer. One last breath before the user decides.
 */
export const HopeInvitationSection = () => {
  return (
    <section
      aria-label="The Invitation"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32"
    >
      {/* Radial glow behind the flame */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(38_85%_55%/0.18)_0%,transparent_60%)] blur-3xl"
      />

      {/* Single static flame mark */}
      <div className="relative z-10 mb-12">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 animate-[hopePulse_3s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,hsl(38_85%_60%/0.5)_0%,transparent_65%)]" />
          <svg
            viewBox="0 0 64 96"
            className="relative mx-auto h-full w-auto drop-shadow-[0_0_40px_hsl(38_85%_55%/0.6)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38, 95%, 85%)" />
                <stop offset="60%" stopColor="hsl(32, 90%, 60%)" />
                <stop offset="100%" stopColor="hsl(20, 85%, 40%)" />
              </linearGradient>
            </defs>
            <path
              d="M32 6 C 38 22, 54 32, 52 56 C 50 78, 38 90, 32 90 C 26 90, 14 78, 12 56 C 10 32, 26 22, 32 6 Z"
              fill="url(#flameGrad)"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.4em] text-[hsl(38_50%_60%)]">
          The Invitation
        </p>
        <h2 className="font-serif text-[clamp(2rem,5vw,3.75rem)] font-light leading-[1.1] tracking-tight text-[hsl(38_85%_90%)]">
          You did not arrive here by accident.
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-base font-light leading-relaxed text-[hsl(38_35%_72%)] md:text-lg">
          ConsciousOS is not an app. It is a doorway.
          <br className="hidden md:block" />
          Behind it: a path that millions walked, that you can begin tonight.
          <br className="hidden md:block" />
          <span className="text-[hsl(38_55%_82%)]">
            One breath. One flame. One life — finally lit.
          </span>
        </p>

        <div className="mt-14 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
          <Link
            to="/auth"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-b from-[hsl(38_85%_60%)] to-[hsl(28_85%_45%)] px-10 py-4 text-sm uppercase tracking-[0.2em] text-[#1a0f00] shadow-[0_0_40px_hsl(38_85%_50%/0.4)] transition-all duration-500 hover:shadow-[0_0_80px_hsl(38_85%_55%/0.7)]"
          >
            <span className="relative z-10 font-medium">Light your flame</span>
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
            />
          </Link>
          <a
            href="#mirror"
            className="text-sm uppercase tracking-[0.2em] text-[hsl(38_45%_70%)] underline-offset-8 transition-colors duration-300 hover:text-[hsl(38_85%_85%)] hover:underline"
          >
            Or sit in stillness first
          </a>
        </div>

        <p className="mt-16 text-xs uppercase tracking-[0.3em] text-[hsl(38_25%_45%)]">
          Free for those who cannot pay. Sacred for those who can.
        </p>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-32 w-full max-w-5xl border-t border-[hsl(38_30%_25%/0.3)] pt-10">
        <div className="flex flex-col items-center justify-between gap-6 text-xs uppercase tracking-[0.25em] text-[hsl(38_25%_50%)] md:flex-row">
          <div>© ConsciousOS — Eternal</div>
          <div className="flex gap-6">
            <a href="#offering" className="transition-colors hover:text-[hsl(38_60%_75%)]">
              Offering
            </a>
            <Link to="/enterprise" className="transition-colors hover:text-[hsl(38_60%_75%)]">
              Organizations
            </Link>
            <Link to="/" className="transition-colors hover:text-[hsl(38_60%_75%)]">
              Trust
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
};
