import { Building2, ArrowRight, ArrowLeft, Users, UsersRound, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateOrganization, useCreateTeam, useInviteMember } from "@/hooks/useEnterprise";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { title: "Create Organization", icon: Building2 },
  { title: "Invite Team", icon: Users },
  { title: "Create Teams", icon: UsersRound },
  { title: "Launch", icon: Sparkles },
];

export default function CreateOrganization() {
  const navigate = useNavigate();
  const createOrg = useCreateOrganization();
  const createTeam = useCreateTeam();
  const inviteMember = useInviteMember();
  const [step, setStep] = useState(0);

  // Step 1: Org details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Step 2: Invites
  const [emails, setEmails] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);

  // Step 3: Teams
  const [teamNames, setTeamNames] = useState<string[]>([""]);

  const handleCreateOrg = () => {
    if (!name.trim()) return;
    createOrg.mutate(
      { name, slug, description },
      {
        onSuccess: (org) => {
          setOrgId(org.id);
          toast.success("Organization created!");
          setStep(1);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleInvites = async () => {
    if (!orgId) return;
    const emailList = emails.split(/[,\n]/).map((e) => e.trim()).filter((e) => e && e.includes("@"));
    for (const email of emailList) {
      try {
        await inviteMember.mutateAsync({ orgId, email, role: "employee" });
      } catch (e: any) {
        toast.error(`Failed to invite ${email}: ${e.message}`);
      }
    }
    if (emailList.length > 0) toast.success(`Invited ${emailList.length} members!`);
    setStep(2);
  };

  const handleCreateTeams = async () => {
    if (!orgId) return;
    const validNames = teamNames.filter((n) => n.trim());
    for (const teamName of validNames) {
      try {
        await createTeam.mutateAsync({ orgId, name: teamName });
      } catch (e: any) {
        toast.error(`Failed to create ${teamName}: ${e.message}`);
      }
    }
    if (validNames.length > 0) toast.success(`Created ${validNames.length} teams!`);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-lg glass-card rounded-2xl border border-border/20 p-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary/20 text-primary border border-primary/30" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h1 className="text-xl font-display font-bold text-foreground">{steps[step].title}</h1>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Create Org */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Organization Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {slug && <p className="text-[10px] text-muted-foreground font-body mt-1">Slug: <span className="text-foreground">{slug}</span></p>}
              </div>
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate("/app")} className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-body text-sm hover:bg-muted/80 transition-colors">Cancel</button>
                <button onClick={handleCreateOrg} disabled={!name.trim() || createOrg.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {createOrg.isPending ? "Creating..." : "Next"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Invite Team */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-sm text-muted-foreground font-body">Enter email addresses (comma or newline separated)</p>
              <textarea value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="john@company.com, jane@company.com" rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-body text-sm hover:bg-muted/80 transition-colors">Skip</button>
                <button onClick={handleInvites} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:opacity-90 transition-opacity">
                  Invite & Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Create Teams */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-sm text-muted-foreground font-body">Create teams to organize your members</p>
              {teamNames.map((tn, i) => (
                <input key={i} type="text" value={tn} onChange={(e) => { const n = [...teamNames]; n[i] = e.target.value; setTeamNames(n); }} placeholder={`Team ${i + 1} name`}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              ))}
              <button onClick={() => setTeamNames([...teamNames, ""])} className="text-xs text-primary font-body hover:underline">+ Add another team</button>
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-body text-sm hover:bg-muted/80 transition-colors">Skip</button>
                <button onClick={handleCreateTeams} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:opacity-90 transition-opacity">
                  Create & Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Launch */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <Sparkles className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-lg font-display font-bold text-foreground">You're All Set!</h2>
              <p className="text-sm text-muted-foreground font-body">Your organization is ready. Head to the dashboard to start transforming your team's consciousness.</p>
              <button onClick={() => navigate("/enterprise")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium hover:opacity-90 transition-opacity">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
