import { useCallback, useRef, useEffect } from 'react';

// Cache für Auth-Daten mit TTL (Time To Live)
class AuthCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 Minuten

  set(key: string, data: any, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
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
    return cacheRef.current.get(`profile_${userId}`);
  }, []);

  const setCachedProfile = useCallback((userId: string, profile: any, ttl?: number) => {
    cacheRef.current.set(`profile_${userId}`, profile, ttl);
  }, []);

  const getCachedSession = useCallback(() => {
    return cacheRef.current.get('session');
  }, []);

  const setCachedSession = useCallback((session: any, ttl?: number) => {
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
