/**
 * Create Intelligent Attribute-to-Regulation Mappings
 *
 * Maps GS1 Benelux attributes to relevant EU regulations based on:
 * - Sustainability flags
 * - Packaging flags
 * - Attribute name patterns
 * - ESRS datapoint relevance
 */

import { getDb } from "./db";
import {
  gs1Attributes,
  regulations,
  attributeRegulationMappings,
} from "../drizzle/schema";
import { eq, like, or } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


interface MappingRule {
  regulationType: string;
  attributePattern?: string;
  packagingRelated?: boolean;
  sustainabilityRelated?: boolean;
  mappingReason: string;
  relevanceScore: number;
}

const MAPPING_RULES: MappingRule[] = [
  // PPWR (Packaging and Packaging Waste Regulation)
  {
    regulationType: "PPWR",
    packagingRelated: true,
    mappingReason:
      "Packaging-related attribute relevant for PPWR compliance and circular economy reporting",
    relevanceScore: 0.95,
  },

  // DPP (Digital Product Passport)
  {
    regulationType: "DPP",
    packagingRelated: true,
    mappingReason:
      "Packaging attribute required for Digital Product Passport material composition disclosure",
    relevanceScore: 0.9,
  },
  {
    regulationType: "DPP",
    sustainabilityRelated: true,
    mappingReason:
      "Sustainability attribute relevant for Digital Product Passport environmental impact disclosure",
    relevanceScore: 0.85,
  },

  // CSRD/ESRS (Corporate Sustainability Reporting Directive)
  {
    regulationType: "CSRD",
    sustainabilityRelated: true,
    mappingReason:
      "Sustainability attribute relevant for CSRD/ESRS environmental and social reporting",
    relevanceScore: 0.9,
  },
  {
    regulationType: "ESRS",
    sustainabilityRelated: true,
    mappingReason:
      "Sustainability attribute maps to ESRS E1-E5 environmental datapoints",
    relevanceScore: 0.92,
  },

  // EUDR (EU Deforestation Regulation)
  {
    regulationType: "EUDR",
    attributePattern: "%origin%",
    mappingReason:
      "Origin/traceability attribute required for EUDR due diligence and deforestation-free supply chain proof",
    relevanceScore: 0.95,
  },
  {
    regulationType: "EUDR",
    attributePattern: "%certification%",
    mappingReason:
      "Certification attribute relevant for EUDR compliance verification (FSC, PEFC, etc.)",
    relevanceScore: 0.88,
  },
  {
    regulationType: "EUDR",
    attributePattern: "%traceability%",
    mappingReason:
      "Traceability attribute essential for EUDR supply chain mapping and geolocation requirements",
    relevanceScore: 0.93,
  },

  // EU Taxonomy
  {
    regulationType: "EU_TAXONOMY",
    attributePattern: "%organic%",
    mappingReason:
      "Organic certification attribute relevant for EU Taxonomy sustainable agriculture criteria",
    relevanceScore: 0.87,
  },
  {
    regulationType: "EU_TAXONOMY",
    attributePattern: "%carbon%",
    mappingReason:
      "Carbon/emissions attribute relevant for EU Taxonomy climate change mitigation criteria",
    relevanceScore: 0.9,
  },
  {
    regulationType: "EU_TAXONOMY",
    attributePattern: "%renewable%",
    mappingReason:
      "Renewable materials attribute relevant for EU Taxonomy circular economy criteria",
    relevanceScore: 0.85,
  },
];

/**
 * Create attribute-to-regulation mappings based on rules
 */
export async function createAttributeMappings(): Promise<{
  success: number;
  skipped: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  console.log("[Attribute Mapper] Starting intelligent mapping creation...");

  let success = 0;
  let skipped = 0;

  for (const rule of MAPPING_RULES) {
    console.log(
      `\\n[Attribute Mapper] Processing rule: ${rule.regulationType} - ${rule.mappingReason.substring(0, 60)}...`
    );

    // Find matching regulation
    const [regulation] = await db
      .select()
      .from(regulations)
      .where(eq(regulations.regulationType, rule.regulationType as any))
      .limit(1);

    if (!regulation) {
      console.log(
        `[Attribute Mapper] ⚠️  Regulation not found: ${rule.regulationType}`
      );
      continue;
    }

    // Find matching attributes
    let matchingAttributes: (typeof gs1Attributes.$inferSelect)[] = [];

    if (rule.attributePattern) {
      // Pattern-based matching
      matchingAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(
          or(
            like(gs1Attributes.attributeName, rule.attributePattern),
            like(gs1Attributes.description, rule.attributePattern)
          )
        );
    } else {
      // Flag-based matching
      const conditions = [];
      if (rule.packagingRelated) {
        conditions.push(eq(gs1Attributes.packagingRelated, 1));
      }
      if (rule.sustainabilityRelated) {
        conditions.push(eq(gs1Attributes.sustainabilityRelated, 1));
      }

      if (conditions.length > 0) {
        matchingAttributes = await db
          .select()
          .from(gs1Attributes)
          .where(or(...conditions));
      } else {
        matchingAttributes = [];
      }
    }

    console.log(
      `[Attribute Mapper] Found ${matchingAttributes.length} matching attributes`
    );

    // Create mappings
    for (const attribute of matchingAttributes) {
      try {
        await db.insert(attributeRegulationMappings).values({
          attributeId: attribute.id,
          regulationId: regulation.id,
          mappingReason: rule.mappingReason,
          relevanceScore: String(rule.relevanceScore) as any,
          verifiedByAdmin: 0,
        });

        success++;

        if (success % 20 === 0) {
          console.log(`[Attribute Mapper] Created ${success} mappings...`);
        }
      } catch (error) {
        // Skip duplicates
        skipped++;
      }
    }
  }

  console.log(`\\n[Attribute Mapper] Mapping creation complete:`);
  console.log(`  - Mappings created: ${success}`);
  console.log(`  - Skipped (duplicates): ${skipped}`);

  return { success, skipped };
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAttributeMappings()
    .then(result => {
      console.log("[Attribute Mapper] Success!");
      console.log(
        `Created ${result.success} mappings, skipped ${result.skipped} duplicates`
      );
      process.exit(0);
    })
    .catch(error => {
      serverLogger.error("[Attribute Mapper] Failed:", error);
      process.exit(1);
    });
}
