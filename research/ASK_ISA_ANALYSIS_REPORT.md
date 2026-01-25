# Ask ISA Feature Analysis Report

**Author:** Manus AI  
**Date:** January 25, 2026  
**Subject:** Critical Evaluation of ChatGPT's Ask ISA Improvement Recommendations

---

## Executive Summary

This report provides a comprehensive analysis of the improvement recommendations proposed by ChatGPT for the Ask ISA feature, cross-referenced with current RAG best practices research and the existing ISA codebase implementation. The analysis evaluates each suggestion for feasibility, value, and alignment with production-grade RAG system standards.

The ChatGPT prompt proposes an ambitious upgrade strategy centered around an "Authoritative Evidence Layer (AEL)" with seven goal qualities. After thorough evaluation, this report identifies which recommendations are well-founded, which require modification, and which additional opportunities exist beyond the original proposal.

---

## 1. Current Ask ISA Architecture Verification

Based on codebase analysis, the current Ask ISA implementation follows this dataflow:

| Component | File Location | Function |
|-----------|---------------|----------|
| Router | `server/routers/ask-isa.ts` | tRPC endpoint handling questions |
| Guardrails | `server/ask-isa-guardrails.ts` | Query classification, refusal logic |
| Vector Search | `server/db-knowledge-vector.ts` | Semantic retrieval via embeddings |
| Prompt Assembly | `server/prompts/ask_isa/index.ts` | 5-block modular prompt system |
| Citation Validation | `server/citation-validation.ts` | Deprecation/verification checks |
| Verification | `server/prompts/ask_isa/verification.ts` | Post-generation quality checks |
| Frontend | `client/src/pages/AskISA.tsx` | User interface with query library |

The system currently uses OpenAI embeddings for vector search, retrieves top-5 results, and applies a modular v2.0 prompt system with verification checks. Citation validation includes deprecation status and 90-day verification age tracking.

---

## 2. Evaluation of ChatGPT's Seven Goal Qualities

### 2.1 Smarter: Better Retrieval Relevance

**ChatGPT Recommendation:** Improve retrieval relevance and multi-step reasoning without hallucination.

**Analysis:** The current implementation uses vector-only search, which research confirms is "inherently lossy and may miss out on retrieving chunks with exact lexical matches" [1]. The recommendation aligns with best practices.

**Verdict:** ✅ **AGREE** — Hybrid search (vector + BM25) is a proven improvement. The current system retrieves only title/description, not full content, which limits context quality.

**Enhancement Opportunity:** Implement semantic chunking instead of fixed-size chunking to preserve context integrity [1].

---

### 2.2 More Reliable: Evidence-Bound Answers

**ChatGPT Recommendation:** All claims must be evidence-bound with no unsupported claims.

**Analysis:** The current system has citation validation (`validateCitationFormat`) that checks for `[Source N]` notation, but it does not verify that specific claims map to specific citations. The verification module (`verifyAskISAResponse`) checks for citation presence but not claim-citation alignment.

**Verdict:** ✅ **AGREE** — This is a critical gap. Research shows "LLMs can still fabricate responses while citing sources, giving users a false sense of confidence" [2].

**Enhancement Opportunity:** Implement claim-level citation mapping where each factual statement is explicitly linked to a source ID.

---

### 2.3 More Efficient: Reduced Latency/Cost

**ChatGPT Recommendation:** Implement routing and adaptive retrieval to reduce latency and cost.

**Analysis:** The current system always performs vector search regardless of query type. Query classification exists but only for refusal logic, not for routing optimization.

**Verdict:** ✅ **AGREE** — Query routing can skip retrieval for simple queries or adjust k-value based on query complexity.

**Consideration:** The current vector search is already optimized (<5s per query vs 60s with LLM scoring). Further optimization should focus on reducing unnecessary LLM calls rather than retrieval speed.

---

### 2.4 More Valuable: Clearer Outputs

**ChatGPT Recommendation:** Provide clearer outputs, stronger provenance, and actionable recommendations.

**Analysis:** The current system prompt (v2.0) already emphasizes "direct and actionable" responses with "next steps or recommendations." The frontend displays confidence badges and source metadata.

**Verdict:** ⚠️ **PARTIALLY AGREE** — The foundation exists, but provenance could be strengthened with authority-level indicators.

**Enhancement Opportunity:** Add visual authority indicators (e.g., "EU Official Source" vs "Industry Guidance") to help users assess source credibility.

---

### 2.5 More Complete: Gap Detection

**ChatGPT Recommendation:** Explicit gap detection and "insufficient evidence" behavior.

**Analysis:** The current system returns a generic message when no results are found but does not explicitly communicate when evidence is partial or when the system cannot answer with high confidence.

