// @ts-nocheck
/**
 * Ask ISA Query Cache
 * 
 * Simple in-memory cache for Ask ISA queries to improve response times
 * for frequently asked questions.
 */

import { serverLogger } from "./_core/logger-wiring";

interface CachedResponse {
  answer: string;
  sources: Array<{
    id: number;
    type: string;
    title: string;
    url?: string | null;
    similarity: number;
    authorityLevel?: string;
    authorityScore?: number;
  }>;
  confidence: {
    level: "high" | "medium" | "low";
    score: number;
  };
  claimVerification?: {
    verificationRate: number;
    totalClaims: number;
    verifiedClaims: number;
    unverifiedClaims: number;
    warnings: string[];
  };
  cachedAt: number;
  hitCount: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

// Cache configuration
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 100; // Maximum number of cached queries
const SIMILARITY_THRESHOLD = 0.95; // Minimum similarity for cache hit

// In-memory cache store
const queryCache = new Map<string, CachedResponse>();
let totalHits = 0;
let totalMisses = 0;

/**
 * Normalize a query string for cache key generation
 */
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Generate a cache key from a query
 */
function generateCacheKey(query: string): string {
  return normalizeQuery(query);
}

/**
 * Check if a cached response is still valid
 */
function isValidCacheEntry(entry: CachedResponse): boolean {
  const age = Date.now() - entry.cachedAt;
  return age < CACHE_TTL_MS;
}

/**
 * Get a cached response for a query
 */
export function getCachedResponse(query: string): CachedResponse | null {
  const key = generateCacheKey(query);
  const cached = queryCache.get(key);
  
  if (cached && isValidCacheEntry(cached)) {
    cached.hitCount++;
    totalHits++;
    serverLogger.info(`[Ask ISA Cache] Cache HIT for query: "${query.substring(0, 50)}..."`);
    return cached;
  }
  
  // Remove expired entry if exists
  if (cached) {
    queryCache.delete(key);
    serverLogger.info(`[Ask ISA Cache] Expired entry removed for query: "${query.substring(0, 50)}..."`);
  }
  
  totalMisses++;
  return null;
}

/**
 * Store a response in the cache
 */
export function cacheResponse(
  query: string,
  response: Omit<CachedResponse, "cachedAt" | "hitCount">
): void {
  // Enforce cache size limit
  if (queryCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of queryCache.entries()) {
      if (entry.cachedAt < oldestTime) {
        oldestTime = entry.cachedAt;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      queryCache.delete(oldestKey);
      serverLogger.info(`[Ask ISA Cache] Evicted oldest entry to make room`);
    }
  }
  
  const key = generateCacheKey(query);
  queryCache.set(key, {
    ...response,
    cachedAt: Date.now(),
    hitCount: 0,
  });
  
  serverLogger.info(`[Ask ISA Cache] Cached response for query: "${query.substring(0, 50)}..."`);
}

/**
 * Invalidate all cache entries
 */
export function invalidateCache(): void {
  const size = queryCache.size;
  queryCache.clear();
  serverLogger.info(`[Ask ISA Cache] Invalidated ${size} cache entries`);
}

/**
 * Invalidate cache entries matching a pattern
 */
export function invalidateCacheByPattern(pattern: string): number {
  const normalizedPattern = normalizeQuery(pattern);
  let invalidated = 0;
  
  for (const [key] of queryCache.entries()) {
    if (key.includes(normalizedPattern)) {
      queryCache.delete(key);
      invalidated++;
    }
  }
  
  serverLogger.info(`[Ask ISA Cache] Invalidated ${invalidated} entries matching pattern: "${pattern}"`);
  return invalidated;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  let oldestEntry: number | null = null;
  let newestEntry: number | null = null;
  
  for (const entry of queryCache.values()) {
    if (oldestEntry === null || entry.cachedAt < oldestEntry) {
      oldestEntry = entry.cachedAt;
    }
    if (newestEntry === null || entry.cachedAt > newestEntry) {
      newestEntry = entry.cachedAt;
    }
  }
  
  const totalRequests = totalHits + totalMisses;
  
  return {
    totalEntries: queryCache.size,
    totalHits,
    totalMisses,
    hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
    oldestEntry,
    newestEntry,
  };
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredEntries(): number {
  let cleaned = 0;
  
  for (const [key, entry] of queryCache.entries()) {
    if (!isValidCacheEntry(entry)) {
      queryCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    serverLogger.info(`[Ask ISA Cache] Cleaned up ${cleaned} expired entries`);
  }
  
  return cleaned;
}

/**
 * Get the most frequently asked questions from cache
 */
export function getTopQueries(limit: number = 10): Array<{ query: string; hitCount: number }> {
  const entries: Array<{ query: string; hitCount: number }> = [];
  
  for (const [key, entry] of queryCache.entries()) {
    if (isValidCacheEntry(entry)) {
      entries.push({ query: key, hitCount: entry.hitCount });
    }
  }
  
  return entries
    .sort((a, b) => b.hitCount - a.hitCount)
    .slice(0, limit);
}
