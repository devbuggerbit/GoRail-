import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  mobile: string | null;
  email: string | null;
  preferred_language: string;
}

interface StaffProfile {
  id: string;
  name: string;
  employee_id: string;
  role: string;
  station_id: string | null;
  train_id: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  staffProfile: StaffProfile | null;
  isStaff: boolean;
  loading: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState(() => localStorage.getItem('railsaathi_lang') || 'en');

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('railsaathi_lang', lang);
  };

  const fetchProfiles = async (userId: string) => {
    const [{ data: up }, { data: sp }] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).maybeSingle(),
      supabase.from('staff').select('*').eq('id', userId).maybeSingle(),
    ]);
    setUserProfile(up);
    setStaffProfile(sp);
    if (up?.preferred_language) setLanguage(up.preferred_language);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfiles(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        (async () => {
          await fetchProfiles(session.user.id);
        })();
      }
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setStaffProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session, user, userProfile, staffProfile,
      isStaff: !!staffProfile,
      loading, language, setLanguage,
      signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
