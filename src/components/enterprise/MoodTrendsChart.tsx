import { motion } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";

export default function MoodTrendsChart({ orgId, teamId }: { orgId: string; teamId?: string }) {
  const { data: trends = [] } = useQuery({
    queryKey: ["mood-trends", orgId, teamId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_team_mood_trends", {
        p_org_id: orgId,
        p_team_id: teamId || null,
        p_days: 30,
      });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        date: format(new Date(d.pulse_date), "MMM d"),
        mood: Number(d.avg_mood),
        energy: Number(d.avg_energy),
        responses: Number(d.response_count),
      }));
    },
    enabled: !!orgId,
  });

  return (
    <motion.div
      className="glass-card rounded-2xl border border-border/20 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Team Mood Trends</h3>
          <p className="text-xs text-muted-foreground font-body">Aggregated anonymous data (min 3 responses)</p>
        </div>
        <SmilePlus className="w-5 h-5 text-primary" />
      </div>

      {trends.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body text-center py-8">
          Not enough mood pulse data yet. Encourage your team to submit daily check-ins.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={25} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
            <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Avg Mood" />
            <Line type="monotone" dataKey="energy" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Avg Energy" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
