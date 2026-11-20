import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { getShowroomHandbook } from "@/data/showroomHandbooks";

const OnionDiagram = () => (
  <svg viewBox="0 0 320 320" className="w-full h-auto max-w-sm mx-auto">
    {[
      { r: 150, fill: "rgba(251,191,36,0.06)", label: "Thought-world", y: 30 },
      { r: 128, fill: "rgba(251,191,36,0.09)", label: "Body", y: 56 },
      { r: 106, fill: "rgba(251,191,36,0.13)", label: "Breath", y: 80 },
      { r: 84,  fill: "rgba(251,191,36,0.18)", label: "Emotions", y: 104 },
      { r: 62,  fill: "rgba(251,191,36,0.25)", label: "Thoughts", y: 128 },
      { r: 40,  fill: "rgba(251,191,36,0.35)", label: "Story", y: 152 },
    ].map((c, i) => (
      <g key={i}>
        <circle cx="160" cy="160" r={c.r} fill={c.fill} stroke="rgba(251,191,36,0.4)" strokeWidth="0.5" />
        <text x="160" y={c.y} textAnchor="middle" fontSize="9" fill="rgba(252,211,77,0.85)" fontWeight="300">
          {c.label}
        </text>
      </g>
    ))}
    <circle cx="160" cy="160" r="18" fill="rgba(252,211,77,0.7)" />
    <text x="160" y="163" textAnchor="middle" fontSize="9" fill="#0f0f0f" fontWeight="500">Core</text>
  </svg>
);

const BandsDiagram = () => (
  <svg viewBox="0 0 320 380" className="w-full h-auto max-w-sm mx-auto">
    {Array.from({ length: 11 }).map((_, i) => {
      const y = 350 - i * 30;
      const opacity = 0.15 + i * 0.07;
      const labels = ["Sleeper","Reactor","Seeker","Practitioner","Witness","Heart","Ego sees","Dissolution","Glimpses","Background","Dissolved"];
      return (
        <g key={i}>
          <rect x="40" y={y - 18} width="240" height="24" rx="4" fill={`rgba(251,191,36,${opacity})`} stroke="rgba(251,191,36,0.3)" strokeWidth="0.5" />
          <text x="56" y={y - 2} fontSize="11" fill="rgba(252,211,77,0.9)" fontWeight="300">
            <tspan fontWeight="500">{i}</tspan>  ·  {labels[i]}
          </text>
        </g>
      );
    })}
  </svg>
);

const ThoughtWorldDiagram = () => (
  <svg viewBox="0 0 360 240" className="w-full h-auto max-w-md mx-auto">
    {/* World */}
    <circle cx="80" cy="120" r="50" fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.5)" />
    <text x="80" y="124" textAnchor="middle" fontSize="11" fill="rgba(167,243,208,0.9)">The world</text>
    {/* Arrow */}
    <line x1="135" y1="120" x2="180" y2="120" stroke="rgba(252,211,77,0.6)" strokeWidth="1" markerEnd="url(#arr)" />
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <polygon points="0 0, 8 4, 0 8" fill="rgba(252,211,77,0.6)" />
      </marker>
    </defs>
    {/* Head */}
    <circle cx="240" cy="120" r="70" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.5)" />
    <text x="240" y="100" textAnchor="middle" fontSize="10" fill="rgba(252,211,77,0.9)">Your head</text>
    <text x="240" y="120" textAnchor="middle" fontSize="9" fill="rgba(252,211,77,0.7)">thoughts</text>
    <text x="240" y="135" textAnchor="middle" fontSize="9" fill="rgba(252,211,77,0.7)">about the world</text>
    <text x="240" y="153" textAnchor="middle" fontSize="8" fill="rgba(252,211,77,0.5)" fontStyle="italic">(this is what you experience)</text>
  </svg>
);

