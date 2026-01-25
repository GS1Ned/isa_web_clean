/**
 * GS1 Web Vocabulary JSON-LD Parser
 *
 * Parses GS1 Web Vocabulary ontology (https://ref.gs1.org/voc/data/gs1Voc.jsonld)
 * and ingests classes and properties into gs1_web_vocabulary table.
 *
 * Focus areas:
 * - DPP-relevant properties (packaging, sustainability, materials)
 * - ESRS-relevant properties (environmental, social, governance)
 * - EUDR-relevant properties (traceability, origin, certification)
 * - Regulatory compliance properties
 */

import * as fs from "fs";
import { getDb } from "./db";
import { gs1WebVocabulary } from "../drizzle/schema";
import { serverLogger } from "./_core/logger-wiring";


interface JsonLdNode {
  "@id": string;
  "@type"?: string | string[];
  "rdfs:label"?: string | { "@value": string; "@language": string };
  "rdfs:comment"?: string | { "@value": string; "@language": string };
  "rdfs:domain"?: { "@id": string } | { "@id": string }[];
  "rdfs:range"?: { "@id": string } | { "@id": string }[];
  "schema:domainIncludes"?: { "@id": string } | { "@id": string }[];
  "schema:rangeIncludes"?: { "@id": string } | { "@id": string }[];
  "sw:term_status"?: string;
  [key: string]: any;
}

interface ParsedVocabTerm {
  termUri: string;
  termType: "class" | "property";
  termName: string;
  label: string;
  description: string;
  domain?: string;
  range?: string;
  dppRelevant: boolean;
  esrsRelevant: boolean;
  eudrRelevant: boolean;
  packagingRelated: boolean;
  sustainabilityRelated: boolean;
  isDeprecated: boolean;
}

/**
 * Extract string value from JSON-LD multilingual object
 */
function extractString(value: any): string {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object") {
    if (value["@value"]) {
      return value["@value"];
    }
    if (Array.isArray(value)) {
      // Find English value
      const enValue = value.find((v: any) => v["@language"] === "en");
      if (enValue) {
        return enValue["@value"] || "";
      }
      // Fallback to first value
      return value[0]?.["@value"] || "";
    }
  }
  return "";
}

/**
 * Extract @id from JSON-LD reference
 */
function extractId(value: any): string {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object") {
    if (value["@id"]) {
      return value["@id"];
    }
    if (Array.isArray(value) && value.length > 0) {
      return value[0]["@id"] || "";
    }
  }
  return "";
}

/**
 * Determine if term is DPP-relevant based on name/description patterns
 */
function isDppRelevant(
  termName: string,
  label: string,
  description: string
): boolean {
  const dppPatterns = [
    "packaging",
    "material",
    "recyclable",
    "recycling",
    "circular",
    "product passport",
    "dpp",
    "composition",
    "component",
    "sustainability",
    "environmental",
    "carbon",
    "emissions",
    "origin",
    "traceability",
    "certification",
    "compliance",
  ];

  const searchText = `${termName} ${label} ${description}`.toLowerCase();
  return dppPatterns.some(pattern => searchText.includes(pattern));
}

/**
 * Determine if term is ESRS-relevant based on name/description patterns
 */
function isEsrsRelevant(
  termName: string,
  label: string,
  description: string
): boolean {
  const esrsPatterns = [
    "sustainability",
    "environmental",
    "social",
    "governance",
    "climate",
    "carbon",
    "emissions",
    "energy",
    "water",
    "waste",
    "biodiversity",
    "pollution",
    "resource",
    "circular economy",
    "human rights",
    "labor",
    "employee",
    "diversity",
    "ethics",
    "supply chain",
    "due diligence",
    "risk",
    "impact",
  ];

  const searchText = `${termName} ${label} ${description}`.toLowerCase();
  return esrsPatterns.some(pattern => searchText.includes(pattern));
}

/**
 * Determine if term is EUDR-relevant based on name/description patterns
 */
