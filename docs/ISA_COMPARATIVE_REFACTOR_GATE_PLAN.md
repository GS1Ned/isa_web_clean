# ISA Comparative Refactor & Gate Plan

**Date**: February 1, 2026  
**Author**: Manus AI (Principal Systems Architect)  
**Status**: Evidence-Based Analysis

---

## Hard Constraints (Non-Negotiable)

- **TiDB is the core database and remains unchanged** (schema evolution allowed; replacement is not)
- The **current ISA stack** (Next.js + tRPC, TiDB, existing ingestion & embedding pipelines) is the **baseline reality**
- No greenfield redesigns. All proposals must be **incremental refactors**
- Claims are **evidence-bound** to provided documents. Missing evidence is marked `UNKNOWN`

---

## Task 1: Capability-by-Capability Comparison

| Capability | Current ISA (Evidence) | Ultimate ISA (Target) | Delta Type | Stack Tension / Conflict | Architectural Risk if Unresolved |
|------------|------------------------|----------------------|------------|--------------------------|----------------------------------|
| **Ingestion Pipeline** | **Partial** — "ISA currently uses **manual data ingestion** for all datasets" (INGESTION.md:4). Automation status: "❌ Not automated" for EU Regulations, GS1 Standards, ESRS Datapoints, Dutch Initiatives. Only Knowledge Embeddings have "✅ UI-based" generation. | **Corpus Governance Service** with versioning, authority ranking, metadata catalog. Automated ingestion with "robust, observable pipeline" (Ultimate Architecture 4.1). | **Incomplete** | Manual ingestion cannot support "version-controlled" and "auditable" corpus claims. No `sources` table exists in current schema for tracking document provenance. | **Critical** — Without automated, versioned ingestion, the "Corpus Coverage > 95%" target is unachievable. Manual processes introduce human error and cannot scale. |
| **Corpus Governance** | **Missing** — No evidence of a `sources` table, authority ranking, or version control in current schema. INGESTION.md shows no metadata catalog. | **Corpus Catalog** with `source_id`, `name`, `url`, `version`, `publication_date`, `ingestion_date`, `status`, `authority_level` (Quality Plan 0.1). | **Missing** | TiDB schema requires new tables. No conflict with stack, but requires schema migration. | **Critical** — Foundation of trust. Without this, all quality metrics are meaningless (per Quality Plan). |
| **Authority Model** | **Implemented** — `authority-model.ts` exists with `classifyAuthority()` and `AuthorityLevel` types. Used in `hybrid-search.ts`. | **Hard Authority Ranking** with strict filtering and conflict resolution policy (Quality Plan 0.2). | **Incomplete** | Current model classifies but does not **enforce** authority in retrieval. No conflict resolution policy implemented. | **Medium** — Answers may cite lower-authority sources when higher-authority sources exist. |
| **RAG / Ask ISA Reasoning** | **Implemented** — Hybrid search (vector + BM25) with RRF fusion (hybrid-search.ts). Query classification, caching, claim verification exist (ask-isa.ts). | **Cite-then-Write Pipeline**: Evidence Selection → Claim Extraction → Answer Generation. Deterministic passage pointers. (Quality Plan 1.1, 1.3). | **Incomplete** | Current pipeline generates answer first, then verifies claims. Ultimate requires architectural inversion: extract claims from evidence *before* generation. | **High** — Current architecture cannot guarantee "every claim is verifiably supported" without significant refactor. |
| **Abstention Policy** | **Missing** — No evidence of "I cannot answer" capability. `ask-isa-guardrails.ts` has `classifyQuery()` for out-of-scope detection, but no abstention on insufficient evidence. | **Hard Abstain Policy**: "If evidence is insufficient or contradictory, the system **must abstain**" (Quality Plan 1.2). | **Missing** | Requires new logic in `ask-isa.ts` to analyze evidence sufficiency before generation. | **High** — Without abstention, system will hallucinate on edge cases, violating compliance-grade requirements. |
| **News Hub** | **Implemented** — "Automated news aggregation from EU, GS1, and Dutch/Benelux sources. AI-powered enrichment (regulation tagging, GS1 impact analysis, sector classification)" (ROADMAP.md:64-66). | No explicit News Hub changes in Ultimate Architecture. Implicit requirement: news items must be linked to entities in Knowledge Graph. | **Incomplete** | News content is enriched but not formally linked to a Knowledge Graph. No evidence of entity linking in current implementation. | **Medium** — News cannot be used for grounded reasoning without formal entity links. |
| **Knowledge Graph** | **Missing** — No evidence of graph database or entity-relationship modeling beyond relational tables. | **Lightweight Knowledge Graph** for regulations, standards, products, companies. Enables multi-hop reasoning. (Ultimate Architecture 4.1). | **Missing** | TiDB supports graph queries (TiDB Graph), but no schema or queries exist. Alternative: Neo4j would violate TiDB constraint. | **Medium** — Multi-hop reasoning and DPP generation are blocked without entity relationships. TiDB Graph is viable path. |
| **Semantic Cache** | **Implemented** — `ask-isa-cache.ts` exists with `getCachedResponse()`, `cacheResponse()`, `getCacheStats()`. | **Semantic Cache** using vector similarity for near-duplicate queries (Ultimate Architecture 4.2). | **Incomplete** | Current cache appears to be exact-match. Ultimate requires semantic similarity matching. | **Low** — Performance optimization, not critical for correctness. |
| **Observability** | **Partial** — `serverLogger` exists. No evidence of end-to-end trace schema or LangSmith integration. | **Full RAG Observability Stack**: "query → retrieved_docs → rerank_scores → used_spans → claims → citations" trace schema. LangSmith integration. (Quality Plan 3.1). | **Incomplete** | No trace schema in database. No structured logging of retrieval pipeline. | **High** — Cannot debug or improve RAG quality without observability. Root-cause analysis is impossible. |
| **RAG Evaluation** | **Missing** — No evidence of golden dataset, evaluation metrics, or automated testing of answer quality. | **RAG Evaluation Framework** with 500+ Q/A pairs, stratified by domain, question type, language. Metrics: recall, citation precision, answer correctness. (Quality Plan 2.3). | **Missing** | Requires new tables for golden dataset and evaluation results. No conflict with stack. | **High** — Cannot measure progress toward quality targets without evaluation framework. |
| **DPP Generation** | **Planned** — "Digital Product Passport integration" listed for Q2 2026 (ROADMAP.md:133). No implementation evidence. | **DPP Generation Service** leveraging Knowledge Graph and reasoning engine (Ultimate Architecture 4.3). | **Missing** | Blocked by missing Knowledge Graph. | **Medium** — Strategic feature, not blocking core functionality. |
| **Agentic RAG** | **Missing** — No evidence of multi-step reasoning, query decomposition, or tool-use patterns. Capability Map explores "Approach 1C: Reasoning-Optimized LLM with Tool Use" but marks it as exploration, not implementation. | **Agentic RAG Controller** for complex, multi-step queries. LangGraph-based agents. (Ultimate Architecture 4.2). | **Missing** | High complexity. Current Genkit/LLM flows are single-turn. Agentic patterns require significant new infrastructure. | **Low** — Strategic feature for complex queries. Not required for core compliance use cases. |
| **Public API** | **Planned** — "Public API" listed for Q3 2025 (ROADMAP.md:350). No implementation evidence. | **Public API (v1)** exposing core knowledge base via secure, documented API (Ultimate Architecture Phase 3). | **Missing** | No conflict with stack. Standard REST/GraphQL on existing tRPC foundation. | **Low** — Strategic feature for third-party integrations. |
| **CI/CD Pipeline** | **Partial** — GitHub Actions workflows exist for embedding generation. No evidence of full CI/CD for deployment. | **Full CI/CD Pipeline** (Ultimate Architecture Phase 4). | **Incomplete** | Current deployment appears manual via Replit. | **Medium** — Operational risk for production stability. |

