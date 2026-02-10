# Feasibility Analysis: Research Findings

**Research Date:** 2025-12-19  
**Purpose:** Gather evidence on AI reasoning limitations and data quality constraints to inform feasibility assessment

---

## Key Research Findings

### 1. AI Reasoning Limitations (Apple Research, June 2025)

**Source:** "The Illusion of Thinking: Understanding the Strengths and Limitations of Reasoning Models via the Lens of Problem Complexity" [1]

**Critical Findings:**

1. **Complete Accuracy Collapse Beyond Certain Complexities**
   - Frontier Large Reasoning Models (LRMs) experience "complete accuracy collapse" when problem complexity exceeds certain thresholds
   - This is not gradual degradation—it is catastrophic failure

2. **Counter-Intuitive Scaling Limits**
   - Reasoning effort increases with problem complexity up to a point
   - Then *declines* despite having adequate token budget
   - Models appear to "give up" on hard problems rather than continue reasoning

3. **Three Performance Regimes Identified**
   - **Low-complexity tasks:** Standard LLMs surprisingly *outperform* reasoning models
   - **Medium-complexity tasks:** Reasoning models show advantage
   - **High-complexity tasks:** Both model types experience complete collapse

4. **Fundamental Limitations in Exact Computation**
   - Models fail to use explicit algorithms
   - Reasoning is inconsistent across similar puzzles
   - Cannot reliably perform multi-step logical operations at scale

**Implications for ISA:**
- Standards development involves high-complexity reasoning (multi-stakeholder trade-offs, cascading implications, regulatory constraints)
- Risk of catastrophic failure in precisely the scenarios where ISA would be most valuable
- Cannot assume "more reasoning tokens = better performance" for complex standards questions

### 2. Data Quality as Primary Constraint

**Sources:** Multiple enterprise AI adoption studies [2][3][4]

**Critical Findings:**

1. **Data Quality and Availability = Top Barrier to AI Adoption**
   - PEX Report 2025/26: Data quality and availability are the *greatest* barriers to AI adoption in enterprises
   - Not compute, not algorithms—data quality

2. **Six Dimensions of Data Quality Impact ML Performance**
   - Completeness, accuracy, consistency, timeliness, validity, uniqueness
   - Poor quality in any dimension severely affects training and accuracy
   - Effects are non-linear and often catastrophic

3. **Enterprise AI Projects Fail Due to Data Difficulties**
   - IT leaders consistently cite data practices as primary obstacle
   - Complexity is increasing, not decreasing
   - "Good data practices" are necessary but not sufficient

**Implications for ISA:**
- GS1 standards data is heterogeneous: meeting transcripts, comment submissions, technical specifications, pilot reports
- No standardized format or quality assurance
- Historical data may be incomplete or inaccessible
- Training data requirements may exceed what is realistically available

### 3. AI Hallucination Risks in High-Stakes Domains

**Sources:** Legal and compliance research [5][6]

**Critical Findings:**

1. **Public AI Trained on Unreliable Content Fails Professional Standards**
   - AI trained on internet content does not meet legal/professional standards
   - Professional-grade AI requires vetted, domain-specific training data

2. **Hallucinations Are Not "Errors"—They Are Fabrications**
   - AI generates outputs not based on training data
   - Presented with false confidence
   - Particularly dangerous in compliance and standards contexts

3. **Guardrails Are Necessary But Not Sufficient**
   - Content quality determines reliability more than architecture
   - Even with guardrails, unreliable training data = unreliable outputs

**Implications for ISA:**
- Standards development is high-stakes: incorrect guidance could lead to non-compliant implementations
- False confidence in AI-generated analysis could undermine stakeholder trust
- Legal and regulatory implications of AI-assisted standards decisions

---

## References

[1]: https://machinelearning.apple.com/research/illusion-of-thinking "Apple Machine Learning Research: The Illusion of Thinking (June 2025)"
[2]: https://www.aidataanalytics.network/data-science-ai/news-trends/data-quality-availability-top-list-of-ai-adoption-barriers "Data quality & availability top list of AI adoption barriers (Oct 2025)"
[3]: https://www.ciodive.com/news/data-process-approach-strategy-AI-project-success/802142/ "Data difficulties still prevent enterprise AI project success (Oct 2025)"
[4]: https://www.sciencedirect.com/science/article/pii/S0306437925000341 "The effects of data quality on machine learning performance (2025)"
[5]: https://legal.thomsonreuters.com/blog/when-ai-hallucinations-hit-the-courtroom-why-content-quality-determines-ai-reliability-in-legal-practice/ "AI hallucinations in court: Why content quality matters (Oct 2025)"
[6]: https://www.deloitte.com/ch/en/services/consulting/perspectives/ai-hallucinations-new-risk-m-a.html "AI doesn't lie, it hallucinates and M&A due diligence must adapt (Dec 2025)"
