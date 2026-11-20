/**
 * Geo-anchored practices — privacy-preserving location anchors.
 * Buckets coords to ~1km grid (3 decimal places of degrees ≈ 110m; we use 2 ≈ 1.1km).
 * Never stores raw coords. Silent fallback when permission denied.
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const SCALE = 100; // 0.01° ≈ 1.1km

interface Anchor {
  lat_bucket: number;
  lng_bucket: number;
  visit_count: number;
  suggested_practice: string | null;
  place_label: string | null;
}

export function useGeoAnchor() {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [denied, setDenied] = useState(false);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat_bucket = Math.round(pos.coords.latitude * SCALE);
        const lng_bucket = Math.round(pos.coords.longitude * SCALE);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: existing } = await supabase
          .from("geo_anchors" as any)
          .select("*")
          .eq("user_id", user.id)
          .eq("lat_bucket", lat_bucket)
          .eq("lng_bucket", lng_bucket)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("geo_anchors" as any)
            .update({
              visit_count: ((existing as any).visit_count ?? 0) + 1,
              last_seen_at: new Date().toISOString(),
            })
            .eq("id", (existing as any).id);
          setAnchor(existing as any);
        } else {
          await supabase.from("geo_anchors" as any).insert({
            user_id: user.id,
            lat_bucket,
            lng_bucket,
            visit_count: 1,
          });
        }
      },
      () => setDenied(true),
      { maximumAge: 5 * 60_000, timeout: 8000 },
    );
  }, []);

  return { anchor, denied };
}
