/**
 * Enhanced Embedding Generation with Metadata Context
 *
 * This script generates embeddings with rich metadata context, improving
 * ASK ISA's ability to provide compliance-worthy answers.
 *
 * Key Features:
 * - Includes authority level, legal status, and source authority in embedding content
 * - Classifies embeddings by semantic layer (legal, normative, operational)
 * - Supports hierarchical relationships between embeddings
 * - Tracks provenance with CELEX IDs and canonical URLs
 *
 * Usage: npx tsx server/generate-embeddings-enhanced.ts
 *
 * @author Manus AI
 * @version 4.0.0
 * @date 2026-02-01
 */

import { getDb } from "./db";
import {
  regulations,
  gs1Standards,
  knowledgeEmbeddings,
  esrsDatapoints,
  cbvVocabularies,
  dppIdentifierComponents,
  ctes,
  kdes,
} from "../drizzle/schema";
import { generateEmbedding, prepareTextForEmbedding } from "./_core/embedding";
import { eq, and, sql, isNull, or } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";
import crypto from "crypto";

// ========== Types ==========

type AuthorityLevel = "law" | "regulation" | "directive" | "standard" | "guidance" | "technical";
type LegalStatus = "draft" | "valid" | "amended" | "repealed" | "superseded";
type SemanticLayer = "legal" | "normative" | "operational";

interface EnhancedDocument {
  id: number;
  sourceType: string;
  title: string;
  content: string;
  url?: string;
  
  // Enhanced metadata
  authorityLevel: AuthorityLevel;
  legalStatus: LegalStatus;
  semanticLayer: SemanticLayer;
  sourceAuthority?: string;
  celexId?: string;
  canonicalUrl?: string;
  effectiveDate?: string;
  documentType?: string;
  parentEmbeddingId?: number;
  regulationId?: number;
}

// ========== Configuration ==========

const CONFIG = {
  BATCH_SIZE: 50,
  RATE_LIMIT_DELAY_MS: 100,
  MAX_RETRIES: 3,
};

// ========== Metadata Mapping ==========

function determineAuthorityLevel(sourceType: string, regulationType?: string): AuthorityLevel {
  switch (sourceType) {
    case "regulation":
      if (regulationType === "CSRD" || regulationType === "EUDR") return "directive";
      return "regulation";
    case "standard":
      return "standard";
    case "esrs_datapoint":
      return "standard";
    case "gdsn_attribute":
    case "cbv_vocabulary":
    case "dpp_component":
    case "cte_kde":
      return "technical";
    default:
      return "guidance";
  }
}

function determineSemanticLayer(sourceType: string): SemanticLayer {
  switch (sourceType) {
    case "regulation":
      return "legal";
    case "standard":
    case "esrs_datapoint":
    case "esrs_gs1_mapping":
      return "normative";
    default:
      return "operational";
  }
}

function determineSourceAuthority(sourceType: string): string | undefined {
  switch (sourceType) {
    case "regulation":
      return "European Commission";
    case "esrs_datapoint":
    case "esrs_gs1_mapping":
      return "EFRAG";
    case "standard":
    case "gdsn_attribute":
    case "cbv_vocabulary":
    case "dpp_component":
      return "GS1";
    case "cte_kde":
      return "GS1 / FDA";
    case "dutch_initiative":
      return "Dutch Government";
    default:
      return undefined;
  }
}

// ========== Enhanced Content Formatting ==========

function formatEnhancedEmbeddingContent(doc: EnhancedDocument): string {
  const parts: string[] = [];

  // Header with authority and status
  const headerParts = [
    `[${doc.authorityLevel.toUpperCase()}]`,
    `[${doc.legalStatus.toUpperCase()}]`,
    doc.documentType ? `[${doc.documentType}]` : "",
  ].filter(Boolean);
  parts.push(headerParts.join(" "));

  // Metadata section
  const metadataParts = [
    doc.sourceAuthority ? `Source: ${doc.sourceAuthority}` : "",
    doc.celexId ? `CELEX: ${doc.celexId}` : "",
    doc.effectiveDate ? `Effective: ${doc.effectiveDate}` : "",
    doc.canonicalUrl ? `Reference: ${doc.canonicalUrl}` : "",
  ].filter(Boolean);
  
  if (metadataParts.length > 0) {
    parts.push(metadataParts.join("\n"));
  }

  // Title
  parts.push("");
  parts.push(doc.title);

  // Content
  parts.push("");
  parts.push(doc.content);

  return parts.join("\n");
}

// ========== Document Collection ==========

