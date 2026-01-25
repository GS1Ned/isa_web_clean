# RAG Best Practices Research Notes

## Source: "Searching for Best Practices in Retrieval-Augmented Generation" (Wang et al., 2024)
- arXiv:2407.01219, cited 233+ times
- Comprehensive study on optimal RAG practices

## Key RAG Workflow Steps Identified:
1. **Query Classification** - Determining whether retrieval is necessary
2. **Retrieval** - Efficiently obtaining relevant documents
3. **Reranking** - Refining order of retrieved documents by relevance
4. **Repacking** - Organizing documents into structured format
5. **Summarization** - Extracting key information, eliminating redundancies
6. **Response Generation** - From repacked/summarized content

## Critical Decisions in RAG Implementation:
- How to split documents into chunks
- Types of embeddings to use for semantic representation
- Choice of retrieval algorithms
- Balance between performance and efficiency

## Observations from Paper Abstract:
- RAG effective for: up-to-date information, mitigating hallucinations, enhancing response quality
- Challenge: complex implementation and prolonged response times
- Solution: identify optimal combinations of RAG approaches

---

## Additional Research Findings (to be expanded):

### Hallucination Prevention in RAG:
- RAG does NOT fully prevent hallucinations
- LLMs can still fabricate responses while citing sources
- Need for explicit citation verification mechanisms

### Production RAG Best Practices:
- Hybrid search (lexical + vector) improves retrieval
- Contextual headers enhance chunk understanding
- Semantic chunking over fixed-size chunking
- Evaluation harness essential for quality assurance



---

## Source: Orkes.io - "Best Practices for Production-Scale RAG Systems" (Feb 2025)

### Common Issues in RAG Systems:
1. **Documents lose context when chunked** - affects retrieval and response quality
2. **Vector embeddings are inherently lossy** - may miss exact lexical matches

### Best Practices Identified:

#### 1. Re-introduce Context
- **Contextual chunk headers**: Prepend chunks with document/section titles
- **Anthropic's contextual retrieval**: Generate AI summaries of chunk's relation to whole document

#### 2. Semantic Chunking
- Split by meaning, not fixed size
- Compare semantic similarity of adjacent sentences
- Use breakpoint threshold for splitting
- Maintains semantic integrity for accurate retrieval

#### 3. Hybrid Search
- Combine keyword-based (BM25) + vector search
- BM25 compensates for lossy nature of vector search
- Covers both semantic and lexical matching

#### 4. Reranking
- Two-stage retrieval process:
  1. Embedding model retrieves initial subset (fast)
  2. Reranker refines and re-orders results (accurate)
- Balances accuracy and speed

---

## Relevance to Ask ISA Analysis:

### Current Ask ISA vs Best Practices:

| Best Practice | Current Ask ISA Status | Gap |
|---------------|----------------------|-----|
| Contextual chunk headers | Uses title/description only | Missing document context |
| Semantic chunking | Fixed chunking | Could improve |
| Hybrid search | Vector-only | Missing BM25/keyword |
| Reranking | Not implemented | Opportunity |
| Citation verification | Basic validation | Needs strengthening |



---

## Source: "Trustworthiness in RAG Systems: A Survey" (Zhou et al., 2024)
- arXiv:2409.10102, cited 112+ times
- Comprehensive framework for RAG trustworthiness

### Six Key Dimensions of RAG Trustworthiness:

1. **Factuality** - Accuracy of generated content
2. **Robustness** - Resistance to adversarial inputs and noise
3. **Fairness** - Unbiased responses across different queries
4. **Transparency** - Clear provenance and reasoning
5. **Accountability** - Traceable decisions and citations
6. **Privacy** - Protection of sensitive information

### Key Insights:
- RAG can mitigate hallucination by providing up-to-date knowledge
- Risk: generating undesirable content if retrieved info is inappropriate or poorly utilized
- Need for unified framework to assess trustworthiness

---

## Source: "Citation-Aware RAG" (TensorLake, 2025)
- Focus on fine-grained citations linking to exact source locations

### Key Concepts:
- **Field-level citations** - Each extracted value linked to source
- **Page/bbox citations** - Precise location in documents
- **Traceable context** = Trustworthy RAG

---

## Source: "RAG with Estimation of Source Reliability" (Hwang et al., 2025)
- Multi-source RAG framework accounting for source reliability
- Models source reliability using statistical priors
- Addresses authority bias in RAG systems

