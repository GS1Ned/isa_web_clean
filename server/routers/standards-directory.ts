/**
 * Standards Directory tRPC Router
 * 
 * Priority 3: Standards Discovery UI
 * 
 * Purpose: Enable users to deterministically discover what standards exist,
 * who owns them, and what their current status is — without interpretation or reasoning.
 * 
 * Scope: Read-only directory of standards with filtering by organization, jurisdiction, sector, lifecycle status
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  gs1Standards,
  gs1Attributes,
  gs1WebVocabulary,
  esrsDatapoints,
} from "../../drizzle/schema";
import { eq, like, or, and, inArray } from "drizzle-orm";

export const standardsDirectoryRouter = router({
  /**
   * List all standards with deterministic filtering
   * 
   * Returns standards from multiple sources:
   * - GS1 Standards (gs1_standards table)
   * - GS1 Attributes (gs1_attributes table - grouped by sector)
   * - GS1 Web Vocabulary (gs1_web_vocabulary table)
   * - ESRS Datapoints (esrs_datapoints table - grouped by standard)
   */
  list: publicProcedure
    .input(
      z
        .object({
          // Filter by owning organization
          organization: z
            .enum([
              "GS1_Global",
              "GS1_EU",
              "GS1_NL",
              "EFRAG",
              "EU",
            ])
            .optional(),
          
          // Filter by jurisdiction
          jurisdiction: z
            .enum([
              "Global",
              "EU",
              "NL",
              "Benelux",
            ])
            .optional(),
          
          // Filter by sector (where available)
          sector: z
            .enum([
              "DIY",
              "FMCG",
              "Healthcare",
              "All",
            ])
            .optional(),
          
          // Filter by lifecycle status (if available)
          lifecycleStatus: z
            .enum([
              "draft",
              "ratified",
              "deprecated",
              "superseded",
              "current",
            ])
            .optional(),
          
          // Search term (name/code only, no interpretation)
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const results: Array<{
        id: string;
        name: string;
        owningOrganization: string;
        jurisdiction: string;
        sector: string | null;
        lifecycleStatus: string | null;
        sourceType: "gs1_standard" | "gs1_attributes" | "gs1_web_vocabulary" | "esrs_datapoint";
        recordCount?: number;
      }> = [];

      // Query GS1 Standards
      const gs1StandardsQuery = db.select().from(gs1Standards);
      const gs1StandardsData = await gs1StandardsQuery;
      
      for (const standard of gs1StandardsData) {
        // Apply filters
        if (input?.search) {
          const searchLower = input.search.toLowerCase();
          if (
            !standard.standardName.toLowerCase().includes(searchLower) &&
            !standard.standardCode.toLowerCase().includes(searchLower)
          ) {
            continue;
          }
        }

        // Infer organization from standard code (deterministic, no interpretation)
        let org = "GS1_Global";
        if (standard.standardCode.includes("NL") || standard.standardCode.includes("Benelux")) {
          org = "GS1_NL";
        } else if (standard.standardCode.includes("EU")) {
          org = "GS1_EU";
        }

        if (input?.organization && org !== input.organization) {
          continue;
        }

        // Infer jurisdiction from organization (deterministic mapping)
        let jurisdiction = "Global";
        if (org === "GS1_NL") jurisdiction = "Benelux";
        if (org === "GS1_EU") jurisdiction = "EU";

        if (input?.jurisdiction && jurisdiction !== input.jurisdiction) {
          continue;
        }

        // Filter by lifecycle status
        const lifecycleStatus = "ratified"; // Assume ratified if in database
        if (input?.lifecycleStatus && lifecycleStatus !== input.lifecycleStatus) {
          continue;
        }

        results.push({
          id: `gs1_standard_${standard.id}`,
          name: standard.standardName,
          owningOrganization: org,
          jurisdiction,
          sector: null, // GS1 standards are cross-sector
          lifecycleStatus: "ratified", // Assume ratified if in database
          sourceType: "gs1_standard",
        });
      }

      // Query GS1 Attributes (grouped by sector)
      if (!input?.organization || input.organization === "GS1_NL") {
        if (!input?.jurisdiction || input.jurisdiction === "Benelux" || input.jurisdiction === "NL") {
          const attributesQuery = db.select().from(gs1Attributes);
          const attributesData = await attributesQuery;

          // Group by sector
          const sectorCounts: Record<string, number> = {};
          for (const attr of attributesData) {
            if (!sectorCounts[attr.sector]) {
              sectorCounts[attr.sector] = 0;
            }
            sectorCounts[attr.sector]++;
          }

          for (const [sector, count] of Object.entries(sectorCounts)) {
            if (input?.sector && sector !== input.sector) {
              continue;
            }

            if (input?.search) {
              const searchLower = input.search.toLowerCase();
              if (!sector.toLowerCase().includes(searchLower) && !`gs1 data source ${sector}`.toLowerCase().includes(searchLower)) {
                continue;
              }
            }

            // Filter by lifecycle status
            const lifecycleStatus = "current";
            if (input?.lifecycleStatus && lifecycleStatus !== input.lifecycleStatus) {
              continue;
            }

            results.push({
              id: `gs1_attributes_${sector}`,
              name: `GS1 Data Source ${sector} Attributes`,
              owningOrganization: "GS1_NL",
              jurisdiction: "Benelux",
              sector,
              lifecycleStatus: "current",
              sourceType: "gs1_attributes",
              recordCount: count,
            });
          }
        }
      }

      // Query GS1 Web Vocabulary
      if (!input?.organization || input.organization === "GS1_Global") {
        if (!input?.jurisdiction || input.jurisdiction === "Global") {
          const vocabQuery = db.select().from(gs1WebVocabulary);
          const vocabData = await vocabQuery;

          if (vocabData.length > 0) {
            if (!input?.search || "gs1 web vocabulary".includes(input.search.toLowerCase())) {
              // Filter by lifecycle status
              const lifecycleStatus = "current";
              if (input?.lifecycleStatus && lifecycleStatus !== input.lifecycleStatus) {
                // Skip this entry
              } else {
                results.push({
                id: "gs1_web_vocabulary",
                name: "GS1 Web Vocabulary",
                owningOrganization: "GS1_Global",
                jurisdiction: "Global",
                sector: null,
                lifecycleStatus: "current",
                sourceType: "gs1_web_vocabulary",
                recordCount: vocabData.length,
                });
              }
            }
          }
        }
      }

      // Query ESRS Datapoints (grouped by standard)
      if (!input?.organization || input.organization === "EFRAG" || input.organization === "EU") {
        if (!input?.jurisdiction || input.jurisdiction === "EU") {
          const esrsQuery = db.select().from(esrsDatapoints);
          const esrsData = await esrsQuery;

          // Group by ESRS standard
          const esrsStandardCounts: Record<string, number> = {};
          for (const datapoint of esrsData) {
            const standard = datapoint.esrsStandard || "Unknown";
            if (!esrsStandardCounts[standard]) {
              esrsStandardCounts[standard] = 0;
            }
            esrsStandardCounts[standard]++;
          }

          for (const [standard, count] of Object.entries(esrsStandardCounts)) {
            if (input?.search) {
              const searchLower = input.search.toLowerCase();
              if (!standard.toLowerCase().includes(searchLower) && !"esrs".includes(searchLower)) {
                continue;
              }
            }

            // Filter by lifecycle status
            const lifecycleStatus = "ratified";
            if (input?.lifecycleStatus && lifecycleStatus !== input.lifecycleStatus) {
              continue;
            }

            results.push({
              id: `esrs_datapoints_${standard}`,
              name: `${standard} Datapoints`,
              owningOrganization: "EFRAG",
              jurisdiction: "EU",
              sector: null,
              lifecycleStatus: "ratified",
              sourceType: "esrs_datapoint",
              recordCount: count,
            });
          }
        }
      }

      return {
        standards: results,
        total: results.length,
      };
    }),

  /**
   * Get detail for a single standard
   * 
   * Returns:
   * - Authoritative source URL (if available)
   * - Dataset/version identifier (if available)
   * - Last verified date (if available)
   * - Read-only display
   */
  getDetail: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [sourceType, ...idParts] = input.id.split("_");
      
      if (sourceType === "gs1" && idParts[0] === "standard") {
        const standardId = parseInt(idParts[1]);
        const [standard] = await db
          .select()
          .from(gs1Standards)
          .where(eq(gs1Standards.id, standardId));

        if (!standard) {
          throw new Error(`Standard ${input.id} not found`);
        }

        return {
          id: input.id,
          name: standard.standardName,
          description: standard.description,
          owningOrganization: standard.standardCode.includes("NL") ? "GS1_NL" : standard.standardCode.includes("EU") ? "GS1_EU" : "GS1_Global",
          jurisdiction: standard.standardCode.includes("NL") ? "Benelux" : standard.standardCode.includes("EU") ? "EU" : "Global",
          sector: null,
          lifecycleStatus: "ratified",
          authoritativeSourceUrl: standard.referenceUrl,
          datasetIdentifier: standard.standardCode,
          lastVerifiedDate: null, // Not tracked in current schema
          category: standard.category,
          scope: standard.scope,
        };
      }

      if (sourceType === "gs1" && idParts[0] === "attributes") {
        const sector = idParts.slice(1).join("_");
        const attributes = await db
          .select()
          .from(gs1Attributes)
          .where(eq(gs1Attributes.sector, sector as any));

        return {
          id: input.id,
          name: `GS1 Data Source ${sector} Attributes`,
          description: `GS1 NL/Benelux data model attributes for ${sector} sector`,
          owningOrganization: "GS1_NL",
          jurisdiction: "Benelux",
          sector,
          lifecycleStatus: "current",
          authoritativeSourceUrl: `https://www.gs1.nl/en/knowledge-base/gs1-data-source/`,
          datasetIdentifier: `gs1nl.benelux.${sector.toLowerCase()}.v3.1.33`,
          lastVerifiedDate: "2025-12-13", // From dataset registry
          recordCount: attributes.length,
        };
      }

      if (input.id === "gs1_web_vocabulary") {
        const vocabData = await db.select().from(gs1WebVocabulary);

        return {
          id: input.id,
          name: "GS1 Web Vocabulary",
          description: "GS1 Web Vocabulary (voc.gs1.org) - semantic vocabulary for GS1 standards",
          owningOrganization: "GS1_Global",
          jurisdiction: "Global",
          sector: null,
          lifecycleStatus: "current",
          authoritativeSourceUrl: "https://www.gs1.org/voc/",
          datasetIdentifier: "gs1.webvoc.v1.17.0",
          lastVerifiedDate: "2025-12-13", // From dataset registry
          recordCount: vocabData.length,
        };
      }

      if (sourceType === "esrs" && idParts[0] === "datapoints") {
        const standard = idParts.slice(1).join("_");
        const datapoints = await db
          .select()
          .from(esrsDatapoints)
          .where(eq(esrsDatapoints.esrsStandard, standard as any));

        return {
          id: input.id,
          name: `${standard} Datapoints`,
          description: `ESRS ${standard} disclosure datapoints from EFRAG Implementation Guidance 3`,
          owningOrganization: "EFRAG",
          jurisdiction: "EU",
          sector: null,
          lifecycleStatus: "ratified",
          authoritativeSourceUrl: "https://www.efrag.org/lab6",
          datasetIdentifier: `esrs.datapoints.ig3`,
          lastVerifiedDate: "2025-12-13", // From dataset registry
          recordCount: datapoints.length,
        };
      }

      throw new Error(`Unknown standard ID format: ${input.id}`);
    }),
});
