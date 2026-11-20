import { supabase } from '@/lib/supabase';

const baseUrl = import.meta.env.VITE_SUPABASE_URL;

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + session.access_token,
  };
}

export async function createThread(input: { question: string; source?: string; confidence?: number }) {
  const headers = await authHeaders();
  if (!headers) return null;
  const r = await fetch(baseUrl + '/functions/v1/manage-thread', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'create', ...input }),
  });
  if (!r.ok) return null;
  return r.json();
}

export async function updateThread(input: { id: string; status?: string; depth_mode?: string; question?: string; resolution_note?: string }) {
  const headers = await authHeaders();
  if (!headers) return null;
  const r = await fetch(baseUrl + '/functions/v1/manage-thread', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'update', ...input }),
  });
  if (!r.ok) return null;
  return r.json();
}

export async function exploreThread(id: string) {
  const headers = await authHeaders();
  if (!headers) return null;
  const r = await fetch(baseUrl + '/functions/v1/manage-thread', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'explore', id }),
  });
  if (!r.ok) return null;
  return r.json();
}
