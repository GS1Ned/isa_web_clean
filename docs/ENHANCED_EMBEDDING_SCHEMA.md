# Enhanced Embedding Schema Design

**Date:** 2026-02-01  
**Author:** Manus AI  
**Version:** 1.0.0

---

## 1. Problem Statement

The current `knowledge_embeddings` table stores embeddings with minimal metadata:

```sql
-- Current schema (simplified)
knowledge_embeddings (
  id, sourceType, sourceId, content, contentHash, 
  embedding, embeddingModel, title, url, isDeprecated
)
```

**Missing:**
- Authority level (law vs. standard vs. guidance)
- Legal status (valid, draft, repealed)
- Effective dates
- Source authority (EU Commission, GS1, EFRAG)
- Semantic layer classification
- Hierarchical relationships

This limits ASK ISA's ability to provide **compliance-worthy** answers.

---

## 2. Enhanced Schema Design

### 2.1 New Columns for `knowledge_embeddings`

```sql
ALTER TABLE knowledge_embeddings ADD COLUMN (
  -- Authority & Governance
  authority_level ENUM('law', 'regulation', 'directive', 'standard', 'guidance', 'technical') 
    DEFAULT 'guidance',
  legal_status ENUM('draft', 'valid', 'amended', 'repealed', 'superseded') 
    DEFAULT 'valid',
  
  -- Temporal Context
  effective_date DATE NULL,
  expiry_date DATE NULL,
  version VARCHAR(50) NULL,
  
  -- Provenance
  source_authority VARCHAR(255) NULL,  -- "European Commission", "GS1 Global", "EFRAG"
  celex_id VARCHAR(50) NULL,           -- For EU legislation (e.g., "32022L2464")
  canonical_url VARCHAR(500) NULL,     -- Permanent URL to authoritative source
  
  -- Semantic Classification
  semantic_layer ENUM('legal', 'normative', 'operational') DEFAULT 'normative',
  document_type VARCHAR(100) NULL,     -- "regulation", "datapoint", "attribute", "vocabulary"
  
  -- Relationships
  parent_embedding_id INT NULL,        -- Hierarchical relationship
  regulation_id INT NULL,              -- Link to regulations table
  
  -- Quality & Confidence
  confidence_score DECIMAL(3,2) DEFAULT 1.00,  -- 0.00 to 1.00
  last_verified_at TIMESTAMP NULL,
  
  -- Indexing
  INDEX idx_authority_level (authority_level),
  INDEX idx_legal_status (legal_status),
  INDEX idx_semantic_layer (semantic_layer),
  INDEX idx_source_authority (source_authority),
  INDEX idx_effective_date (effective_date),
  FOREIGN KEY (parent_embedding_id) REFERENCES knowledge_embeddings(id),
  FOREIGN KEY (regulation_id) REFERENCES regulations(id)
);
```

### 2.2 Source Type Expansion

Expand `sourceType` ENUM to include all ISA data sources:

```sql
ALTER TABLE knowledge_embeddings 
MODIFY COLUMN sourceType ENUM(
  'regulation',      -- EU regulations (CSRD, EUDR, etc.)
  'standard',        -- GS1 standards
  'esrs_datapoint',  -- ESRS datapoints (granular)
  'gdsn_attribute',  -- GDSN class attributes
  'cbv_vocabulary',  -- CBV vocabularies
  'dpp_component',   -- DPP identifier components
  'epcis_event',     -- EPCIS event types
  'cte_kde',         -- CTEs and KDEs
  'news',            -- News articles
  'guidance'         -- Guidance documents
) NOT NULL;
```

---

## 3. Semantic Layer Classification

### 3.1 Three-Layer Model

| Layer | Description | Sources | Authority |
|-------|-------------|---------|-----------|
| **Legal** | Legally binding requirements | EU Regulations, Directives | Highest |
| **Normative** | Interpretive standards | ESRS, EFRAG guidance | High |
| **Operational** | Implementation guidance | GS1, GDSN, EPCIS | Medium |

### 3.2 Mapping Rules

```typescript
function determineSemanticLayer(sourceType: string): SemanticLayer {
  switch (sourceType) {
    case 'regulation':
      return 'legal';
    case 'esrs_datapoint':
    case 'standard':
      return 'normative';
    case 'gdsn_attribute':
    case 'cbv_vocabulary':
    case 'dpp_component':
    case 'epcis_event':
    case 'cte_kde':
      return 'operational';
    default:
      return 'normative';
  }
}
```

---

## 4. Enhanced Embedding Content Format

### 4.1 Current Format (Weak)

```
CSRD - Corporate Sustainability Reporting Directive
Directive (EU) 2022/2464 amending Regulation (EU) No 537/2014...
```

### 4.2 Enhanced Format (Strong)