**Verdict:** ✅ **AGREE** — This aligns with the trustworthiness framework's "transparency" dimension [3].

**Enhancement Opportunity:** Implement graduated response modes: "Full Answer," "Partial Answer (gaps noted)," and "Insufficient Evidence."

---

### 2.6 More User-Friendly: Transparent Authority

**ChatGPT Recommendation:** Transparent authority/provenance and consistent UI/UX behavior.

**Analysis:** The current UI shows source metadata (datasetId, datasetVersion, lastVerifiedDate, isDeprecated) but does not clearly communicate authority levels or source hierarchy.

**Verdict:** ✅ **AGREE** — Users need to understand why certain sources are more authoritative than others.

**Enhancement Opportunity:** Implement the proposed Authority Model with clear visual hierarchy.

---

### 2.7 Audit-Ready: Structured Evidence Contract

**ChatGPT Recommendation:** Implement structured evidence contract with reproducible citations and version/status/verified dates.

**Analysis:** The current system stores some metadata but lacks a formal schema for evidence contracts. The response structure is ad-hoc rather than schema-validated.

**Verdict:** ✅ **AGREE** — This is essential for enterprise compliance use cases.

**Enhancement Opportunity:** Define and implement the JSON Schema for evidence contracts as proposed.

---

## 3. Evaluation of Proposed Strategy: Authoritative Evidence Layer (AEL)

**ChatGPT Proposal:** Implement an "Authoritative Evidence Layer" with evaluation gates.

**Analysis:** The AEL concept aligns with research on source reliability in RAG systems [4]. The key components are:

1. **Authority Levels** — Classifying sources by credibility (EU institutions > GS1 bodies > industry guidance)
2. **Gating Rules** — Enforcing minimum authority thresholds for certain query types
3. **Fallback Behavior** — Clear communication when only low-authority evidence exists

**Verdict:** ✅ **AGREE WITH MODIFICATIONS**

The AEL is a sound concept, but the implementation should be pragmatic:

| Proposed Approach | Recommended Modification |
|-------------------|-------------------------|
| Complex authority scoring | Simple 3-tier system (Official, Verified, Community) |
| Strict gating rules | Soft warnings with user override option |
| Full evidence contract | Phased implementation starting with core fields |

---

## 4. Evaluation of Proposed Failure Modes

ChatGPT identified 8+ failure modes. Here is the assessment:

| Failure Mode | Current Mitigation | Gap Assessment |
|--------------|-------------------|----------------|
| Prompt injection | Guardrails check for adversarial patterns | ⚠️ Basic regex, could be strengthened |
| Irrelevant retrieval | Vector similarity threshold | ⚠️ No hybrid search fallback |
| Hallucinated citations | Citation format validation | ❌ No claim-citation verification |
| Authority/version drift | lastVerifiedDate tracking | ✅ Implemented |
| Stale advisory lock UX | Advisory version display | ⚠️ UX could be clearer |
| Low recall@k | k=5 default | ⚠️ No adaptive k-value |
| Latency/cost spikes | Optimized vector search | ✅ Acceptable |
| Ambiguous queries | Query classification | ⚠️ Could offer clarification prompts |
| Unsafe recommendations | Legal advice disclaimer | ✅ Implemented |

---

## 5. Evaluation of Proposed Evidence Contract Schema

**ChatGPT Proposal:** JSON Schema with answer_text, claims[], citations[], confidence, authority_summary, verification_flags.

**Analysis:** This is a well-structured proposal that aligns with enterprise RAG requirements [5]. The schema enables:

- Traceable claim-to-citation mapping
- Authority-level filtering
- Audit trail for compliance

**Verdict:** ✅ **AGREE** — Implement with the following refinements:

```json
{
  "answer_text": "string",
  "claims": [
    {
      "claim_id": "string",
      "text": "string",
      "citation_ids": ["string"],
      "confidence": "number (0-1)"
    }
  ],
  "citations": [
    {
      "citation_id": "string",
      "doc_id": "string",
      "publisher": "string",
      "authority_level": "official|verified|community",
      "url": "string",
      "version": "string",
      "status": "current|deprecated|superseded",
      "publication_date": "ISO-8601",
      "last_verified_date": "ISO-8601",
      "excerpt": "string",
      "chunk_id": "string"
    }
  ],
  "confidence": {
    "level": "high|medium|low",
    "score": "number",
    "factors": ["string"]
  },
  "authority_summary": "string",
  "verification_flags": {
    "all_claims_cited": "boolean",
    "all_citations_valid": "boolean",
    "contains_deprecated_sources": "boolean",
    "requires_expert_review": "boolean"
  }
}
```

---

## 6. Evaluation of Proposed Authority Model

