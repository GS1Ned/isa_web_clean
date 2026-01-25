/**
 * LLM-Based Semantic Matching
 *
 * Uses LLM to score document relevance instead of vector embeddings.
 * This approach works with Manus Forge API's chat completions endpoint.
 */

import crypto from "crypto";
import { invokeLLM } from "./_core/llm";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Generate content hash for deduplication
 */
export function generateContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Score relevance of a document to a query using LLM
 * Returns a score from 0-10 where 10 is most relevant
 */
export async function scoreRelevance(
  query: string,
  document: string
): Promise<number> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a relevance scoring system. Given a user query and a document, score how relevant the document is to answering the query on a scale of 0-10.

0 = Completely irrelevant
5 = Somewhat related but not directly helpful
10 = Highly relevant and directly answers the query

Respond with ONLY a single number between 0 and 10.`,
        },
        {
          role: "user",
          content: `Query: ${query}\n\nDocument: ${document.slice(0, 1000)}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const scoreText =
      (typeof content === "string" ? content.trim() : "0") || "0";
    const score = parseFloat(scoreText);

    return isNaN(score) ? 0 : Math.max(0, Math.min(10, score));
  } catch (error) {
    serverLogger.error("[Relevance] Failed to score relevance:", error);
    return 0;
  }
}

/**
 * Batch score multiple documents against a query
 * Returns documents with relevance scores
 */
export async function batchScoreRelevance(
  query: string,
  documents: Array<{ id: number; content: string; [key: string]: any }>
): Promise<
  Array<{ id: number; content: string; relevance: number; [key: string]: any }>
> {
  const scoredDocuments = await Promise.all(
    documents.map(async doc => {
      const relevance = await scoreRelevance(query, doc.content);
      return { ...doc, relevance };
    })
  );

  // Sort by relevance (descending)
  return scoredDocuments.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Prepare content for storage based on source type
 */
export function prepareContentForEmbedding(
  sourceType: "regulation" | "standard" | "esrs_datapoint" | "dutch_initiative" | "esrs_gs1_mapping",
  source: any
): string {
  switch (sourceType) {
    case "regulation":
      return `${source.name || source.title}\n\n${source.description || ""}\n\nScope: ${source.scope || ""}\n\nKey Requirements: ${source.keyRequirements || ""}`.trim();

    case "standard":
      return `${source.standardName}\n\nCategory: ${source.category || ""}\n\nDescription: ${source.description || ""}\n\nUse Cases: ${source.useCases || ""}`.trim();

    case "esrs_datapoint":
      return `${source.datapointCode}: ${source.datapointName}\n\nDescription: ${source.description || ""}\n\nData Type: ${source.dataType || ""}\n\nMandatory: ${source.isMandatory ? "Yes" : "No"}`.trim();

    case "dutch_initiative":
      return `${source.name}\n\nSector: ${source.sector || ""}\n\nDescription: ${source.description || ""}\n\nScope: ${source.scope || ""}\n\nKey Targets: ${source.keyTargets || ""}`.trim();

    case "esrs_gs1_mapping":
      return `ESRS ${source.esrsStandard} → GS1 ${source.gs1Standard}\n\nESRS Requirement: ${source.esrsRequirement}\n\nGS1 Attribute: ${source.gs1Attribute}\n\nMapping Type: ${source.mappingType || ""}\n\nConfidence: ${source.confidence || ""}\n\nRationale: ${source.rationale || ""}`.trim();

    default:
      return JSON.stringify(source);
  }
}

/**
 * Generate human-readable title for search results
 */
export function generateEmbeddingTitle(
  sourceType: "regulation" | "standard" | "esrs_datapoint" | "dutch_initiative" | "esrs_gs1_mapping",
  source: any
): string {
  switch (sourceType) {
    case "regulation":
      return source.name || source.title || `Regulation ${source.id}`;

    case "standard":
      return source.standardName || `Standard ${source.id}`;

    case "esrs_datapoint":
      return (
        `${source.datapointCode}: ${source.datapointName}` ||
        `Datapoint ${source.id}`
      );

    case "dutch_initiative":
      return source.name || `Initiative ${source.id}`;

    case "esrs_gs1_mapping":
      return `${source.esrsStandard} → ${source.gs1Standard}: ${source.gs1Attribute}` || `Mapping ${source.id}`;

    default:
      return `Source ${source.id}`;
  }
}

/**
 * Generate URL for source detail page
 */
export function generateEmbeddingUrl(
  sourceType: "regulation" | "standard" | "esrs_datapoint" | "dutch_initiative" | "esrs_gs1_mapping",
  sourceId: number
): string {
  switch (sourceType) {
    case "regulation":
      return `/hub/regulations/${sourceId}`;

    case "standard":
      return `/hub/standards-mapping`; // Standards don't have individual pages yet

    case "esrs_datapoint":
      return `/hub/esrs-datapoints`;

    case "dutch_initiative":
      return `/hub/dutch-initiatives/${sourceId}`;

    case "esrs_gs1_mapping":
      return `/hub/esrs-gs1-mappings`;

    default:
      return `/hub`;
  }
}

/**
 * Batch process documents for storage
 * Generates content hashes and prepares for database insertion
 */
export async function prepareDocumentsForStorage(
  sourceType: "regulation" | "standard" | "esrs_datapoint" | "dutch_initiative",
  sources: any[]
): Promise<
  Array<{
    sourceType: string;
    sourceId: number;
    content: string;
    contentHash: string;
    title: string;
    url: string;
  }>
> {
  return sources.map(source => {
    const content = prepareContentForEmbedding(sourceType, source);
    const contentHash = generateContentHash(content);
    const title = generateEmbeddingTitle(sourceType, source);
    const url = generateEmbeddingUrl(sourceType, source.id);

    return {
      sourceType,
      sourceId: source.id,
      content,
      contentHash,
      title,
      url,
    };
  });
}