const ThreeBrainsDiagram = () => (
  <svg viewBox="0 0 320 320" className="w-full h-auto max-w-sm mx-auto">
    {/* Body silhouette */}
    <ellipse cx="160" cy="180" rx="70" ry="120" fill="rgba(251,191,36,0.04)" stroke="rgba(251,191,36,0.25)" />
    {/* Head brain */}
    <circle cx="160" cy="80" r="32" fill="rgba(139,92,246,0.25)" stroke="rgba(196,181,253,0.7)" />
    <text x="160" y="78" textAnchor="middle" fontSize="9" fill="rgba(221,214,254,0.95)" fontWeight="500">Head</text>
    <text x="160" y="90" textAnchor="middle" fontSize="7" fill="rgba(221,214,254,0.7)">analyst</text>
    {/* Heart brain */}
    <circle cx="160" cy="170" r="28" fill="rgba(244,63,94,0.25)" stroke="rgba(252,165,165,0.7)" />
    <text x="160" y="168" textAnchor="middle" fontSize="9" fill="rgba(254,205,211,0.95)" fontWeight="500">Heart</text>
    <text x="160" y="180" textAnchor="middle" fontSize="7" fill="rgba(254,205,211,0.7)">feeling</text>
    {/* Gut brain */}
    <circle cx="160" cy="245" r="26" fill="rgba(251,191,36,0.3)" stroke="rgba(252,211,77,0.8)" />
    <text x="160" y="244" textAnchor="middle" fontSize="9" fill="rgba(254,243,199,0.95)" fontWeight="500">Gut</text>
    <text x="160" y="255" textAnchor="middle" fontSize="7" fill="rgba(254,243,199,0.7)">instinct</text>
    {/* Connecting lines */}
    <line x1="160" y1="112" x2="160" y2="142" stroke="rgba(251,191,36,0.4)" strokeDasharray="2,2" />
    <line x1="160" y1="198" x2="160" y2="219" stroke="rgba(251,191,36,0.4)" strokeDasharray="2,2" />
  </svg>
);

const FourPathsDiagram = () => {
  const paths = [
    { angle: -90, label: "Jnana", sub: "mind", color: "rgba(139,92,246,0.7)" },
    { angle: 0,   label: "Bhakti", sub: "heart", color: "rgba(244,63,94,0.7)" },
    { angle: 90,  label: "Karma", sub: "hands", color: "rgba(251,191,36,0.7)" },
    { angle: 180, label: "Raja", sub: "body", color: "rgba(52,211,153,0.7)" },
  ];
  return (
    <svg viewBox="0 0 320 320" className="w-full h-auto max-w-sm mx-auto">
      {/* Mountain summit center */}
      <circle cx="160" cy="160" r="22" fill="rgba(252,211,77,0.7)" />
      <text x="160" y="156" textAnchor="middle" fontSize="8" fill="#0f0f0f" fontWeight="500">One</text>
      <text x="160" y="166" textAnchor="middle" fontSize="8" fill="#0f0f0f" fontWeight="500">Self</text>
      {paths.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = 160 + Math.cos(rad) * 110;
        const y = 160 + Math.sin(rad) * 110;
        return (
          <g key={i}>
            <line x1="160" y1="160" x2={x} y2={y} stroke={p.color} strokeWidth="1" />
            <circle cx={x} cy={y} r="26" fill={p.color.replace("0.7", "0.2")} stroke={p.color} />
            <text x={x} y={y - 2} textAnchor="middle" fontSize="10" fill="rgba(252,211,77,0.95)" fontWeight="500">{p.label}</text>
            <text x={x} y={y + 10} textAnchor="middle" fontSize="7" fill="rgba(252,211,77,0.7)">{p.sub}</text>
          </g>
        );
      })}
    </svg>
  );
};

const NervousSystemDiagram = () => (
  <svg viewBox="0 0 360 220" className="w-full h-auto max-w-md mx-auto">
    {/* Gas pedal */}
    <rect x="20" y="60" width="130" height="80" rx="8" fill="rgba(244,63,94,0.15)" stroke="rgba(252,165,165,0.6)" />
    <text x="85" y="90" textAnchor="middle" fontSize="11" fill="rgba(254,205,211,0.95)" fontWeight="500">Sympathetic</text>
    <text x="85" y="105" textAnchor="middle" fontSize="9" fill="rgba(254,205,211,0.7)">gas pedal</text>
    <text x="85" y="120" textAnchor="middle" fontSize="8" fill="rgba(254,205,211,0.6)">fight · flight · push</text>
    {/* Brake */}
    <rect x="210" y="60" width="130" height="80" rx="8" fill="rgba(52,211,153,0.15)" stroke="rgba(110,231,183,0.6)" />
    <text x="275" y="90" textAnchor="middle" fontSize="11" fill="rgba(167,243,208,0.95)" fontWeight="500">Parasympathetic</text>
    <text x="275" y="105" textAnchor="middle" fontSize="9" fill="rgba(167,243,208,0.7)">brake</text>
    <text x="275" y="120" textAnchor="middle" fontSize="8" fill="rgba(167,243,208,0.6)">rest · digest · heal</text>
    {/* Breath as steering */}
    <text x="180" y="35" textAnchor="middle" fontSize="10" fill="rgba(252,211,77,0.9)" fontWeight="500">BREATH = steering wheel</text>
    <line x1="150" y1="100" x2="210" y2="100" stroke="rgba(252,211,77,0.6)" strokeWidth="1" />
    <circle cx="180" cy="100" r="14" fill="rgba(251,191,36,0.3)" stroke="rgba(252,211,77,0.8)" />
    <text x="180" y="103" textAnchor="middle" fontSize="8" fill="rgba(254,243,199,0.95)">prana</text>
    {/* Bottom labels */}
    <text x="85" y="170" textAnchor="middle" fontSize="8" fill="rgba(252,211,77,0.5)" fontStyle="italic">short fast inhale</text>
    <text x="275" y="170" textAnchor="middle" fontSize="8" fill="rgba(252,211,77,0.5)" fontStyle="italic">long slow exhale</text>
  </svg>
);

