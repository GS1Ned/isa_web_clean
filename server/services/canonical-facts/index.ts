// @ts-nocheck
/**
 * Canonical Facts Service
 *
 * Minimal canonical fact extraction and persistence with provenance.
 */

import { sql } from "drizzle-orm";
import { getDb } from "../../db";
import { serverLogger } from "../../_core/logger-wiring";

export interface CanonicalFactInput {
  sourceId: number;
  sourceChunkId: number;
  contentHash: string;
  title?: string | null;
  content: string;
}

export interface CanonicalFactRecord {
  id: number;
  sourceId: number;
  sourceChunkId: number;
  evidenceKey: string;
  factType: string;
  subject: string;
  predicate: string;
  objectValue: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

const STANDARD_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "CSRD", pattern: /\bCSRD\b/i },
  { label: "ESRS", pattern: /\bESRS\b/i },
  { label: "EUDR", pattern: /\bEUDR\b/i },
  { label: "EPCIS 2.0", pattern: /\bEPCIS\s*2\.0\b/i },
  { label: "GS1 Digital Link", pattern: /\bDigital\s+Link\b/i },
  { label: "GTIN", pattern: /\bGTIN\b/i },
  { label: "GLN", pattern: /\bGLN\b/i },
  { label: "SSCC", pattern: /\bSSCC\b/i },
];

const LIFECYCLE_PATTERNS: Array<{ status: string; pattern: RegExp }> = [
  { status: "active", pattern: /\bactive\b/i },
  { status: "deprecated", pattern: /\bdeprecated\b/i },
  { status: "superseded", pattern: /\bsuperseded\b/i },
  { status: "draft", pattern: /\bdraft\b/i },
  { status: "archived", pattern: /\barchived\b/i },
];

const RELATION_PATTERNS: Array<{ predicate: string; pattern: RegExp }> = [
  { predicate: "requires", pattern: /\brequires?\b/i },
  { predicate: "maps_to", pattern: /\bmaps?\s+to\b/i },
  { predicate: "supports", pattern: /\bsupports?\b/i },
  { predicate: "aligns_with", pattern: /\baligns?\s+with\b/i },
];

let canonicalFactsAvailable: boolean | null = null;

function buildEvidenceKey(sourceChunkId: number, contentHash: string): string {
  return `ke:${sourceChunkId}:${contentHash}`;
}

function normalizeTitle(title?: string | null): string {
  return typeof title === "string" && title.trim() ? title.trim() : "Unknown Source";
}

export function extractCanonicalFactsFromChunk(input: CanonicalFactInput): CanonicalFactRecord[] {
  const evidenceKey = buildEvidenceKey(input.sourceChunkId, input.contentHash);
  const sourceTitle = normalizeTitle(input.title);
  const facts: CanonicalFactRecord[] = [];
  let localFactId = 1;

  for (const item of STANDARD_PATTERNS) {
    if (!item.pattern.test(input.content) && !item.pattern.test(sourceTitle)) continue;
    facts.push({
      id: localFactId++,
      sourceId: input.sourceId,
      sourceChunkId: input.sourceChunkId,
      evidenceKey,
      factType: "standard_reference",
      subject: sourceTitle,
      predicate: "references_standard",
      objectValue: item.label,
      confidence: 0.9,
      metadata: { extractor: "pattern", pattern: item.pattern.source },
    });
  }

  for (const lifecycle of LIFECYCLE_PATTERNS) {
    if (!lifecycle.pattern.test(input.content)) continue;
    facts.push({
      id: localFactId++,
      sourceId: input.sourceId,
      sourceChunkId: input.sourceChunkId,
      evidenceKey,
      factType: "lifecycle_status",
      subject: sourceTitle,
      predicate: "has_lifecycle_status",
      objectValue: lifecycle.status,
      confidence: 0.75,
      metadata: { extractor: "pattern", pattern: lifecycle.pattern.source },
    });
  }

  const gtinMatches = input.content.match(/\bGTIN[-\s:]?(\d{8,14})\b/gi) || [];
  for (const match of gtinMatches.slice(0, 5)) {
    facts.push({
      id: localFactId++,
      sourceId: input.sourceId,
      sourceChunkId: input.sourceChunkId,
      evidenceKey,
      factType: "identifier",
      subject: sourceTitle,
      predicate: "contains_identifier",
      objectValue: match.replace(/\s+/g, " ").trim(),
      confidence: 0.95,
      metadata: { extractor: "regex", identifierType: "GTIN" },
    });
  }

  const standardsFound = facts
    .filter((fact) => fact.factType === "standard_reference")
    .map((fact) => fact.objectValue);

  if (standardsFound.length >= 2) {
    for (const relation of RELATION_PATTERNS) {
      if (!relation.pattern.test(input.content)) continue;
      facts.push({
        id: localFactId++,
        sourceId: input.sourceId,
        sourceChunkId: input.sourceChunkId,
        evidenceKey,
        factType: "standard_relation",
        subject: standardsFound[0],
        predicate: relation.predicate,
        objectValue: standardsFound[1],
        confidence: 0.7,
        metadata: { extractor: "pattern", relationPattern: relation.pattern.source },
      });
      break;
    }
  }

  return facts;
}

