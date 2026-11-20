import { motion } from "framer-motion";
import cosmicVoid from "@/assets/cosmic-void.jpg";

const line = (i: number) => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
});

const ForgottenSkillSection = () => (
  <section className="relative py-32 md:py-44 px-6 overflow-hidden">
    {/* Deep background */}
    <div className="absolute inset-0 opacity-[0.08]">
      <img src={cosmicVoid} alt="" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-gradient-void" />

    <div className="relative max-w-3xl mx-auto">
      {/* Preamble */}
      <motion.p
        className="text-sm font-body tracking-[0.35em] uppercase text-primary/60 mb-10 text-center"
        variants={line(0)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
      >
        The Forgotten Skill
      </motion.p>

      {/* Headline */}
      <motion.h2
        className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-center text-foreground leading-tight mb-16"
        variants={line(1)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
      >
        The Skill Humanity{" "}
        <span className="text-gradient-sunrise">Forgot</span>
      </motion.h2>

      {/* Philosophical narrative — each block fades in */}
      <div className="space-y-10 text-center">
        <motion.p
          className="text-lg md:text-xl font-body font-light text-foreground/70 italic leading-relaxed"
          variants={line(2)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          For thousands of years, yogis and sages explored one question:
          <br />
          <span className="text-foreground font-medium not-italic">
            Can a human learn to master their own mind?
          </span>
        </motion.p>

        {/* What we learn */}
        <motion.div
          className="space-y-1.5 text-foreground/50 font-body text-base md:text-lg font-light"
          variants={line(3)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          <p>In school, we learn mathematics.</p>
          <p>We learn history.</p>
          <p>We learn how to use technology.</p>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl font-display font-semibold text-foreground"
          variants={line(4)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          But we are never taught something far more important.
        </motion.p>

        <motion.div
          className="space-y-1 text-foreground/60 font-body text-base md:text-lg font-light"
          variants={line(5)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          <p className="text-foreground font-medium text-lg md:text-xl">How the mind works.</p>
          <p>How thoughts arise.</p>
          <p>How emotions control us.</p>
          <p>How habits run our lives.</p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-16 h-px bg-primary/30 mx-auto"
          variants={line(6)} initial="hidden" whileInView="visible" viewport={{ once: true }}
        />

        {/* The discovery */}
        <motion.p
          className="text-lg md:text-xl font-body text-foreground/70 italic leading-relaxed"
          variants={line(7)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          The ancient yogis discovered something profound.
        </motion.p>

        <motion.p
          className="text-2xl md:text-3xl font-display font-bold text-foreground leading-snug"
          variants={line(8)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          A human can become the{" "}
          <span className="text-gradient-sunrise">observer</span> of their mind.
          <br />
          <span className="text-lg md:text-xl font-light text-foreground/60">
            And once you observe the mind, you begin to gain control over it.
          </span>
        </motion.p>

        {/* Divider */}
        <motion.div
          className="w-16 h-px bg-primary/30 mx-auto"
          variants={line(9)} initial="hidden" whileInView="visible" viewport={{ once: true }}
        />

        {/* Modern problem */}
        <motion.div
          className="space-y-1.5 text-foreground/50 font-body text-base md:text-lg font-light"
          variants={line(10)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          <p className="text-foreground/70 font-medium">Today we control machines.</p>
          <p>Phones. Computers. Artificial Intelligence.</p>
        </motion.div>

        <motion.div
          className="space-y-1.5 text-foreground/50 font-body text-base md:text-lg font-light"
          variants={line(11)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          <p>But very few people can control</p>
          <p>their own <span className="text-foreground">attention</span>.</p>
          <p>their <span className="text-foreground">emotions</span>.</p>
          <p>their <span className="text-foreground">thoughts</span>.</p>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl font-display font-semibold text-foreground"
          variants={line(12)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          Technology became powerful.
          <br />
          <span className="text-foreground/50 font-light text-lg md:text-xl">
            But the human operating system was never upgraded.
          </span>
        </motion.p>

        {/* Divider */}
        <motion.div
          className="w-16 h-px bg-primary/30 mx-auto"
          variants={line(13)} initial="hidden" whileInView="visible" viewport={{ once: true }}
        />

        {/* Human OS concept */}
        <motion.div
          className="py-8"
          variants={line(14)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm font-body">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border/40 bg-card/30">
              <span className="text-primary font-semibold">Body</span>
              <span className="text-muted-foreground">→ Hardware</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-primary/20 bg-primary/5">
              <span className="text-primary font-semibold">Mind</span>
              <span className="text-muted-foreground">→ Operating System</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border/40 bg-card/30 glow-sunrise">
              <span className="text-primary font-semibold">Awareness</span>
              <span className="text-muted-foreground">→ Administrator</span>
            </div>
          </div>
        </motion.div>

        {/* Transition */}
        <motion.p
          className="text-foreground/60 font-body font-light text-base md:text-lg"
          variants={line(15)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          This system is designed to change that.
          <br />
          Not through motivation. Not through productivity hacks.
        </motion.p>

        <motion.p
          className="text-2xl md:text-3xl font-display font-bold text-foreground"
          variants={line(16)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          But through{" "}
          <span className="text-gradient-sunrise text-glow">awareness</span>.
        </motion.p>

        <motion.p
          className="text-base font-body text-muted-foreground font-light italic max-w-md mx-auto"
          variants={line(17)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
        >
          The same principle the yogis discovered — thousands of years ago — now powered by AI.
        </motion.p>
      </div>

      {/* Closing accent line */}
      <motion.div
        className="mt-20 text-center"
        variants={line(18)} initial="hidden" whileInView="visible" viewport={{ once: true }}
      >
        <p className="text-sm font-body tracking-[0.2em] uppercase text-primary/40">
          You learned to control machines.
        </p>
        <p className="text-lg md:text-xl font-display font-semibold text-gradient-sunrise mt-2">
          Now learn to control the one operating them.
        </p>
      </motion.div>
    </div>

    {/* Bottom gradient line */}
    <motion.div
      className="w-px h-24 bg-gradient-to-b from-primary/50 to-transparent mx-auto mt-20"
      initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
    />
  </section>
);

export default ForgottenSkillSection;
