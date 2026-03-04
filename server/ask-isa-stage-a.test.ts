import { describe, expect, it } from "vitest";

import {
  ASK_ISA_STAGE_A_MIN_ANSWER_CHARS,
  ASK_ISA_STAGE_A_MIN_CLAIM_VERIFICATION_RATE,
  validateAskISAStageAAnswer,
} from "./ask-isa-stage-a";

describe("ask-isa stage-a validation", () => {
  it("passes a citation-complete and evidence-backed answer", () => {
    const result = validateAskISAStageAAnswer({
      answer:
        "ESRS E1 requires climate disclosures for material impacts and emissions reporting [Source 1]. Companies should also align governance controls and boundary definitions with the cited evidence set [Source 2].",
      sourceCount: 2,
      evidenceReadySourceCount: 2,
      verifiedEvidenceSourceCount: 2,
      needsVerificationSourceCount: 0,
      deprecatedSourceCount: 0,
      claimVerification: {
        totalClaims: 2,
        verificationRate: 1,
      },
    });

    expect(result.passed).toBe(true);
    expect(result.citationValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("fails when source citations are missing", () => {
    const result = validateAskISAStageAAnswer({
      answer:
        "ESRS E1 requires climate disclosures for material impacts and emissions reporting without any inline citation markers.",
      sourceCount: 2,
      evidenceReadySourceCount: 2,
      verifiedEvidenceSourceCount: 2,
      needsVerificationSourceCount: 0,
      deprecatedSourceCount: 0,
      claimVerification: {
        totalClaims: 1,
        verificationRate: 1,
      },
    });

    expect(result.passed).toBe(false);
    expect(result.missingCitations).toContain(
      "Answer contains no citations - all factual claims must be cited"
    );
  });

  it("fails when no evidence-backed sources are available", () => {
    const result = validateAskISAStageAAnswer({
      answer:
        "ESRS E1 requires climate disclosures for material impacts and emissions reporting [Source 1]. Companies should also align governance controls with the cited evidence set [Source 2].",
      sourceCount: 2,
      evidenceReadySourceCount: 0,
      verifiedEvidenceSourceCount: 0,
      needsVerificationSourceCount: 2,
      deprecatedSourceCount: 0,
      claimVerification: {
        totalClaims: 2,
        verificationRate: 1,
      },
    });

    expect(result.passed).toBe(false);
    expect(result.missingCitations).toContain(
      "No evidence-backed sources are available for stage-a citation output"
    );
  });

  it("fails when answer completeness is below the stage-a floor", () => {
    const answer = "Short answer [Source 1].";
    const result = validateAskISAStageAAnswer({
      answer,
      sourceCount: 1,
      evidenceReadySourceCount: 1,
      verifiedEvidenceSourceCount: 1,
      needsVerificationSourceCount: 0,
      deprecatedSourceCount: 0,
      claimVerification: {
        totalClaims: 1,
        verificationRate: 1,
      },
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toContain(
      `Answer completeness below stage-a floor (${answer.trim().length}/${ASK_ISA_STAGE_A_MIN_ANSWER_CHARS} chars)`
    );
  });

  it("fails when claim verification drops below the stage-a floor", () => {
    const result = validateAskISAStageAAnswer({
      answer:
        "ESRS E1 requires climate disclosures for material impacts and emissions reporting [Source 1]. Companies should also align governance controls and boundary definitions with the cited evidence set [Source 2].",
      sourceCount: 2,
      evidenceReadySourceCount: 2,
      verifiedEvidenceSourceCount: 2,
      needsVerificationSourceCount: 0,
      deprecatedSourceCount: 0,
      claimVerification: {
        totalClaims: 2,
        verificationRate: 0.25,
      },
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toContain(
      `Claim verification below stage-a floor (25% < ${Math.round(ASK_ISA_STAGE_A_MIN_CLAIM_VERIFICATION_RATE * 100)}%)`
    );
  });

  it("fails when no recently verified evidence-backed sources are available", () => {
    const result = validateAskISAStageAAnswer({
      answer:
        "ESRS E1 requires climate disclosures for material impacts and emissions reporting [Source 1]. Companies should align governance controls with the cited evidence set [Source 2].",
      sourceCount: 2,
      evidenceReadySourceCount: 2,
      verifiedEvidenceSourceCount: 0,
      needsVerificationSourceCount: 2,
      deprecatedSourceCount: 0,
      claimVerification: {
        totalClaims: 2,
        verificationRate: 1,
      },
    });

    expect(result.passed).toBe(false);
    expect(result.missingCitations).toContain(
      "No recently verified evidence-backed sources are available for stage-a citation output"
    );
  });

  it("fails when deprecated sources are present", () => {
    const result = validateAskISAStageAAnswer({
      answer:
        "ESRS E1 requires climate disclosures for material impacts and emissions reporting [Source 1]. Companies should align governance controls with the cited evidence set [Source 2].",
      sourceCount: 2,
      evidenceReadySourceCount: 2,
      verifiedEvidenceSourceCount: 1,
      needsVerificationSourceCount: 0,
      deprecatedSourceCount: 1,
      claimVerification: {
        totalClaims: 2,
        verificationRate: 1,
      },
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toContain(
      "Deprecated sources are present in stage-a citation output"
    );
  });

  it("warns when only part of the cited source set needs verification", () => {
    const result = validateAskISAStageAAnswer({
      answer:
        "ESRS E1 requires climate disclosures for material impacts and emissions reporting [Source 1]. Companies should align governance controls with the cited evidence set [Source 2].",
      sourceCount: 2,
      evidenceReadySourceCount: 2,
      verifiedEvidenceSourceCount: 1,
      needsVerificationSourceCount: 1,
      deprecatedSourceCount: 0,
      claimVerification: {
        totalClaims: 2,
        verificationRate: 1,
      },
    });

    expect(result.passed).toBe(true);
    expect(result.warnings).toContain(
      "Some cited sources require refreshed verification (1/2)"
    );
  });
});
