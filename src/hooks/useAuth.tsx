import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  householdId: string | null;
  signUpWithPhone: (phone: string, pin: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string, pin: string) => Promise<{ error: Error | null }>;
  autoJoin: (name: string, code: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function phoneToEmail(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return `${cleaned}@homehub.app`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchHouseholdId(session.user.id);
      } else {
        setHouseholdId(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchHouseholdId(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHouseholdId = async (userId: string) => {
    const { data } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    setHouseholdId(data?.household_id ?? null);
    setLoading(false);
  };

  const signUpWithPhone = async (phone: string, pin: string) => {
    const email = phoneToEmail(phone);
    // PIN is padded to meet Supabase 6-char min password requirement
    const password = pin + '00';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: '', phone },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error as Error };

    // Save phone to profile
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ phone })
        .eq('user_id', data.user.id);
    }

    return { error: null };
  };

  const signInWithPhone = async (phone: string, pin: string) => {
    const email = phoneToEmail(phone);
    const password = pin + '00';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const autoJoin = async (name: string, code: string) => {
    // Create a random account for the family member
    const randomId = crypto.randomUUID().slice(0, 12);
    const email = `family_${randomId}@homehub.app`;
    const password = crypto.randomUUID().slice(0, 12);

    // Store credentials so they stay logged in
    localStorage.setItem('homehub_family_email', email);
    localStorage.setItem('homehub_family_password', password);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) return { error: signUpError as Error };

    // Update profile with name
    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser) {
      await supabase
        .from('profiles')
        .update({ display_name: name })
        .eq('user_id', newUser.id);
    }

    // Join household
    const { error: joinError } = await supabase.rpc('join_household_by_code', { _code: code });
    if (joinError) return { error: joinError as Error };

    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('homehub_family_email');
    localStorage.removeItem('homehub_family_password');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, householdId, signUpWithPhone, signInWithPhone, autoJoin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