const BridgesDiagram = () => {
  const bridges = [
    { left: "Quantum observer", right: "Sakshi (Witness)" },
    { left: "Relativity", right: "Maya" },
    { left: "E = mc²", right: "Prakriti" },
    { left: "Neuroplasticity", right: "Samskara" },
    { left: "Polyvagal theory", right: "Pranayama" },
    { left: "Default Mode Net.", right: "Ahamkara" },
    { left: "Entanglement", right: "Advaita" },
  ];
  return (
    <svg viewBox="0 0 360 280" className="w-full h-auto max-w-md mx-auto">
      <text x="80" y="20" textAnchor="middle" fontSize="10" fill="rgba(167,243,208,0.9)" fontWeight="500">Modern science</text>
      <text x="280" y="20" textAnchor="middle" fontSize="10" fill="rgba(252,211,77,0.9)" fontWeight="500">Timeless yoga</text>
      {bridges.map((b, i) => {
        const y = 50 + i * 30;
        return (
          <g key={i}>
            <rect x="10" y={y - 12} width="140" height="22" rx="4" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.4)" strokeWidth="0.5" />
            <text x="80" y={y + 3} textAnchor="middle" fontSize="9" fill="rgba(167,243,208,0.95)">{b.left}</text>
            <line x1="155" y1={y} x2="205" y2={y} stroke="rgba(251,191,36,0.5)" strokeDasharray="2,2" />
            <rect x="210" y={y - 12} width="140" height="22" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.4)" strokeWidth="0.5" />
            <text x="280" y={y + 3} textAnchor="middle" fontSize="9" fill="rgba(252,211,77,0.95)">{b.right}</text>
          </g>
        );
      })}
    </svg>
  );
};

const ShowroomHandbook = () => {
  useForceDarkMode();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const h = slug ? getShowroomHandbook(slug) : undefined;
  if (!h) return <Navigate to="/showroom" replace />;

  const Diagram =
    h.diagram === "onion" ? OnionDiagram :
    h.diagram === "bands" ? BandsDiagram :
    h.diagram === "thought-world" ? ThoughtWorldDiagram :
    h.diagram === "three-brains" ? ThreeBrainsDiagram :
    h.diagram === "four-paths" ? FourPathsDiagram :
    h.diagram === "nervous-system" ? NervousSystemDiagram :
    h.diagram === "bridges" ? BridgesDiagram :
    () => null;


  return (
    <>
      <Seo
        title={`${h.title} — handbook`}
        description={h.subtitle}
        canonicalPath={`/showroom/handbooks/${h.slug}`}
        type="article"
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
          <button
            onClick={() => navigate("/showroom")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <header className="mt-6 mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/70">Handbook</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-light leading-tight">{h.title}</h1>
            <p className="mt-3 text-base text-foreground/70 italic">{h.subtitle}</p>
          </header>

          <div className="mb-10 rounded-2xl border border-border/50 bg-card/30 p-6">
            <Diagram />
            <p className="mt-4 text-center text-xs text-muted-foreground italic">{h.oneLine}</p>
          </div>

          <article className="prose prose-invert prose-headings:font-light prose-p:leading-relaxed prose-a:text-amber-300 prose-a:no-underline hover:prose-a:underline max-w-none">
            <ReactMarkdown>{h.body}</ReactMarkdown>
          </article>

          {h.relatedEssaySlugs && h.relatedEssaySlugs.length > 0 && (
            <section className="mt-12 border-t border-border/60 pt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Go deeper</p>
              <ul className="space-y-2">
                {h.relatedEssaySlugs.map(s => (
                  <li key={s}>
                    <Link to={`/blog/${s}`} className="text-sm text-amber-200 hover:text-amber-100">
                      → /blog/{s}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

// keep SITE_URL ref alive in case future schema usage
void SITE_URL;

export default ShowroomHandbook;
