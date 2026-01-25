/**
 * Ask ISA Guardrails
 *
 * Enforces query type validation and refusal patterns for out-of-scope questions.
 * Based on ASK_ISA_GUARDRAILS.md and ASK_ISA_QUERY_LIBRARY.md
 */

export type QueryType =
  | "gap"
  | "mapping"
  | "version_comparison"
  | "dataset_provenance"
  | "recommendation"
  | "coverage"
  | "forbidden";

export interface QueryClassification {
  type: QueryType;
  allowed: boolean;
  reason?: string;
  suggestedAlternative?: string;
}

/**
 * Classify a query to determine if it's allowed or forbidden
 */
export function classifyQuery(question: string): QueryClassification {
  const lowerQuestion = question.toLowerCase();

  // Forbidden patterns - General ESG explanations
  const generalESGPatterns = [
    /what is (csrd|esrs|eudr|dpp|espr|ppwr)/i,
    /explain (csrd|esrs|eudr|dpp|sustainability)/i,
    /tell me about (sustainability|esg|csrd)/i,
    /define (csrd|esrs|carbon footprint)/i,
  ];

  for (const pattern of generalESGPatterns) {
    if (pattern.test(question)) {
      return {
        type: "forbidden",
        allowed: false,
        reason: "General ESG explanations are out of scope",
        suggestedAlternative:
          "Try asking about specific gaps, mappings, or recommendations in ISA advisory (e.g., 'Which gaps exist for CSRD in DIY?')",
      };
    }
  }

  // Forbidden patterns - Hypothetical questions
  const hypotheticalPatterns = [
    /what should gs1/i,
    /should gs1 (nl|netherlands|adopt|implement)/i,
    /what would happen if/i,
    /what if gs1/i,
  ];

  for (const pattern of hypotheticalPatterns) {
    if (pattern.test(question)) {
      return {
        type: "forbidden",
        allowed: false,
        reason: "Hypothetical questions are not supported",
        suggestedAlternative:
          "ISA can cite existing recommendations only. Try asking 'What are the short-term recommendations for [sector]?'",
      };
    }
  }

  // Forbidden patterns - Speculative questions
  const speculativePatterns = [
    /will gs1 (nl|netherlands)/i,
    /in (2026|2027|2028|next year)/i,
    /future (of|trends|developments|regulations)/i,
    /predict/i,
    /what will happen/i,
  ];

  for (const pattern of speculativePatterns) {
    if (pattern.test(question)) {
      return {
        type: "forbidden",
        allowed: false,
        reason: "Speculative questions are not supported",
        suggestedAlternative:
          "ISA can cite regulatory change log entries only. Try asking 'What changed between v1.0 and v1.1?'",
      };
    }
  }

  // Forbidden patterns - Out-of-scope calculations
  const calculationPatterns = [
    /how (do i|to) calculate/i,
    /calculate (scope 3|emissions|carbon)/i,
    /estimate (emissions|carbon footprint)/i,
    /compute/i,
  ];

  for (const pattern of calculationPatterns) {
    if (pattern.test(question)) {
      return {
        type: "forbidden",
        allowed: false,
        reason: "Calculation questions are out of advisory scope",
        suggestedAlternative:
          "ISA provides gap analyses and recommendations only. Try asking 'Which gaps exist for Product Carbon Footprint?'",
      };
    }
  }

  // Forbidden patterns - Conversational prompts
  const conversationalPatterns = [
    /^(hi|hello|hey|thanks|thank you)/i,
    /tell me (more|about)/i,
    /can you help/i,
  ];

  for (const pattern of conversationalPatterns) {
    if (pattern.test(question)) {
      return {
        type: "forbidden",
        allowed: false,
        reason: "ISA is a query interface, not a conversational assistant",
        suggestedAlternative:
          "Please ask a specific question about gaps, mappings, recommendations, or coverage (e.g., 'Which gaps exist for CSRD in DIY?')",
      };
    }
  }

  // Allowed patterns - Gap queries
  const gapPatterns = [
    /which gaps (exist|remain|are)/i,
    /what is the status of gap/i,
    /gap (analysis|assessment)/i,
    /(critical|missing|partial) gaps/i,
  ];

  for (const pattern of gapPatterns) {
    if (pattern.test(question)) {
      return {
        type: "gap",
        allowed: true,
      };
    }
  }

  // Allowed patterns - Mapping queries
  const mappingPatterns = [
    /which (gs1|attributes) (cover|map|support)/i,
    /which mappings/i,
    /mapping (coverage|status)/i,
    /attributes (map|cover|support)/i,
  ];

  for (const pattern of mappingPatterns) {
    if (pattern.test(question)) {
      return {
        type: "mapping",
        allowed: true,
      };
    }
  }

  // Allowed patterns - Version comparison queries
  const versionPatterns = [
    /what changed between (v1\.0|v1\.1|version)/i,
    /diff(erence)? between/i,
    /upgraded from/i,
    /new (in|dataset|entries)/i,
  ];

  for (const pattern of versionPatterns) {
    if (pattern.test(question)) {
      return {
        type: "version_comparison",
        allowed: true,
      };
    }
  }

  // Allowed patterns - Dataset provenance queries
  const provenancePatterns = [
    /which datasets (underpin|support|are used)/i,
    /authoritative source/i,
    /dataset (id|version|provenance)/i,
    /which (sector model|version)/i,
  ];

  for (const pattern of provenancePatterns) {
    if (pattern.test(question)) {
      return {
        type: "dataset_provenance",
        allowed: true,
      };
    }
  }

  // Allowed patterns - Recommendation queries
  const recommendationPatterns = [
    /(short|medium|long).term recommendations/i,
    /what are the recommendations/i,
    /recommendations (for|to address)/i,
    /which recommendations/i,
  ];

  for (const pattern of recommendationPatterns) {
    if (pattern.test(question)) {
      return {
        type: "recommendation",
        allowed: true,
      };
    }
  }

  // Allowed patterns - Coverage queries
  const coveragePatterns = [
    /coverage percentage/i,
    /what is the coverage/i,
    /which (esrs topic|requirements) (has|have) (the )?(highest|lowest)/i,
    /percentage of.*covered/i,
  ];

  for (const pattern of coveragePatterns) {
    if (pattern.test(question)) {
      return {
        type: "coverage",
        allowed: true,
      };
    }
  }

  // Default: Allow but mark as unclassified
  // The LLM will attempt to answer, but may refuse if truly out of scope
  return {
    type: "gap", // Default to gap query type
    allowed: true,
  };
}

