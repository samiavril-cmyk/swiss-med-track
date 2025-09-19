import { useCallback, useRef, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type CachedProfile = Partial<ProfileRow> & Pick<ProfileRow, 'user_id' | 'email' | 'full_name'>;

// Cache für Auth-Daten mit TTL (Time To Live)
class AuthCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 Minuten

  set(key: string, data: unknown, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    return this.get<unknown>(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Optimistic Updates für Auth-Operationen
export const useAuthCache = () => {
  const cacheRef = useRef(new AuthCache());

  // Cache-Bereinigung alle 5 Minuten
  useEffect(() => {
    const interval = setInterval(() => {
      cacheRef.current.clearExpired();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getCachedProfile = useCallback((userId: string) => {
    return cacheRef.current.get<CachedProfile>(`profile_${userId}`);
  }, []);

  const setCachedProfile = useCallback((userId: string, profile: CachedProfile, ttl?: number) => {
    cacheRef.current.set(`profile_${userId}`, profile, ttl);
  }, []);

  const getCachedSession = useCallback(() => {
    return cacheRef.current.get<Session | null>('session');
  }, []);

  const setCachedSession = useCallback((session: Session | null, ttl?: number) => {
    cacheRef.current.set('session', session, ttl);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return cacheRef.current.getStats();
  }, []);

  return {
    getCachedProfile,
    setCachedProfile,
    getCachedSession,
    setCachedSession,
    clearCache,
    getCacheStats
  };
};
