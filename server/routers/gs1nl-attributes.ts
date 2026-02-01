/**
 * GS1 NL Attributes Router
 * 
 * Provides tRPC procedures for browsing and searching GS1 Nederland datamodel attributes
 * stored in the knowledge_embeddings table.
 * 
 * This router enables the GS1 NL Attribute Browser page to:
 * - List all GS1 NL datamodel attributes
 * - Filter by sector (FMCG, DIY, Healthcare, Fashion, Sustainability)
 * - Search by title and content
 * - Get detailed attribute information
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { knowledgeEmbeddings } from "../../drizzle/schema";
import { sql, like, or, and, desc, asc } from "drizzle-orm";
import { serverLogger } from "../_core/logger-wiring";

// Sector enum for filtering
const SectorEnum = z.enum(["all", "fmcg", "diy", "healthcare", "fashion", "sustainability"]);
type Sector = z.infer<typeof SectorEnum>;

// Sector keywords for content-based detection
const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  all: [],
  fmcg: ["fmcg", "levensmiddelen", "food", "drogisterij", "drugstore", "voeding", "nutrition"],
  diy: ["diy", "doe-het-zelf", "garden", "tuin", "dier", "pet", "bouwmarkt"],
  healthcare: ["healthcare", "gezondheidszorg", "medical", "medisch", "zorg", "pharma"],
  fashion: ["fashion", "mode", "textiel", "textile", "apparel", "kleding", "footwear"],
  sustainability: ["sustainability", "duurzaamheid", "eco", "dpp", "carbon", "co2", "sup", "eudr"],
};

// GS1 NL sourceType patterns
const GS1_NL_SOURCE_PATTERNS = [
  "gs1_nl_datamodel",
  "gs1_nl_fmcg",
  "gs1_nl_diy", 
  "gs1_nl_healthcare",
  "gs1_nl_fashion",
  "gs1_nl_sustainability",
];

export const gs1nlAttributesRouter = router({
  /**
   * List GS1 NL datamodel attributes with optional filtering
   */
  list: publicProcedure
    .input(
      z.object({
        sector: SectorEnum.optional().default("all"),
        search: z.string().optional(),
        limit: z.number().min(1).max(500).optional().default(100),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Build base conditions for GS1 NL content
        const sourceConditions = GS1_NL_SOURCE_PATTERNS.map(pattern => 
          like(knowledgeEmbeddings.sourceType, `%${pattern}%`)
        );
        
        let whereCondition = or(...sourceConditions);

        // Apply search filter if provided
        if (input.search && input.search.trim()) {
          const searchTerm = `%${input.search.trim()}%`;
          whereCondition = and(
            whereCondition,
            or(
              like(knowledgeEmbeddings.title, searchTerm),
              like(knowledgeEmbeddings.content, searchTerm)
            )
          );
        }

        // Execute query
        const results = await db
          .select({
            id: knowledgeEmbeddings.id,
            title: knowledgeEmbeddings.title,
            content: knowledgeEmbeddings.content,
            sourceType: knowledgeEmbeddings.sourceType,
            url: knowledgeEmbeddings.url,
            createdAt: knowledgeEmbeddings.createdAt,
          })
          .from(knowledgeEmbeddings)
          .where(whereCondition)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(asc(knowledgeEmbeddings.title));

        // Transform results with sector detection
        const attributes = results.map(row => {
          // Detect sector from sourceType and content
          let detectedSector: Sector = "fmcg"; // Default
          const lowerContent = (row.content + " " + row.title + " " + row.sourceType).toLowerCase();
          
          // Check sourceType first
          if (row.sourceType.includes("diy")) detectedSector = "diy";
          else if (row.sourceType.includes("healthcare")) detectedSector = "healthcare";
          else if (row.sourceType.includes("fashion")) detectedSector = "fashion";
          else if (row.sourceType.includes("sustainability")) detectedSector = "sustainability";
          else {
            // Fall back to content-based detection
            for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
              if (sector === "all") continue;
              if (keywords.some(kw => lowerContent.includes(kw))) {
                detectedSector = sector as Sector;
                break;
              }
            }
          }
          
          // Extract field name from title if present (e.g., "GTIN (gtin)")
          const fieldNameMatch = row.title.match(/\(([a-zA-Z_]+)\)/);
          const fieldName = fieldNameMatch ? fieldNameMatch[1] : undefined;
          
          // Detect if mandatory from content
          const mandatory = lowerContent.includes("verplicht") || 
                           lowerContent.includes("required") ||
                           lowerContent.includes("mandatory") ||
                           lowerContent.includes("must be");
          
          // Detect data type from content
          let dataType = "string";
          if (lowerContent.includes("number") || lowerContent.includes("numeric") || lowerContent.includes("getal")) {
            dataType = "number";
          } else if (lowerContent.includes("boolean") || lowerContent.includes("true/false")) {
            dataType = "boolean";
          } else if (lowerContent.includes("date") || lowerContent.includes("datum")) {
            dataType = "date";
          }
          
          return {
            id: row.id,
            title: row.title,
            content: row.content,
            sector: detectedSector,
            fieldName,
            dataType,
            mandatory,
            url: row.url,
            sourceType: row.sourceType,
          };
        });

        // Apply sector filter after detection (if not "all")
        const filteredAttributes = input.sector === "all" 
          ? attributes 
          : attributes.filter(attr => attr.sector === input.sector);

        serverLogger.info(`[GS1NL] Returned ${filteredAttributes.length} attributes (sector: ${input.sector})`);
        return filteredAttributes;

      } catch (error) {
        serverLogger.error("[GS1NL] Failed to fetch attributes:", error);
        throw new Error("Failed to fetch GS1 NL attributes");
      }
    }),

  /**
   * Get a single attribute by ID with full details
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = await db
        .select()
        .from(knowledgeEmbeddings)
        .where(sql`${knowledgeEmbeddings.id} = ${input.id}`)
        .limit(1);

      if (results.length === 0) {
        throw new Error("Attribute not found");
      }

      const row = results[0];
      return {
        id: row.id,
        title: row.title,
        content: row.content,
        sourceType: row.sourceType,
        url: row.url,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }),

  /**
   * Get statistics about GS1 NL content in the knowledge base
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Build conditions for GS1 NL content
      const sourceConditions = GS1_NL_SOURCE_PATTERNS.map(pattern => 
        like(knowledgeEmbeddings.sourceType, `%${pattern}%`)
      );
      
      const whereCondition = or(...sourceConditions);

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(knowledgeEmbeddings)
        .where(whereCondition);

      // Get counts by sourceType
      const byTypeResult = await db
        .select({
          sourceType: knowledgeEmbeddings.sourceType,
          count: sql<number>`COUNT(*)`,
        })
        .from(knowledgeEmbeddings)
        .where(whereCondition)
        .groupBy(knowledgeEmbeddings.sourceType);

      // Map sourceTypes to sectors
      const bySector: Record<string, number> = {
        fmcg: 0,
        diy: 0,
        healthcare: 0,
        fashion: 0,
        sustainability: 0,
      };

      for (const row of byTypeResult) {
        const sourceType = row.sourceType.toLowerCase();
        if (sourceType.includes("diy")) bySector.diy += Number(row.count);
        else if (sourceType.includes("healthcare")) bySector.healthcare += Number(row.count);
        else if (sourceType.includes("fashion")) bySector.fashion += Number(row.count);
        else if (sourceType.includes("sustainability")) bySector.sustainability += Number(row.count);
        else bySector.fmcg += Number(row.count);
      }

      return {
        total: totalResult[0]?.count || 0,
        bySector,
        byType: byTypeResult.reduce((acc, row) => {
          acc[row.sourceType] = Number(row.count);
          return acc;
        }, {} as Record<string, number>),
      };

    } catch (error) {
      serverLogger.error("[GS1NL] Failed to fetch stats:", error);
      throw new Error("Failed to fetch GS1 NL stats");
    }
  }),

  /**
   * Search attributes using semantic similarity (if embeddings available)
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        sector: SectorEnum.optional().default("all"),
        limit: z.number().min(1).max(50).optional().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // For now, use simple text search
      // TODO: Implement semantic search using embeddings
      const searchTerm = `%${input.query}%`;
      
      const sourceConditions = GS1_NL_SOURCE_PATTERNS.map(pattern => 
        like(knowledgeEmbeddings.sourceType, `%${pattern}%`)
      );

      const results = await db
        .select({
          id: knowledgeEmbeddings.id,
          title: knowledgeEmbeddings.title,
          content: knowledgeEmbeddings.content,
          sourceType: knowledgeEmbeddings.sourceType,
          url: knowledgeEmbeddings.url,
        })
        .from(knowledgeEmbeddings)
        .where(
          and(
            or(...sourceConditions),
            or(
              like(knowledgeEmbeddings.title, searchTerm),
              like(knowledgeEmbeddings.content, searchTerm)
            )
          )
        )
        .limit(input.limit);

      return results.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content.substring(0, 300) + (row.content.length > 300 ? "..." : ""),
        sourceType: row.sourceType,
        url: row.url,
      }));
    }),
});
