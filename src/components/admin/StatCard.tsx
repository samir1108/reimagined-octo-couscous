import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
