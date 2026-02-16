import { describe, it, expect } from "vitest";

import { appRouter } from "./routers";
import type { Context } from "./_core/context";

const mockPublicContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

describe("appRouter shape", () => {
  it("keeps stable top-level keys", () => {
    const record = (appRouter as any)?._def?.record as Record<string, unknown>;
    const keys = Object.keys(record ?? {}).sort();

    const expected = [
      "advisory",
      "advisoryDiff",
      "advisoryReports",
      "analytics",
      "askISA",
      "askISAV2",
      "attributeRecommender",
      "auth",
      "citationAdmin",
      "contact",
      "coverageAnalytics",
      "cron",
      "dataQuality",
      "datasetRegistry",
      "dutchInitiatives",
      "errorTracking",
      "esgArtefacts",
      "esrs",
      "esrsGs1Mapping",
      "esrsRoadmap",
      "evaluation",
      "export",
      "gapAnalyzer",
      "governanceDocuments",
      "gs1Attributes",
      "gs1Standards",
      "gs1nlAttributes",
      "hub",
      "insights",
      "monitoring",
      "newsAdmin",
      "observability",
      "onboarding",
      "performanceTracking",
      "pipelineObservability",
      "productionMonitoring",
      "regulations",
      "regulatoryChangeLog",
      "scraperHealth",
      "standards",
      "standardsDirectory",
      "system",
      "user",
      "webhookConfig",
    ].sort();

    expect(keys).toEqual(expected);
  });

  it("keeps expected domain router procedures", () => {
    const caller = appRouter.createCaller(mockPublicContext);

    expect(typeof caller.regulations.list).toBe("function");
    expect(typeof caller.regulations.getWithStandards).toBe("function");

    expect(typeof caller.standards.list).toBe("function");

    expect(typeof caller.insights.recentChanges).toBe("function");
    expect(typeof caller.insights.stats).toBe("function");

    expect(typeof caller.user.analysisHistory).toBe("function");
    expect(typeof caller.user.createAnalysis).toBe("function");
    expect(typeof caller.user.preferences).toBe("function");
    expect(typeof caller.user.updatePreferences).toBe("function");

    expect(typeof caller.hub.getRecentNews).toBe("function");
    expect(typeof caller.hub.getLastPipelineRun).toBe("function");
    expect(typeof caller.hub.getEvents).toBe("function");
  });
});
