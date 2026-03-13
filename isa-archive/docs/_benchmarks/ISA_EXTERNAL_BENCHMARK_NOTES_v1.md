# ISA_EXTERNAL_BENCHMARK_NOTES_v1
Last verified: 2026-01-28

Scope: current (currency-verified) external reference points to benchmark ISA’s architecture, grounding, evaluation, and agent/workflow approach.

## 1) Grounding, retrieval, and citations (official vendor docs)

### OpenAI (hosted tools + retrieval)
- File Search tool guide (Responses API): https://platform.openai.com/docs/guides/tools-file-search
- Retrieval guide (vector stores): https://platform.openai.com/docs/guides/retrieval
- Responses API reference: https://platform.openai.com/docs/api-reference/responses
- Vector stores API reference: https://platform.openai.com/docs/api-reference/vector-stores
- Cookbook: RAG on PDFs using File Search: https://developers.openai.com/cookbook/examples/file_search_responses/
- Guide: Optimizing LLM accuracy (covers prompt vs RAG vs fine-tuning tradeoffs): https://platform.openai.com/docs/guides/optimizing-llm-accuracy
- Guide: Deep research (agentic research + connectors/tooling): https://platform.openai.com/docs/guides/deep-research

### Google (Gemini grounding)
- Vertex AI grounding overview: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/grounding/overview
- Grounding with your search API: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/grounding/grounding-with-your-search-api
- Firebase AI Logic: Grounding with Google Search: https://firebase.google.com/docs/ai-logic/grounding-google-search
- Google blog: Gemini API File Search Tool (managed RAG): https://blog.google/innovation-and-ai/technology/developers-tools/file-search-gemini-api/

### Anthropic (citations)
- Anthropic blog: Introducing Citations on the Anthropic API: https://claude.com/blog/introducing-citations-api

## 2) Agent/workflow patterns and evaluation tooling

### LangGraph / LangChain OSS docs
- LangGraph workflow vs agent patterns: https://docs.langchain.com/oss/python/langgraph/workflows-agents

### RAG evaluation tooling
- Ragas docs: LangGraph agent evaluation how-to: https://docs.ragas.io/en/stable/howtos/integrations/_langgraph_agent_evaluation/

## 3) What to extract from these sources for ISA

### A. Grounding & evidence binding
- Canonical “citation object” model (what a citation contains; how it links to a chunk / doc / version)
- Retrieval controls: top-k, filters, reranking, latency vs quality tradeoffs
- Freshness mechanics: live web / search grounding vs curated corpora

### B. Evaluation & continuous validation
- Minimal evaluation harness: dataset -> retrieval metrics -> answer faithfulness -> regression gating
- Agent evaluation: tool-call correctness + trace replay + drift detection

### C. Operational patterns
- Cost controls: index once, query cheap; cache; adaptive retrieval
- Safety/compliance controls: whitelisted sources + audit trails

## 4) Fit-to-ISA adoption candidates (to decide in Critical Path)

- Introduce an explicit citation schema for ISA outputs (document_id, version, location, retrieved_span, retrieved_at, authority_tier).
- Add a minimal “RAG regression suite” (golden Q&A + required citations) to run in CI or nightly.
- Adopt a workflow/agent split: deterministic pipelines for ingestion/mapping; agentic only for scoped research tasks with strict stops.