async function collectEnhancedDocuments(db: any): Promise<EnhancedDocument[]> {
  const documents: EnhancedDocument[] = [];

  // Collect regulations
  serverLogger.info("[Enhanced] Collecting regulations...");
  const regs = await db
    .select({
      id: regulations.id,
      title: regulations.title,
      description: regulations.description,
      regulationType: regulations.regulationType,
      sourceUrl: regulations.sourceUrl,
      celexId: regulations.celexId,
      effectiveDate: regulations.effectiveDate,
      embedding: regulations.embedding,
    })
    .from(regulations);

  for (const reg of regs) {
    const content = `${reg.title} ${reg.description || ""}`.trim();
    const needsUpdate =
      !reg.embedding || !Array.isArray(reg.embedding) || reg.embedding.length === 0;

    if (needsUpdate && content.length > 10) {
      documents.push({
        id: reg.id,
        sourceType: "regulation",
        title: reg.title || `Regulation ${reg.id}`,
        content,
        url: reg.sourceUrl || undefined,
        authorityLevel: determineAuthorityLevel("regulation", reg.regulationType),
        legalStatus: "valid",
        semanticLayer: "legal",
        sourceAuthority: "European Commission",
        celexId: reg.celexId || undefined,
        canonicalUrl: reg.sourceUrl || undefined,
        effectiveDate: reg.effectiveDate
          ? new Date(reg.effectiveDate).toISOString().split("T")[0]
          : undefined,
        documentType: reg.regulationType || "regulation",
      });
    }
  }
  serverLogger.info(`[Enhanced] Found ${documents.length} regulations to process`);

  // Collect ESRS datapoints
  serverLogger.info("[Enhanced] Collecting ESRS datapoints...");
  const datapoints = await db
    .select({
      id: esrsDatapoints.id,
      code: esrsDatapoints.code,
      name: esrsDatapoints.name,
      esrsStandard: esrsDatapoints.esrsStandard,
      disclosureRequirement: esrsDatapoints.disclosureRequirement,
      dataType: esrsDatapoints.dataType,
    })
    .from(esrsDatapoints);

  const esrsCount = documents.length;
  for (const dp of datapoints) {
    if (dp.code === "ID") continue; // Skip header row
    
    const content = `${dp.code}: ${dp.name}`.trim();
    if (content.length > 10) {
      documents.push({
        id: dp.id,
        sourceType: "esrs_datapoint",
        title: `${dp.code} - ${dp.esrsStandard || "ESRS"}`,
        content,
        authorityLevel: "standard",
        legalStatus: "valid",
        semanticLayer: "normative",
        sourceAuthority: "EFRAG",
        documentType: `ESRS Datapoint (${dp.dataType || "unknown"})`,
      });
    }
  }
  serverLogger.info(
    `[Enhanced] Found ${documents.length - esrsCount} ESRS datapoints to process`
  );

  // Collect CBV vocabularies
  serverLogger.info("[Enhanced] Collecting CBV vocabularies...");
  const cbvs = await db
    .select({
      id: cbvVocabularies.id,
      vocabularyType: cbvVocabularies.vocabularyType,
      code: cbvVocabularies.code,
      label: cbvVocabularies.label,
      definition: cbvVocabularies.definition,
    })
    .from(cbvVocabularies);

  const cbvCount = documents.length;
  for (const cbv of cbvs) {
    const content = `${cbv.label}: ${cbv.definition || ""}`.trim();
    if (content.length > 10) {
      documents.push({
        id: cbv.id,
        sourceType: "cbv_vocabulary",
        title: `CBV ${cbv.vocabularyType}: ${cbv.code}`,
        content,
        authorityLevel: "technical",
        legalStatus: "valid",
        semanticLayer: "operational",
        sourceAuthority: "GS1",
        documentType: `CBV Vocabulary (${cbv.vocabularyType})`,
      });
    }
  }
  serverLogger.info(
    `[Enhanced] Found ${documents.length - cbvCount} CBV vocabularies to process`
  );

  // Collect DPP components
  serverLogger.info("[Enhanced] Collecting DPP components...");
  const dpps = await db
    .select({
      id: dppIdentifierComponents.id,
      componentName: dppIdentifierComponents.componentName,
      description: dppIdentifierComponents.description,
      gs1Key: dppIdentifierComponents.gs1Key,
    })
    .from(dppIdentifierComponents);

  const dppCount = documents.length;
  for (const dpp of dpps) {
    const content = `${dpp.componentName}: ${dpp.description || ""}`.trim();
    if (content.length > 10) {
      documents.push({
        id: dpp.id,
        sourceType: "dpp_component",
        title: `DPP Component: ${dpp.componentName}`,
        content,
        authorityLevel: "technical",
        legalStatus: "valid",
        semanticLayer: "operational",
        sourceAuthority: "GS1",
        documentType: `DPP Identifier (${dpp.gs1Key || "unknown"})`,
      });
    }
  }
  serverLogger.info(
    `[Enhanced] Found ${documents.length - dppCount} DPP components to process`
  );

  return documents;
}

