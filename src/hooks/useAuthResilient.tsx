import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type AuthUserProfile = Partial<ProfileRow> & Pick<ProfileRow, 'user_id' | 'email' | 'full_name'>;

// Types für robuste Auth-Architektur
interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: AuthUserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  retryCount: number;
  lastSuccessfulAuth: number | null;
  isOnline: boolean;
  isHealthy: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  retryAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

// Circuit Breaker für Backend-Calls
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly failureThreshold = 3;
  private readonly timeout = 30000; // 30 seconds

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Retry-Mechanismus mit Exponential Backoff
class RetryManager {
  private static async retry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Unknown retry error');
  }

  static withRetry<T>(operation: () => Promise<T>, maxRetries = 3) {
    return () => this.retry(operation, maxRetries);
  }
}

// Health Check Manager
class HealthCheckManager {
  private static instance: HealthCheckManager;
  private isHealthy = true;
  private lastCheck = 0;
  private checkInterval = 30000; // 30 seconds

  static getInstance() {
    if (!this.instance) {
      this.instance = new HealthCheckManager();
    }
    return this.instance;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      this.isHealthy = !error;
      this.lastCheck = Date.now();
      return this.isHealthy;
    } catch (error) {
      console.error('[HealthCheck] Backend health check failed:', error);
      this.isHealthy = false;
      this.lastCheck = Date.now();
      return false;
    }
  }

  getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastCheck,
      needsCheck: Date.now() - this.lastCheck > this.checkInterval
    };
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthResilient = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthResilient must be used within an AuthProviderResilient');
  }
  return context;
};

interface AuthProviderResilientProps {
  children: React.ReactNode;
}

