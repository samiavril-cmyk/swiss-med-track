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
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setUserProfile(profile);
      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth] Starting sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Sign out error:', error);
        throw error;
      }
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsAdmin(false);
      
      console.log('[Auth] Sign out successful');
    } catch (error) {
      console.error('[Auth] Error signing out:', error);
      // Still clear local state even if server sign out fails
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
