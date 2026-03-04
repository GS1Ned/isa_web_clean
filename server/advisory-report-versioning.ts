import {
  EsrsDecisionArtifactsSchema,
  type EsrsDecisionArtifact,
} from "./esrs-decision-artifacts";

type AdvisoryReportVersionSource = {
  decisionArtifacts?: unknown;
};

export function resolveVersionDecisionArtifacts(input: {
  requestedArtifacts?: EsrsDecisionArtifact[];
  sourceReport: AdvisoryReportVersionSource | null;
}): EsrsDecisionArtifact[] | undefined {
  if (!input.sourceReport) {
    throw new Error("Report not found");
  }

  if (input.requestedArtifacts && input.requestedArtifacts.length > 0) {
    return input.requestedArtifacts;
  }

  const parsedArtifacts = EsrsDecisionArtifactsSchema.safeParse(input.sourceReport.decisionArtifacts);
  if (parsedArtifacts.success && parsedArtifacts.data.length > 0) {
    return parsedArtifacts.data;
  }

  return undefined;
}
