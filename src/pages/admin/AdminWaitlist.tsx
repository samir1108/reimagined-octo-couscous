import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Skeleton } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { Mail, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface WaitlistEmail {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

function useWaitlist() {
  return useQuery({
    queryKey: ['admin-waitlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waitlist_emails' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as WaitlistEmail[];
    },
  });
}

export default function AdminWaitlist() {
  const { data: emails, isLoading } = useWaitlist();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('waitlist_emails' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist'] });
      toast.success('Email removed');
    },
  });

  const exportCSV = () => {
    if (!emails?.length) return;
    const csv = ['Email,Source,Date', ...emails.map(e =>
      `${e.email},${e.source},${new Date(e.created_at).toLocaleDateString()}`
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waitlist-emails.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Waitlist Emails</h2>
          <p className="text-sm text-muted-foreground">{emails?.length || 0} signups collected</p>
        </div>
        {emails && emails.length > 0 && (
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        )}
      </div>

      {!emails?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No waitlist signups yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/20">
            <span className="col-span-5">Email</span>
            <span className="col-span-3">Source</span>
            <span className="col-span-3">Date</span>
            <span className="col-span-1"></span>
          </div>
          {emails.map((e) => (
            <div key={e.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-border/30 items-center hover:bg-muted/10">
              <span className="col-span-5 text-foreground font-mono text-xs truncate">{e.email}</span>
              <span className="col-span-3">
                <Badge variant="outline" className="text-[10px]">{e.source}</Badge>
              </span>
              <span className="col-span-3 text-muted-foreground text-xs">
                {new Date(e.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(e.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
