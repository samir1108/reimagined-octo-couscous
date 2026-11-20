import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { toast } from "sonner";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import Seo from "@/components/seo/Seo";

const schema = z.object({
  company_name: z.string().trim().min(1, "Company name required").max(120),
  contact_name: z.string().trim().min(1, "Your name is required").max(80),
  work_email: z.string().trim().email("Valid work email required").max(160),
  company_size: z.string().max(40).optional(),
  role: z.string().max(80).optional(),
  message: z.string().max(2000).optional(),
});

const SIZES = ["1–10", "11–50", "51–200", "201–500", "501–2000", "2000+"];

export default function EnterpriseContact() {
  useForceDarkMode();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inquiryType = (params.get("type") as "pilot" | "demo" | "sales") || "sales";

  const [form, setForm] = useState({
    company_name: "", contact_name: "", work_email: "",
    company_size: "", role: "", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please check the form");
      return;
    }
    setLoading(true);
    const { error } = await (supabase.from("sales_inquiries") as any).insert({
      ...parsed.data,
      inquiry_type: inquiryType,
      source: "landing-enterprise",
    });
    setLoading(false);
    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }
    setDone(true);
  };

  const titles: Record<string, string> = {
    pilot: "Start Your Free 30-Day Pilot",
    demo: "Book a Live Demo",
    sales: "Talk to Sales",
  };

  return (
    <>
      <Seo
         title={`${titles[inquiryType]} — ConsciousOS for Teams`}
         description="Bring ConsciousOS to your organization. Reduce burnout, build coherence, and measure team consciousness."
        canonicalPath="/enterprise/contact"
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-xl glass-card rounded-2xl border border-border/20 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </button>

          {done ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
              <h1 className="text-xl font-display font-bold">Thank you, {form.contact_name.split(" ")[0]}!</h1>
              <p className="text-sm text-muted-foreground">
                Our team will reach out to <span className="text-foreground font-medium">{form.work_email}</span> within 1 business day.
              </p>
              <Link to="/" className="inline-block text-primary text-sm hover:underline mt-2">
                Back to homepage
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-7 h-7 text-primary" />
                <h1 className="text-xl font-display font-bold">{titles[inquiryType]}</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Tell us about your team — we'll set everything up for you.
              </p>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Company name *"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    required maxLength={120}
                  />
                  <Input
                    placeholder="Your name *"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    required maxLength={80}
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Work email *"
                  value={form.work_email}
                  onChange={(e) => setForm({ ...form, work_email: e.target.value })}
                  required maxLength={160}
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.company_size}
                    onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                    className="px-3 py-2 rounded-md bg-background border border-input text-sm"
                  >
                    <option value="">Company size</option>
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Input
                    placeholder="Your role (e.g. CHRO)"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    maxLength={80}
                  />
                </div>
                <Textarea
                  placeholder="What's the biggest wellbeing or culture challenge in your team right now? (optional)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  maxLength={2000}
                />
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? "Sending..." : "Submit"}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  By submitting you agree to be contacted by our team. We never share your details.
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
