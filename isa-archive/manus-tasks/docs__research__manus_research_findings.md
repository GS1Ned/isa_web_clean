# Manus Best Practices Research - Findings Log

**Research Date:** 2025-12-17  
**Purpose:** Collect authoritative best practices for optimizing ISA development using Manus

---

## Official Manus Documentation

### Core Capabilities (Source: https://manus.im/docs/introduction/welcome)

**Key Differentiators:**
- Autonomous general AI agent designed to complete tasks and deliver results
- Operates in complete sandbox environment with:
  * Internet access
  * Persistent file system
  * Ability to install software and create custom tools
- Works independently without constant supervision
- Remembers context across long tasks
- Delivers production-ready results

**Positioning:**
- "Think of Manus AI as a virtual colleague with its own computer"
- "capable of planning, executing, and delivering complete work products from start to finish"
- Unlike traditional AI tools that require step-by-step guidance

---

## Research Sources to Explore

1. **Official Documentation:**
   - https://manus.im/docs/introduction/welcome ✅ VISITED
   - https://manus.im/docs/features/wide-research (parallel processing)
   - https://manus.im/docs/integrations/manus-api (API capabilities)

2. **Blog Posts & Technical Articles:**
   - https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus (Jul 2025)
   - https://skywork.ai/blog/ai-agent/prompt-engineering-manus-1-5-structure-guardrails-evaluation/

3. **Community Resources:**
   - https://github.com/hodorwang/manus-guide (community guide)
   - https://www.reddit.com/r/PromptEngineering/comments/1j7q4ki/manus_ai_prompts_and_tools_100_real/
   - https://medium.com/@niall.mcnulty/how-im-using-manus-966eac81e9e1

4. **Third-Party Analysis:**
   - https://www.singlegrain.com/digital-marketing/manus-ai-the-ultimate-guide-to-understanding-and-using-it/ (Apr 2025)
   - https://www.baytechconsulting.com/blog/manus-ai-an-analytical-guide-to-the-autonomous-ai-agent-2025 (May 2025)
   - https://gist.github.com/renschni/4fbc70b31bad8dd57f3370239dccd58f (technical investigation)

---

## Next Research Steps

1. Read Context Engineering blog post (official Manus engineering insights)
2. Explore Wide Research documentation (parallel processing patterns)
3. Review Skywork.ai prompt engineering guide (Manus 1.5 specific)
4. Analyze community guides for practical patterns
5. Extract ISA-relevant insights from third-party analyses


---

## Context Engineering Principles (Source: Official Manus Blog, July 2025)

**Article:** "Context Engineering for AI Agents: Lessons from Building Manus"  
**Author:** Yichao 'Peak' Ji (Manus Engineering)  
**URL:** https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus  
**Date:** July 18, 2025

### Core Philosophy

Manus chose **context engineering over model training** for faster iteration:
- Ship improvements in hours instead of weeks
- Keep product orthogonal to underlying models
- "If model progress is the rising tide, we want Manus to be the boat, not the pillar stuck to the seabed"
- Rebuilt agent framework 4 times through "Stochastic Gradient Descent" (experimental refinement)

### Principle 1: Design Around the KV-Cache

**Why it matters:**
- KV-cache hit rate is the single most important metric for production AI agents
- Directly affects latency and cost
- Manus average input-to-output ratio: 100:1 (context grows, output stays short)
- Claude Sonnet: cached tokens cost 0.30 USD/MTok vs 3 USD/MTok uncached (10x difference)

**Best practices:**
1. **Keep prompt prefix stable** - Even single-token differences invalidate cache
   - ❌ Don't include timestamps (especially second-precision) at beginning of system prompt
   - ✅ Keep system prompt static and deterministic

2. **Make context append-only** - Never modify previous actions/observations
   - ❌ Don't edit prior context entries
   - ✅ Ensure deterministic JSON serialization (stable key ordering)

3. **Mark cache breakpoints explicitly** - Account for cache expiration
   - Minimum: ensure breakpoint includes end of system prompt
   - Use session IDs to route requests consistently across distributed workers