---


## Task 2: Inconsistencies & Stack Conflicts

### 2.1 Critical Inconsistencies

| ID | Inconsistency | Evidence (Current) | Evidence (Target) | Resolution Required |
|----|---------------|-------------------|-------------------|---------------------|
| **I-1** | **Ingestion is manual; target requires automated, versioned corpus** | "Manual data ingestion for all datasets" (INGESTION.md:4) | "Corpus Governance Service... handles versioning, authority ranking" (Ultimate Architecture 4.1) | **Schema migration + new service**. Add `sources` table with version tracking. Build automated ingestion pipeline. |
| **I-2** | **No abstention capability; target requires hard abstain** | No evidence of abstention logic in `ask-isa.ts`. Guardrails only classify query type, not evidence sufficiency. | "If evidence is insufficient or contradictory, the system **must abstain**" (Quality Plan 1.2) | **New logic in ask-isa.ts**. Add evidence sufficiency check before LLM generation. |
| **I-3** | **Answer-first architecture; target requires cite-then-write** | Current flow: Query → Hybrid Search → LLM Generation → Claim Verification (post-hoc). | "Evidence Selection → Claim Extraction → Answer Generation" (Quality Plan 1.1) | **Architectural refactor**. Invert pipeline: extract claims from evidence first, then generate answer constrained to those claims. |
| **I-4** | **No Knowledge Graph; target requires entity relationships** | No graph schema in TiDB. No entity linking in codebase. | "Knowledge Graph... enables multi-hop reasoning" (Ultimate Architecture 4.1) | **New schema + queries**. Design entity tables (regulations, standards, products) and relationship tables. Use TiDB's graph query capabilities. |
| **I-5** | **No RAG evaluation framework; target requires 500+ Q/A golden dataset** | No evidence of golden dataset or evaluation metrics. | "500+ Q/A pairs, stratified by domain, question type, language" (Quality Plan 2.3) | **New tables + evaluation scripts**. Create `golden_qa_pairs` and `evaluation_results` tables. Build evaluation harness. |
| **I-6** | **No observability trace schema; target requires end-to-end tracing** | Only `serverLogger` exists. No structured trace data. | "query → retrieved_docs → rerank_scores → used_spans → claims → citations" trace schema (Quality Plan 3.1) | **New trace table + logging middleware**. Add `rag_traces` table. Instrument `ask-isa.ts` to log full pipeline. |

