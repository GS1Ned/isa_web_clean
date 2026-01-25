/**
 * Multi-Sector Attribute-to-Regulation Mapper
 *
 * Creates intelligent mappings between GS1 attributes (DIY/Healthcare sectors)
 * and EU regulations based on attribute semantics and regulation requirements.
 */

import { getDb } from "./db";
import {
  gs1Attributes,
  regulations,
  attributeRegulationMappings,
} from "../drizzle/schema";
import { eq, and, or } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


interface MappingRule {
  regulationType: string;
  keywords: string[];
  relevanceScore: number;
  mappingReason: string;
}

// Mapping rules for DIY/Garden/Pet sector
const diyMappingRules: MappingRule[] = [
  {
    regulationType: "PPWR",
    keywords: [
      "packaging",
      "package",
      "material",
      "recyclable",
      "container",
      "waste",
      "disposal",
    ],
    relevanceScore: 0.95,
    mappingReason:
      "Packaging and Packaging Waste Regulation (PPWR) requires detailed packaging material and recyclability information",
  },
  {
    regulationType: "DPP",
    keywords: [
      "packaging",
      "material",
      "recyclable",
      "durability",
      "repair",
      "spare part",
      "warranty",
      "energy",
      "efficiency",
    ],
    relevanceScore: 0.9,
    mappingReason:
      "Digital Product Passport (DPP) requires product lifecycle, material composition, and circularity information",
  },
  {
    regulationType: "CSRD",
    keywords: [
      "sustainability",
      "sustainable",
      "carbon",
      "co2",
      "emission",
      "environmental",
      "energy",
      "certification",
      "organic",
    ],
    relevanceScore: 0.85,
    mappingReason:
      "Corporate Sustainability Reporting Directive (CSRD) requires environmental impact disclosure",
  },
  {
    regulationType: "ESRS",
    keywords: [
      "sustainability",
      "carbon",
      "emission",
      "environmental",
      "energy",
      "water",
      "waste",
    ],
    relevanceScore: 0.85,
    mappingReason:
      "European Sustainability Reporting Standards (ESRS) require detailed environmental metrics",
  },
  {
    regulationType: "REACH",
    keywords: [
      "chemical",
      "substance",
      "hazard",
      "safety",
      "toxic",
      "material composition",
    ],
    relevanceScore: 0.9,
    mappingReason:
      "REACH regulation requires chemical substance registration and safety information",
  },
];

// Mapping rules for Healthcare sector
const healthcareMappingRules: MappingRule[] = [
  {
    regulationType: "MDR",
    keywords: [
      "medical",
      "device",
      "sterile",
      "safety",
      "risk",
      "clinical",
      "performance",
      "intended use",
      "manufacturer",
    ],
    relevanceScore: 0.95,
    mappingReason:
      "Medical Device Regulation (MDR) requires comprehensive device identification and safety information",
  },
  {
    regulationType: "IVDR",
    keywords: [
      "diagnostic",
      "in vitro",
      "test",
      "specimen",
      "laboratory",
      "clinical performance",
    ],
    relevanceScore: 0.95,
    mappingReason:
      "In Vitro Diagnostic Regulation (IVDR) requires diagnostic device specifications",
  },
  {
    regulationType: "CSRD",
    keywords: ["sustainability", "environmental", "carbon", "emission"],
    relevanceScore: 0.7,
    mappingReason:
      "Corporate Sustainability Reporting Directive (CSRD) applies to healthcare manufacturers",
  },
];

/**
 * Check if attribute matches mapping rule
 */
function matchesRule(
  attributeName: string,
  attributeDescription: string,
  rule: MappingRule
): boolean {
  const searchText = `${attributeName} ${attributeDescription}`.toLowerCase();
  return rule.keywords.some(keyword =>
    searchText.includes(keyword.toLowerCase())
  );
}

/**
 * Create mappings for DIY/Garden/Pet sector
 */
