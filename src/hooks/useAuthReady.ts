import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { setUser as setObservabilityUser } from "@/lib/observability";

interface AuthReadyState {
  isReady: boolean;
  user: User | null;
}

const EXPIRY_SKEW_SECONDS = 30;

/**
 * INITIAL_SESSION is read straight from storage and is not validated, so an
 * expired token can surface here before supabase-js finishes refreshing it.
 * Treating that session as ready makes app code fire authenticated requests
 * with a dead JWT (401 from PostgREST). Ignore it and wait for the validated
 * getUser() result, TOKEN_REFRESHED, or SIGNED_IN.
 */
function isUsableSession(session: Session | null): session is Session {
  if (!session?.user) return false;
  if (!session.expires_at) return true;
  return session.expires_at - EXPIRY_SKEW_SECONDS > Date.now() / 1000;
}

export function useAuthReady(): AuthReadyState {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    const applySession = (session: Session | null) => {
      if (!active) return;
      if (!session) {
        setUser(null);
        setObservabilityUser(null);
        setIsReady(true);
        return;
      }
      if (!isUsableSession(session)) return;
      setUser(session.user);
      setObservabilityUser(session.user.id);
      setIsReady(true);
    };

    void supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (!active) return;
        setUser(user);
        setObservabilityUser(user?.id ?? null);
        setIsReady(true);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setObservabilityUser(null);
        setIsReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isReady };
}