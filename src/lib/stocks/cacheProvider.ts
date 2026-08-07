export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCacheProvider implements ICacheProvider {
  private cache = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

let cacheProviderInstance: ICacheProvider;

export function getCacheProvider(): ICacheProvider {
  if (!cacheProviderInstance) {
    cacheProviderInstance = new InMemoryCacheProvider();
  }
  return cacheProviderInstance;
}
