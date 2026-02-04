# Retrieval / Embeddings / Grounding

**Canonical Specification**
**Status:** CURRENT (as-built)
**Generated:** 2026-02-03

## 1. Identity

- **Name:** Retrieval / Embeddings / Grounding
- **Scope:** This specification defines the CURRENT state of retrieval / embeddings / grounding within ISA.
- **Marker:** CURRENT (as-built) — not ULTIMATE (ambition/research)

## 2. Core Sources

The following documents form the authoritative basis for this specification:

1. `./docs/architecture/ISA_ULTIMATE_ARCHITECTURE.md`
2. `./docs/ultimate_architecture_docs/ISA_ULTIMATE_ARCHITECTURE.md`
3. `./ISA_CAPABILITY_MAP.md`
4. `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md`
5. `./docs/ENHANCED_EMBEDDING_SCHEMA.md`
6. `./research/ASK_ISA_IMPLEMENTATION_PLAN.md`
7. `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md`
8. `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v1.md`
9. `./research/ASK_ISA_ANALYSIS_REPORT.md`
10. `./AUTONOMOUS_DEVELOPMENT_SUMMARY.md`

## 3. Definitions

*Terms used in this specification are defined in ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** **Value Proposition:** Enhanced reasoning capabilities could enable ISA to answer complex queries like "What GS1 standards must a textile manufacturer implement to comply with both CSRD and Digital Pr
- Source: `./ISA_CAPABILITY_MAP.md` > Domain 1: Reasoning & Inference

**INV-2:** - **Maintenance Burden:** Rules must be updated when regulations change; potential for rule drift
- Source: `./ISA_CAPABILITY_MAP.md` > Approach 1B: Hybrid Symbolic-Neural Reasoning

