import { lazy, Suspense } from "react";
import { HopeNavbar } from "@/components/hope/HopeNavbar";
import { HopeVoidSection } from "@/components/hope/HopeVoidSection";
import { HopeInvitationSection } from "@/components/hope/HopeInvitationSection";
import Seo from "@/components/seo/Seo";

/**
 * ConsciousOS — The new landing experience.
 * Mounted at /hope-preview while we iterate. Original landing stays at /.
 *
 * Ship 1 (this build): Foundation + Section 1 (The Void) + Section 9 (The Invitation).
 * Ships 2-6 will fill in The Mirror, Forgetting, Spiral, Three Brains, Day in ConsciousOS,
 * Voices, and The Offering.
 */
const HopeLanding = () => {
  return (
    <div className="hope-shell relative min-h-screen overflow-x-hidden bg-[#050402] text-[hsl(38_60%_92%)] antialiased">
      <Seo
        title="ConsciousOS — Yogic Companion Preview: A New Landing"
        description="A cinematic preview of the new ConsciousOS landing — the void, the invitation, and the journey from conditioning to consciousness."
        canonicalPath="/hope-preview"
      />
      {/* Persistent ambient field — soft particles that drift behind every section */}

      <HopeNavbar />

      <main className="relative z-10">
        <HopeVoidSection />
        {/* Section 2-8 placeholders — will be replaced in subsequent ships */}
        <HopeInvitationSection />
      </main>
    </div>
  );
};

export default HopeLanding;
