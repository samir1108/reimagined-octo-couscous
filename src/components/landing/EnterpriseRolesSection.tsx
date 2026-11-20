import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Users, User, Heart, BarChart3, Brain, ShieldCheck, TrendingUp } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0, 0, 0.2, 1] as const },
  }),
};

const roles = [
  {
    id: "ceo",
    label: "CEO / CHRO",
    icon: Crown,
    title: "Transform Your Organization's Consciousness",
    desc: "See what no survey can reveal. Real-time consciousness data across your entire organization — culture health, leadership effectiveness, and transformation velocity.",
    features: [
      { icon: BarChart3, text: "Org-wide consciousness dashboard with real-time metrics" },
      { icon: TrendingUp, text: "Culture transformation velocity & ROI tracking" },
      { icon: Brain, text: "Executive consciousness coaching with AI blind-spot detection" },
      { icon: ShieldCheck, text: "Board-ready wellbeing & performance reports" },
    ],
  },
  {
    id: "manager",
    label: "Manager",
    icon: Users,
    title: "Lead Teams with Awareness, Not Authority",
    desc: "Get real-time coherence scores for your team. Spot burnout before it happens. Coach with consciousness data, not just KPIs.",
    features: [
      { icon: Users, text: "Team coherence scores & synchrony measurement" },
      { icon: Heart, text: "Burnout early-warning alerts for each team member" },
      { icon: Brain, text: "1-on-1 consciousness coaching prompts & guides" },
      { icon: TrendingUp, text: "Team growth tracking across consciousness dimensions" },
    ],
  },
  {
    id: "player",
    label: "Team Player",
    icon: User,
    title: "Grow Within Your Team Context",
    desc: "Personal consciousness growth supported by your team. Peer challenges, streak competitions, and shared wisdom — growth is better together.",
    features: [
      { icon: User, text: "Personal consciousness journey within team context" },
      { icon: Users, text: "Peer learning circles & shared observation practices" },
      { icon: TrendingUp, text: "Streak competitions & growth challenges with teammates" },
      { icon: Brain, text: "AI-guided practices adapted to your work patterns" },
    ],
  },
  {
    id: "hr",
    label: "HR Leader",
    icon: Heart,
    title: "Wellbeing That Actually Moves the Needle",
    desc: "Go beyond engagement surveys. Predictive analytics that show you exactly where to invest for maximum wellbeing and retention ROI.",
    features: [
      { icon: BarChart3, text: "Wellbeing ROI dashboard with financial impact metrics" },
      { icon: TrendingUp, text: "Engagement analytics beyond surface-level surveys" },
      { icon: ShieldCheck, text: "Retention prediction & proactive intervention triggers" },
      { icon: Brain, text: "Program effectiveness measurement across all initiatives" },
    ],
  },
];

const EnterpriseRolesSection = () => {
  const [activeRole, setActiveRole] = useState("ceo");
  const active = roles.find((r) => r.id === activeRole)!;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/15 to-background" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} custom={0} className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4">
            Built For Every Role
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 font-display">
            How{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Your Role
            </span>{" "}
            Benefits
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every person in your organization experiences consciousness differently. We built for that.
          </motion.p>
        </motion.div>

        {/* Role Tabs */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={3}
          className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10"
        >
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeRole === r.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <r.icon className="w-4 h-4" />
              {r.label}
            </button>
          ))}
        </motion.div>

        {/* Active Role Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-8 md:p-10"
          >
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <active.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 font-display">{active.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{active.desc}</p>
              </div>
              <div className="space-y-4">
                {active.features.map((f, i) => (
                  <motion.div
                    key={f.text}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/30"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <f.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/90">{f.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EnterpriseRolesSection;
