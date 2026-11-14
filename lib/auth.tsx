'use client';
import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from './api';
import { supabase } from './supabase';
import type { Me, Role } from './types';

interface AuthState {
  session: Session | null;
  me: Me | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<Me | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const profile = await api<Me>('/me');
      setMe(profile);
      setError(null);
      return profile;
    } catch (e) {
      setMe(null);
      setError(e instanceof ApiError && e.status !== 401 ? e.message : null);
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) await refresh();
      if (alive) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'SIGNED_OUT') setMe(null);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setMe(null);
    setSession(null);
  }, []);

  return <Ctx.Provider value={{ session, me, loading, error, refresh, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}

export const homeFor = (role: Role) => (role === 'teacher' ? '/teacher' : '/student');

/** Redirects away unless the signed-in user has `role`. */
export function useRequireRole(role: Role) {
  const { me, loading, session } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!session || !me) router.replace('/login');
    else if (me.role !== role) router.replace(homeFor(me.role));
  }, [loading, session, me, role, router]);
  return { ready: !loading && !!me && me.role === role, me };
}
