import fs from "node:fs";
import path from "node:path";

import { validateCitations } from "../../server/citation-validation";
import { askISAV2Router } from "../../server/routers/ask-isa-v2";
import {
  retrieveAskISAV2Candidates,
  type AskISAV2KnowledgeResult,
} from "../../server/routers/ask-isa-v2-retrieval";

type ScenarioCase = {
  id: string;
  query: string;
  focusArea?: string;
  expectedIntent: string;
  topK?: number;
  expectedAnyTitlePatterns?: string[];
  requiredTopKSourceTypes?: string[];
  requiredFreshTopKSourceTypes?: string[];
  requiredTopKAuthorityTiers?: string[];
  preferredTop1SourceType?: string;
  preferredTop1TitlePattern?: string;
  answerExpectation?: {
    expectNonAbstain?: boolean;
    minimumSourceCount?: number;
    requireMappingSignals?: boolean;
    expectGapAnalysis?: boolean;
    forbidGapAnalysis?: boolean;
    minConfidenceLevel?: "low" | "medium" | "high";
    maxConfidenceLevel?: "low" | "medium" | "high";
    requireUncertaintyPatterns?: string[];
    requireGapRecommendationPatterns?: string[];
    forbidGapRecommendationPatterns?: string[];
    expectedPrimarySourceType?: string;
    expectedPrimarySourceRole?: string;
    expectedPrimaryAuthorityTier?: string;
    requireEvidenceReadyPrimary?: boolean;
    requireSupportingSourceTypes?: string[];
    requireDecisionSummary?: boolean;
    requireCautionFlagPatterns?: string[];
    expectGapTriggerMode?: "auto" | "explicit" | "suppressed" | "none";
  };
  failureModes?: string[];
};

type ScenarioDataset = {
  dataset_id: string;
  notes?: string;
  cases: ScenarioCase[];
};

type RankedEval = {
  intentMatch: boolean;
  expectedTitleHit: boolean;
  sourceCoverageHit: boolean;
  freshSourceCoverageHit: boolean;
  authorityCoverageHit: boolean;
  top1PreferenceHit: boolean | null;
  score: number;
  titles: string[];
  sourceTypes: string[];
};

type AnswerEval = {
  nonAbstainHit: boolean | null;
  sourceCountHit: boolean | null;
  mappingSignalsHit: boolean | null;
  gapAnalysisHit: boolean | null;
  confidenceHit: boolean | null;
  uncertaintyHit: boolean | null;
  gapRecommendationHit: boolean | null;
  primarySourceTypeHit: boolean | null;
  primarySourceRoleHit: boolean | null;
  primaryAuthorityTierHit: boolean | null;
  evidenceReadyPrimaryHit: boolean | null;
  supportingSourceCoverageHit: boolean | null;
  decisionSummaryHit: boolean | null;
  cautionFlagsHit: boolean | null;
  gapTriggerModeHit: boolean | null;
  score: number;
  abstained: boolean;
  sourceCount: number;
  gapAnalysisPresent: boolean;
  confidenceLevel: string | null;
  uncertainty: string | null;
  primarySourceType: string | null;
  primarySourceRole: string | null;
  primaryAuthorityTier: string | null;
  cautionFlags: string[];
  gapTriggerMode: string | null;
};

function readScenarioDataset(): ScenarioDataset {
  const filePath = path.resolve(
    process.cwd(),
    "data/evaluation/golden/ask_isa/scenario_cases_v2_live.json"
  );
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ScenarioDataset;
}

function createPublicCaller() {
  return askISAV2Router.createCaller({
    user: null,
    req: { protocol: "https", headers: {} } as any,
    res: {} as any,
  } as any);
}

function titleHit(results: AskISAV2KnowledgeResult[], patterns: string[] = []): boolean {
  if (patterns.length === 0) return true;
  return results.some(result =>
    patterns.some(pattern =>
      result.title.toLowerCase().includes(pattern.toLowerCase())
    )
  );
}

function sourceCoverageHit(
  results: AskISAV2KnowledgeResult[],
  requiredTypes: string[] = []
): boolean {
  if (requiredTypes.length === 0) return true;
  return requiredTypes.every(type =>
    results.some(result => result.sourceType === type)
  );
}

function freshSourceCoverageHit(
  citations: Array<Record<string, unknown>>,
  results: AskISAV2KnowledgeResult[],
  requiredTypes: string[] = []
): boolean {
  if (requiredTypes.length === 0) return true;
  return requiredTypes.every(type =>
    results.some((result, index) =>
      result.sourceType === type &&
      citations[index]?.needsVerification === false
    )
  );
}

