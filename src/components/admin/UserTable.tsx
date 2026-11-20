import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system";
import { Badge } from "@/design-system";
import { format } from 'date-fns';

interface User {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  onboarded: boolean;
  created_at: string;
  overall_band: number | null;
  journey_phase: string | null;
  streak_current: number | null;
  total_sessions: number | null;
  v_level_current: number | null;
}

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Phase</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Band</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Streak</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Sessions</th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => navigate(`/admin/users/${user.user_id}`)}
              className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
            >
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {(user.display_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.display_name || 'Anonymous'}</p>
                    <Badge variant={user.onboarded ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                      {user.onboarded ? 'Onboarded' : 'New'}
                    </Badge>
                  </div>
                </div>
              </td>
              <td className="p-3 hidden md:table-cell">
                <span className="text-sm text-muted-foreground capitalize">{user.journey_phase || '—'}</span>
              </td>
              <td className="p-3 hidden lg:table-cell">
                <span className="text-sm font-mono text-foreground">{user.overall_band?.toFixed(1) ?? '—'}</span>
              </td>
              <td className="p-3 hidden lg:table-cell">
                <span className="text-sm text-foreground">{user.streak_current ?? 0} 🔥</span>
              </td>
              <td className="p-3 hidden md:table-cell">
                <span className="text-sm text-muted-foreground">{user.total_sessions ?? 0}</span>
              </td>
              <td className="p-3">
                <span className="text-xs text-muted-foreground">{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