async function createDIYMappings(): Promise<{
  created: number;
  skipped: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log("[Mapper] Creating DIY/Garden/Pet attribute mappings...");

  // Fetch DIY attributes
  const diyAttributes = await db
    .select()
    .from(gs1Attributes)
    .where(eq(gs1Attributes.sector, "diy_garden_pet"));

  console.log(
    `[Mapper] Found ${diyAttributes.length} DIY/Garden/Pet attributes`
  );

  // Fetch regulations
  const allRegulations = await db.select().from(regulations);

  let created = 0;
  let skipped = 0;

  for (const attr of diyAttributes) {
    const attributeName = attr.attributeName;
    const attributeDescription = attr.description || "";

    for (const rule of diyMappingRules) {
      if (matchesRule(attributeName, attributeDescription, rule)) {
        const regulation = allRegulations.find(
          r => r.regulationType === rule.regulationType
        );
        if (!regulation) {
          skipped++;
          continue;
        }

        try {
          await db.insert(attributeRegulationMappings).values({
            attributeId: attr.id,
            regulationId: regulation.id,
            mappingReason: rule.mappingReason,
            relevanceScore: rule.relevanceScore.toString(),
            verifiedByAdmin: 0,
          });
          created++;
        } catch (error) {
          // Skip duplicates
          skipped++;
        }
      }
    }

    if (created % 100 === 0 && created > 0) {
      console.log(`[Mapper] Created ${created} DIY mappings...`);
    }
  }

  console.log(
    `[Mapper] DIY mapping complete: ${created} created, ${skipped} skipped`
  );
  return { created, skipped };
}

/**
 * Create mappings for Healthcare sector
 */
async function createHealthcareMappings(): Promise<{
  created: number;
  skipped: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log("[Mapper] Creating Healthcare attribute mappings...");

  // Fetch Healthcare attributes
  const healthcareAttributes = await db
    .select()
    .from(gs1Attributes)
    .where(eq(gs1Attributes.sector, "healthcare"));

  console.log(
    `[Mapper] Found ${healthcareAttributes.length} Healthcare attributes`
  );

  // Fetch regulations
  const allRegulations = await db.select().from(regulations);

  let created = 0;
  let skipped = 0;

  for (const attr of healthcareAttributes) {
    const attributeName = attr.attributeName;
    const attributeDescription = attr.description || "";

    for (const rule of healthcareMappingRules) {
      if (matchesRule(attributeName, attributeDescription, rule)) {
        const regulation = allRegulations.find(
          r => r.regulationType === rule.regulationType
        );
        if (!regulation) {
          skipped++;
          continue;
        }

        try {
          await db.insert(attributeRegulationMappings).values({
            attributeId: attr.id,
            regulationId: regulation.id,
            mappingReason: rule.mappingReason,
            relevanceScore: rule.relevanceScore.toString(),
            verifiedByAdmin: 0,
          });
          created++;
        } catch (error) {
          // Skip duplicates
          skipped++;
        }
      }
    }

    if (created % 50 === 0 && created > 0) {
      console.log(`[Mapper] Created ${created} Healthcare mappings...`);
    }
  }

  console.log(
    `[Mapper] Healthcare mapping complete: ${created} created, ${skipped} skipped`
  );
  return { created, skipped };
}

/**
 * Main execution
 */
async function main() {
  console.log("[Mapper] Starting multi-sector attribute mapping...");
  const startTime = Date.now();

  try {
    // Create DIY mappings
    const diyResult = await createDIYMappings();

    // Create Healthcare mappings
    const healthcareResult = await createHealthcareMappings();

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`[Mapper] Completed in ${duration}s`);
    console.log(`[Mapper] Summary:`);
    console.log(`  - DIY mappings created: ${diyResult.created}`);
    console.log(`  - DIY mappings skipped: ${diyResult.skipped}`);
    console.log(`  - Healthcare mappings created: ${healthcareResult.created}`);
    console.log(`  - Healthcare mappings skipped: ${healthcareResult.skipped}`);
    console.log(
      `  - Total mappings created: ${diyResult.created + healthcareResult.created}`
    );
  } catch (error) {
    serverLogger.error("[Mapper] Mapping failed:", error);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log("[Mapper] Mapping successful");
      process.exit(0);
    })
    .catch(error => {
      serverLogger.error("[Mapper] Mapping failed:", error);
      process.exit(1);
    });
}