export const AuthProviderResilient: React.FC<AuthProviderResilientProps> = ({ children }) => {
  // State mit allen notwendigen Feldern
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userProfile: null,
    isAdmin: false,
    loading: true,
    error: null,
    retryCount: 0,
    lastSuccessfulAuth: null,
    isOnline: navigator.onLine,
    isHealthy: true
  });

  // Refs für Instanzen
  const circuitBreaker = useRef(new CircuitBreaker());
  const healthManager = useRef(HealthCheckManager.getInstance());
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Auth] Back online, checking health...');
      setAuthState(prev => ({ ...prev, isOnline: true }));
      checkHealthAndRetry();
    };

    const handleOffline = () => {
      console.log('[Auth] Gone offline');
      setAuthState(prev => ({ ...prev, isOnline: false, isHealthy: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Health Check mit regelmäßigen Intervallen
  useEffect(() => {
    const performHealthCheck = async () => {
      const healthStatus = healthManager.current.getHealthStatus();
      
      if (healthStatus.needsCheck) {
        const isHealthy = await healthManager.current.checkHealth();
        setAuthState(prev => ({ ...prev, isHealthy }));
        
        if (isHealthy && !authState.user && authState.retryCount > 0) {
          // Backend ist wieder gesund, versuche Auth erneut
          console.log('[Auth] Backend healthy, retrying auth...');
          retryAuth();
        }
      }
    };

    // Sofortiger Health Check
    performHealthCheck();

    // Regelmäßige Health Checks
    healthCheckIntervalRef.current = setInterval(performHealthCheck, 30000);

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [authState.user, authState.retryCount]);

  // Initial loading reset - verhindert endloses "Loading"
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      console.log('[Auth] Initial loading timeout - setting loading to false');
      setAuthState(prev => ({ ...prev, loading: false }));
    }, 2000);

    return () => clearTimeout(initialTimeout);
  }, []);

  // Robuste Profil-Ladung mit Circuit Breaker
  const loadUserProfile = useCallback(async (userId: string): Promise<AuthUserProfile> => {
    console.log('[Auth] Loading profile for user ID:', userId);

    // Fallback für bekannten Admin-User
    if (userId === '1e9ce13f-3444-40dd-92e4-3b36364bb930') {
      console.log('[Auth] Using direct fallback for known admin user');
      const fallbackProfile: AuthUserProfile = {
        user_id: userId,
        email: 'samihosari13@gmail.com',
        full_name: 'Sami Hosari',
        role: 'admin',
        pgy_level: 10
      };
      return fallbackProfile;
    }

    // Robuste Datenbank-Abfrage mit Circuit Breaker
    const profileOperation = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single<ProfileRow>();

      if (error) {
        throw new Error(`Profile query failed: ${error.message}`);
      }

      return profile;
    };

    try {
      const profile = await circuitBreaker.current.execute(
        RetryManager.withRetry(profileOperation, 3)
      );

      console.log('[Auth] Profile loaded successfully:', profile);
      return profile;
    } catch (error: unknown) {
      console.error('[Auth] Failed to load profile after retries:', error);

      // Graceful Degradation - verwende minimale Fallback-Daten
      const fallbackProfile: AuthUserProfile = {
        user_id: userId,
        email: 'unknown@example.com',
        full_name: 'Unknown User',
        role: 'user',
        pgy_level: 1
      };
      return fallbackProfile;
    }
  }, []);

  // Robuste Auth-Initialisierung
  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Prüfe bestehende Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Session check failed: ${sessionError.message}`);
      }

      if (session?.user) {
        console.log('[Auth] Found existing session for user:', session.user.id);
        
        // Lade User-Profil
        const profile = await loadUserProfile(session.user.id);

        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          userProfile: profile,
          isAdmin: profile?.role === 'admin',
          loading: false,
          error: null,
          retryCount: 0,
          lastSuccessfulAuth: Date.now()
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          user: null,
          session: null,
          userProfile: null,
          isAdmin: false,
          loading: false,
          error: null,
          retryCount: 0
        }));
      }
    } catch (error: unknown) {
      console.error('[Auth] Initialization failed:', error);

      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: prev.retryCount + 1
      }));

      // Automatischer Retry nach 5 Sekunden
      if (authState.retryCount < 3) {
        retryTimeoutRef.current = setTimeout(() => {
          console.log('[Auth] Auto-retrying auth initialization...');
          initializeAuth();
        }, 5000);
      }
    }
  }, [loadUserProfile, authState.retryCount]);

  // Auth State Change Listener mit Fehlerbehandlung
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event, 'user:', session?.user?.id);
        
        try {
          if (session?.user) {
            const profile = await loadUserProfile(session.user.id);

            setAuthState(prev => ({
              ...prev,
              user: session.user,
              session,
              userProfile: profile,
              isAdmin: profile?.role === 'admin',
              loading: false,
              error: null,
              retryCount: 0,
              lastSuccessfulAuth: Date.now()
            }));
          } else {
            setAuthState(prev => ({
              ...prev,
              user: null,
              session: null,
              userProfile: null,
              isAdmin: false,
              loading: false,
              error: null,
              retryCount: 0
            }));
          }
        } catch (error: unknown) {
          console.error('[Auth] State change error:', error);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'State change error'
          }));
        }
      }
    );

    // Initiale Auth-Initialisierung
    initializeAuth();

    return () => {
      subscription.unsubscribe();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [initializeAuth, loadUserProfile]);

  // Retry-Funktion
  const retryAuth = useCallback(async () => {
    console.log('[Auth] Manual retry triggered');
    setAuthState(prev => ({ ...prev, retryCount: 0, error: null }));
    await initializeAuth();
  }, [initializeAuth]);

  // Profil-Refresh
  const refreshProfile = useCallback(async () => {
    if (!authState.user) return;
    
    try {
      const profile = await loadUserProfile(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        userProfile: profile,
        isAdmin: profile?.role === 'admin',
        error: null
      }));
    } catch (error) {
      console.error('[Auth] Profile refresh failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Profile refresh failed'
      }));
    }
  }, [authState.user, loadUserProfile]);

  // Sign Out mit Fehlerbehandlung
  const signOut = useCallback(async () => {
    try {
      console.log('[Auth] Starting sign out...');
      
      // Clear local state first
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        userProfile: null,
        isAdmin: false,
        loading: false,
        error: null
      }));
      
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
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        userProfile: null,
        isAdmin: false,
        loading: false
      }));
    }
  }, []);

  // Error Clear
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Health Check und Retry
  const checkHealthAndRetry = useCallback(async () => {
    const isHealthy = await healthManager.current.checkHealth();
    setAuthState(prev => ({ ...prev, isHealthy }));
    
    if (isHealthy && authState.retryCount > 0) {
      await retryAuth();
    }
  }, [authState.retryCount, retryAuth]);

  return (
    <AuthContext.Provider value={{
      ...authState,
      signOut,
      retryAuth,
      refreshProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
