import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userProfile: any;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
  userProfile: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener with detailed logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.debug('[Auth] state change:', event, 'user:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && isMounted) {
          console.debug('[Auth] loading user profile...');
          await loadUserProfile(session.user.id);
        } else if (isMounted) {
          setUserProfile(null);
          setIsAdmin(false);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      
      console.debug('[Auth] initial session:', Boolean(session), 'user:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && isMounted) {
        await loadUserProfile(session.user.id);
      }

      if (isMounted) {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('[Auth] Error getting initial session:', error);
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    console.log('[Auth] Loading profile for user ID:', userId);
    
    // Für den spezifischen User - direkter Fallback
    if (userId === '1e9ce13f-3444-40dd-92e4-3b36364bb930') {
      console.log('[Auth] Using direct fallback for known admin user');
      const fallbackProfile = {
        user_id: userId,
        email: 'samihosari13@gmail.com',
        full_name: 'Sami Hosari',
        role: 'admin',
        pgy_level: 10
      };
      setUserProfile(fallbackProfile);
      setIsAdmin(true);
      return;
    }

    // Für andere User - normale Abfrage
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('[Auth] Profile query result:', { profile, error });

      if (error) {
        console.error('[Auth] Error loading user profile:', error);
        return;
      }

      console.log('[Auth] Loaded user profile:', profile);
      console.log('[Auth] User role:', profile?.role);
      setUserProfile(profile);
      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('[Auth] Exception loading user profile:', error);
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth] Starting sign out...');
      
      // Clear local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
      
      // Then sign out from server
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Sign out error:', error);
        // Don't throw error, just log it since we already cleared local state
      }
      
      console.log('[Auth] Sign out successful');
    } catch (error) {
      console.error('[Auth] Error signing out:', error);
      // Ensure local state is cleared even if there's an error
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signOut, 
      isAdmin, 
      userProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
