// Firestore Cache System
// Professional caching layer for dashboard data

import { getFirebaseFirestore } from "./firebase";
import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

export interface CacheEntry<T> {
  data: T;
  timestamp: Timestamp;
  expiresAt: Timestamp;
  version: string;
}

const CACHE_VERSION = "1.0.0";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get cached data from Firestore
 */
export async function getCachedData<T>(
  cacheKey: string,
  maxAge: number = DEFAULT_TTL
): Promise<T | null> {
  try {
    const firestore = getFirebaseFirestore();
    const cacheRef = doc(firestore, "cache", cacheKey);
    const cacheDoc = await getDoc(cacheRef);

    if (!cacheDoc.exists()) {
      return null;
    }

    const cacheData = cacheDoc.data() as CacheEntry<T>;
    const now = Timestamp.now();
    const expiresAt = cacheData.expiresAt;

    // Check if cache is expired
    if (expiresAt.toMillis() < now.toMillis()) {
      console.log(`[Cache] Expired: ${cacheKey}`);
      return null;
    }

    // Check version compatibility
    if (cacheData.version !== CACHE_VERSION) {
      console.log(`[Cache] Version mismatch: ${cacheKey} (${cacheData.version} vs ${CACHE_VERSION})`);
      return null;
    }

    console.log(`[Cache] Hit: ${cacheKey}`);
    return cacheData.data;
  } catch (error) {
    console.warn(`[Cache] Error reading cache for ${cacheKey}:`, error);
    return null;
  }
}

/**
 * Set cached data in Firestore
 */
export async function setCachedData<T>(
  cacheKey: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  try {
    const firestore = getFirebaseFirestore();
    const cacheRef = doc(firestore, "cache", cacheKey);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + ttl);

    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
      version: CACHE_VERSION
    };

    await setDoc(cacheRef, cacheEntry);
    console.log(`[Cache] Set: ${cacheKey} (expires in ${ttl / 1000}s)`);
  } catch (error) {
    console.warn(`[Cache] Error setting cache for ${cacheKey}:`, error);
    // Don't throw - cache failures shouldn't break the app
  }
}

/**
 * Invalidate cache entry
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  try {
    const firestore = getFirebaseFirestore();
    const cacheRef = doc(firestore, "cache", cacheKey);
    await setDoc(cacheRef, {
      expiresAt: Timestamp.fromMillis(0) // Expire immediately
    });
    console.log(`[Cache] Invalidated: ${cacheKey}`);
  } catch (error) {
    console.warn(`[Cache] Error invalidating cache for ${cacheKey}:`, error);
  }
}

/**
 * Generate cache key from query parameters
 */
export function generateCacheKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  const baseKey = endpoint.replace(/^\//, "").replace(/\//g, "_");
  
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");

  return `${baseKey}_${sortedParams}`;
}
