import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminData';
import { UserTable } from '@/components/admin/UserTable';
import { Input } from "@/design-system";
import { Button } from "@/design-system";
import { Skeleton } from "@/design-system";
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAdminUsers(search, page);

  const totalPages = data ? Math.ceil(data.total / 50) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">User Management</h2>
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} total users` : 'Loading...'}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : data?.users.length ? (
        <>
          <UserTable users={data.users} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-center py-12">No users found</p>
      )}
    </div>
  );
}
