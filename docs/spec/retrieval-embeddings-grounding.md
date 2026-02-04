# Retrieval / Embeddings / Grounding

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Retrieval / Embeddings / Grounding
- **Scope:** CURRENT state of retrieval / embeddings / grounding
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

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

*See ISA_MASTER_SPEC.md*

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

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

**OPEN ISSUE:** Define observability hooks.

## 8. Acceptance Criteria

- AC-1: - Build PDF processing pipeline (upload → parse → validate → store)
- AC-2: - **Mitigation:** Validate graph query value with simpler property graph (Domain 3A only) before adding GNN and reasoning layers
- AC-3: Given the breadth of capability options explored above, this section provides a decision framework to guide which approaches to validate first based o
- AC-4: Each exploration phase should have clear success criteria and off-ramps to avoid sunk cost fallacy.
- AC-5: As ISA explores next-generation capabilities, certain architectural principles and constraints should guide implementation decisions to ensure the pla

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| RET-001 | **Value Proposition:** Enhanced reasoning capabilities could... | `./ISA_CAPABILITY_MAP.md` |
| RET-002 | - **Maintenance Burden:** Rules must be updated when regulat... | `./ISA_CAPABILITY_MAP.md` |
| RET-003 | **Gap:** The current architecture cannot efficiently answer ... | `./ISA_CAPABILITY_MAP.md` |
| RET-004 | - **Learning Curve:** Team must learn graph query languages ... | `./ISA_CAPABILITY_MAP.md` |
| RET-005 | - **Maintenance:** Model retraining required as knowledge ba... | `./ISA_CAPABILITY_MAP.md` |
| RET-006 | **Current ISA Capability:** ISA provides historical and curr... | `./ISA_CAPABILITY_MAP.md` |
| RET-007 | **Gap:** Organizations need advance warning of regulatory ch... | `./ISA_CAPABILITY_MAP.md` |
| RET-008 | - **Operational Readiness:** New systems must include monito... | `./ISA_CAPABILITY_MAP.md` |
| RET-009 | **Rationale:** Advanced capabilities (reasoning chains, visu... | `./ISA_CAPABILITY_MAP.md` |
| RET-010 | **Rationale:** Many next-generation capabilities (reasoning-... | `./ISA_CAPABILITY_MAP.md` |
| RET-011 | **Rationale:** Advanced capabilities require specialized exp... | `./ISA_CAPABILITY_MAP.md` |
| RET-012 | 2. **Ensure JSON serialization is deterministic.** ISA's dat... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-013 | - **Verification:** Post-conditions (e.g., "All ESRS datapoi... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-014 | 4. **Only ship prompt changes that beat baseline.** ISA's pr... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-015 | - **Validation rules** that each agent must apply [3]... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-016 | - No greenfield redesigns. All proposals must be **increment... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-017 | / **Abstention Policy** / **Missing** — No evidence of "I ca... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-018 | / **News Hub** / **Implemented** — "Automated news aggregati... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-019 | / **Agentic RAG** / **Missing** — No evidence of multi-step ... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-020 | / ID / Inconsistency / Evidence (Current) / Evidence (Target... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-021 | / **I-2** / **No abstention capability; target requires hard... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-022 | This plan prioritizes the resolution of critical inconsisten... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-023 | / Priority / Action / Description / Acceptance Criteria (Mus... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-024 | / **2.1 (Critical)** / **Implement Cite-then-Write Pipeline*... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-025 | / **2.2 (High)** / **Implement Hard Abstention Policy** / Ad... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-026 | 1.  **Critical Path Identified**: The analysis confirms a cr... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-027 | 2.  **Architectural Inversion Required**: The most significa... | `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md` |
| RET-028 | - Add a minimal “RAG regression suite” (golden Q&A + require... | `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v1.md` |
| RET-029 | **ChatGPT Recommendation:** All claims must be evidence-boun... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-030 | - Build PDF processing pipeline (upload → parse → validate →... | `./ISA_CAPABILITY_MAP.md` |
| RET-031 | - **Mitigation:** Validate graph query value with simpler pr... | `./ISA_CAPABILITY_MAP.md` |
| RET-032 | Given the breadth of capability options explored above, this... | `./ISA_CAPABILITY_MAP.md` |
| RET-033 | Each exploration phase should have clear success criteria an... | `./ISA_CAPABILITY_MAP.md` |
| RET-034 | As ISA explores next-generation capabilities, certain archit... | `./ISA_CAPABILITY_MAP.md` |
| RET-035 | **Rationale:** The exploration phase is explicitly about kee... | `./ISA_CAPABILITY_MAP.md` |
| RET-036 | - **Modular Integration:** New capabilities should integrate... | `./ISA_CAPABILITY_MAP.md` |
| RET-037 | - **Feature Flags:** All next-generation capabilities should... | `./ISA_CAPABILITY_MAP.md` |
| RET-038 | - **Reversibility:** Infrastructure investments (graph datab... | `./ISA_CAPABILITY_MAP.md` |
| RET-039 | - **Data Portability:** Knowledge representations (embedding... | `./ISA_CAPABILITY_MAP.md` |
| RET-040 | **Rationale:** Complex approaches (multi-agent systems, GNN ... | `./ISA_CAPABILITY_MAP.md` |
| RET-041 | - **Fallback Mechanisms:** Complex capabilities should degra... | `./ISA_CAPABILITY_MAP.md` |
| RET-042 | - **Progressive Disclosure:** Advanced features should be op... | `./ISA_CAPABILITY_MAP.md` |
| RET-043 | - **Consistency:** New capabilities should follow existing I... | `./ISA_CAPABILITY_MAP.md` |
| RET-044 | - **User Control:** Users should be able to configure, disab... | `./ISA_CAPABILITY_MAP.md` |
| RET-045 | The current ISA implementation provides a **stable baseline*... | `./ISA_CAPABILITY_MAP.md` |
| RET-046 | Domain 3 (Knowledge Representation) approaches—particularly ... | `./ISA_CAPABILITY_MAP.md` |
| RET-047 | Domain 5 (Predictive Intelligence) spans a wide range of app... | `./ISA_CAPABILITY_MAP.md` |
| RET-048 | Many advanced capabilities (reasoning-optimized LLMs, autono... | `./ISA_CAPABILITY_MAP.md` |
| RET-049 | 11. **If Agents Validate:** Explore proactive assistant scen... | `./ISA_CAPABILITY_MAP.md` |
| RET-050 | The exploration phase should be considered successful if it ... | `./ISA_CAPABILITY_MAP.md` |
| RET-051 | - **Stage 2 (Weeks 5-12):** Controlled experiments to valida... | `./ISA_CAPABILITY_MAP.md` |
| RET-052 | Each stage includes explicit **off-ramps**—conditions under ... | `./ISA_CAPABILITY_MAP.md` |
| RET-053 | The existing ISA implementation is a valuable asset, not a c... | `./ISA_CAPABILITY_MAP.md` |
| RET-054 | 3. **Make context append-only.** ISA's agent loops should ne... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-055 | 4. **Mark cache breakpoints explicitly.** If ISA uses custom... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-056 | Manus treats the file system as unlimited, persistent, exter... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-057 | 1. **Document compression strategies as restorable.** ISA's ... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-058 | 2. **Treat file system as structured memory.** ISA's `data/`... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-059 | 3. **Avoid irreversible compression.** ISA's 200-day news ar... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-060 | 1. **Factor ISA prompts into 5 blocks.** Current ISA prompts... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-061 | 3. **Pin a compact, living plan.** ISA's todo.md should be k... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-062 | 2. **Update todo.md every loop during complex tasks.** ISA's... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-063 | 1. **Review ISA's agent loops.** Audit current agent loops (... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-064 | 2. **Require rationale logging.** Each tool call should log:... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-065 | 3. **Add loop caps and HALT conditions.** ISA's agent loops ... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-066 | 1. **Leave failed ingestion attempts in context.** ISA's dat... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-067 | 3. **Add verification steps requiring citations.** ISA's Ask... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-068 | 4. **Never hide errors in production logs.** ISA's news pipe... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-069 | 1. **Introduce variation in repetitive tasks.** ISA's ingest... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-070 | 3. **Monitor for drift in batch operations.** ISA's planned ... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-071 | ISA's 691-file structure is well-organized but should be for... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-072 | 3. **Use file paths as context compression.** ISA's ingestio... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-073 | 1. **Sample production traces.** ISA's Ask ISA system should... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-074 | 3. **Validation across multiple standards.** Validate ISA da... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-075 | - **Example:** "Validate this product dataset against 20 dif... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-076 | - **Example:** "Validate 200 product records against ISA sch... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-077 | 4. **Ensure consistency across parallel agents.** ISA's regu... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-078 | - **Scope file system:** ISA's ingestion scripts should only... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-079 | - **Whitelist parameters:** Database queries should use para... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-080 | - **Require human approval for destructive actions:** Deleti... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-081 | - **RBAC:** ISA's admin panel should enforce role-based acce... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-082 | - **Log every retrieval and write:** ISA's database operatio... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-083 | - **Trace prompts, tool calls, outputs, latency, costs:** IS... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-084 | - **Alert on suspicious patterns:** Repeated failed tool cal... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-085 | - [ ] Audit JSON serialization in ingestion scripts. Ensure ... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-086 | - [ ] Verify agent loops are append-only. No retroactive edi... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-087 | 4. **Ensure regulatory compliance** via layered guardrails a... | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` |
| RET-088 | 3. Verify improved retrieval quality... | `./docs/ENHANCED_EMBEDDING_SCHEMA.md` |
| RET-089 | Verify that each factual claim in the response is supported ... | `./research/ASK_ISA_IMPLEMENTATION_PLAN.md` |
| RET-090 | **Analysis:** The current system has citation validation (`v... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-091 | **Consideration:** The current vector search is already opti... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-092 | The AEL is a sound concept, but the implementation should be... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-093 | **Analysis:** This aligns with research on source reliabilit... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-094 | **Agreement with Nuance:** Some improvements (e.g., BM25 sea... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-095 | For ambiguous queries, the system should offer clarification... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-096 | The existing feedback buttons (`AskISAFeedbackButtons.tsx`) ... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-097 | The current system stores conversation history but does not ... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-098 | However, the implementation scope is ambitious and should be... | `./research/ASK_ISA_ANALYSIS_REPORT.md` |
| RET-099 | Ensure production-grade reliability through comprehensive un... | `./AUTONOMOUS_DEVELOPMENT_SUMMARY.md` |
| RET-100 | 8. **Add citation validation** - Verify claims match sources... | `./docs/DEVELOPMENT_PROGRESS_2026-02-01.md` |