function isEudrRelevant(
  termName: string,
  label: string,
  description: string
): boolean {
  const eudrPatterns = [
    "origin",
    "traceability",
    "certification",
    "deforestation",
    "forest",
    "timber",
    "wood",
    "palm oil",
    "soy",
    "cattle",
    "cocoa",
    "coffee",
    "rubber",
    "geolocation",
    "supply chain",
    "due diligence",
    "regulatory",
  ];

  const searchText = `${termName} ${label} ${description}`.toLowerCase();
  return eudrPatterns.some(pattern => searchText.includes(pattern));
}

/**
 * Determine if term is packaging-related
 */
function isPackagingRelated(
  termName: string,
  label: string,
  description: string
): boolean {
  const packagingPatterns = [
    "packaging",
    "package",
    "container",
    "wrapper",
    "material",
    "recyclable",
    "recycling",
    "reusable",
    "disposal",
  ];

  const searchText = `${termName} ${label} ${description}`.toLowerCase();
  return packagingPatterns.some(pattern => searchText.includes(pattern));
}

/**
 * Determine if term is sustainability-related
 */
function isSustainabilityRelated(
  termName: string,
  label: string,
  description: string
): boolean {
  const sustainabilityPatterns = [
    "sustainability",
    "sustainable",
    "environmental",
    "eco",
    "carbon",
    "emissions",
    "renewable",
    "organic",
    "certification",
    "climate",
    "green",
    "circular",
  ];

  const searchText = `${termName} ${label} ${description}`.toLowerCase();
  return sustainabilityPatterns.some(pattern => searchText.includes(pattern));
}

/**
 * Parse GS1 Web Vocabulary JSON-LD file
 */
export async function parseGS1WebVocabulary(
  filePath: string
): Promise<ParsedVocabTerm[]> {
  serverLogger.info(`[GS1 Web Vocab Parser] Reading file: ${filePath}`);

  const fileContent = fs.readFileSync(filePath, "utf-8");
  // Remove BOM if present
  const cleanContent = fileContent.replace(/^\uFEFF/, "");
  const jsonld = JSON.parse(cleanContent);

  if (!jsonld["@graph"] || !Array.isArray(jsonld["@graph"])) {
    throw new Error("Invalid JSON-LD structure: @graph not found");
  }

  const terms: ParsedVocabTerm[] = [];

  for (const node of jsonld["@graph"] as JsonLdNode[]) {
    const id = node["@id"];

    // Skip blank nodes and non-GS1 terms
    if (!id || id.startsWith("_:") || !id.startsWith("gs1:")) {
      continue;
    }

    const types = Array.isArray(node["@type"])
      ? node["@type"]
      : [node["@type"]];

    // Determine term type
    let termType: "class" | "property" | null = null;
    if (types.includes("owl:Class") || types.includes("rdfs:Class")) {
      termType = "class";
    } else if (
      types.includes("owl:ObjectProperty") ||
      types.includes("owl:DatatypeProperty") ||
      types.includes("rdf:Property")
    ) {
      termType = "property";
    }

    if (!termType) {
      continue;
    }

    // Extract term name (remove gs1: prefix)
    const termName = id.replace("gs1:", "");

    // Extract label and description
    const label = extractString(node["rdfs:label"]);
    const description = extractString(node["rdfs:comment"]);

    // Extract domain and range
    const domain = extractId(
      node["rdfs:domain"] || node["schema:domainIncludes"]
    );
    const range = extractId(node["rdfs:range"] || node["schema:rangeIncludes"]);

    // Check if deprecated
    const isDeprecated = node["sw:term_status"] === "deprecated";

    // Determine relevance flags
    const dppRelevant = isDppRelevant(termName, label, description);
    const esrsRelevant = isEsrsRelevant(termName, label, description);
    const eudrRelevant = isEudrRelevant(termName, label, description);
    const packagingRelated = isPackagingRelated(termName, label, description);
    const sustainabilityRelated = isSustainabilityRelated(
      termName,
      label,
      description
    );

    terms.push({
      termUri: id,
      termType,
      termName,
      label: label || termName,
      description: description || "",
      domain: domain || undefined,
      range: range || undefined,
      dppRelevant,
      esrsRelevant,
      eudrRelevant,
      packagingRelated,
      sustainabilityRelated,
      isDeprecated,
    });
  }

  serverLogger.info(`[GS1 Web Vocab Parser] Parsed ${terms.length} terms`);
  serverLogger.info(
    `[GS1 Web Vocab Parser] DPP-relevant: ${terms.filter(t => t.dppRelevant).length}`
  );
  serverLogger.info(
    `[GS1 Web Vocab Parser] ESRS-relevant: ${terms.filter(t => t.esrsRelevant).length}`
  );
  serverLogger.info(
    `[GS1 Web Vocab Parser] EUDR-relevant: ${terms.filter(t => t.eudrRelevant).length}`
  );
  serverLogger.info(
    `[GS1 Web Vocab Parser] Packaging-related: ${terms.filter(t => t.packagingRelated).length}`
  );
  serverLogger.info(
    `[GS1 Web Vocab Parser] Sustainability-related: ${terms.filter(t => t.sustainabilityRelated).length}`
  );

  return terms;
}

