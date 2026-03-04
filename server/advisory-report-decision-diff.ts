import {
  EsrsDecisionArtifactsSchema,
  type EsrsDecisionArtifact,
} from "./esrs-decision-artifacts";

export interface AdvisoryReportDecisionArtifactDiffSummary {
  currentArtifactCount: number;
  snapshotArtifactCount: number;
  addedArtifactTypes: string[];
  removedArtifactTypes: string[];
  changedArtifactTypes: string[];
  unchangedArtifactTypes: string[];
  confidenceChangedArtifactTypes: string[];
  averageConfidenceDelta: number | null;
  hasChanges: boolean;
}

function parseDecisionArtifacts(value: unknown): EsrsDecisionArtifact[] {
  const parsed = EsrsDecisionArtifactsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function getArtifactKey(artifact: EsrsDecisionArtifact) {
  return `${artifact.capability}:${artifact.artifactType}`;
}

function getComparableSnapshot(artifact: EsrsDecisionArtifact) {
  return JSON.stringify({
    capability: artifact.capability,
    artifactType: artifact.artifactType,
    artifactVersion: artifact.artifactVersion,
    confidence: artifact.confidence,
    evidence: artifact.evidence,
    summary: artifact.summary,
    subject: artifact.subject,
  });
}

function roundScore(value: number) {
  return Number(value.toFixed(2));
}

function averageConfidence(artifacts: EsrsDecisionArtifact[]) {
  if (artifacts.length === 0) {
    return null;
  }

  return roundScore(
    artifacts.reduce((sum, artifact) => sum + artifact.confidence.score, 0) /
      artifacts.length,
  );
}

function compactArtifactTypes(
  values: Array<string | undefined>,
): string[] {
  return values.filter((value): value is string => typeof value === "string");
}

export function buildDecisionArtifactDiffSummary(input: {
  currentArtifacts?: unknown;
  snapshotArtifacts?: unknown;
}): AdvisoryReportDecisionArtifactDiffSummary {
  const currentArtifacts = parseDecisionArtifacts(input.currentArtifacts);
  const snapshotArtifacts = parseDecisionArtifacts(input.snapshotArtifacts);

  const currentByKey = new Map(
    currentArtifacts.map(artifact => [getArtifactKey(artifact), artifact]),
  );
  const snapshotByKey = new Map(
    snapshotArtifacts.map(artifact => [getArtifactKey(artifact), artifact]),
  );

  const currentKeys = new Set(currentByKey.keys());
  const snapshotKeys = new Set(snapshotByKey.keys());

  const addedArtifactTypes = Array.from(currentKeys)
    .filter(key => !snapshotKeys.has(key))
    .map(key => currentByKey.get(key)?.artifactType)
    .filter((value): value is EsrsDecisionArtifact["artifactType"] => typeof value === "string")
    .sort();

  const removedArtifactTypes = Array.from(snapshotKeys)
    .filter(key => !currentKeys.has(key))
    .map(key => snapshotByKey.get(key)?.artifactType)
    .filter((value): value is EsrsDecisionArtifact["artifactType"] => typeof value === "string")
    .sort();

  const changedArtifactTypes: string[] = [];
  const unchangedArtifactTypes: string[] = [];
  const confidenceChangedArtifactTypes: string[] = [];

  for (const key of Array.from(currentKeys).filter(candidate => snapshotKeys.has(candidate)).sort()) {
    const currentArtifact = currentByKey.get(key);
    const snapshotArtifact = snapshotByKey.get(key);

    if (!currentArtifact || !snapshotArtifact) {
      continue;
    }

    const confidenceChanged =
      currentArtifact.confidence.level !== snapshotArtifact.confidence.level ||
      currentArtifact.confidence.score !== snapshotArtifact.confidence.score ||
      currentArtifact.confidence.basis !== snapshotArtifact.confidence.basis;

    if (confidenceChanged) {
      confidenceChangedArtifactTypes.push(currentArtifact.artifactType);
    }

    if (getComparableSnapshot(currentArtifact) === getComparableSnapshot(snapshotArtifact)) {
      unchangedArtifactTypes.push(currentArtifact.artifactType);
      continue;
    }

    changedArtifactTypes.push(currentArtifact.artifactType);
  }

  const currentAverage = averageConfidence(currentArtifacts);
  const snapshotAverage = averageConfidence(snapshotArtifacts);
  const averageConfidenceDelta =
    currentAverage == null || snapshotAverage == null
      ? null
      : roundScore(currentAverage - snapshotAverage);

  return {
    currentArtifactCount: currentArtifacts.length,
    snapshotArtifactCount: snapshotArtifacts.length,
    addedArtifactTypes: compactArtifactTypes(addedArtifactTypes),
    removedArtifactTypes: compactArtifactTypes(removedArtifactTypes),
    changedArtifactTypes: compactArtifactTypes(changedArtifactTypes),
    unchangedArtifactTypes: compactArtifactTypes(unchangedArtifactTypes),
    confidenceChangedArtifactTypes: compactArtifactTypes(confidenceChangedArtifactTypes.sort()),
    averageConfidenceDelta,
    hasChanges:
      addedArtifactTypes.length > 0 ||
      removedArtifactTypes.length > 0 ||
      changedArtifactTypes.length > 0,
  };
}