function authorityCoverageHit(
  citations: Array<Record<string, unknown>>,
  requiredTiers: string[] = []
): boolean {
  if (requiredTiers.length === 0) return true;
  return requiredTiers.every(tier =>
    citations.some(citation => citation?.authorityTier === tier)
  );
}

function top1PreferenceHit(
  results: AskISAV2KnowledgeResult[],
  scenario: ScenarioCase
): boolean | null {
  const top1 = results[0];
  if (!top1) return false;
  if (scenario.preferredTop1TitlePattern) {
    return top1.title
      .toLowerCase()
      .includes(scenario.preferredTop1TitlePattern.toLowerCase());
  }
  if (scenario.preferredTop1SourceType) {
    return top1.sourceType === scenario.preferredTop1SourceType;
  }
  return null;
}

function evaluateRankedResults(
  scenario: ScenarioCase,
  intent: string,
  results: AskISAV2KnowledgeResult[],
  citations: Array<Record<string, unknown>>
): RankedEval {
  const topK = scenario.topK ?? 5;
  const sliced = results.slice(0, topK);
  const slicedCitations = citations.slice(0, topK);
  const top1Hit = top1PreferenceHit(sliced, scenario);
  const evalScoreParts = [
    intent === scenario.expectedIntent ? 1 : 0,
    titleHit(sliced, scenario.expectedAnyTitlePatterns) ? 1 : 0,
    sourceCoverageHit(sliced, scenario.requiredTopKSourceTypes) ? 1 : 0,
    freshSourceCoverageHit(
      slicedCitations,
      sliced,
      scenario.requiredFreshTopKSourceTypes
    )
      ? 1
      : 0,
    authorityCoverageHit(slicedCitations, scenario.requiredTopKAuthorityTiers)
      ? 1
      : 0,
    top1Hit === null ? 1 : top1Hit ? 1 : 0,
  ];

  return {
    intentMatch: intent === scenario.expectedIntent,
    expectedTitleHit: titleHit(sliced, scenario.expectedAnyTitlePatterns),
    sourceCoverageHit: sourceCoverageHit(sliced, scenario.requiredTopKSourceTypes),
    freshSourceCoverageHit: freshSourceCoverageHit(
      slicedCitations,
      sliced,
      scenario.requiredFreshTopKSourceTypes
    ),
    authorityCoverageHit: authorityCoverageHit(
      slicedCitations,
      scenario.requiredTopKAuthorityTiers
    ),
    top1PreferenceHit: top1Hit,
    score: Number((evalScoreParts.reduce((sum, value) => sum + value, 0) / evalScoreParts.length).toFixed(4)),
    titles: sliced.map(result => result.title),
    sourceTypes: sliced.map(result => result.sourceType),
  };
}

function compareConfidenceLevel(
  actual: string | null | undefined,
  expected: "low" | "medium" | "high",
  mode: "min" | "max"
) {
  const rank = { low: 1, medium: 2, high: 3 } as const;
  if (!actual || !(actual in rank)) return false;
  if (mode === "min") {
    return rank[actual as keyof typeof rank] >= rank[expected];
  }
  return rank[actual as keyof typeof rank] <= rank[expected];
}

function stringContainsAny(
  value: string | null | undefined,
  patterns: string[] = []
): boolean {
  if (patterns.length === 0) return true;
  const haystack = String(value || "").toLowerCase();
  return patterns.every(pattern => haystack.includes(pattern.toLowerCase()));
}

function noForbiddenPatterns(
  value: string | null | undefined,
  patterns: string[] = []
): boolean {
  if (patterns.length === 0) return true;
  const haystack = String(value || "").toLowerCase();
  return patterns.every(pattern => !haystack.includes(pattern.toLowerCase()));
}

function supportingSourceCoverageHit(
  sources: Array<Record<string, any>>,
  requiredTypes: string[] = []
) {
  if (requiredTypes.length === 0) return true;
  return requiredTypes.every(type =>
    sources.slice(1).some(source => source?.sourceType === type)
  );
}