**INV-3:** **Gap:** The current architecture cannot efficiently answer graph-traversal queries (e.g., "What are all transitive dependencies between CSRD, affected ESRS datapoints, required GS1 standards, and imp
- Source: `./ISA_CAPABILITY_MAP.md` > Domain 3: Knowledge Representation & Graph Intelligence

**INV-4:** - **Learning Curve:** Team must learn graph query languages and data modeling patterns
- Source: `./ISA_CAPABILITY_MAP.md` > Approach 3A: Hybrid Relational + Property Graph

**INV-5:** - **Maintenance:** Model retraining required as knowledge base evolves; potential for embedding drift
- Source: `./ISA_CAPABILITY_MAP.md` > Approach 3C: Embeddings-Based Knowledge Graph with GNN

**INV-6:** **Current ISA Capability:** ISA provides historical and current information about regulations, standards, and compliance requirements. The News Hub tracks recent developments, but the system operates 
- Source: `./ISA_CAPABILITY_MAP.md` > Domain 5: Predictive Intelligence & Change Detection

**INV-7:** **Gap:** Organizations need advance warning of regulatory changes to plan compliance strategies, allocate resources, and avoid last-minute scrambles. ISA currently cannot predict which regulations are
- Source: `./ISA_CAPABILITY_MAP.md` > Domain 5: Predictive Intelligence & Change Detection

**INV-8:** - **Operational Readiness:** New systems must include monitoring, logging, error handling, and runbooks before production deployment
- Source: `./ISA_CAPABILITY_MAP.md` > Principle 3: Start Simple, Add Complexity Judiciously

**INV-9:** **Rationale:** Advanced capabilities (reasoning chains, visual diagrams, proactive alerts, graph visualizations) can overwhelm users if not designed carefully. User experience must remain intuitive an
- Source: `./ISA_CAPABILITY_MAP.md` > Principle 4: Respect User Context and Cognitive Load

**INV-10:** **Rationale:** Many next-generation capabilities (reasoning-optimized LLMs, VLMs, autonomous agents) have significantly higher per-query costs than current ISA operations. Cost models must be sustaina
- Source: `./ISA_CAPABILITY_MAP.md` > Constraint 1: Cost Sustainability

**INV-11:** **Rationale:** Advanced capabilities require specialized expertise (ML engineering, graph databases, agent frameworks) that may not be available. Maintenance burden must be sustainable with current te
- Source: `./ISA_CAPABILITY_MAP.md` > Constraint 4: Team Expertise and Maintenance Burden

**INV-12:** 2. **Ensure JSON serialization is deterministic.** ISA's data pipeline outputs (GS1 attributes, ESRS datapoints, regulation metadata) must use stable key ordering. Audit all JSON.stringify() calls in 
- Source: `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` > 1.1 The KV-Cache Imperative

**INV-13:** - **Verification:** Post-conditions (e.g., "All ESRS datapoints must have valid datapointId"), self-checks, HALT/ESCALATE rules
- Source: `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` > 1.3 Modular Prompt Structure

**INV-14:** 4. **Only ship prompt changes that beat baseline.** ISA's production deployment should gate on evaluation metrics (e.g., "RAG precision must be ≥ 85%") [2].
- Source: `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` > 5.1 Offline Evaluation (Pre-Launch)

**INV-15:** - **Validation rules** that each agent must apply [3]
- Source: `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` > 6.2 Wide Research Best Practices for ISA

## 5. Interfaces / Pipelines / Entry Points

*CURRENT implementation details extracted from source documents.*

## 6. Governance & Change Control

Changes to this specification require:
1. Review of source documents
2. Update to TRACEABILITY_MATRIX.csv
3. Approval per ISA governance rules

## 7. Observability & Evaluation Hooks

**OPEN ISSUE:** Observability hooks not fully defined for this cluster.

## 8. Acceptance Criteria / IRON Gates

- AC-1: - Build PDF processing pipeline (upload → parse → validate → store)
- AC-2: - **Mitigation:** Validate graph query value with simpler property graph (Domain 3A only) before adding GNN and reasoning layers
- AC-3: Given the breadth of capability options explored above, this section provides a decision framework to guide which approaches to validate first based o
- AC-4: Each exploration phase should have clear success criteria and off-ramps to avoid sunk cost fallacy.
- AC-5: As ISA explores next-generation capabilities, certain architectural principles and constraints should guide implementation decisions to ensure the pla

## 9. Traceability Annex

| Claim ID | Statement (truncated) | Source |
|----------|----------------------|--------|
| RET-001 | **Value Proposition:** Enhanced reasoning capabilities could... | `./ISA_CAPABILITY_MAP.md` |
| RET-002 | - **Maintenance Burden:** Rules must be updated when regulat... | `./ISA_CAPABILITY_MAP.md` |
| RET-003 | **Gap:** The current architecture cannot efficiently answer ... | `./ISA_CAPABILITY_MAP.md` |
| RET-004 | - **Learning Curve:** Team must learn graph query languages ... | `./ISA_CAPABILITY_MAP.md` |
| RET-005 | - **Maintenance:** Model retraining required as knowledge ba... | `./ISA_CAPABILITY_MAP.md` |
| RET-006 | - Build PDF processing pipeline (upload → parse → validate →... | `./ISA_CAPABILITY_MAP.md` |
| RET-007 | **Current ISA Capability:** ISA provides historical and curr... | `./ISA_CAPABILITY_MAP.md` |
| RET-008 | **Gap:** Organizations need advance warning of regulatory ch... | `./ISA_CAPABILITY_MAP.md` |
| RET-009 | - **Mitigation:** Validate graph query value with simpler pr... | `./ISA_CAPABILITY_MAP.md` |
| RET-010 | Given the breadth of capability options explored above, this... | `./ISA_CAPABILITY_MAP.md` |
| RET-011 | Each exploration phase should have clear success criteria an... | `./ISA_CAPABILITY_MAP.md` |
| RET-012 | As ISA explores next-generation capabilities, certain archit... | `./ISA_CAPABILITY_MAP.md` |
| RET-013 | **Rationale:** The exploration phase is explicitly about kee... | `./ISA_CAPABILITY_MAP.md` |
| RET-014 | - **Modular Integration:** New capabilities should integrate... | `./ISA_CAPABILITY_MAP.md` |
| RET-015 | - **Feature Flags:** All next-generation capabilities should... | `./ISA_CAPABILITY_MAP.md` |
| RET-016 | - **Reversibility:** Infrastructure investments (graph datab... | `./ISA_CAPABILITY_MAP.md` |
| RET-017 | - **Data Portability:** Knowledge representations (embedding... | `./ISA_CAPABILITY_MAP.md` |
| RET-018 | **Rationale:** Complex approaches (multi-agent systems, GNN ... | `./ISA_CAPABILITY_MAP.md` |
| RET-019 | - **Operational Readiness:** New systems must include monito... | `./ISA_CAPABILITY_MAP.md` |
| RET-020 | - **Fallback Mechanisms:** Complex capabilities should degra... | `./ISA_CAPABILITY_MAP.md` |
