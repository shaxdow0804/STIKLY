import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEMO_ADMIN, isSupabaseConfigured } from '../lib/config';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const loadProfile = useCallback(async (u) => {
    if (!u) return setProfile(null);
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setUser(data.session?.user || null);
      await loadProfile(data.session?.user);
      if (active) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user || null);
      // defer to avoid calling supabase inside the auth callback
      setTimeout(() => loadProfile(session?.user), 0);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const need = () => { if (!supabase) throw new Error('Accounts need Supabase credentials. See the README.'); };

  const api = useMemo(() => ({
    user, profile, loading,
    configured: isSupabaseConfigured,
    // Admin rights always come from the database (profiles.is_admin), enforced by RLS. DEMO_ADMIN is a local-dev flag only.
    isAdmin: DEMO_ADMIN || Boolean(profile?.is_admin),
    async signUp(email, password, fullName) {
      need();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
      return { needsConfirmation: !data.session };
    },
    async signIn(email, password) {
      need();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() {
      need();
      await supabase.auth.signOut();
    },
  }), [user, profile, loading]);

  return <AuthCtx.Provider value={api}>{children}</AuthCtx.Provider>;
}