function evaluateAnswer(
  scenario: ScenarioCase,
  answerResult: Record<string, any>
): AnswerEval {
  const answerExpectation = scenario.answerExpectation || {};
  const sources = Array.isArray(answerResult.sources) ? answerResult.sources : [];
  const primarySource = sources[0] || null;
  const gapRecommendations = Array.isArray(answerResult.gapAnalysis?.recommendations)
    ? answerResult.gapAnalysis.recommendations.join("\n")
    : "";
  const decisionSummary = answerResult.decisionSummary;
  const cautionFlags = Array.isArray(decisionSummary?.cautionFlags)
    ? decisionSummary.cautionFlags.map((flag: unknown) => String(flag))
    : [];

  const scoreParts: boolean[] = [];

  const nonAbstainHit =
    typeof answerExpectation.expectNonAbstain === "boolean"
      ? answerExpectation.expectNonAbstain
        ? !Boolean(answerResult.abstained)
        : Boolean(answerResult.abstained)
      : null;
  if (nonAbstainHit !== null) scoreParts.push(nonAbstainHit);

  const sourceCountHit =
    typeof answerExpectation.minimumSourceCount === "number"
      ? sources.length >= answerExpectation.minimumSourceCount
      : null;
  if (sourceCountHit !== null) scoreParts.push(sourceCountHit);

  const mappingSignalsHit =
    typeof answerExpectation.requireMappingSignals === "boolean"
      ? answerExpectation.requireMappingSignals
        ? Boolean(answerResult.mappingContext?.hasSignals)
        : !Boolean(answerResult.mappingContext?.hasSignals)
      : null;
  if (mappingSignalsHit !== null) scoreParts.push(mappingSignalsHit);

  const gapAnalysisPresent = Boolean(answerResult.gapAnalysis);
  const gapAnalysisHit =
    typeof answerExpectation.expectGapAnalysis === "boolean"
      ? answerExpectation.expectGapAnalysis === gapAnalysisPresent
      : typeof answerExpectation.forbidGapAnalysis === "boolean"
        ? answerExpectation.forbidGapAnalysis
          ? !gapAnalysisPresent
          : gapAnalysisPresent
        : null;
  if (gapAnalysisHit !== null) scoreParts.push(gapAnalysisHit);

  const confidenceHit =
    answerExpectation.minConfidenceLevel || answerExpectation.maxConfidenceLevel
      ? Boolean(
          (!answerExpectation.minConfidenceLevel ||
            compareConfidenceLevel(
              answerResult.confidence?.level,
              answerExpectation.minConfidenceLevel,
              "min"
            )) &&
            (!answerExpectation.maxConfidenceLevel ||
              compareConfidenceLevel(
                answerResult.confidence?.level,
                answerExpectation.maxConfidenceLevel,
                "max"
              ))
        )
      : null;
  if (confidenceHit !== null) scoreParts.push(confidenceHit);

  const uncertaintyHit = answerExpectation.requireUncertaintyPatterns?.length
    ? stringContainsAny(
        answerResult.uncertainty,
        answerExpectation.requireUncertaintyPatterns
      )
    : null;
  if (uncertaintyHit !== null) scoreParts.push(uncertaintyHit);

  const gapRecommendationHit =
    answerExpectation.requireGapRecommendationPatterns?.length ||
    answerExpectation.forbidGapRecommendationPatterns?.length
      ? Boolean(
          stringContainsAny(
            gapRecommendations,
            answerExpectation.requireGapRecommendationPatterns
          ) &&
            noForbiddenPatterns(
              gapRecommendations,
              answerExpectation.forbidGapRecommendationPatterns
            )
        )
      : null;
  if (gapRecommendationHit !== null) scoreParts.push(gapRecommendationHit);

  const primarySourceTypeHit = answerExpectation.expectedPrimarySourceType
    ? primarySource?.sourceType === answerExpectation.expectedPrimarySourceType
    : null;
  if (primarySourceTypeHit !== null) scoreParts.push(primarySourceTypeHit);

  const primarySourceRoleHit = answerExpectation.expectedPrimarySourceRole
    ? primarySource?.sourceRole === answerExpectation.expectedPrimarySourceRole
    : null;
  if (primarySourceRoleHit !== null) scoreParts.push(primarySourceRoleHit);

  const primaryAuthorityTierHit = answerExpectation.expectedPrimaryAuthorityTier
    ? primarySource?.authorityTier === answerExpectation.expectedPrimaryAuthorityTier
    : null;
  if (primaryAuthorityTierHit !== null) scoreParts.push(primaryAuthorityTierHit);

  const evidenceReadyPrimaryHit =
    typeof answerExpectation.requireEvidenceReadyPrimary === "boolean"
      ? answerExpectation.requireEvidenceReadyPrimary
        ? Boolean(primarySource?.evidenceKey)
        : !Boolean(primarySource?.evidenceKey)
      : null;
  if (evidenceReadyPrimaryHit !== null) scoreParts.push(evidenceReadyPrimaryHit);

  const supportingCoverageHit = answerExpectation.requireSupportingSourceTypes?.length
    ? supportingSourceCoverageHit(
        sources,
        answerExpectation.requireSupportingSourceTypes
      )
    : null;
  if (supportingCoverageHit !== null) scoreParts.push(supportingCoverageHit);

  const decisionSummaryHit =
    typeof answerExpectation.requireDecisionSummary === "boolean"
      ? answerExpectation.requireDecisionSummary
        ? Boolean(decisionSummary)
        : !Boolean(decisionSummary)
      : null;
  if (decisionSummaryHit !== null) scoreParts.push(decisionSummaryHit);

  const cautionFlagsHit = answerExpectation.requireCautionFlagPatterns?.length
    ? stringContainsAny(
        cautionFlags.join("\n"),
        answerExpectation.requireCautionFlagPatterns
      )
    : null;
  if (cautionFlagsHit !== null) scoreParts.push(cautionFlagsHit);

  const gapTriggerModeHit = answerExpectation.expectGapTriggerMode
    ? answerResult.gapTrigger?.mode === answerExpectation.expectGapTriggerMode
    : null;
  if (gapTriggerModeHit !== null) scoreParts.push(gapTriggerModeHit);

  return {
    nonAbstainHit,
    sourceCountHit,
    mappingSignalsHit,
    gapAnalysisHit,
    confidenceHit,
    uncertaintyHit,
    gapRecommendationHit,
    primarySourceTypeHit,
    primarySourceRoleHit,
    primaryAuthorityTierHit,
    evidenceReadyPrimaryHit,
    supportingSourceCoverageHit: supportingCoverageHit,
    decisionSummaryHit,
    cautionFlagsHit,
    gapTriggerModeHit,
    score: Number(
      (
        scoreParts.reduce((sum, passed) => sum + (passed ? 1 : 0), 0) /
        Math.max(scoreParts.length, 1)
      ).toFixed(4)
    ),
    abstained: Boolean(answerResult.abstained),
    sourceCount: sources.length,
    gapAnalysisPresent,
    confidenceLevel: answerResult.confidence?.level ?? null,
    uncertainty: answerResult.uncertainty ?? null,
    primarySourceType: primarySource?.sourceType ?? null,
    primarySourceRole: primarySource?.sourceRole ?? null,
    primaryAuthorityTier: primarySource?.authorityTier ?? null,
    cautionFlags,
    gapTriggerMode: answerResult.gapTrigger?.mode ?? null,
  };
}

