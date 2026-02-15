/**
 * Export Scheduler
 *
 * Manages background generation of PDF exports for popular regulations
 * and caches them for faster downloads. Implements cache invalidation
 * and scheduled regeneration.
 */

import { exportRegulationToPDF, generateExportFilename } from "./export-utils";
import { getRegulations } from "./db";
import { storagePut, storageGet } from "./storage";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Cache metadata stored in database or memory
 */
interface ExportCacheEntry {
  regulationId: string;
  format: "pdf" | "csv";
  cachedAt: Date;
  expiresAt: Date;
  s3Key: string;
  fileSize: number;
  checksum: string;
}

/**
 * In-memory cache for export metadata
 * In production, this should be stored in database or Redis
 */
const exportCache = new Map<string, ExportCacheEntry>();

/**
 * Cache TTL in milliseconds (24 hours)
 */
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * List of popular regulations to pre-generate (by ID)
 */
const POPULAR_REGULATIONS = ["1", "2", "3", "4", "5"];

/**
 * Generate cache key for a regulation export
 */
function getCacheKey(regulationId: string, format: "pdf" | "csv"): string {
  return `export:${regulationId}:${format}`;
}

/**
 * Check if cached export is still valid
 */
function isCacheValid(entry: ExportCacheEntry): boolean {
  return new Date() < entry.expiresAt;
}

/**
 * Get cached export from S3 if available
 */
export async function getCachedExport(
  regulationId: string,
  format: "pdf" | "csv"
): Promise<{ url: string; buffer?: Buffer } | null> {
  const cacheKey = getCacheKey(regulationId, format);
  const cached = exportCache.get(cacheKey);

  if (!cached || !isCacheValid(cached)) {
    return null;
  }

  try {
    const { url } = await storageGet(cached.s3Key);
    return { url };
  } catch (error) {
    serverLogger.error(`[Export Cache] Failed to retrieve cached export: ${error}`);
    exportCache.delete(cacheKey);
    return null;
  }
}

/**
 * Cache export to S3
 */
export async function cacheExport(
  regulationId: string,
  format: "pdf" | "csv",
  buffer: Buffer,
  filename: string
): Promise<ExportCacheEntry | null> {
  try {
    const cacheKey = getCacheKey(regulationId, format);
    const s3Key = `exports/${regulationId}/${format}/${filename}`;
    const mimeType = format === "pdf" ? "application/pdf" : "text/csv";

    // Upload to S3
    const { url: _url, key } = await storagePut(s3Key, buffer, mimeType);

    // Calculate checksum for cache validation
    const crypto = await import("crypto");
    const checksum = crypto.default
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    const entry: ExportCacheEntry = {
      regulationId,
      format,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL),
      s3Key: key,
      fileSize: buffer.length,
      checksum,
    };

    exportCache.set(cacheKey, entry);
    serverLogger.info(`[Export Cache] Cached ${format.toUpperCase()} for regulation ${regulationId}`);

    return entry;
  } catch (error) {
    serverLogger.error(`[Export Cache] Failed to cache export: ${error}`);
    return null;
  }
}

/**
 * Invalidate cache for a regulation
 */
export function invalidateCache(regulationId: string): void {
  const pdfKey = getCacheKey(regulationId, "pdf");
  const csvKey = getCacheKey(regulationId, "csv");

  exportCache.delete(pdfKey);
  exportCache.delete(csvKey);

  serverLogger.info(`[Export Cache] Invalidated cache for regulation ${regulationId}`);
}

/**
 * Invalidate all caches
 */
export function invalidateAllCaches(): void {
  exportCache.clear();
  serverLogger.info("[Export Cache] Invalidated all caches");
}

/**
 * Background job: Pre-generate PDFs for popular regulations
 * Should be scheduled to run daily or on-demand
 */