### 2.2 Stack Conflicts

| ID | Conflict | Current Stack | Target Stack | Resolution |
|----|----------|---------------|--------------|------------|
| **C-1** | **Knowledge Graph implementation** | TiDB (relational) | "TiDB Graph, or native graph database like Neo4j" (Ultimate Architecture 4.1) | **Use TiDB Graph**. Neo4j would violate TiDB constraint. TiDB supports graph queries via SQL extensions. Design schema with explicit relationship tables. |
| **C-2** | **Semantic Cache implementation** | Current cache appears exact-match (string key). | "Semantic similarity to find and return cached answers for identical or similar questions" (Ultimate Architecture 4.2) | **Extend cache with vector similarity**. Store query embeddings alongside cached responses. Use cosine similarity threshold for cache hits. |
| **C-3** | **Cite-then-Write vs. current pipeline** | LLM generates answer, then `claim-citation-verifier.ts` verifies post-hoc. | Claims extracted from evidence *before* answer generation. | **Major refactor of `ask-isa.ts`**. New pipeline: (1) Retrieve evidence, (2) Extract atomic claims from evidence, (3) Generate answer constrained to claims. |
| **C-4** | **Observability tooling** | No LangSmith or OpenTelemetry integration. | "LangSmith, OpenTelemetry, Grafana" (Ultimate Architecture 4.4) | **Add LangSmith integration**. Wrap LLM calls with LangSmith tracing. Export metrics to Grafana via OpenTelemetry. |