```
[LEGAL] [VALID] [EU Directive]
Source: European Commission
CELEX: 32022L2464
Effective: 2024-01-01
Reference: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464

CSRD - Corporate Sustainability Reporting Directive

Directive (EU) 2022/2464 amending Regulation (EU) No 537/2014, 
Directive 2004/109/EC, Directive 2006/43/EC and Directive 2013/34/EU, 
as regards corporate sustainability reporting.

Key Requirements:
- Mandatory sustainability reporting for large companies
- Double materiality assessment
- Assurance requirements
- Digital tagging (XBRL)
```

### 4.3 Implementation

```typescript
function prepareEnhancedEmbeddingContent(doc: EnhancedDocument): string {
  const header = [
    `[${doc.authorityLevel.toUpperCase()}]`,
    `[${doc.legalStatus.toUpperCase()}]`,
    doc.documentType ? `[${doc.documentType}]` : '',
  ].filter(Boolean).join(' ');

  const metadata = [
    doc.sourceAuthority ? `Source: ${doc.sourceAuthority}` : '',
    doc.celexId ? `CELEX: ${doc.celexId}` : '',
    doc.effectiveDate ? `Effective: ${doc.effectiveDate}` : '',
    doc.canonicalUrl ? `Reference: ${doc.canonicalUrl}` : '',
  ].filter(Boolean).join('\n');

  return `${header}\n${metadata}\n\n${doc.title}\n\n${doc.content}`;
}
```

---

## 5. ASK ISA Query Enhancement

### 5.1 Filtered Retrieval

With enhanced metadata, ASK ISA can filter results:

```typescript
async function retrieveRelevantKnowledge(
  query: string,
  filters: {
    authorityLevel?: AuthorityLevel[];
    legalStatus?: LegalStatus[];
    semanticLayer?: SemanticLayer[];
    effectiveAfter?: Date;
  }
): Promise<KnowledgeEmbedding[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  // Build WHERE clause from filters
  const conditions = [];
  if (filters.authorityLevel?.length) {
    conditions.push(inArray(knowledgeEmbeddings.authorityLevel, filters.authorityLevel));
  }
  if (filters.legalStatus?.length) {
    conditions.push(inArray(knowledgeEmbeddings.legalStatus, filters.legalStatus));
  }
  if (filters.semanticLayer?.length) {
    conditions.push(inArray(knowledgeEmbeddings.semanticLayer, filters.semanticLayer));
  }
  if (filters.effectiveAfter) {
    conditions.push(gte(knowledgeEmbeddings.effectiveDate, filters.effectiveAfter));
  }
  
  // Vector similarity search with filters
  return db.select()
    .from(knowledgeEmbeddings)
    .where(and(...conditions))
    .orderBy(cosineSimilarity(knowledgeEmbeddings.embedding, queryEmbedding))
    .limit(10);
}
```

### 5.2 Hierarchical Reasoning

```typescript
async function getFullContext(embeddingId: number): Promise<KnowledgeContext> {
  const embedding = await db.select()
    .from(knowledgeEmbeddings)
    .where(eq(knowledgeEmbeddings.id, embeddingId))
    .limit(1);
  
  // Get parent chain (e.g., datapoint → disclosure requirement → standard → regulation)
  const parentChain = await getParentChain(embedding.parentEmbeddingId);
  
  // Get related regulation
  const regulation = embedding.regulationId 
    ? await db.select().from(regulations).where(eq(regulations.id, embedding.regulationId))
    : null;
  
  return {
    embedding,
    parentChain,
    regulation,
    authorityPath: buildAuthorityPath(parentChain, regulation),
  };
}
```

---

## 6. Migration Strategy

### Phase 1: Schema Migration (Low Risk)

1. Add new columns with defaults
2. No data loss, backward compatible
3. Existing queries continue to work

### Phase 2: Data Enrichment (Medium Effort)

1. Update regulations with authority metadata
2. Link ESRS datapoints to parent regulations
3. Classify existing embeddings by semantic layer

### Phase 3: Embedding Regeneration (High Value)

1. Regenerate embeddings with enhanced content format
2. Include metadata in embedding text
3. Verify improved retrieval quality

---

## 7. Expected Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Query precision | ~70% | ~90% | +20% |
| Source traceability | Partial | Full | Complete |
| Compliance confidence | Low | High | Significant |
| Hierarchical reasoning | None | Full | New capability |

---

## 8. Implementation Checklist

- [ ] Create database migration script
- [ ] Update Drizzle schema
- [ ] Implement enhanced content formatter
- [ ] Update embedding generation script
- [ ] Add metadata enrichment for existing data
- [ ] Update ASK ISA retrieval logic
- [ ] Test with sample queries
- [ ] Document API changes

---

**End of Document**
