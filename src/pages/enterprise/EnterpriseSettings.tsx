import { useOutletContext } from "react-router-dom";
import { Settings, Save, Upload, Trash2, AlertTriangle } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { type Organization, type OrgMember } from "@/hooks/useEnterprise";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function EnterpriseSettings() {
  const { membership, org } = useOutletContext<{ membership: OrgMember; org: Organization | null }>();
  const qc = useQueryClient();
  const [name, setName] = useState(org?.name || "");
  const [description, setDescription] = useState(org?.description || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);
    const { error } = await supabase
      .from("organizations")
      .update({ name, description })
      .eq("id", org.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["organization", org.id] });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !org) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    setUploading(true);
    const path = `${org.id}/logo.${file.name.split(".").pop()}`;

    const { error: uploadErr } = await supabase.storage
      .from("org-logos")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      toast.error(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("org-logos").getPublicUrl(path);
    const logo_url = urlData.publicUrl;

    const { error: updateErr } = await supabase
      .from("organizations")
      .update({ logo_url })
      .eq("id", org.id);

    setUploading(false);
    if (updateErr) {
      toast.error(updateErr.message);
    } else {
      toast.success("Logo uploaded");
      qc.invalidateQueries({ queryKey: ["organization", org.id] });
    }
  };

  if (membership.role !== "admin") {
    return (
      <div className="text-center py-12">
        <Settings className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground font-body">Only admins can access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" />
          Organization Settings
        </h1>
      </div>

      {/* Logo */}
      <div className="glass-card rounded-2xl border border-border/20 p-6 space-y-4">
        <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider block">
          Organization Logo
        </label>
        <div className="flex items-center gap-4">
          {org?.logo_url ? (
            <img src={org.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border/20" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-muted/30 border border-border/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs px-4 py-2 rounded-xl bg-primary/10 text-primary font-body hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Logo"}
            </button>
            <p className="text-[10px] text-muted-foreground font-body mt-1">Max 2MB, JPG or PNG</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="glass-card rounded-2xl border border-border/20 p-6 space-y-4">
        <div>
          <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Organization Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Slug
          </label>
          <input
            type="text"
            value={org?.slug || ""}
            disabled
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/20 text-sm font-body text-muted-foreground cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-2xl border border-red-500/20 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="font-display text-sm font-semibold text-red-400">Danger Zone</h3>
        </div>
        {!showDanger ? (
          <button
            onClick={() => setShowDanger(true)}
            className="text-xs px-4 py-2 rounded-xl border border-red-500/20 text-red-400 font-body hover:bg-red-500/10 transition-colors"
          >
            Show Danger Options
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-body">
              Deleting your organization is permanent and cannot be undone. All members, teams, and invites will be removed.
            </p>
            <button
              onClick={async () => {
                if (!org) return;
                const confirmed = window.confirm("Are you absolutely sure? This will permanently delete your organization.");
                if (!confirmed) return;
                // Note: Cascade delete will handle org_members, teams, etc.
                const { error } = await supabase.from("organizations").delete().eq("id", org.id);
                if (error) {
                  toast.error("Cannot delete: " + error.message);
                } else {
                  toast.success("Organization deleted");
                  window.location.href = "/enterprise/auth";
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-body text-xs hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Organization
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
