interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cacheStore: Record<string, CacheEntry<unknown> | undefined> = {};
const pendingRequests: Record<string, Promise<unknown> | undefined> = {};

/**
 * Checks cache or executes fetchFn, deduplicating parallel execution queries.
 */
export async function getOrFetchWithCache<T>(
  key: string,
  ttlMs: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cacheStore[key];
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  // Deduplicate active requests
  if (pendingRequests[key]) {
    return pendingRequests[key] as Promise<T>;
  }

  const promise = fetchFn()
    .then((data) => {
      cacheStore[key] = {
        data,
        expiresAt: Date.now() + ttlMs,
      };
      delete pendingRequests[key];
      return data;
    })
    .catch((err) => {
      delete pendingRequests[key];
      throw err;
    });

  pendingRequests[key] = promise;
  return promise;
}

/**
 * Helper to clear cache (e.g. during error retries or testing)
 */
export function clearCache(key?: string) {
  if (key) {
    delete cacheStore[key];
  } else {
    Object.keys(cacheStore).forEach((k) => delete cacheStore[k]);
  }
}

export function getCacheEntry<T>(key: string): T | undefined {
  const cached = cacheStore[key];
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }
  return undefined;
}

export function setCacheEntry(key: string, data: unknown, ttlMs: number) {
  cacheStore[key] = {
    data,
    expiresAt: Date.now() + ttlMs,
  };
}
