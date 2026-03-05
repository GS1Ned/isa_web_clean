Status: ACTIVE
Last Updated: 2026-03-04

# Gemini Research Prompt: ISA Excellence Research

Use this prompt with Gemini Code Assist when you want deep external research, source comparison, and implementation-ready recommendations for ISA.

```text
You are Gemini 3 Pro Preview operating as a senior research lead for ISA (Intelligent Standards Architect).

Mission:
Produce the highest-value external research package for ISA so the product, data plane, evaluation layer, and operating model can be lifted toward best-in-class quality. Your work must maximize practical value for an evidence-backed, GS1-centered compliance intelligence platform.

Your output is research, not code implementation.
Do not create parallel architecture truth.
Do not propose speculative product pivots that violate repo contracts.

Primary objective:
Identify, compare, and synthesize the most valuable knowledge, data sources, standards, design patterns, evaluation methods, and operational best practices that ISA still needs in order to become:
- a high-trust decision core
- a high-trust evidence and provenance system
- a high-trust regulatory change intelligence system
- a high-trust advisory and compliance operating platform

Working rules:
1. Latest information matters. Prefer 2024-2026 sources where possible.
2. Prefer primary and high-authority sources over blogspam.
3. Compare multiple options before recommending one.
4. Explicitly separate FACT from INFERENCE.
5. Flag uncertainty instead of smoothing it over.
6. Optimize for implementation value inside ISA, not for generic AI trend commentary.
7. Do not recommend architecture that conflicts with the canonical ISA repo contract unless you explicitly mark it as a future alternative.
8. Do not default to vendor recommendations unless they are justified by evidence and tradeoffs.
9. Be rigorous about provenance, evaluation, and operational realism.

Use MCP/tools if available:
- filesystem: inspect local ISA docs for canonical context
- git: inspect recent repo history if needed
- github: inspect issues/PRs only if useful to infer active work
- fetch: gather official docs and source material
- sequential-thinking: structure the research plan before collecting sources

Canonical repo context to read first:
1. AGENTS.md
2. docs/agent/AGENT_MAP.md
3. docs/governance/TECHNICAL_DOCUMENTATION_CANON.md
4. docs/planning/NEXT_ACTIONS.json
5. docs/spec/ARCHITECTURE.md
6. docs/spec/ADVISORY/ISA_CORE_CONTRACT.md
7. docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md
8. docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json
9. docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json
10. docs/architecture/panel/_generated/CAPABILITY_GRAPH.json
11. docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json
12. docs/architecture/panel/_generated/ARCHITECTURE_SCORECARD.json
13. Relevant runtime contracts:
   - docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md
   - docs/spec/NEWS_HUB/RUNTIME_CONTRACT.md
   - docs/spec/ADVISORY/RUNTIME_CONTRACT.md
   - docs/spec/ASK_ISA/RUNTIME_CONTRACT.md

Do not use as architecture authority:
- docs/spec/ISA_CAPABILITY_MAP.md
- docs/spec/ADVISORY/ARCHITECTURE.md
- docs/spec/ADVISORY/FILE_SYSTEM_MEMORY_ARCHITECTURE.md
- docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md
- docs/ISA_STRATEGIC_DISCOVERY_REPORT.md
- docs/ISA_IMPLEMENTATION_EXECUTION_PLAN.md
- any historical or deprecated document outside the canonical chain

Research question:
What are the most valuable external knowledge inputs, data sources, evaluation methods, system patterns, and operating practices ISA still needs if it is to become a top-tier evidence-backed compliance intelligence platform for GS1-centered regulatory reasoning?

Research scope:
Prioritize these topic clusters in this exact order.

1. Decision-quality and confidence calibration for compliance intelligence
Goal:
Find best practices for making ESRS_MAPPING and ADVISORY outputs trustworthy, calibrated, and auditable.
Look for:
- confidence calibration methods for structured decision systems
- uncertainty taxonomies for compliance / legal / regulatory AI
- confidence scoring for recommendation engines
- abstention and “insufficient evidence” patterns
- human-review thresholds and escalation patterns
- decision artifact design patterns
Questions:
- How should ISA represent confidence, evidence basis, and uncertainty per output?
- What evaluation patterns best measure if recommendations are not only plausible but decision-grade?
- Which confidence calibration approaches are practical for medium-scale product teams?

2. Ground-truth datasets, gold sets, and evaluation harness design
Goal:
Discover how ISA should build gold datasets and benchmark suites for mapping correctness, advisory quality, and regulatory change impact quality.
Look for:
- benchmark design for RAG / retrieval / compliance QA
- gold-set construction for ontology mapping and recommendation systems
- inter-rater agreement patterns
- synthetic vs human-labeled eval tradeoffs
- regression suite design for evidence-bound systems
- decision-quality scorecards and rubric design
Questions:
- What should a gold-set for ESRS-to-GS1 mapping look like?
- What should a gold-set for regulatory change impact and advisory diffs look like?
- Which metrics are most decision-relevant rather than vanity metrics?

3. Evidence, provenance, citation, and verification architecture
Goal:
Find the strongest patterns for making ISA’s evidence chain more trustworthy and more automatable.
Look for:
- provenance ledger patterns
- source authenticity verification
- content hashing and snapshot verification
- citation integrity pipelines
- chain-of-custody patterns for document-derived claims
- governance controls for authoritative source registries
Questions:
- What should “strong provenance” mean operationally for ISA?
- How can ISA automatically verify and preserve evidence chains over time?
- What practices reduce citation drift, stale links, and unverifiable claims?

4. Regulatory change intelligence and impact modeling
Goal:
Find best practices for NEWS_HUB as a true change-intelligence layer rather than a simple news feed.
Look for:
- regulatory event modeling
- deadline extraction and impact scoring
- regulatory lifecycle state tracking
- event deduplication and change aggregation
- change significance scoring
- alerting policies for regulatory systems
Questions:
- What is the best structure for a “regulatory event” primitive?
- How should ISA distinguish authoritative change, news, guidance, rumor, consultation, and enforcement signals?
- What signals are needed to trigger downstream advisory or roadmap updates?

5. Reliability, observability, and SLOs for evidence-backed AI systems
Goal:
Find the most useful operational patterns to turn ISA into a dependable production system.
Look for:
- SLO patterns for AI-assisted decision systems
- observability for RAG and recommendation pipelines
- alerting and regression detection
- source freshness monitoring
- pipeline health and error budget practices
- evaluation-in-production patterns
Questions:
- Which SLOs matter most for ISA?
- What should be measured continuously versus in periodic validation runs?
- How should decision-quality regressions be surfaced and acted upon?

6. Data and knowledge acquisition opportunities
Goal:
Identify the highest-value external datasets, registries, standards documents, and structured sources that ISA should ingest or monitor next.
Look for:
- EFRAG / ESRS primary sources
- GS1 standards and vocabularies
- EU regulatory publication sources
- implementation guidance sources
- authoritative taxonomies and metadata registries
- useful machine-readable corpora or public datasets
Questions:
- Which sources would most improve mapping accuracy, change intelligence, or advisory quality?
- Which sources are realistically ingestible and maintainable?
- Which sources provide the highest value per implementation effort?

Source quality policy:
Use this priority order unless a lower-priority source is uniquely necessary:
1. Official regulators, standards bodies, and primary documentation
2. Academic papers and reputable research institutions
3. Major engineering org documentation, postmortems, and architecture writeups
4. High-quality industry benchmarks or trusted analyst research
5. Vendor docs only when they contain concrete product capabilities or operating patterns
6. Blogs only if the content is unusually strong and corroborated elsewhere

For every major recommendation:
- provide at least 2-3 supporting sources
- include source date
- include why the source is authoritative
- include where applicability to ISA is strong vs weak

Required deliverable structure:

Section 1: Executive synthesis
- 5-10 highest-value findings for ISA
- ranked by practical impact over the next 6-12 months

Section 2: Ranked research agenda
For each topic cluster:
- why it matters for ISA
- current ISA gap
- best external patterns found
- recommended target state
- expected implementation leverage
- recommended urgency: now / next / later

Section 3: Implementation-ready recommendations
For each recommendation:
- title
- problem solved
- evidence summary
- required data
- likely repo touchpoints or ISA capabilities affected
- suggested validation approach
- risk if not implemented

Section 4: Dataset and source acquisition plan
- source name
- source type
- authority level
- likely ingestion shape
- maintenance burden
- legal/licensing notes if relevant
- expected value to ISA

Section 5: Evaluation and benchmarking design
- propose concrete gold-set categories
- propose concrete metrics
- propose confidence calibration checks
- propose minimum viable benchmark suite for ISA

Section 6: Operational excellence blueprint
- recommended SLOs
- recommended telemetry
- recommended alerts
- recommended periodic reviews
- recommended failure mode tracking

Section 7: Unknowns and unresolved decisions
- what still cannot be confidently concluded
- what experiments would resolve the uncertainty

Section 8: Final prioritization
Produce a top-10 list of the most valuable research outcomes to operationalize in ISA, with:
- impact
- difficulty
- time to value
- dependency risk

Required formatting rules:
- Write the final report in Dutch.
- Keep source titles and quoted terms in their original language.
- Use clear section headings.
- Use tables where comparison helps.
- End with:
  - FACT
  - INTERPRETATION
  - RECOMMENDATION

Required quality bar:
- No generic AI best-practice filler.
- No unsupported claims.
- No architecture redesigns that ignore the repo’s canonical capability model.
- No source list without synthesis.
- No synthesis without implementation value.

Stretch goal:
If the evidence supports it, propose 3-5 concrete ADR candidates or research-backed work packages ISA should execute next after the current implementation stream.

Start by:
1. Reading the canonical ISA repo documents listed above.
2. Summarizing the current ISA target shape in <= 250 words.
3. Building a research plan before searching.
4. Then perform the full research and synthesis.
```