### Principle 2: Mask, Don't Remove

**Problem:** Dynamic action spaces (adding/removing tools mid-iteration) cause issues:
1. Tool definitions live near front of context → changes invalidate KV-cache
2. Previous actions referencing removed tools confuse the model → schema violations

**Solution:** Context-aware state machine with logit masking
- Keep all tools defined in context
- Mask token logits during decoding to prevent/enforce certain actions
- Use response prefill to constrain action space without modifying tool definitions

**Three function calling modes (Hermes format):**
- Auto: Model may choose to call function or not
- Required: Model must call a function (unconstrained choice)
- Specified: Model must call function from specific subset

**Design pattern:** Consistent tool name prefixes (e.g., `browser_*`, `shell_*`) enable group-level constraints

### Principle 3: Use the File System as Context

**Problem:** 128K+ token context windows still insufficient for real-world agents:
1. Observations can be huge (web pages, PDFs)
2. Model performance degrades beyond certain context length
3. Long inputs expensive even with prefix caching

**Solution:** Treat file system as ultimate context
- Unlimited size, persistent by nature
- Model learns to write/read files on demand
- File system as structured, externalized memory

**Compression strategy:** Always restorable
- Web page content → keep URL (can re-fetch)
- Document contents → keep file path (can re-read)
- Never irreversible compression (can't predict which observation becomes critical 10 steps later)

**Vision:** Agentic State Space Models (SSMs) could succeed by mastering file-based memory instead of holding long-term state in context

### Principle 4: Manipulate Attention Through Recitation

**Observation:** Manus creates `todo.md` and updates it step-by-step during complex tasks

**Purpose:** Deliberate attention manipulation mechanism
- Typical task requires ~50 tool calls (long loop)
- Risk of drifting off-topic or forgetting earlier goals
- Rewriting todo list = reciting objectives into end of context
- Pushes global plan into model's recent attention span
- Avoids "lost-in-the-middle" issues
- Reduces goal misalignment using natural language

### Principle 5: Keep the Wrong Stuff In

**Philosophy:** Agents make mistakes - it's not a bug, it's reality

**Anti-pattern:** Hiding errors (clean trace, retry, reset state)
- Removes evidence
- Model can't adapt without evidence

**Best practice:** Leave failed actions in context
- Model sees failed action + resulting observation/stack trace
- Implicitly updates internal beliefs
- Shifts prior away from similar actions
- Reduces chance of repeating same mistake

**Key insight:** Error recovery is one of clearest indicators of true agentic behavior (underrepresented in academic benchmarks)

### Principle 6: Don't Get Few-Shotted

**Problem:** Few-shot prompting can backfire in agent systems
- LLMs are excellent mimics
- Context full of similar action-observation pairs → model follows pattern even when suboptimal
- Dangerous in repetitive tasks (e.g., reviewing 20 resumes → falls into rhythm)
- Leads to drift, overgeneralization, hallucination

**Solution:** Increase diversity
- Introduce structured variation in actions/observations
- Different serialization templates
- Alternate phrasing
- Minor noise in order/formatting
- Controlled randomness breaks patterns and tweaks attention

**Principle:** The more uniform your context, the more brittle your agent becomes

---

## ISA-Specific Implications

### Immediate Applications

1. **KV-Cache Optimization:**
   - Remove timestamps from system prompts (ISA likely has date/time in prompts)
   - Ensure JSON serialization is deterministic (check all data pipeline outputs)
   - Make context append-only (verify no retroactive edits in agent loops)

2. **File System as Memory:**
   - ISA already uses file system extensively (datasets, docs, schemas)
   - Formalize this as "externalized memory" pattern
   - Document compression strategies (e.g., "keep dataset ID, drop full content")

3. **Todo.md Pattern:**
   - ISA already uses todo.md extensively (good!)
   - Recognize this as attention manipulation, not just organization
   - Ensure todo.md is updated frequently during long tasks

4. **Error Preservation:**
   - Review ISA development logs - are errors being hidden?
   - Ensure failed ingestion attempts, schema mismatches, API errors stay in context
   - Document error recovery patterns for future reference

5. **Diversity in Repetitive Tasks:**
   - ISA has many repetitive patterns (ingestion scripts, schema updates, mapping generation)
   - Introduce variation in prompts/templates to avoid "few-shot rut"
   - Alternate phrasing when describing similar tasks

### Strategic Considerations

- ISA's long-horizon, regulatory-sensitive nature aligns perfectly with Manus's context engineering philosophy
- File system as memory is critical for ISA's scale (11K+ records, 178MB datasets)
- Error recovery especially important for data quality (ingestion failures, schema mismatches)
- Todo.md attention manipulation explains why ISA has been successful despite complexity


---

## Prompt Engineering for Manus 1.5 (Source: Skywork.ai, December 2025)

**Article:** "Prompt Engineering for Manus 1.5 (2025): Structure, Guardrails & Evaluation"  
**URL:** https://skywork.ai/blog/ai-agent/prompt-engineering-manus-1-5-structure-guardrails-evaluation/  
**Date:** December 2025  
**Note:** "Manus 1.5" is community shorthand for current Manus-style agents (not official version)

### 1. Modular Prompt Structure

**Five distinct blocks (keep versioned):**

1. **System:** Role, mission objective, non-negotiable guardrails
2. **Context:** Task brief, current plan snapshot, constraints, tool registry
3. **Step Policy:** Analyze → Plan → Act → Observe rules, logging, iteration limits
4. **Output Contracts:** Machine-checkable schemas for plan, action, observations, final answer
5. **Verification:** Post-conditions, self-checks, HALT/ESCALATE rules

**Why modular beats monolithic:**
- Tune single block without destabilizing rest
- Better maintainability and safety
- Easier versioning and A/B testing

**Template structure:**
```
[SYSTEM]
- Role and mission objective
- Hard guardrails (never execute without sandbox, never exfiltrate secrets/PII, pause for risky operations)

[CONTEXT]
- Brief: one-paragraph task
- Global plan artifact (pinned, kept short)
- Constraints: time, budget, data boundaries
- Tools: name, purpose, when-to-use, constraints

[STEP_POLICY]
- Iterate: Analyze → Plan → Act (max 1 tool call per loop) → Observe → Evaluate
- Always log: rationale, chosen tool, parameters, observation summary
- Escalate if plan diverges or uncertainty > threshold

[OUTPUT_CONTRACTS]
- Plan JSON, Action JSON, Observation JSON, Final JSON (with schemas)

[VERIFICATION]
- All claims backed by citations or tool outputs
- JSON conforms to schema
- No policy violations; else HALT
- If low confidence (<0.7), request human review
```

### 2. Context and Memory Engineering

**Practices that consistently help in production:**

1. **Pin a compact, living plan** - Keep minimal "plan artifact" in recency, update each loop
2. **Separate short-term from long-term memory** - Use retrieval for background; don't stuff entire docs in prompt
3. **One tool action per iteration** - Improves observability and rollback
4. **Declare tool catalogs with when-to-use rules** - Be explicit about latency/cost and safety boundaries

### 3. Guardrails (Layered Approach)

**Prompt-level:**
- Hard constraints in System
- Spell out prohibitions, approval requirements, HALT/ESCALATE conditions
- Adversarial hygiene: refuse instructions in untrusted inputs; summarize and sanitize before acting

**Tool sandboxing:**
- Scope file system, networking, APIs
- Whitelist parameters
- Enforce time/memory limits
- Require human approval for destructive actions
- Provide rollback paths

**Data access control:**
- RBAC, scoped credentials
- PII masking/redaction in outputs
- Log every retrieval and write

**Continuous monitoring:**
- Trace prompts, tool calls, outputs, latency, costs
- Alert on suspicious patterns (repeated failed tool calls, sudden refusal spikes)

**Red teaming:**
- Maintain library of jailbreaks/prompt injections
- Schedule exercises, treat findings as issues with owners and SLAs

### 4. Evaluation Blueprint

**Offline (pre-launch):**
1. Define task suites: correctness, schema adherence, tool selection accuracy, safety refusals
2. Create automated evals + small human-labeled set
3. A/B prompts: monolithic vs modular; vary guardrail strictness
4. Track: pass rate, latency, tokens, cost
5. Set promotion thresholds, freeze baseline

**Online (post-launch):**
1. Sample production traces: JSON validity, policy compliance, tool choice errors, hallucination heuristics
2. Route regressions into weekly triage with humans in loop
3. Only ship prompt changes that beat baseline

**Key metrics:**
- Task success rate (end-to-end) and step accuracy
- Tool precision/recall (correct tool chosen vs opportunities)
- Safety incident rate (blocked attacks, refusals, escalations)
- Latency per loop and tokens per successful task
- Cost per successful task

### 5. Troubleshooting Playbook

**Hallucinated tools or facts:**
- Add verification steps requiring citing tool outputs
- Narrow tool registry, add "do not guess" constraints
- Enforce one action per iteration; require rationale and parameter echoing

**Loop stalls or thrashing:**
- Add loop caps and explicit HALT conditions (no progress in N iterations)
- Surface current plan artifact, require updates each loop

**Context bloat and goal drift:**
- Aggressively prune history
- Keep only: plan artifact, last observation, essential constraints in recency
- Use retrieval for background

**Over-permissive tools:**
- Scope filesystem/network
- Require human approval for destructive endpoints
- Add rollback scripts

**Safety regressions:**
- Run adversarial input suite (jailbreaks, injections) through input filter
- Adjust prompt constraints accordingly

### 6. Implementation Checklist

**Structure:**
- [ ] Split prompts into 5 blocks (System, Context, Step policy, Output contracts, Verification)
- [ ] Define and pin compact plan artifact; update every loop
- [ ] Limit to one tool call per iteration, require rationale logging

**Guardrails:**
- [ ] System-level hard constraints; adversarial hygiene in inputs
- [ ] Strict tool sandboxing (FS/network scope, time/memory limits, approvals, rollback)
- [ ] RBAC and PII masking; full audit logs
- [ ] Monitoring with traces, alerts for anomalies

**Evaluation:**
- [ ] Offline task suite with automated checks; baseline saved
- [ ] Online sampling with regression gates; human review of flagged traces
- [ ] Metrics: success rate, tool precision/recall, safety incidents, latency/tokens, cost

---

## ISA-Specific Implications (Skywork Insights)

### Immediate Applications

1. **Modular Prompt Structure:**
   - ISA prompts should be factored into 5 blocks for maintainability
   - Especially important given ISA's complexity (standards ingestion, RAG, agentic loops)
   - Version each block separately for easier iteration

2. **Plan Artifact:**
   - ISA already uses todo.md extensively (good!)
   - Formalize as "pinned plan artifact" updated each loop
   - Keep compact (not exhaustive) for attention management

3. **One Tool Call Per Iteration:**
   - Review ISA's current agent loops - are they following this pattern?
   - Improves observability and rollback (critical for data quality)

4. **Tool Registry with When-to-Use Rules:**
   - Document ISA's tools (ingestion, mapping, validation, RAG) with explicit when-to-use guidance
   - Include latency/cost/safety boundaries

5. **Guardrails for Data Quality:**
   - ISA handles regulatory data (GS1, EFRAG, EU standards)
   - Implement PII masking/redaction (even though standards are public, may contain examples)
   - Log every retrieval and write for audit trail

6. **Evaluation Metrics:**
   - Define ISA-specific success metrics:
     * Ingestion accuracy (schema adherence)
     * Mapping correctness (standards alignment)
     * RAG retrieval precision/recall
     * Knowledge graph consistency
   - Establish baseline before making prompt changes

### Strategic Considerations

- ISA's long-horizon nature requires robust evaluation framework (not just ad-hoc testing)
- Modular prompts enable safer iteration on complex system
- Guardrails especially important for regulatory/standards context (can't afford hallucinations)
- One tool call per iteration aligns with ISA's need for traceability


---

## Wide Research: Parallel Multi-Agent Processing (Source: Official Manus Docs)

**Feature:** Wide Research  
**URL:** https://manus.im/docs/features/wide-research  
**Date:** Current (as of Dec 2025)

### What It Is

Manus's approach to handling tasks involving many similar items (analyzing 100 products, researching 50 companies, generating 20 pieces of content). Instead of single agent processing items sequentially, Wide Research deploys hundreds of independent agents working in parallel.

### The Context Window Problem

Traditional AI systems operate with fixed context window. When analyzing many items sequentially:
- Items 1-5: Detailed, thorough analysis with full context
- Items 10-20: Descriptions become shorter as context fills
- Items 30+: Generic summaries and increased errors as earlier context compressed/lost
- "Fabrication threshold" typically occurs around 8-10 items for most AI systems

### Architecture

1. **Task Decomposition:** Main agent analyzes request, breaks into independent sub-tasks
2. **Parallel Agent Deployment:** Each sub-task assigned to dedicated agent with own fresh context window
3. **Independent Processing:** Agents work simultaneously, each conducting thorough research without competing for context space
4. **Result Synthesis:** Main agent collects completed sub-tasks, assembles into requested format

**Result:** Item #250 receives same depth of analysis as item #1 (each has own dedicated agent and full context window)

### When to Use

**Perfect for:**
- Competitive intelligence (50+ competitors)
- Market research (100+ products)
- Academic research (30+ papers)
- Lead generation (200+ prospects)
- Content creation (20+ similar items)
- Data extraction (100+ pages)
- Batch processing (50+ images/files)

**Not ideal for:**
- Single deep-dive analysis (use regular agent mode)
- Tasks requiring sequential dependencies
- Real-time interactive research
- Tasks with fewer than 10 items

### Tips for Better Results

1. **Be specific about structure:** "Create table with columns: name, company, role, email, LinkedIn"
2. **Specify scale upfront:** "Analyze all 100 companies in this list"
3. **Describe desired output format:** "Organize in sortable spreadsheet with filters"
4. **Include evaluation criteria:** "Rate each product on: price, features, reviews, availability"

### Real-World Examples

- Researching 250 AI researchers (complete database with detailed profiles)
- Comparing 100 sneaker models (comprehensive market research table)
- Analyzing AGI timelines (30+ sources with visualization)
- Researching 20 biographies (comprehensive biographies with consistent structure)
- Batch editing 50 LinkedIn profile pics (consistent professional editing)
- Extracting GitHub prompt library (structured database of 100+ prompts)

---

## ISA-Specific Implications (Wide Research)

### Potential Applications

1. **Standards Ingestion at Scale:**
   - ISA currently processes standards one at a time
   - Wide Research could parallelize ingestion of multiple standards documents
   - Example: "Ingest all 50 GS1 GDSN attribute definitions and create structured schema"

2. **Cross-Standard Mapping:**
   - Generate mappings between ISA and multiple external standards simultaneously
   - Example: "Map ISA core schema to GS1, EFRAG, and EU Taxonomy in parallel"

3. **Validation Across Multiple Standards:**
   - Validate ISA data against multiple regulatory frameworks simultaneously
   - Example: "Validate this product dataset against 20 different regulatory requirements"

4. **Comparative Analysis:**
   - Compare how different standards handle similar concepts
   - Example: "Analyze how 30 different sustainability standards define 'carbon footprint'"

5. **Batch Data Quality Checks:**
   - Process large datasets with parallel quality validation
   - Example: "Validate 200 product records against ISA schema and regulatory requirements"

### Considerations

- ISA's current scale (11K+ records) could benefit from parallel processing
- Standards ingestion is currently sequential - could be parallelized
- Need to ensure consistency across parallel agents (schema validation, terminology)
- Wide Research best for independent items - ISA may have dependencies between standards
- Consider for future scaling when processing thousands of standards documents