export async function generatePopularExports(): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ regulationId: string; error: string }>;
}> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as Array<{ regulationId: string; error: string }>,
  };

  serverLogger.info("[Export Scheduler] Starting popular exports generation...");

  const regulations = await getRegulations();

  for (const regulationId of POPULAR_REGULATIONS) {
    try {
      const regulation = regulations.find(r => String(r.id) === regulationId);

      if (!regulation) {
        serverLogger.warn(`[Export Scheduler] Regulation ${regulationId} not found`);
        results.failed++;
        results.errors.push({
          regulationId,
          error: "Regulation not found",
        });
        continue;
      }

      // Check if cache is still valid
      const cached = exportCache.get(getCacheKey(regulationId, "pdf"));
      if (cached && isCacheValid(cached)) {
        serverLogger.info(`[Export Scheduler] PDF for regulation ${regulationId} already cached`);
        results.successful++;
        continue;
      }

      // Generate PDF
      const exportData = {
        id: String(regulation.id),
        title: regulation.title,
        type: regulation.regulationType,
        celexId: regulation.celexId || "",
        description: regulation.description || "",
        effectiveDate: regulation.effectiveDate ? new Date(regulation.effectiveDate) : new Date(),
        enforcementDate: null,
        status: "Active",
        applicableSectors: [],
        applicableGS1Standards: [],
        implementationPhases: [],
        relatedRegulations: [],
        faqItems: [],
        checklist: [],
      };

      const pdfBuffer = exportRegulationToPDF(exportData);
      const filename = generateExportFilename(regulation.title, "pdf");

      // Cache the PDF
      const cacheResult = await cacheExport(
        regulationId,
        "pdf",
        pdfBuffer,
        filename
      );
      if (!cacheResult) {
        throw new Error("Failed to cache PDF");
      }

      results.successful++;
      serverLogger.info(`[Export Scheduler] Successfully generated PDF for regulation ${regulationId}`);
    } catch (error) {
      results.failed++;
      results.errors.push({
        regulationId,
        error: `${error}`,
      });
      serverLogger.error(
        `[Export Scheduler] Failed to generate export for regulation ${regulationId}: ${error}`
      );
    }
  }

  serverLogger.info(`[Export Scheduler] Completed: ${results.successful} successful, ${results.failed} failed`);

  return results;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalCached: number;
  totalSize: number;
  entries: Array<{
    regulationId: string;
    format: string;
    cachedAt: string;
    expiresAt: string;
    fileSize: number;
  }>;
} {
  const entries: Array<{
    regulationId: string;
    format: string;
    cachedAt: string;
    expiresAt: string;
    fileSize: number;
  }> = [];

  exportCache.forEach(entry => {
    entries.push({
      regulationId: entry.regulationId,
      format: entry.format,
      cachedAt: entry.cachedAt.toISOString(),
      expiresAt: entry.expiresAt.toISOString(),
      fileSize: entry.fileSize,
    });
  });

  const totalSize = entries.reduce((sum, e) => sum + e.fileSize, 0);

  return {
    totalCached: exportCache.size,
    totalSize,
    entries,
  };
}

/**
 * Cleanup expired cache entries
 */
export function cleanupExpiredCache(): number {
  let cleaned = 0;
  const now = new Date();

  const keysToDelete: string[] = [];
  exportCache.forEach((entry, key) => {
    if (now > entry.expiresAt) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => {
    exportCache.delete(key);
    cleaned++;
  });

  if (cleaned > 0) {
    serverLogger.info(`[Export Cache] Cleaned up ${cleaned} expired entries`);
  }

  return cleaned;
}

/**
 * Initialize scheduler
 * Sets up periodic cleanup and optional pre-generation
 */
export function initializeScheduler(): void {
  // Cleanup expired cache every hour
  setInterval(
    () => {
      cleanupExpiredCache();
    },
    60 * 60 * 1000
  );

  serverLogger.info("[Export Scheduler] Initialized with hourly cleanup");
}