async function main() {
  const dataset = readScenarioDataset();
  const caller = createPublicCaller();
  const rows = [];

  for (const scenario of dataset.cases) {
    const bundle = await retrieveAskISAV2Candidates(scenario.query);
    const legacyCitations = await validateCitations(
      bundle.legacyRankedResults
        .slice(0, scenario.topK ?? 5)
        .map(result => ({
          id: result.id,
          title: result.title,
          url: result.url || undefined,
          similarity: result.similarity,
        }))
    );
    const currentCitations = await validateCitations(
      bundle.rerankedResults
        .slice(0, scenario.topK ?? 5)
        .map(result => ({
          id: result.id,
          title: result.title,
          url: result.url || undefined,
          similarity: result.similarity,
        }))
    );
    const legacy = evaluateRankedResults(
      scenario,
      bundle.intent,
      bundle.legacyRankedResults,
      legacyCitations
    );
    const current = evaluateRankedResults(
      scenario,
      bundle.intent,
      bundle.rerankedResults,
      currentCitations
    );

    let answerCheck: AnswerEval | null = null;
    if (scenario.answerExpectation) {
      const answerResult = await caller.askEnhanced({
        question: scenario.query,
        includeGapAnalysis: false,
      });
      answerCheck = evaluateAnswer(scenario, answerResult as Record<string, any>);
    }

    rows.push({
      id: scenario.id,
      query: scenario.query,
      focusArea: scenario.focusArea || null,
      intent: bundle.intent,
      legacy,
      current,
      answerCheck,
    });
  }

  const averages = {
    legacy: Number(
      (
        rows.reduce((sum, row) => sum + Number((row as any).legacy.score || 0), 0) /
        rows.length
      ).toFixed(4)
    ),
    current: Number(
      (
        rows.reduce((sum, row) => sum + Number((row as any).current.score || 0), 0) /
        rows.length
      ).toFixed(4)
    ),
    answer: Number(
      (
        rows.reduce(
          (sum, row) => sum + Number((row as any).answerCheck?.score || 0),
          0
        ) / rows.length
      ).toFixed(4)
    ),
  };

  console.log(
    JSON.stringify(
      {
        datasetId: dataset.dataset_id,
        caseCount: dataset.cases.length,
        averages,
        rows,
      },
      null,
      2
    )
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