/**
 * Generate refusal message for forbidden queries
 */
export function generateRefusalMessage(
  classification: QueryClassification
): string {
  if (classification.allowed) {
    return "";
  }

  let message = `ISA cannot answer this question. ${classification.reason}.`;

  if (classification.suggestedAlternative) {
    message += `\n\n${classification.suggestedAlternative}`;
  }

  return message;
}

/**
 * Validate citation completeness
 * Every response should cite: Advisory ID, version, dataset IDs
 */
export function validateCitations(answer: string): {
  valid: boolean;
  missingElements: string[];
} {
  const missingElements: string[] = [];

  // Check for advisory ID
  if (!/ISA_ADVISORY_v\d+\.\d+/i.test(answer)) {
    missingElements.push("Advisory ID (e.g., ISA_ADVISORY_v1.1)");
  }

  // Check for dataset references
  if (
    !/dataset|gs1nl\.|esrs\.|eu\.|gs1eu\./i.test(answer) &&
    !/Dataset registry/i.test(answer)
  ) {
    missingElements.push("Dataset IDs or registry reference");
  }

  return {
    valid: missingElements.length === 0,
    missingElements,
  };
}

/**
 * Calculate confidence score based on number of sources
 */
export function calculateConfidence(sourceCount: number): {
  level: "high" | "medium" | "low";
  score: number;
} {
  if (sourceCount >= 3) {
    return { level: "high", score: sourceCount };
  } else if (sourceCount === 2) {
    return { level: "medium", score: sourceCount };
  } else {
    return { level: "low", score: sourceCount };
  }
}
