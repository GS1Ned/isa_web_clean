export type AskIsaConfidenceLevel = "high" | "medium" | "low";

export interface AskIsaConfidence {
  level: AskIsaConfidenceLevel;
  score: number;
  sourceCount: number;
}

function normalizeSourceCount(sourceCount: number) {
  if (!Number.isFinite(sourceCount)) return 0;
  return Math.max(0, Math.floor(sourceCount));
}

export function calculateAskIsaConfidenceFromSourceCount(
  sourceCount: number,
): AskIsaConfidence {
  const normalizedSourceCount = normalizeSourceCount(sourceCount);

  if (normalizedSourceCount >= 3) {
    return {
      level: "high",
      score: Math.min(0.95, 0.75 + Math.min(normalizedSourceCount - 3, 4) * 0.05),
      sourceCount: normalizedSourceCount,
    };
  }

  if (normalizedSourceCount === 2) {
    return {
      level: "medium",
      score: 0.65,
      sourceCount: normalizedSourceCount,
    };
  }

  if (normalizedSourceCount === 1) {
    return {
      level: "low",
      score: 0.4,
      sourceCount: normalizedSourceCount,
    };
  }

  return {
    level: "low",
    score: 0,
    sourceCount: 0,
  };
}

export function normalizeAskIsaConfidenceScore(
  score?: number | null,
  sourceCount?: number | null,
) {
  const numericScore = Number(score);

  if (Number.isFinite(numericScore) && numericScore > 1) {
    const inferredSourceCount = Number.isFinite(sourceCount)
      ? Number(sourceCount)
      : numericScore;
    return calculateAskIsaConfidenceFromSourceCount(inferredSourceCount).score;
  }

  if (!Number.isFinite(numericScore)) {
    if (Number.isFinite(sourceCount)) {
      return calculateAskIsaConfidenceFromSourceCount(Number(sourceCount)).score;
    }
    return 0;
  }

  return Math.max(0, Math.min(1, numericScore));
}

export function formatAskIsaSourceCount(sourceCount?: number | null) {
  if (!Number.isFinite(sourceCount)) return null;
  const normalizedSourceCount = normalizeSourceCount(Number(sourceCount));
  return normalizedSourceCount === 1
    ? "1 source"
    : `${normalizedSourceCount} sources`;
}

export function formatAskIsaConfidencePercent(
  score?: number | null,
  sourceCount?: number | null,
) {
  const normalizedScore = normalizeAskIsaConfidenceScore(score, sourceCount);
  return `${Math.round(normalizedScore * 100)}%`;
}