**ChatGPT Proposal:** Authority levels (EU institutions, GS1 bodies, official specs, regulator guidance, industry) with gating rules.

**Analysis:** This aligns with research on source reliability estimation [4]. The model should be:

| Authority Level | Examples | Trust Score |
|-----------------|----------|-------------|
| **Official** | EU Regulations (CSRD, EUDR), EFRAG publications | 1.0 |
| **Verified** | GS1 Standards, GS1 Netherlands sector models | 0.9 |
| **Guidance** | Regulator guidance documents, implementation guides | 0.7 |
| **Industry** | Industry whitepapers, best practice documents | 0.5 |
| **Community** | User-contributed content, forum discussions | 0.3 |

**Verdict:** ✅ **AGREE** — Implement with visual indicators in the UI.

---

## 7. Evaluation of Proposed Evaluation Harness

**ChatGPT Proposal:** Golden set format, metrics (citation coverage, faithfulness, refusal correctness, recall@k, latency), CI integration.

**Analysis:** This aligns with RAG evaluation best practices [6]. The current codebase has basic tests but lacks a comprehensive evaluation harness.

**Verdict:** ✅ **AGREE** — Essential for maintaining quality as the system evolves.

**Recommended Implementation:**

1. **Golden Set:** 50-100 curated questions with expected citations and authority constraints
2. **Metrics:**
   - Citation coverage: % of claims with valid citations
   - Faithfulness: Semantic similarity between answer and retrieved context
   - Refusal accuracy: Correctly refusing out-of-scope queries
   - Retrieval recall@k: % of relevant documents in top-k
   - Latency P95: 95th percentile response time
3. **CI Integration:** Run on every PR, fail build if metrics drop below threshold

---

## 8. Areas of Disagreement with ChatGPT

### 8.1 Incremental PR Approach (4-6 PRs)

**ChatGPT Recommendation:** Implement in 4-6 small PRs.

**Disagreement:** While incremental delivery is good practice, the proposed scope is too ambitious for 4-6 PRs. A more realistic estimate is 8-12 PRs over 2-3 months.

### 8.2 "Do Not Rebuild from Scratch"

**ChatGPT Recommendation:** Work inside existing codebase, do not rebuild.

**Partial Disagreement:** The current architecture is sound, but some components (e.g., vector search without hybrid fallback) may benefit from significant refactoring rather than incremental patches.

### 8.3 Heavy Dependencies Justification

**ChatGPT Recommendation:** Do not introduce heavy dependencies unless justified.

**Agreement with Nuance:** Some improvements (e.g., BM25 search, reranking) may require new dependencies. The justification should be based on value delivered, not just "time-to-value."

---

## 9. Additional Improvement Opportunities Not in ChatGPT Prompt

### 9.1 Contextual Chunk Headers

The current system uses title/description for embeddings but loses document context. Implementing Anthropic's contextual retrieval method [1] would significantly improve retrieval quality.

### 9.2 Semantic Chunking

The current fixed-size chunking approach loses semantic integrity. Semantic chunking based on sentence similarity would improve retrieval accuracy [1].

### 9.3 Reranking Layer

Adding a reranking step after initial retrieval would improve precision without significantly impacting latency [1].

### 9.4 Query Clarification

For ambiguous queries, the system should offer clarification prompts rather than attempting to answer with low confidence.

### 9.5 User Feedback Loop

The existing feedback buttons (`AskISAFeedbackButtons.tsx`) should feed into a continuous improvement pipeline for retrieval and prompt tuning.

### 9.6 Conversation Context

The current system stores conversation history but does not use it for context-aware retrieval. Multi-turn conversations should leverage previous Q&A pairs.

---

## 10. Prioritized Recommendations

Based on the analysis, here are the prioritized recommendations:

| Priority | Improvement | Effort | Impact | Recommendation |
|----------|-------------|--------|--------|----------------|
| 1 | Hybrid Search (Vector + BM25) | Medium | High | Implement immediately |
| 2 | Claim-Citation Verification | Medium | High | Critical for reliability |
| 3 | Authority Model (3-tier) | Low | Medium | Quick win for UX |
| 4 | Evidence Contract Schema | Medium | High | Foundation for audit-readiness |
| 5 | Contextual Chunk Headers | Medium | High | Significant retrieval improvement |
| 6 | Evaluation Harness | High | High | Essential for quality assurance |
| 7 | Reranking Layer | Medium | Medium | Precision improvement |
| 8 | Query Clarification | Low | Medium | UX improvement |
| 9 | Semantic Chunking | High | Medium | Long-term investment |
| 10 | Conversation Context | Medium | Low | Nice-to-have |

---

## 11. Conclusion

ChatGPT's Ask ISA improvement prompt is well-researched and aligns with current RAG best practices. The seven goal qualities are sound, and the proposed Authoritative Evidence Layer is a valid architectural approach.

