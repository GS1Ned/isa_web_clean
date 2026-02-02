/**
 * Ask ISA Cite-then-Write Module
 * Version: 1.0
 * Last Updated: February 2, 2026
 * 
 * Purpose: Implement the Cite-then-Write paradigm for compliance-grade RAG
 * 
 * Architecture:
 * The Cite-then-Write approach reverses the traditional RAG generation flow:
 * 1. First, extract and cite specific passages from sources
 * 2. Then, synthesize an answer using ONLY the cited passages
 * 
 * Benefits:
 * - Eliminates hallucination by grounding every claim in explicit evidence
 * - Improves citation precision (citations are selected before writing)
 * - Enables verification (each claim can be traced to a specific passage)
 * - Supports compliance requirements (audit trail of evidence)
 */

/**
 * Cite-then-Write Step Policy
 * 
 * This policy instructs the model to:
 * 1. First identify and quote relevant passages
 * 2. Then synthesize an answer using only those passages
 */
export const CITE_THEN_WRITE_STEP_POLICY = `**Cite-then-Write Process:**

You MUST follow this two-phase approach for EVERY response:

**PHASE 1: CITE (Evidence Extraction)**

Before writing ANY answer, you must first extract relevant evidence from the provided sources.

For each source that contains relevant information:
1. Identify the specific passage(s) that address the user's question
2. Quote the passage verbatim (or near-verbatim)
3. Note the source number

Format your evidence extraction as:

<evidence>
[Source 1] "Exact quote from source 1 that is relevant to the question."
[Source 2] "Exact quote from source 2 that provides additional context."
[Source 3] "Exact quote from source 3 with specific data or requirements."
</evidence>

**Rules for Evidence Extraction:**
- Extract 3-5 passages per response (more for complex questions)
- Each passage should be 1-3 sentences (not entire paragraphs)
- Prefer passages with specific facts, numbers, or requirements
- If no relevant passages exist, state: "No relevant evidence found in provided sources."

**CRITICAL: Diversity Requirements**
- You MUST use passages from at least 2 different sources (unless only 1 source is relevant)
- Actively seek CONTRASTING or COMPLEMENTARY perspectives from different sources
- If sources disagree, extract BOTH viewpoints and note the disagreement
- Do NOT rely on a single source for >60% of your evidence

**Conflict Detection:**
- If two sources provide conflicting information, extract BOTH passages
- In your answer, explicitly acknowledge the conflict: "Source X states [...], while Source Y indicates [...]"
- When conflicts exist, prefer the source with higher authority (regulations > guidance > informational)

**PHASE 2: WRITE (Synthesis)**

After extracting evidence, synthesize your answer using ONLY the extracted passages.

**Critical Rules:**
- EVERY factual claim must come from an extracted passage
- EVERY sentence with facts must end with [Source N]
- You may NOT add information that is not in the extracted passages
- You may paraphrase, but the meaning must be preserved
- You may add structure (headings, lists) to improve readability

Format your synthesis as:

<answer>
Your synthesized answer here, with [Source N] citations at the end of each sentence.
</answer>

**PHASE 3: VERIFY (Self-Check)**

Before finalizing, verify:
1. Does every factual claim trace back to an extracted passage?
2. Does every sentence with facts have a [Source N] citation?
3. Did I add any information not present in the sources?
4. Did I use at least 2 different sources (if available)?
5. If sources conflict, did I acknowledge the disagreement?

If ANY verification fails, revise your answer before responding.

**Complete Response Format:**

<evidence>
[Source N] "Quoted passage 1"
[Source N] "Quoted passage 2"
...
</evidence>

<answer>
Synthesized answer with [Source N] citations.
</answer>`;

/**
 * Compact version for token-constrained scenarios
 */
export const CITE_THEN_WRITE_COMPACT = `**Process:** 
1. CITE: Extract relevant quotes from sources (2-5 passages)
2. WRITE: Synthesize answer using ONLY extracted quotes
3. VERIFY: Ensure every claim has a citation

Format: <evidence>[Source N] "quote"</evidence> then <answer>response with [Source N]</answer>`;

/**
 * Evidence extraction prompt for structured output
 */
export const EVIDENCE_EXTRACTION_PROMPT = `Extract the most relevant passages from the provided sources that address the user's question.

For each relevant passage:
- Quote the exact text (1-3 sentences)
- Note the source number
- Rate relevance (high/medium/low)

Output as JSON:
{
  "passages": [
    {
      "sourceNumber": 1,
      "quote": "Exact quoted text",
      "relevance": "high",
      "topic": "Brief topic label"
    }
  ],
  "totalRelevantPassages": 3,
  "coverageAssessment": "The sources fully/partially/minimally cover the question"
}`;

