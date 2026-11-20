import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, Database, UserX, Globe, Download, ArrowLeft } from "lucide-react";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import Seo from "@/components/seo/Seo";

const guarantees = [
  { icon: Eye, title: "Managers see aggregates only", body: "Individual journals, conversations, and reflections are NEVER visible to admins or managers. Dashboards show team-level trends only — minimum 5 employees per group required to display data." },
  { icon: UserX, title: "Employees can opt out anytime", body: "Any employee can disable analytics sharing in their settings. They keep their personal practice; the org simply stops receiving their aggregated signal." },
  { icon: Database, title: "Your data stays yours", body: "We never sell, rent, or share employee data with third parties. Data is encrypted at rest and in transit. We are not in the business of advertising." },
  { icon: Globe, title: "GDPR & DPDP-A compliant", body: "We honour right to access, rectification, erasure, and portability. Data Processing Agreements available on request. EU/IN data residency options on enterprise plans." },
  { icon: Download, title: "Full data export & deletion", body: "Admins can export all org data at any time. On contract termination, all employee data is permanently deleted within 30 days." },
  { icon: ShieldCheck, title: "Security by design", body: "Row-level security in the database, JWT authentication, audit logs on every admin action. SOC 2 Type II audit on roadmap for 2026." },
];

export default function EnterprisePrivacy() {
  useForceDarkMode();
  return (
    <>
      <Seo
        title="Privacy & Trust — ConsciousOS Enterprise"
        description="How ConsciousOS protects employee data. Aggregated-only manager views, GDPR compliance, employee opt-out, full data export."
        canonicalPath="/enterprise/privacy"
      />
      <div className="min-h-screen bg-background px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Privacy & Trust</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">Built for trust from day one.</h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Wellbeing data is some of the most sensitive an employee can produce. We treat it that way — with strict aggregation, opt-outs, and full transparency.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {guarantees.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl border border-border/20 p-5"
              >
                <g.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-1.5">{g.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{g.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 glass-card rounded-2xl border border-border/20 p-6 text-center">
            <h3 className="font-display font-semibold mb-2">Need a security questionnaire or DPA?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our team responds within 1 business day with full documentation.
            </p>
            <Link
              to="/enterprise/contact?type=sales"
              className="inline-block px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
