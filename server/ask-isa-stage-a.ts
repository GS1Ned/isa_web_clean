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
  claimVerification: Pick<VerificationSummary, "totalClaims" | "verificationRate">;
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
  const { answer, sourceCount, evidenceReadySourceCount, claimVerification } = input;

  const sourceCitationValidation = validatePromptCitations(answer, sourceCount);
  const verification = verifyAskISAResponse(
    answer,
    Array.from({ length: sourceCount }, (_, index) => ({ id: index + 1 })),
    normalizeConfidenceFromSourceCount(sourceCount)
  );

  const missingCitations = [...sourceCitationValidation.issues];
  if (evidenceReadySourceCount < 1) {
    missingCitations.push("No evidence-backed sources are available for stage-a citation output");
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

  return {
    passed: normalizedIssues.length === 0,
    citationValid: normalizedMissingCitations.length === 0,
    missingCitations: normalizedMissingCitations,
    issues: normalizedIssues,
    warnings: uniqueStrings(verification.warnings),
  };
}
