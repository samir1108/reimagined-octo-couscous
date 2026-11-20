import { useState } from 'react';
import { useAdminSessions, useAdminSessionMessages } from '@/hooks/useAdminSessionData';
import { Input } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { Skeleton } from "@/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system";
import { ScrollArea } from "@/design-system";
import {
  Search, ChevronLeft, ChevronRight, MessageSquare, Clock, Bot, User,
  X, Filter,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/design-system";

function ConversationViewer({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const { data: messages, isLoading } = useAdminSessionMessages(sessionId);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[80vh] rounded-xl border border-border bg-card flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Session Conversation</h3>
            <Badge variant="outline" className="text-[10px]">{messages?.length || 0} messages</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : !messages?.length ? (
            <p className="text-sm text-muted-foreground text-center py-12">No messages in this session</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role !== 'user' && (
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : msg.role === 'system'
                      ? 'bg-muted/20 border border-border'
                      : 'bg-muted/30'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {format(new Date(msg.created_at), 'h:mm a')}
                      <span className="ml-2 uppercase">{msg.role}</span>
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User className="h-3.5 w-3.5 text-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default function AdminSessions() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [viewingSession, setViewingSession] = useState<string | null>(null);
  const { data, isLoading } = useAdminSessions(search, type, page);

  const totalPages = data ? Math.ceil(data.total / 30) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Session Conversations</h2>
        <p className="text-sm text-muted-foreground">
          View all guide sessions and conversations — train your AI by understanding what users say
          {data ? ` · ${data.total} total sessions` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user or summary..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>
        <Select value={type || 'all'} onValueChange={(v) => { setType(v === 'all' ? null : v); setPage(0); }}>
          <SelectTrigger className="w-40">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="guide">Guide</SelectItem>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
            <SelectItem value="practice">Practice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : !data?.sessions?.length ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No sessions found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setViewingSession(s.id)}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/20 cursor-pointer transition-colors"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={s.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {(s.display_name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.display_name || 'Anonymous'}</span>
                    <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                    <Badge variant={s.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
                      {s.status}
                    </Badge>
                  </div>
                  {s.summary && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{s.summary}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{s.message_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{Math.round(s.duration_minutes || 0)}m</span>
                  </div>
                  <span>{format(new Date(s.created_at), 'MMM d')}</span>
                </div>
              </div>
            ))}
          </div>

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
      )}

      {/* Conversation Viewer Modal */}
      {viewingSession && (
        <ConversationViewer sessionId={viewingSession} onClose={() => setViewingSession(null)} />
      )}
    </div>
  );
}