### 2.3 Dependency Graph of Conflicts

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRITICAL PATH                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │ I-1: Corpus      │                                           │
│  │ Governance       │──────────────────────────────┐            │
│  │ (Schema + Svc)   │                              │            │
│  └────────┬─────────┘                              │            │
│           │                                        │            │
│           ▼                                        ▼            │
│  ┌──────────────────┐                    ┌──────────────────┐   │
│  │ C-1: Knowledge   │                    │ I-5: RAG         │   │
│  │ Graph (TiDB)     │                    │ Evaluation       │   │
│  └────────┬─────────┘                    │ Framework        │   │
│           │                              └────────┬─────────┘   │
│           │                                       │             │
│           ▼                                       ▼             │
│  ┌──────────────────┐                    ┌──────────────────┐   │
│  │ I-3: Cite-then-  │◄───────────────────│ I-6: Observa-   │   │
│  │ Write Pipeline   │                    │ bility Stack     │   │
│  └────────┬─────────┘                    └──────────────────┘   │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                           │
│  │ I-2: Abstention  │                                           │
│  │ Policy           │                                           │
│  └──────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Legend:
  ──► = "depends on" / "blocked by"
```

### 2.4 Risk Assessment

| Risk Level | Count | Items |
|------------|-------|-------|
| **Critical** | 2 | I-1 (Corpus Governance), I-3 (Cite-then-Write) |
| **High** | 3 | I-2 (Abstention), I-5 (RAG Evaluation), I-6 (Observability) |
| **Medium** | 2 | C-1 (Knowledge Graph), C-4 (LangSmith) |
| **Low** | 2 | C-2 (Semantic Cache), I-4 (Knowledge Graph - for DPP) |

---


## Task 3: Prioritized Refactor Plan with Acceptance Gates

This plan prioritizes the resolution of critical inconsistencies and stack conflicts, structured into sequential gates. Each gate must be successfully passed before the next can begin.

### Gate 1: Foundation - Corpus Governance & Observability (2-3 weeks)

**Objective**: Establish a single source of truth for all knowledge and make the RAG pipeline observable.

| Priority | Action | Description | Acceptance Criteria (Must Pass) |
|----------|--------|-------------|---------------------------------|
| **1.1 (Critical)** | **Implement Corpus Governance Schema** | Add `sources` and `source_chunks` tables to TiDB. The `sources` table will track document metadata (version, authority, publication date). `source_chunks` will store versioned, structured content. | **Gate 1.1 Pass**: `sources` and `source_chunks` tables exist in TiDB. A test document can be ingested, versioned, and retrieved with correct authority level. |
| **1.2 (High)** | **Integrate Observability Stack** | Wrap all major steps in `ask-isa.ts` (retrieval, ranking, generation) with LangSmith tracing. Create a `rag_traces` table to store a structured log of the pipeline for each query. | **Gate 1.2 Pass**: A query to Ask ISA generates a complete trace in LangSmith. The `rag_traces` table contains a structured log of the query, retrieved documents, and final answer. |
| **1.3 (Medium)** | **Refactor Ingestion Pipeline** | Create a new, automated ingestion service that populates the `sources` and `source_chunks` tables. Deprecate manual seed scripts. | **Gate 1.3 Pass**: The new ingestion service can successfully process a new version of a source document, creating new versioned chunks in the database. |

**Gate 1 Decision**: Is the data foundation robust and auditable enough to build upon? Can we trace every query from start to finish?

---

### Gate 2: Core Reasoning - Cite-then-Write & Evaluation (1-2 months)

**Objective**: Re-architect the core reasoning pipeline to be evidence-based and implement a baseline for quality evaluation.

| Priority | Action | Description | Acceptance Criteria (Must Pass) |
|----------|--------|-------------|---------------------------------|
| **2.1 (Critical)** | **Implement Cite-then-Write Pipeline** | Refactor `ask-isa.ts`. The new flow must be: (1) Retrieve evidence from `source_chunks`. (2) Extract atomic claims from evidence. (3) Generate answer constrained *only* to those claims. | **Gate 2.1 Pass**: For a test query, the `rag_traces` log shows that claims were extracted *before* the final answer was generated. The final answer contains no information not present in the extracted claims. |
| **2.2 (High)** | **Implement Hard Abstention Policy** | Add a pre-generation step that analyzes the retrieved evidence. If evidence is insufficient or contradictory, the system must return a predefined "I cannot answer" message. | **Gate 2.2 Pass**: A query known to have insufficient evidence in the corpus triggers the abstention response. This is logged in the trace. |
| **2.3 (High)** | **Implement RAG Evaluation Framework (v1)** | Create a `golden_qa_pairs` table and populate it with 50 initial Q&A pairs. Build an evaluation script that runs these queries and calculates `Citation Precision` and `Answer Correctness` against the golden answers. | **Gate 2.3 Pass**: The evaluation script runs successfully and produces a report with `Citation Precision > 95%` on the initial golden set. |

**Gate 2 Decision**: Does the answer quality meet the 95% citation precision target? Is the system capable of gracefully abstaining?

---

### Gate 3: Advanced Capabilities - Knowledge Graph & Caching (2-3 months)

**Objective**: Enhance reasoning with structured knowledge and improve performance with semantic caching.

| Priority | Action | Description | Acceptance Criteria (Must Pass) |
|----------|--------|-------------|---------------------------------|
| **3.1 (Medium)** | **Implement Knowledge Graph (v1)** | Design and implement a graph schema in TiDB for regulations, standards, and their relationships. Populate the graph with existing data. | **Gate 3.1 Pass**: A graph query can successfully traverse from a regulation to a related standard. The graph is populated with all current ISA data. |
| **3.2 (Low)** | **Implement Semantic Cache** | Extend the existing cache to store query embeddings. On a new query, perform a vector similarity search against the cache. If similarity > 0.98, return the cached response. | **Gate 3.2 Pass**: A semantically similar (but not identical) query returns a cached response. The cache hit is logged in the trace. |
| **3.3 (Medium)** | **Integrate KG into Retrieval** | Modify the retrieval step to query the Knowledge Graph for entities and relationships related to the user's query. Use these results to augment the context for the LLM. | **Gate 3.3 Pass**: A query about a regulation's relationship to a standard uses the KG to retrieve context, which is visible in the `rag_traces` log. |

**Gate 3 Decision**: Does the Knowledge Graph improve answer quality for multi-hop questions? Does the semantic cache significantly improve performance?

---

## Task 4: Final Output Compilation

This document constitutes the complete and final output, integrating all previous tasks into a single, coherent plan. It serves as the authoritative roadmap for refactoring ISA to align with the Ultimate Architecture vision.

### Summary of Key Findings

1.  **Critical Path Identified**: The analysis confirms a critical development path: **Corpus Governance → Observability → Cite-then-Write → Abstention → Evaluation**. These steps are sequential and must be executed in order.
2.  **Architectural Inversion Required**: The most significant refactor is the shift from an "answer-first" to a "cite-then-write" pipeline. This is non-trivial but essential for achieving compliance-grade auditability.
3.  **No Stack Blockers**: All target capabilities can be implemented on the existing TiDB-centric stack. The primary challenges are architectural and logical, not technological.

### Next Steps

The immediate next step is to begin the implementation of **Gate 1: Foundation**. This involves:
1.  Finalizing the schema for the `sources` and `source_chunks` tables.
2.  Creating a new database migration to apply the schema changes.
3.  Beginning the development of the new, automated ingestion service.

This plan provides a clear, evidence-based, and actionable path forward to evolve ISA into a superior, trustworthy, and auditable system.