/**
 * Synthesis prompt that uses extracted evidence
 */
export const SYNTHESIS_FROM_EVIDENCE_PROMPT = `Using ONLY the extracted evidence passages below, synthesize a comprehensive answer to the user's question.

**Rules:**
1. Every factual claim must come from an extracted passage
2. Every sentence with facts must end with [Source N]
3. Do not add information not present in the passages
4. You may paraphrase but must preserve meaning
5. Structure the answer for clarity (headings, lists if appropriate)

**Extracted Evidence:**
{evidence}

**User Question:**
{question}

**Synthesized Answer:**`;

/**
 * Verification checklist for Cite-then-Write responses
 */
export const CITE_THEN_WRITE_VERIFICATION = `**Cite-then-Write Verification Checklist:**

Before submitting your response, verify:

□ Evidence Extraction
  - Did I extract 2-5 relevant passages?
  - Are the quotes accurate (verbatim or near-verbatim)?
  - Do the passages cover the key aspects of the question?

□ Synthesis Quality
  - Does every factual sentence have a [Source N] citation?
  - Does every claim trace back to an extracted passage?
  - Did I avoid adding information not in the sources?

□ Answer Completeness
  - Does the answer directly address the user's question?
  - Is the answer structured clearly?
  - Are there actionable next steps (if applicable)?

□ Confidence Assessment
  - Is my confidence in this answer above 70%?
  - If not, did I add a confidence disclaimer?

If any check fails, revise before submitting.`;

/**
 * Parse evidence from a Cite-then-Write response
 */
export function parseEvidence(response: string): Array<{
  sourceNumber: number;
  quote: string;
}> {
  const evidenceMatch = response.match(/<evidence>([\s\S]*?)<\/evidence>/);
  if (!evidenceMatch) return [];
  
  const evidenceBlock = evidenceMatch[1];
  const passages: Array<{ sourceNumber: number; quote: string }> = [];
  
  // Match patterns like [Source 1] "quote" or [Source 1] 'quote'
  const regex = /\[Source\s*(\d+)\]\s*["']([^"']+)["']/g;
  let match;
  
  while ((match = regex.exec(evidenceBlock)) !== null) {
    passages.push({
      sourceNumber: parseInt(match[1], 10),
      quote: match[2].trim(),
    });
  }
  
  return passages;
}

/**
 * Parse answer from a Cite-then-Write response
 */
export function parseAnswer(response: string): string {
  const answerMatch = response.match(/<answer>([\s\S]*?)<\/answer>/);
  return answerMatch ? answerMatch[1].trim() : response;
}

/**
 * Verify that all citations in the answer trace back to extracted evidence
 */
export function verifyCitationTraceability(
  answer: string,
  evidence: Array<{ sourceNumber: number; quote: string }>
): {
  valid: boolean;
  citedSources: number[];
  evidenceSources: number[];
  missingEvidence: number[];
  unusedEvidence: number[];
} {
  // Extract source numbers cited in the answer
  const citationRegex = /\[Source\s*(\d+)\]/g;
  const citedSources = new Set<number>();
  let match;
  
  while ((match = citationRegex.exec(answer)) !== null) {
    citedSources.add(parseInt(match[1], 10));
  }
  
  // Get source numbers from evidence
  const evidenceSources = new Set(evidence.map(e => e.sourceNumber));
  
  // Find citations without evidence
  const missingEvidence = Array.from(citedSources).filter(s => !evidenceSources.has(s));
  
  // Find evidence not cited
  const unusedEvidence = Array.from(evidenceSources).filter(s => !citedSources.has(s));
  
  return {
    valid: missingEvidence.length === 0,
    citedSources: Array.from(citedSources),
    evidenceSources: Array.from(evidenceSources),
    missingEvidence,
    unusedEvidence,
  };
}

/**
 * Calculate citation precision for a Cite-then-Write response
 */
export function calculateCitationPrecision(
  answer: string,
  evidence: Array<{ sourceNumber: number; quote: string }>
): number {
  const verification = verifyCitationTraceability(answer, evidence);
  
  if (verification.citedSources.length === 0) return 0;
  
  const traceable = verification.citedSources.filter(
    s => verification.evidenceSources.includes(s)
  ).length;
  
  return traceable / verification.citedSources.length;
}
