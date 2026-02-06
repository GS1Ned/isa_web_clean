# PHASE 1: Integration Positioning Decision

**Date:** 2026-01-25  
**Status:** CONFIRMED

---

## Architectural Role

The `EU_ESG_to_GS1_Mapping_v1.1` artefact set serves as a **canonical reasoning layer** in ISA.

```
User Layer (Ask ISA, Dashboards)
         ↓
Reasoning Layer ← EU_ESG_to_GS1_Mapping (THIS ARTEFACT)
         ↓
Knowledge Layer (Embeddings, RAG)
         ↓
Data Layer (regulations, gs1Attributes, etc.)
```

---

## What It Replaces, Enriches, or Leaves Untouched

| ISA Component | Action | Rationale |
|---------------|--------|-----------|
| `regulations` table | **ENRICHES** | Artefact provides ELI URLs, effect_status, last_verified |
| `gs1EsrsMappings` table | **LEAVES UNTOUCHED** | Different abstraction level (product vs obligation) |
| `esrsDatapoints` table | **LEAVES UNTOUCHED** | XBRL-level detail; artefact is obligation-level |
| `knowledgeEmbeddings` | **ENRICHES** | New sourceTypes: obligation, atomic_requirement |
| Ask ISA responses | **ENRICHES** | Adds obligation traceability and GS1 fitness context |

---

## Layer Storage Decisions

| Artefact Layer | Storage Type | Rationale |
|----------------|--------------|-----------|
| `corpus.json` | **DB Table** | Core reference; needs query/join capability |
| `obligations.json` | **DB Table** | Legal traceability anchor; needs foreign keys |
| `atomic_requirements.json` | **DB Table** | Enables deterministic reasoning chains |
| `data_requirements.json` | **DB Table** | Links to GS1 mappings; needs query capability |
| `gs1_mapping.json` | **DB Table** | GS1 fitness assessment; needs join to data_requirements |
| `scoring.json` | **DB Table** | Prioritisation; merged with gs1_mapping |
| `schemas/*.json` | **Static Reference** | Validation only; no runtime query needed |
| `validation/*.txt` | **Static Reference** | Audit evidence; no runtime query needed |

---

## Immutability Constraint

All artefact content is **semantically frozen**. The integration:
- Copies data verbatim into DB tables
- Does NOT reinterpret, extend, or alter content
- Preserves all IDs, relationships, and text exactly as authored

---

## GS1 Constraint

> GS1 is never legally required.

All `mapping_strength` values are preserved exactly. The integration does NOT:
- Upgrade "partial" to "strong"
- Claim GS1 is necessary for compliance
- Omit "none" mappings

---

**POSITIONING CONFIRMED. PROCEEDING TO PHASE 2.**
