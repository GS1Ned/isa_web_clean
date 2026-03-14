import fs from "node:fs";
import path from "node:path";

import { askISAV2Router } from "../../server/routers/ask-isa-v2";
import {
  retrieveAskISAV2Candidates,
  type AskISAV2KnowledgeResult,
} from "../../server/routers/ask-isa-v2-retrieval";

type ScenarioCase = {
  id: string;
  query: string;
  expectedIntent: string;
  topK?: number;
  expectedAnyTitlePatterns?: string[];
  requiredTopKSourceTypes?: string[];
  preferredTop1SourceType?: string;
  preferredTop1TitlePattern?: string;
  answerExpectation?: {
    expectNonAbstain?: boolean;
    minimumSourceCount?: number;
    requireMappingSignals?: boolean;
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
  top1PreferenceHit: boolean | null;
  score: number;
  titles: string[];
  sourceTypes: string[];
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
  results: AskISAV2KnowledgeResult[]
): RankedEval {
  const topK = scenario.topK ?? 5;
  const sliced = results.slice(0, topK);
  const top1Hit = top1PreferenceHit(sliced, scenario);
  const evalScoreParts = [
    intent === scenario.expectedIntent ? 1 : 0,
    titleHit(sliced, scenario.expectedAnyTitlePatterns) ? 1 : 0,
    sourceCoverageHit(sliced, scenario.requiredTopKSourceTypes) ? 1 : 0,
    top1Hit === null ? 1 : top1Hit ? 1 : 0,
  ];

  return {
    intentMatch: intent === scenario.expectedIntent,
    expectedTitleHit: titleHit(sliced, scenario.expectedAnyTitlePatterns),
    sourceCoverageHit: sourceCoverageHit(sliced, scenario.requiredTopKSourceTypes),
    top1PreferenceHit: top1Hit,
    score: Number((evalScoreParts.reduce((sum, value) => sum + value, 0) / evalScoreParts.length).toFixed(4)),
    titles: sliced.map(result => result.title),
    sourceTypes: sliced.map(result => result.sourceType),
  };
}

async function main() {
  const dataset = readScenarioDataset();
  const caller = createPublicCaller();
  const rows = [];

  for (const scenario of dataset.cases) {
    const bundle = await retrieveAskISAV2Candidates(scenario.query);
    const legacy = evaluateRankedResults(
      scenario,
      bundle.intent,
      bundle.legacyRankedResults
    );
    const current = evaluateRankedResults(
      scenario,
      bundle.intent,
      bundle.rerankedResults
    );

    let answerCheck: Record<string, unknown> | null = null;
    if (scenario.answerExpectation) {
      const answerResult = await caller.askEnhanced({
        question: scenario.query,
        includeGapAnalysis: false,
      });
      answerCheck = {
        abstained: Boolean(answerResult.abstained),
        sourceCount: Array.isArray(answerResult.sources)
          ? answerResult.sources.length
          : 0,
        mappingSignals: Boolean(answerResult.mappingContext?.hasSignals),
      };
    }

    rows.push({
      id: scenario.id,
      query: scenario.query,
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