/**
 * Ingest parsed terms into database
 */
export async function ingestWebVocabulary(
  terms: ParsedVocabTerm[]
): Promise<{ success: number; errors: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let success = 0;
  let errors = 0;

  for (const term of terms) {
    try {
      await db.insert(gs1WebVocabulary).values({
        termUri: term.termUri,
        termType: term.termType,
        termName: term.termName,
        label: term.label,
        description: term.description,
        domain: term.domain,
        range: term.range,
        dppRelevant: term.dppRelevant ? 1 : 0,
        esrsRelevant: term.esrsRelevant ? 1 : 0,
        eudrRelevant: term.eudrRelevant ? 1 : 0,
        packagingRelated: term.packagingRelated ? 1 : 0,
        sustainabilityRelated: term.sustainabilityRelated ? 1 : 0,
        isDeprecated: term.isDeprecated ? 1 : 0,
      });

      success++;

      if (success % 100 === 0) {
        serverLogger.info(`[GS1 Web Vocab Parser] Ingested ${success} terms...`);
      }
    } catch (error) {
      errors++;
    }
  }

  serverLogger.info(
    `[GS1 Web Vocab Parser] Ingestion complete: ${success} success, ${errors} errors`
  );

  return { success, errors };
}

/**
 * Main ingestion workflow
 */
export async function ingestGS1WebVocabulary(filePath: string): Promise<void> {
  const startTime = Date.now();

  try {
    serverLogger.info(
      "[GS1 Web Vocab Parser] Starting GS1 Web Vocabulary ingestion..."
    );
    serverLogger.info(`[GS1 Web Vocab Parser] File: ${filePath}`);

    // Step 1: Parse JSON-LD
    const terms = await parseGS1WebVocabulary(filePath);

    // Step 2: Ingest terms
    const result = await ingestWebVocabulary(terms);

    const duration = Math.round((Date.now() - startTime) / 1000);

    serverLogger.info(`[GS1 Web Vocab Parser] Completed in ${duration}s`);
    serverLogger.info(`[GS1 Web Vocab Parser] Summary:`);
    serverLogger.info(`  - Terms parsed: ${terms.length}`);
    serverLogger.info(`  - Terms ingested: ${result.success}`);
    serverLogger.info(`  - Errors: ${result.errors}`);
  } catch (error) {
    serverLogger.error(`[GS1 Web Vocab Parser] Ingestion failed:`, error);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath =
    process.argv[2] || "/home/ubuntu/isa_web/data/gs1_web_vocab/gs1Voc.jsonld";

  ingestGS1WebVocabulary(filePath)
    .then(() => {
      serverLogger.info("[GS1 Web Vocab Parser] Ingestion successful");
      process.exit(0);
    })
    .catch(error => {
      serverLogger.error("[GS1 Web Vocab Parser] Ingestion failed:", error);
      process.exit(1);
    });
}
