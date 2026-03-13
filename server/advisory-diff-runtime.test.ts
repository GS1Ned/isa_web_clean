import { describe, expect, it } from "vitest";

import { buildAdvisoryReadModel } from "./advisory-read-model";
import { getAdvisorySummaryPayload } from "./advisory-diff-runtime";

describe("advisory-diff-runtime", () => {
  it("returns the normalized current advisory summary for the active advisory version", async () => {
    const readModel = await buildAdvisoryReadModel();
    const activeVersion = `v${String(readModel.summary.version).replace(/^v/i, "")}`;
    const summary = await getAdvisorySummaryPayload(activeVersion);

    expect(summary.version).toBeDefined();
    expect(summary.mappingResults?.total ?? summary.stats?.totalMappings ?? 0).toBeGreaterThan(0);
    expect(summary.migrationState).toBeDefined();
  });

  it("falls back to legacy advisory summaries for older requested versions", async () => {
    const summary = await getAdvisorySummaryPayload("v1.0");

    expect(summary.version).toBeDefined();
    expect(summary.statistics?.totalMappings || summary.mappingResults?.total || 0).toBeGreaterThan(0);
  });
});
