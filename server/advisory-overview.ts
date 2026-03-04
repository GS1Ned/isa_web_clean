import { buildAdvisoryReadModel } from "./advisory-read-model";
import { getLatestAdvisoryReport } from "./db-advisory-reports";

export async function buildAdvisoryOverview() {
  const readModel = await buildAdvisoryReadModel();

  try {
    const latestReport = await getLatestAdvisoryReport();
    return {
      summary: readModel.summary,
      metadata: readModel.metadata,
      latestReport,
    };
  } catch {
    return {
      summary: readModel.summary,
      metadata: readModel.metadata,
      latestReport: null,
    };
  }
}