export async function persistCanonicalFacts(facts: CanonicalFactRecord[]): Promise<void> {
  if (facts.length === 0) return;

  const db = await getDb();
  if (!db) return;

  try {
    const insertedFacts: Array<{ id: number; sourceChunkId: number; factType: string; evidenceKey: string }> = [];

    for (const fact of facts) {
      const [result] = await db.execute(sql`
        INSERT INTO canonical_facts (
          source_id,
          source_chunk_id,
          evidence_key,
          fact_type,
          subject,
          predicate,
          object_value,
          confidence,
          metadata
        ) VALUES (
          ${fact.sourceId},
          ${fact.sourceChunkId},
          ${fact.evidenceKey},
          ${fact.factType},
          ${fact.subject},
          ${fact.predicate},
          ${fact.objectValue},
          ${fact.confidence},
          ${JSON.stringify(fact.metadata || {})}
        )
      `);

      const insertedId = (result as any).insertId;
      insertedFacts.push({
        id: insertedId,
        sourceChunkId: fact.sourceChunkId,
        factType: fact.factType,
        evidenceKey: fact.evidenceKey,
      });
    }

    const groupedByChunk = new Map<number, Array<{ id: number; evidenceKey: string }>>();
    for (const row of insertedFacts) {
      const existing = groupedByChunk.get(row.sourceChunkId) || [];
      existing.push({ id: row.id, evidenceKey: row.evidenceKey });
      groupedByChunk.set(row.sourceChunkId, existing);
    }

    for (const [sourceChunkId, rows] of groupedByChunk.entries()) {
      if (rows.length < 2) continue;
      const [fromFact, toFact] = rows;
      await db.execute(sql`
        INSERT INTO canonical_fact_relations (
          source_id,
          source_chunk_id,
          from_fact_id,
          to_fact_id,
          relation_type,
          evidence_key,
          confidence
        ) VALUES (
          ${facts.find(f => f.sourceChunkId === sourceChunkId)?.sourceId || 0},
          ${sourceChunkId},
          ${fromFact.id},
          ${toFact.id},
          ${"co_occurs"},
          ${fromFact.evidenceKey},
          ${0.6}
        )
      `);
    }
  } catch (error) {
    serverLogger.error("[CanonicalFacts] Persist failed:", error);
  }
}

export async function findCanonicalFactsForQuery(query: string, limit: number = 8): Promise<CanonicalFactRecord[]> {
  const db = await getDb();
  if (!db) return [];

  if (canonicalFactsAvailable === null) {
    try {
      const result = await db.execute(sql`
        SELECT to_regclass('public.canonical_facts') as table_name
      `);
      const rows = Array.isArray(result)
        ? (result as Record<string, unknown>[])
        : (((result as { rows?: Record<string, unknown>[] })?.rows || []) as Record<string, unknown>[]);
      canonicalFactsAvailable = Boolean(rows[0]?.table_name);
    } catch {
      canonicalFactsAvailable = false;
    }
  }

  if (!canonicalFactsAvailable) return [];

  const terms = Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length >= 3)
        .slice(0, 10)
    )
  );

  try {
    const result = await db.execute(sql`
      SELECT
        id,
        source_id as sourceId,
        source_chunk_id as sourceChunkId,
        evidence_key as evidenceKey,
        fact_type as factType,
        subject,
        predicate,
        object_value as objectValue,
        confidence,
        metadata
      FROM canonical_facts
      ORDER BY created_at DESC
      LIMIT 500
    `);

    const list = Array.isArray(result)
      ? (result as any[])
      : (((result as { rows?: any[] })?.rows || []) as any[]);
    const scored = list
      .map((row) => {
        const haystack = `${row.subject || ""} ${row.predicate || ""} ${row.objectValue || ""}`.toLowerCase();
        const termHits = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
        return {
          ...row,
          _score: termHits + Number(row.confidence || 0),
        };
      })
      .filter((row) => row._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score, ...row }) => row as CanonicalFactRecord);

    return scored;
  } catch (error) {
    serverLogger.error("[CanonicalFacts] Query failed:", error);
    return [];
  }
}
