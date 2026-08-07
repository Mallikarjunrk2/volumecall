import fs from "fs";
import path from "path";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cacheStore: Record<string, CacheEntry<unknown> | undefined> = {};
const pendingRequests: Record<string, Promise<unknown> | undefined> = {};

const isDev = process.env.NODE_ENV === "development";
const devCacheDir = path.join(process.cwd(), ".cache", "indianapi");

function writeDevCache(key: string, data: unknown) {
  if (!isDev) return;
  try {
    if (!fs.existsSync(devCacheDir)) {
      fs.mkdirSync(devCacheDir, { recursive: true });
    }
    const filePath = path.join(devCacheDir, `${encodeURIComponent(key)}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ data, expiresAt: Date.now() + 7 * 24 * 3600 * 1000 }));
  } catch (err) {
    console.warn("[Dev Cache Write Failed]:", err);
  }
}

function readDevCache<T>(key: string): T | undefined {
  if (!isDev) return undefined;
  try {
    const filePath = path.join(devCacheDir, `${encodeURIComponent(key)}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      return parsed.data as T;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

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

  const devCached = readDevCache<T>(key);
  if (devCached !== undefined) {
    cacheStore[key] = {
      data: devCached,
      expiresAt: Date.now() + ttlMs,
    };
    return devCached;
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
      writeDevCache(key, data);
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
    if (isDev) {
      try {
        const filePath = path.join(devCacheDir, `${encodeURIComponent(key)}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {}
    }
  } else {
    Object.keys(cacheStore).forEach((k) => delete cacheStore[k]);
  }
}

export function getCacheEntry<T>(key: string): T | undefined {
  const cached = cacheStore[key];
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }
  const devCached = readDevCache<T>(key);
  if (devCached !== undefined) {
    cacheStore[key] = {
      data: devCached,
      expiresAt: Date.now() + 3600000,
    };
    return devCached;
  }
  return undefined;
}

export function setCacheEntry(key: string, data: unknown, ttlMs: number) {
  cacheStore[key] = {
    data,
    expiresAt: Date.now() + ttlMs,
  };
  writeDevCache(key, data);
}