However, the implementation scope is ambitious and should be phased over 8-12 PRs rather than 4-6. The highest-impact improvements are hybrid search, claim-citation verification, and the evaluation harness.

The current Ask ISA implementation provides a solid foundation. With the recommended improvements, it can evolve into a production-grade, audit-ready RAG system that meets enterprise compliance requirements.

---

## References

[1] Orkes.io, "Best Practices for Production-Scale RAG Systems," February 2025. https://orkes.io/blog/rag-best-practices/

[2] Datadog, "Detect hallucinations in your RAG LLM applications," May 2025. https://www.datadoghq.com/blog/llm-observability-hallucination-detection/

[3] Zhou et al., "Trustworthiness in Retrieval-Augmented Generation Systems: A Survey," arXiv:2409.10102, September 2024. https://arxiv.org/abs/2409.10102

[4] Hwang et al., "Retrieval-augmented generation with estimation of source reliability," EMNLP 2025. https://aclanthology.org/2025.emnlp-main.1738/

[5] TensorLake, "Citation-Aware RAG: How to add Fine Grained Citations," September 2025. https://tensorlake.ai/blog/rag-citations

[6] Wang et al., "Searching for Best Practices in Retrieval-Augmented Generation," arXiv:2407.01219, July 2024. https://arxiv.org/abs/2407.01219



---

## Appendix A: Additional Research Findings

### A.1 Query Expansion Techniques

Query expansion is a technique to improve retrieval accuracy by enhancing the original query with additional contextually relevant terms [7]. Two primary approaches exist:

**Retriever-based expansion** uses the retrieval system itself to find related terms from the corpus. This is computationally efficient but limited to terms present in the knowledge base.

**Generation-based expansion** uses an LLM to generate alternative phrasings or hypothetical answers. This is more flexible but requires an additional LLM call.

For Ask ISA, generation-based expansion could significantly improve retrieval for technical queries where users may not use the exact terminology present in regulations.

### A.2 Multi-Turn Conversation Context

Research shows that "LLMs get lost in conversation, which materializes as a significant decrease in reliability as models struggle to maintain context across turns" [8]. The DH-RAG framework addresses this by creating dynamic historical context that evolves with the conversation [9].

The current Ask ISA implementation stores conversation history but does not use it for context-aware retrieval. Implementing conversation-aware retrieval would improve the user experience for follow-up questions.

### A.3 Continuous Improvement with User Feedback

A feedback-driven RAG system can "dynamically adjust search algorithms based on self-optimization inside AI Agents and optimize towards user feedback" [10]. The current Ask ISA has feedback buttons but does not use this data for system improvement.

Implementing a feedback loop would enable:
- Retrieval quality improvement based on user ratings
- Prompt tuning based on answer quality feedback
- Identification of knowledge gaps for content expansion

---

## Appendix B: Implementation Roadmap

Based on the analysis, here is a recommended implementation roadmap:

### Phase 1: Foundation (Weeks 1-4)
1. Implement hybrid search (Vector + BM25)
2. Add contextual chunk headers to embeddings
3. Create evaluation harness with golden set

### Phase 2: Reliability (Weeks 5-8)
4. Implement claim-citation verification
5. Add authority model (3-tier)
6. Implement evidence contract schema

### Phase 3: User Experience (Weeks 9-12)
7. Add query clarification for ambiguous queries
8. Implement graduated response modes
9. Add visual authority indicators in UI

### Phase 4: Advanced Features (Weeks 13-16)
10. Implement reranking layer
11. Add query expansion
12. Implement conversation-aware retrieval

### Phase 5: Continuous Improvement (Ongoing)
13. Implement feedback loop for retrieval tuning
14. Add semantic chunking
15. Expand golden set based on production queries

---

## Appendix C: Additional References

[7] Sahin, S., "Query Expansion in Enhancing Retrieval-Augmented Generation," Medium, November 2024. https://medium.com/@sahin.samia/query-expansion-in-enhancing-retrieval-augmented-generation-rag-d41153317383

[8] OpenAI Community, "Lost in conversation: All models get lost easily in multi-turn conversations," May 2025. https://community.openai.com/t/interesting-research-lost-in-conversation-all-models-get-lost-easily-in-multi-turn-conversations/1266901

[9] "DH-RAG: A dynamic historical context-powered retrieval-augmented generation method for multi-turn dialogue," arXiv:2502.13847, 2025. https://arxiv.org/abs/2502.13847

[10] Reddit r/Rag, "Use user feedback to improve RAG automatically," November 2024. https://www.reddit.com/r/Rag/comments/1guxabm/use_user_feedback_to_improve_rag_automatically/

