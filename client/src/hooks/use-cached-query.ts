// Cached Query Hook
// React Query hook with Firestore cache integration

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getCachedData, setCachedData, generateCacheKey } from "@/lib/firestore-cache";

interface CachedQueryOptions<T> extends Omit<UseQueryOptions<T>, "queryFn"> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  cacheKey?: string;
  cacheTTL?: number; // Time to live in milliseconds
  useCache?: boolean; // Enable/disable cache
}

/**
 * React Query hook with Firestore cache support
 */
export function useCachedQuery<T>({
  queryKey,
  queryFn,
  cacheKey,
  cacheTTL = 5 * 60 * 1000, // 5 minutes default
  useCache = true,
  ...options
}: CachedQueryOptions<T>) {
  const finalCacheKey = cacheKey || generateCacheKey(queryKey[0], queryKey[1] as any);

  return useQuery<T>({
    ...options,
    queryKey,
    queryFn: async () => {
      // Try to get from cache first
      if (useCache) {
        const cached = await getCachedData<T>(finalCacheKey, cacheTTL);
        if (cached !== null) {
          return cached;
        }
      }

      // Fetch from API
      const data = await queryFn();

      // Store in cache
      if (useCache) {
        await setCachedData(finalCacheKey, data, cacheTTL);
      }

      return data;
    }
  });
}