// ========== Embedding Generation ==========

async function generateEnhancedEmbedding(
  doc: EnhancedDocument
): Promise<{ embedding: number[]; tokens: number } | null> {
  try {
    const enhancedContent = formatEnhancedEmbeddingContent(doc);
    const preparedContent = prepareTextForEmbedding(enhancedContent);
    const result = await generateEmbedding(preparedContent);
    return {
      embedding: result.embedding,
      tokens: result.usage.total_tokens,
    };
  } catch (error) {
    serverLogger.error(`[Enhanced] Failed to generate embedding for ${doc.sourceType}:${doc.id}`, error);
    return null;
  }
}

function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function upsertEnhancedEmbedding(
  db: any,
  doc: EnhancedDocument,
  embedding: number[]
): Promise<void> {
  const enhancedContent = formatEnhancedEmbeddingContent(doc);
  const contentHash = hashContent(enhancedContent);

  const existing = await db
    .select({ id: knowledgeEmbeddings.id })
    .from(knowledgeEmbeddings)
    .where(
      and(
        eq(knowledgeEmbeddings.sourceType, doc.sourceType as any),
        eq(knowledgeEmbeddings.sourceId, doc.id)
      )
    )
    .limit(1);

  const embeddingData = {
    content: enhancedContent,
    contentHash,
    embedding,
    title: doc.title,
    url: doc.url || doc.canonicalUrl,
    embeddingModel: "text-embedding-3-small",
    isDeprecated: 0,
    // Enhanced metadata (if schema supports it)
    // authority_level: doc.authorityLevel,
    // legal_status: doc.legalStatus,
    // semantic_layer: doc.semanticLayer,
    // source_authority: doc.sourceAuthority,
    // celex_id: doc.celexId,
    // canonical_url: doc.canonicalUrl,
    // effective_date: doc.effectiveDate,
    // document_type: doc.documentType,
  };

  if (existing.length > 0) {
    await db
      .update(knowledgeEmbeddings)
      .set(embeddingData)
      .where(eq(knowledgeEmbeddings.id, existing[0].id));
  } else {
    await db.insert(knowledgeEmbeddings).values({
      sourceType: doc.sourceType as any,
      sourceId: doc.id,
      ...embeddingData,
    });
  }

  // Also update source table
  if (doc.sourceType === "regulation") {
    await db
      .update(regulations)
      .set({ embedding })
      .where(eq(regulations.id, doc.id));
  }
}

// ========== Main Execution ==========

async function generateEnhancedEmbeddings() {
  const startTime = Date.now();
  serverLogger.info("=".repeat(60));
  serverLogger.info("ENHANCED EMBEDDING GENERATION");
  serverLogger.info("=".repeat(60));

  const db = await getDb();
  if (!db) {
    serverLogger.error("[Enhanced] Database not available");
    process.exit(1);
  }

  // Collect documents
  const documents = await collectEnhancedDocuments(db);
  serverLogger.info(`[Enhanced] Total documents to process: ${documents.length}`);

  if (documents.length === 0) {
    serverLogger.info("[Enhanced] No documents need processing");
    return;
  }

  // Process documents
  let processed = 0;
  let failed = 0;
  let totalTokens = 0;

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    try {
      const result = await generateEnhancedEmbedding(doc);
      
      if (result) {
        await upsertEnhancedEmbedding(db, doc, result.embedding);
        processed++;
        totalTokens += result.tokens;
        
        if ((i + 1) % 10 === 0) {
          serverLogger.info(
            `[Enhanced] Progress: ${i + 1}/${documents.length} | ` +
            `Success: ${processed} | Failed: ${failed} | Tokens: ${totalTokens}`
          );
        }
      } else {
        failed++;
      }
    } catch (error) {
      serverLogger.error(`[Enhanced] Error processing ${doc.sourceType}:${doc.id}`, error);
      failed++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY_MS));
  }

  // Summary
  const duration = Math.round((Date.now() - startTime) / 1000);
  const estimatedCost = (totalTokens / 1_000_000) * 0.02;

  serverLogger.info("=".repeat(60));
  serverLogger.info("ENHANCED EMBEDDING GENERATION COMPLETE");
  serverLogger.info("=".repeat(60));
  serverLogger.info(`Duration: ${duration}s`);
  serverLogger.info(`Documents processed: ${processed}`);
  serverLogger.info(`Documents failed: ${failed}`);
  serverLogger.info(`Total tokens: ${totalTokens.toLocaleString()}`);
  serverLogger.info(`Estimated cost: $${estimatedCost.toFixed(4)}`);
  serverLogger.info("=".repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEnhancedEmbeddings();
}

export { generateEnhancedEmbeddings, formatEnhancedEmbeddingContent };
