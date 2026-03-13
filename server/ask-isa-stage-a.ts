import type { VerificationSummary } from "./claim-citation-verifier";
import {
  validateCitations as validatePromptCitations,
  verifyAskISAResponse,
} from "./prompts/ask_isa";

export const ASK_ISA_STAGE_A_MIN_ANSWER_CHARS = 100;
export const ASK_ISA_STAGE_A_MIN_CLAIM_VERIFICATION_RATE = 0.5;
export const ASK_ISA_STAGE_A_ABSTENTION_MESSAGE =
  "I cannot provide a compliance-grade answer because citation or verification checks failed. Please refine the question or request more specific evidence.";

export interface AskISAStageAValidationInput {
  answer: string;
  sourceCount: number;
  evidenceReadySourceCount: number;
  verifiedEvidenceSourceCount: number;
  needsVerificationSourceCount: number;
  deprecatedSourceCount: number;
  claimVerification: Pick<VerificationSummary, "totalClaims" | "verificationRate">;
  /** When true, skip evidence-key checks because sources come from curated knowledge embeddings */
  knowledgeEmbeddingMode?: boolean;
}

export interface AskISAStageAValidationResult {
  passed: boolean;
  citationValid: boolean;
  missingCitations: string[];
  issues: string[];
  warnings: string[];
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeConfidenceFromSourceCount(sourceCount: number): number {
  return Math.max(0, Math.min(1, sourceCount / 3));
}

export function validateAskISAStageAAnswer(
  input: AskISAStageAValidationInput
): AskISAStageAValidationResult {
  const {
    answer,
    sourceCount,
    evidenceReadySourceCount,
    verifiedEvidenceSourceCount,
    needsVerificationSourceCount,
    deprecatedSourceCount,
    claimVerification,
  } = input;

  const sourceCitationValidation = validatePromptCitations(answer, sourceCount);
  const verification = verifyAskISAResponse(
    answer,
    Array.from({ length: sourceCount }, (_, index) => ({ id: index + 1 })),
    normalizeConfidenceFromSourceCount(sourceCount)
  );

  const missingCitations = [...sourceCitationValidation.issues];
  // In knowledgeEmbeddingMode, sources come from curated DB records without formal
  // evidence-key provenance chains. Skip evidence-key checks in this mode.
  if (!input.knowledgeEmbeddingMode) {
    if (evidenceReadySourceCount < 1) {
      missingCitations.push("No evidence-backed sources are available for stage-a citation output");
    } else if (verifiedEvidenceSourceCount < 1) {
      missingCitations.push(
        "No recently verified evidence-backed sources are available for stage-a citation output"
      );
    }
  }

  if (deprecatedSourceCount > 0) {
    missingCitations.push("Deprecated sources are present in stage-a citation output");
  }

  const issues = [...missingCitations, ...verification.issues];

  if (answer.trim().length < ASK_ISA_STAGE_A_MIN_ANSWER_CHARS) {
    issues.push(
      `Answer completeness below stage-a floor (${answer.trim().length}/${ASK_ISA_STAGE_A_MIN_ANSWER_CHARS} chars)`
    );
  }

  if (
    claimVerification.totalClaims > 0 &&
    claimVerification.verificationRate < ASK_ISA_STAGE_A_MIN_CLAIM_VERIFICATION_RATE
  ) {
    issues.push(
      `Claim verification below stage-a floor (${Math.round(
        claimVerification.verificationRate * 100
      )}% < ${Math.round(ASK_ISA_STAGE_A_MIN_CLAIM_VERIFICATION_RATE * 100)}%)`
    );
  }

  const normalizedMissingCitations = uniqueStrings(missingCitations);
  const normalizedIssues = uniqueStrings(issues);

  const warnings = [...verification.warnings];
  if (needsVerificationSourceCount > 0 && verifiedEvidenceSourceCount > 0) {
    warnings.push(
      `Some cited sources require refreshed verification (${needsVerificationSourceCount}/${sourceCount})`
    );
  }

  return {
    passed: normalizedIssues.length === 0,
    citationValid: normalizedMissingCitations.length === 0,
    missingCitations: normalizedMissingCitations,
    issues: normalizedIssues,
    warnings: uniqueStrings(warnings),
  };
}
